#!/usr/bin/env python3
"""Recall eval: can each retrieval backend find the known answer file?

Runs every case in questions.jsonl against up to four backends over the SAME
roots (KeystoneOS data/memory-index-paths.json, tokens resolved per machine):

  memsearch  vector search (Milvus + ONNX embedder), top 5 distinct files
  fts5       stdlib SQLite FTS5 / BM25 over whole files, natural-language query
  rg         ripgrep on the case's `keyword`, files ranked by match count
  recall     ~/.claude/scripts/recall.py's own index: fts5 roots + whole vault (it opens only #1)
  jev        fts5 top 30, then TypeSafe Jev re-sorts the ALLOWED notes by a yes/no
             "does this note answer the question?" (cloud call; see JEV_ALLOWED)

Per case: rank of the first expected file, latency, failure, and coverage
(does an expected file exist under the configured roots on THIS machine --
the check that exposes path drift like the 2026-09-30 {VAULT} bug).

Writes results/<date>-<machine>-<label>.json and appends one row per backend
to ledger.md. Stdlib only. Spec: ../2026-09-30-memory-infra-audit.md section 6.

  python recall-eval.py --label opus-5.5            # all backends
  python recall-eval.py --backends fts5,rg          # skip memsearch (no Docker / low RAM)
  python recall-eval.py --backends fts5,jev         # needs TYPESAFE_API_KEY or ~/.claude/typesafe.env
"""
import argparse, datetime, json, os, platform, re, shutil, sqlite3, statistics, subprocess, sys, time
import urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
HOME = Path.home()


def first_dir(cands, marker=None):
    for c in cands:
        if (c / marker if marker else c).is_dir():
            return c
    return cands[0]


DEV = first_dir([HOME / "DEV", HOME / "Desktop" / "DEV"], "KeystoneOS")
VAULT = first_dir([HOME / "SecondBrain", HOME / "Desktop" / "SecondBrain"])


def roots():
    cfg = json.loads((DEV / "KeystoneOS" / "data" / "memory-index-paths.json").read_text(encoding="utf-8"))
    out = []
    for p in cfg["paths"]:
        p = p.replace("{DEV}", str(DEV)).replace("{VAULT}", str(VAULT)).replace("{HOME}", str(HOME))
        out.append(Path(p))
    return out


def norm(p):
    return str(p).replace("\\", "/").lower()


def matches(path, expected):
    n = norm(path)
    return any(e.lower() in n for e in expected)


def rank_of(files, expected):
    for i, f in enumerate(files, 1):
        if matches(f, expected):
            return i
    return None


# ---------------- backends ----------------

def b_memsearch(q, case):
    exe = shutil.which("memsearch")
    if not exe:
        raise RuntimeError("memsearch not on PATH")
    r = subprocess.run([exe, "search", q, "-k", "20", "-j"], capture_output=True, text=True,
                       encoding="utf-8", errors="replace", timeout=180)
    if r.returncode != 0:
        raise RuntimeError((r.stderr or r.stdout).strip().splitlines()[-1][:200] if (r.stderr or r.stdout).strip() else f"exit {r.returncode}")
    data = json.loads(r.stdout[r.stdout.find("["):]) if "[" in r.stdout else []
    files = []
    for hit in data:
        src = hit.get("source") or hit.get("path") or hit.get("file") or ""
        if src and src not in files:
            files.append(src)
    return files[:5]


_FTS = None


def _recall():
    """BM25 has one home: ~/.claude/scripts/recall.py. This file only calls it."""
    import importlib.util
    spec = importlib.util.spec_from_file_location("recall", HOME / ".claude" / "scripts" / "recall.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


RECALL = _recall()


def build_fts(rts):
    db = RECALL.open_index([str(r) for r in rts], ":memory:")
    return db, db.execute("SELECT count(*) FROM seen").fetchone()[0]


def fts5_top(q, limit):
    return RECALL.fts5_top(_FTS, q, limit)


def b_fts5(q, case):
    return fts5_top(q, 5)


# Only these folders may be sent to TypeSafe's cloud (Eric's choice, 2026-09-30):
# vault book/knowledge notes, compiled knowledge articles, and Tier A project memory
# (user_* personal notes excluded).
# Transcripts, daily logs, meeting notes, briefings, dev-docs, Codex memories and
# KeystoneOS decisions are never sent; they keep their fts5 positions instead.
JEV_ALLOWED = ("/secondbrain/knowledge/", "/claude-memory-compiler/knowledge/", "/.claude/projects/")
JEV_POOL = 30
JEV_CHARS = 2000
JEV_URL = "https://api.typesafe.ai/v1/systemone"
_JEV_KEY = None
JEV_USAGE = {"calls": 0, "input_tokens": 0}


def jev_allowed(path):
    n = norm(path)
    if "/.claude/projects/" in n:
        # Tier A notes only, never session transcripts; and not the personal user_* notes
        return "/memory/" in n and not Path(n).name.startswith("user_")
    return any(a in n for a in JEV_ALLOWED)


def jev_key():
    global _JEV_KEY
    if _JEV_KEY is None:
        _JEV_KEY = os.environ.get("TYPESAFE_API_KEY", "")
        env = HOME / ".claude" / "typesafe.env"
        if not _JEV_KEY and env.exists():
            for line in env.read_text(encoding="utf-8").splitlines():
                if line.startswith("TYPESAFE_API_KEY="):
                    _JEV_KEY = line.split("=", 1)[1].strip().strip("'\"")
        if not _JEV_KEY:
            raise RuntimeError("no TYPESAFE_API_KEY")
    return _JEV_KEY


def jev_answers(query, path):
    text = Path(path).read_text(encoding="utf-8", errors="replace")[:JEV_CHARS]
    body = {"model": "jev-latest",
            "state": {"query": query, "note": {"title": Path(path).stem, "text": text}},
            "questions": {"answers": {"type": "noul",
                                      "instructions": "Does `note` contain the information that answers `query`?",
                                      "criteria": {"yes": "The note directly addresses what the query asks about.",
                                                   "no": "The note is about something else or only mentions the words in passing."}}}}
    req = urllib.request.Request(JEV_URL, data=json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + jev_key(), "Content-Type": "application/json"})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                out = json.loads(r.read())
            JEV_USAGE["calls"] += 1
            JEV_USAGE["input_tokens"] += out.get("usage", {}).get("input_tokens", 0)
            return out["answers"]["answers"]["noul"]
        except urllib.error.HTTPError as e:
            if e.code in (429, 529) and attempt < 4:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"TypeSafe HTTP {e.code}: {e.read()[:120]!r}")


def b_jev(q, case):
    jev_key()  # load once before the thread pool; lazy loading inside it raced (2026-09-30)
    pool = fts5_top(q, JEV_POOL)
    slots = [i for i, p in enumerate(pool) if jev_allowed(p)]
    sendable = [pool[i] for i in slots]
    with ThreadPoolExecutor(max_workers=8) as ex:
        probs = list(ex.map(lambda p: jev_answers(q, p), sendable))
    ranked = [p for _, p in sorted(zip(probs, sendable), key=lambda x: -x[0])]
    out = list(pool)
    for slot, p in zip(slots, ranked):
        out[slot] = p
    case["_jev_pool_hit"] = rank_of(pool, case["expected"])
    return out[:5]


def b_rg(q, case):
    exe = shutil.which("rg")
    if not exe:
        raise RuntimeError("rg not on PATH")
    rts = [str(r) for r in roots() if r.is_dir()]
    r = subprocess.run([exe, "-i", "-F", "-c", "--glob", "*.md", case["keyword"], *rts],
                       capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60)
    counts = []
    for line in r.stdout.splitlines():
        path, _, c = line.rpartition(":")
        if c.isdigit():
            counts.append((int(c), path))
    counts.sort(key=lambda x: -x[0])
    return [p for _, p in counts[:5]]


_RECALL_DB = None


def b_recall(q, case):
    """recall.py's own index (memsearch roots + whole vault, mtime-refreshed on disk)."""
    global _RECALL_DB
    if _RECALL_DB is None:
        _RECALL_DB = RECALL.open_index(RECALL.roots())
    return RECALL.fts5_top(_RECALL_DB, q, 5)


BACKENDS = {"memsearch": b_memsearch, "fts5": b_fts5, "rg": b_rg, "jev": b_jev, "recall": b_recall}


# ---------------- run ----------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backends", default="memsearch,fts5,rg")
    ap.add_argument("--label", default="", help="free text, e.g. the model or the change under test")
    ap.add_argument("--only", default="", help="comma list of case ids")
    a = ap.parse_args()

    cases = [json.loads(l) for l in (HERE / "questions.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
    if a.only:
        keep = set(a.only.split(","))
        cases = [c for c in cases if c["id"] in keep]
    rts = roots()
    missing_roots = [str(r) for r in rts if not r.is_dir()]

    # Coverage: is an expected file reachable under the configured roots here?
    allfiles = [f for r in rts if r.is_dir() for f in r.rglob("*.md")]
    for c in cases:
        c["covered"] = any(matches(f, c["expected"]) for f in allfiles)

    global _FTS
    backends = [b for b in a.backends.split(",") if b]
    # Chained after memsearch-drain in a scheduled task, this runs whether or not the
    # index finished. Don't let a partial index pass as a clean memsearch number.
    drain_log = HOME / ".claude" / "scripts" / "logs" / "memsearch-drain.log"
    if "memsearch" in backends and drain_log.exists():
        tail = drain_log.read_text(encoding="utf-8", errors="replace").strip().splitlines()[-1:]
        if not tail or "exit=0" not in tail[0]:
            a.label = (a.label + "-index-unverified").lstrip("-")
            print(f"memsearch-drain.log does not end in exit=0 ({tail[0][:80] if tail else 'empty'}); label -> {a.label}")
    build_s = None
    if "fts5" in backends or "jev" in backends:
        t = time.perf_counter()
        _FTS, nfiles = build_fts(rts)
        build_s = round(time.perf_counter() - t, 1)
        print(f"fts5: indexed {nfiles} files in {build_s}s")

    results = {b: [] for b in backends}
    for b in backends:
        for c in cases:
            t = time.perf_counter()
            err = None
            files = []
            try:
                files = BACKENDS[b](c["query"], c)
            except Exception as e:  # a failure is a data point, not a crash
                err = f"{type(e).__name__}: {e}"[:200]
            ms = round((time.perf_counter() - t) * 1000)
            rk = rank_of(files, c["expected"])
            row = {"id": c["id"], "layer": c["layer"], "rank": rk, "ms": ms, "error": err, "top": files}
            if b == "jev":
                row["pool_rank"] = c.pop("_jev_pool_hit", None)
            results[b].append(row)
            mark = "FAIL" if err else (f"@{rk}" if rk else "miss")
            print(f"  {b:9s} {c['id']:4s} {mark:5s} {ms:6d} ms  {c['query'][:60]}")

    machine = platform.node().lower()
    summary = {}
    for b, rs in results.items():
        n = len(rs)
        hit1 = sum(1 for r in rs if r["rank"] == 1)
        hit5 = sum(1 for r in rs if r["rank"] and r["rank"] <= 5)
        mrr = sum(1 / r["rank"] for r in rs if r["rank"]) / n if n else 0
        lat = sorted(r["ms"] for r in rs)
        fails = sum(1 for r in rs if r["error"])
        by_layer = {}
        for r in rs:
            L = by_layer.setdefault(r["layer"], [0, 0])
            L[1] += 1
            L[0] += 1 if r["rank"] and r["rank"] <= 5 else 0
        summary[b] = {"n": n, "hit1": hit1, "hit5": hit5, "mrr": round(mrr, 3),
                      "p50_ms": lat[len(lat) // 2] if lat else None,
                      "p95_ms": lat[min(len(lat) - 1, int(len(lat) * 0.95))] if lat else None,
                      "fail_pct": round(100 * fails / n, 1) if n else 0,
                      "by_layer": {k: f"{v[0]}/{v[1]}" for k, v in sorted(by_layer.items())}}
    cov = round(100 * sum(c["covered"] for c in cases) / len(cases), 1) if cases else 0

    today = datetime.date.today().isoformat()
    out = HERE / "results" / f"{today}-{machine}-{re.sub(r'[^A-Za-z0-9._-]+', '_', a.label or 'run').strip('_')}.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps({"date": today, "machine": machine, "label": a.label, "roots": [str(r) for r in rts],
                               "missing_roots": missing_roots, "coverage_pct": cov,
                               "uncovered": [c["id"] for c in cases if not c["covered"]],
                               "fts5_build_s": build_s, "summary": summary, "results": results}, indent=1), encoding="utf-8")

    ledger = HERE / "ledger.md"
    if not ledger.exists():
        ledger.write_text("# Recall eval ledger\n\nOne row per backend per run. Decision rule: audit section 6.2.\n\n"
                          "| date | machine | label | backend | n | hit@1 | hit@5 | MRR | p50 ms | p95 ms | fail% | coverage% | by layer (hit@5) |\n"
                          "|---|---|---|---|---|---|---|---|---|---|---|---|---|\n", encoding="utf-8")
    with ledger.open("a", encoding="utf-8") as fh:
        for b, s in summary.items():
            layers = ", ".join(f"{k} {v}" for k, v in s["by_layer"].items())
            fh.write(f"| {today} | {machine} | {a.label} | {b} | {s['n']} | {s['hit1']} | {s['hit5']} | {s['mrr']} | "
                     f"{s['p50_ms']} | {s['p95_ms']} | {s['fail_pct']} | {cov} | {layers} |\n")

    print(f"\ncoverage {cov}%  missing roots: {len(missing_roots)}  uncovered: {[c['id'] for c in cases if not c['covered']]}")
    for b, s in summary.items():
        print(f"{b:9s} hit@5 {s['hit5']}/{s['n']}  hit@1 {s['hit1']}  MRR {s['mrr']}  p50 {s['p50_ms']} ms  fail {s['fail_pct']}%  {s['by_layer']}")
    if "jev" in backends:
        print(f"jev: {JEV_USAGE['calls']} calls, {JEV_USAGE['input_tokens']} input tokens "
              f"(~${JEV_USAGE['input_tokens'] * 0.042 / 1e6:.4f} at $0.042/M)")
    print(f"results: {out}")


if __name__ == "__main__":
    main()
