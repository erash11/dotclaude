"""Recall: answer-evidence for a question in plain code, before any model call.

The ladder: BM25 full-text search over local markdown (SQLite FTS5, ~10 ms) ->
open only the best file -> keep only the paragraphs that match (a short file
comes back whole) -> follow one pointer if those paragraphs miss most of the
keywords. Prints the evidence with file paths and line numbers; the model
answers from that in one go.

Roots: KeystoneOS/data/memory-index-paths.json (the memsearch roots, one home)
plus the whole SecondBrain vault and every ~/.claude/projects/*/memory folder,
which that file only partly covers.
The index lives in ~/.claude/cache/recall-fts.sqlite and refreshes by mtime on
each call; delete the file to force a full rebuild (~10 s).

Usage:
    python3 ~/.claude/scripts/recall.py "why did cloud-push fail on Drive"
    python3 ~/.claude/scripts/recall.py "..." --deep     # always also run memsearch (~10 s)
    python3 ~/.claude/scripts/recall.py "..." --quick    # never run memsearch
    python3 ~/.claude/scripts/recall.py "..." --top 5    # show more candidates

On no match, or a weak match (the opened files hold under half the question words), it runs
memsearch by itself: its meaning search found 3 of the 5 word-gap misses (2026-10-24).
Exit 0 = evidence printed, 1 = no match.
"""
import argparse
import glob
import json
import math
import os
import re
import sqlite3
import subprocess
import sys

HOME = os.path.expanduser("~")
DEV = os.path.join(HOME, "DEV")
VAULT = os.path.join(HOME, "SecondBrain")
KNOWLEDGE = os.path.join(HOME, ".claude/claude-memory-compiler/knowledge")
ROOTS_CFG = os.path.join(DEV, "KeystoneOS/data/memory-index-paths.json")
DB_PATH = os.path.join(HOME, ".claude/cache/recall-fts.sqlite")
SKIP_DIRS = {".obsidian", ".trash", ".git", "Archive", "archive", "Templates", "node_modules"}  # archive: superseded plans
BUDGET = 1800  # evidence chars per file; a whole paragraph is never cut
WHOLE = 4000   # a file body this small is returned whole (memory notes are short by design)
LEAD = 500     # a big file's opening paragraph up to this size is always shown

STOP = set("""a about after again all also an and any are as at be been before being both
but by can could did do does doing done for from had has have how i if in into is it its
me my no not of on or our out over should so than that the their them then there these they
this those to up us was we were what when where which while who why will with would you your
get got let make made many much more most now one only other same some such too very
just like each every first two three four off""".split())


def stem(w):
    """Crude suffix strip so 'scanned' meets 'scan' and 'pages' meets 'page'."""
    for suf in ("ing", "ed", "s"):
        if len(w) - len(suf) >= 3 and w.endswith(suf) and not w.endswith("ss"):
            w = w[: -len(suf)]
            break
    if len(w) > 3 and w[-1] == w[-2] and w[-1] not in "aeiouls":
        w = w[:-1]
    return w


def tokens(text):
    return [stem(t) for t in re.findall(r"[a-z0-9]+", text.lower())]


def keywords(question):
    seen = []
    for raw in re.findall(r"[a-z0-9]+", question.lower()):
        t = stem(raw)
        if raw not in STOP and t not in STOP and len(t) > 1 and t not in seen:
            seen.append(t)
    return seen


# ---- full-text index ----------------------------------------------------------

def roots(cfg=ROOTS_CFG):
    out = []
    try:
        for p in json.load(open(cfg, encoding="utf-8"))["paths"]:
            out.append(p.replace("{DEV}", DEV).replace("{VAULT}", VAULT).replace("{HOME}", HOME))
    except (OSError, ValueError, KeyError):
        pass
    # Every project's Tier A folder (Mac and old Windows slugs), not only the ones listed in the config.
    return out + [VAULT] + sorted(glob.glob(os.path.join(HOME, ".claude/projects/*/memory")))


def md_files(rts):
    """Every .md under the roots. os.walk does not follow symlinks, so a link into Drive cannot hang it."""
    seen = set()
    for r in rts:
        for dirpath, dirs, files in os.walk(r):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for f in files:
                p = os.path.join(dirpath, f)
                if f.endswith(".md") and p not in seen:
                    seen.add(p)
                    yield p


def open_index(rts, db_path=DB_PATH):
    """FTS5 table kept in step with the disk by mtime: only new or changed files are re-read."""
    if db_path != ":memory:":
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
    db = sqlite3.connect(db_path, timeout=60, isolation_level=None)
    if "name" not in [c[1] for c in db.execute("PRAGMA table_info(d)")]:  # pre-2026-10-24 index had no name column
        db.execute("DROP TABLE IF EXISTS d")
        db.execute("DROP TABLE IF EXISTS seen")
    db.execute("CREATE VIRTUAL TABLE IF NOT EXISTS d USING fts5(path UNINDEXED, name, body, tokenize='porter unicode61')")
    db.execute("CREATE TABLE IF NOT EXISTS seen(path TEXT PRIMARY KEY, mtime REAL)")
    db.execute("BEGIN IMMEDIATE")  # two refreshes at once could each insert the same new file
    old = dict(db.execute("SELECT path, mtime FROM seen"))
    now = {}
    for p in md_files(rts):
        try:
            now[p] = os.stat(p).st_mtime
        except OSError:
            pass
    stale = [p for p, m in now.items() if old.get(p) != m]
    gone = [p for p in old if p not in now]
    for p in gone + stale:
        db.execute("DELETE FROM d WHERE path = ?", (p,))
        db.execute("DELETE FROM seen WHERE path = ?", (p,))
    for p in stale:
        try:
            body = open(p, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        name = os.path.basename(p)[:-3].replace("-", " ").replace("_", " ")
        db.execute("INSERT INTO d VALUES (?, ?, ?)", (p, name, name + "\n" + body))
        db.execute("INSERT INTO seen VALUES (?, ?)", (p, now[p]))
    db.execute("COMMIT")
    return db


TOKEN = re.compile(r"[A-Za-z0-9][A-Za-z0-9\-]*")


def fts5_top(db, q, limit):
    """BM25 rank of whole files for a natural-language query (any word may match). The file name is
    in the body and also in its own column at weight 2: bench 11 -> 12 of 13, eval unchanged
    (recall-bench/results.md, 2026-10-24); weight 8 lost a bench row."""
    toks = [t for t in TOKEN.findall(q) if len(t) > 2]
    if not toks:
        return []
    expr = " OR ".join('"%s"' % t.replace('"', "") for t in toks)
    return [r[0] for r in db.execute(
        "SELECT path FROM d WHERE d MATCH ? ORDER BY bm25(d, 0.0, 2.0, 1.0) LIMIT ?", (expr, limit))]


def tier_a(p):
    """A Tier A memory file: short, hand-kept, newest word on its topic. The MEMORY.md index is not one."""
    return "/.claude/projects/" in p and "/memory/" in p and os.path.basename(p) != "MEMORY.md"


def about_hits(db, path, q, describe=True):
    """Question words in what the file says it is about: its name, plus (describe) its frontmatter
    description line. Memory names are topic slugs and their description is a one-line summary."""
    about = os.path.basename(path)[:-3].replace("_", " ").replace("-", " ")
    row = db.execute("SELECT body FROM d WHERE path = ?", (path,)).fetchone() if describe else None
    if row:
        head = row[0].split("\n")[:40]  # body starts with the name line, then the frontmatter
        if len(head) > 1 and head[1].strip() == "---":
            for line in head[2:]:
                if line.strip() == "---":
                    break
                if line.startswith("description:"):
                    about += " " + line.split(":", 1)[1]
    return len(set(keywords(q)) & set(tokens(about)))


def newest_copy(db, path):
    """Mac and old Windows slugs can hold the same memory file; the most recently changed copy wins."""
    name = os.path.basename(path)
    rows = [(m, p) for p, m in db.execute("SELECT path, mtime FROM seen WHERE path LIKE ?", ("%/" + name,))
            if os.path.basename(p) == name and tier_a(p)]
    return max(rows)[1] if rows else path


def rank(db, q, limit):
    """BM25 order, except a Tier A memory in the top 3 moves to #1 when what it says it is about
    (name + description) matches as many question words as #1's file name. Compiled knowledge
    articles and vault notes can be older than the memory that corrected them; the guard stops an
    off-topic memory jumping. (Giving #1 its title too lost n06 on the 30-case eval.)"""
    cands = [newest_copy(db, p) if tier_a(p) else p for p in fts5_top(db, q, max(limit, 3) + 3)]
    cands = list(dict.fromkeys(cands))
    # global-memory/handoffs keeps a .windows.md twin of many files; one copy is enough.
    cands = [p for p in cands if not (p.endswith(".windows.md") and p[:-len(".windows.md")] + ".md" in cands)]
    # The best-matching Tier A memory in the top 3, not the first: a superseded memory at #1 must
    # not shield the current one at #2 (p01 flipped on 2026-10-24 for this reason).
    tops = [p for p in cands[:3] if tier_a(p)]
    a = max(tops, key=lambda p: (about_hits(db, p, q), -cands.index(p))) if tops else None
    if a and a != cands[0] and about_hits(db, a, q) >= about_hits(db, cands[0], q, describe=False):
        cands.remove(a)
        cands.insert(0, a)
    return cands[:limit]


def idf_of(db, kws):
    n = db.execute("SELECT count(*) FROM seen").fetchone()[0] or 1
    out = {}
    for k in kws:
        try:
            df = db.execute("SELECT count(*) FROM d WHERE d MATCH ?", ('"%s"*' % k,)).fetchone()[0]
        except sqlite3.OperationalError:
            df = 0
        out[k] = math.log(1 + n / (1 + df))
    return out


# ---- inside the one chosen file --------------------------------------------

def paragraphs(path):
    """(first line no, heading, text) per blank-line block, frontmatter dropped except description."""
    lines = open(path, encoding="utf-8", errors="replace").read().split("\n")
    out, start, heading, buf = [], 0, "", []
    i = 0
    if lines and lines[0].strip() == "---":
        for j in range(1, len(lines)):
            if lines[j].strip() == "---":
                desc = [l for l in lines[1:j] if l.startswith("description:")]
                if desc:
                    out.append((2, "", desc[0]))
                i = j + 1
                break
    for n in range(i, len(lines) + 1):
        line = lines[n] if n < len(lines) else ""
        if line.strip() == "" or n == len(lines):
            if buf:
                out.append((start + 1, heading, "\n".join(buf)))
                buf = []
            continue
        if line.startswith("#"):
            if buf:
                out.append((start + 1, heading, "\n".join(buf)))
                buf = []
            heading = line.lstrip("#").strip()
            continue
        if not buf:
            start = n
        buf.append(line)
    return out


def best_paragraphs(path, kws, idf, k=3):
    paras = paragraphs(path)
    if sum(len(p[2]) for p in paras) <= WHOLE:
        return [(0, i, ln, h, t, {w for w in kws if w in set(tokens(h + " " + t))})
                for i, (ln, h, t) in enumerate(paras)]
    scored = []
    for pos, (ln, head, text) in enumerate(paras):
        toks = set(tokens(head + " " + text))
        s = sum(idf.get(w, 1) for w in kws if w in toks)
        if s:
            scored.append((s, pos, ln, head, text, {w for w in kws if w in toks}))
    scored.sort(key=lambda x: -x[0])
    chosen, used = [], 0
    for item in scored[:k]:
        if chosen and used + len(item[4]) > BUDGET:
            continue
        chosen.append(item)
        used += len(item[4])
    # The opening paragraph usually states the main fact ("deployed at <url>") in words the question
    # may not share, so a short one always comes along, outside the budget.
    lead = next(((pos, ln, h, t) for pos, (ln, h, t) in enumerate(paras) if not t.startswith("description:")), None)
    if lead and len(lead[3]) <= LEAD and lead[0] not in {c[1] for c in chosen}:
        pos, ln, h, t = lead
        chosen.append((0, pos, ln, h, t, {w for w in kws if w in set(tokens(h + " " + t))}))
    chosen.sort(key=lambda x: x[1])  # back to document order
    return chosen


def outline(path, limit=25):
    """Heading lines of a big file: a map of what the unread parts cover."""
    heads = [l.lstrip("#").strip() for l in open(path, encoding="utf-8", errors="replace")
             if re.match(r"#{1,4}\s", l)]
    return heads[:limit]


def pointers(text, from_path):
    """Resolvable [[name]] links and backticked .md paths, in order of appearance."""
    found = []
    for name in re.findall(r"\[\[([^\]|#]+)", text):
        name = name.strip()
        for cand in (os.path.join(os.path.dirname(from_path), name + ".md"),
                     os.path.join(os.path.dirname(from_path), "project_" + name + ".md"),
                     os.path.join(KNOWLEDGE, name + ".md")):
            if os.path.exists(cand):
                found.append(cand)
                break
        else:
            hits = glob.glob(os.path.join(VAULT, "**", name + ".md"), recursive=True)
            if hits:
                found.append(hits[0])
    for p in re.findall(r"`(~?/[^`\s]+\.md)`", text):
        p = os.path.expanduser(p)
        if os.path.exists(p):
            found.append(p)
    return [p for p in dict.fromkeys(found) if os.path.abspath(p) != os.path.abspath(from_path)]


def gather(question, db, top=3):
    """Returns (kws, candidates, evidence) where evidence is [(path, [paragraph tuples])]."""
    kws = keywords(question)
    cands = rank(db, question, top)
    if not cands or not os.path.exists(cands[0]):
        return kws, cands, []
    idf = idf_of(db, kws)
    path = cands[0]
    chosen = best_paragraphs(path, kws, idf)
    evidence = [(path, chosen)]
    covered = set().union(*(c[5] for c in chosen)) if chosen else set()
    # One hop, gated: only when this file misses at least half the keywords.
    if len(covered) * 2 < len(kws):
        text = "\n".join(c[4] for c in chosen) or open(path, encoding="utf-8", errors="replace").read()
        for target in pointers(text, path)[:1]:
            extra = best_paragraphs(target, kws, idf)
            if extra and set().union(*(c[5] for c in extra)) - covered:
                evidence.append((target, extra))
    return kws, cands, evidence


def short(p):
    return p.replace(HOME, "~")


def memory_first(hits, limit=5):
    """memsearch hits -> one best chunk per file, Tier A memory files first, at most `limit` files.
    Same idea as rank()'s Tier A rule. Eval 2026-10-25 (30 cases): hit@1 13 -> 16, hit@5 25 -> 27,
    no vault case worse. A Windows-slug twin is dropped when the Mac copy is also listed;
    _archive memories are old versions, so they do not move up."""
    best = {}
    for h in hits:
        best.setdefault(h["source"], h)  # memsearch returns best score first
    win = lambda p: "/projects/C--" in p or "/projects/c--" in p
    mac_names = {os.path.basename(p) for p in best if not win(p)}
    files = [p for p in best if not (win(p) and os.path.basename(p) in mac_names)]
    up = lambda p: tier_a(p) and "/_archive/" not in p
    return [best[p] for p in [p for p in files if up(p)] + [p for p in files if not up(p)]][:limit]


def memsearch_hits(question):
    """memsearch's top 20 chunks (meaning + keyword search over the memsearch roots), memory files first,
    5 files shown; about 8-10 s (top 20 costs the same as top 5, measured 2026-10-25)."""
    exe = os.path.join(HOME, ".local/bin/memsearch")
    try:
        res = subprocess.run([exe if os.path.exists(exe) else "memsearch", "search", question, "--top-k", "20", "-j"],
                             capture_output=True, text=True, timeout=45)  # ~4x measured; a locked index must not hang a ~1 s tool
    except (OSError, subprocess.TimeoutExpired) as e:
        return f"memsearch did not run: {e}"
    if res.stdout.strip():
        try:
            hits = json.loads(res.stdout[res.stdout.find("["):])
        except ValueError:
            return res.stdout  # not JSON: show memsearch's own text rather than nothing
        out = []
        for n, h in enumerate(memory_first(hits), 1):
            body = h["content"] if len(h["content"]) <= 600 else (
                h["content"][:600] + f"\n  ... [truncated, run 'memsearch expand {h['chunk_hash']}' for full content]")
            out.append(f"--- Result {n} ---\nSource: {short(h['source'])} (lines {h['start_line']}-{h['end_line']})\n{body}")
        return "\n\n".join(out) + "\n" if out else "memsearch: no hits.\n"
    # memsearch exits 0 with empty stdout when it fails; an empty section reads as "no match".
    # Seen 2026-10-25: the SessionEnd re-index (memsearch-sync.js worker) held the Milvus lock for 15+ min.
    if "DataDirLockedError" in res.stderr or "holds the lock" in res.stderr:
        return "memsearch DID NOT RUN: an index run holds its lock (it re-indexes after each session ends). Retry in a few minutes."
    last = (res.stderr.strip().splitlines() or ["no output"])[-1][:200]
    return f"memsearch DID NOT RUN: {last}"


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("question")
    ap.add_argument("--top", type=int, default=3, help="candidates to list")
    ap.add_argument("--deep", action="store_true", help="always also run memsearch")
    ap.add_argument("--quick", action="store_true", help="never run memsearch")
    a = ap.parse_args(argv)

    db = open_index(roots())
    kws, cands, evidence = gather(a.question, db, a.top)

    print(f"# recall: {a.question}")
    print(f"keywords: {' '.join(kws)}")
    print("candidates (BM25, Tier A memory first, only #1 opened): " + "  ".join(short(c) for c in cands))
    if not evidence or not evidence[0][1]:
        print("\nNO MATCH in the word index.")
        if not a.quick:
            print("\n## memsearch (meaning search)\n" + memsearch_hits(a.question))
        return 1
    covered = set().union(*(c[5] for _, chosen in evidence for c in chosen))
    for path, chosen in evidence:
        print(f"\n## {short(path)}")
        heads = outline(path)
        if len(chosen) < len(paragraphs(path)) and heads:
            print("outline: " + " | ".join(heads))
        for _, _, ln, head, text, _ in chosen:
            print(f"\n[line {ln}{' · ' + head if head else ''}]\n{text}")
    weak = len(covered) * 2 < len(kws)
    if weak:
        print(f"\nWEAK MATCH: these files hold {len(covered)} of {len(kws)} question words; "
              "the notes may use other words.")
    if (weak or a.deep) and not a.quick:
        print("\n## memsearch (meaning search)\n" + memsearch_hits(a.question))
    return 0


if __name__ == "__main__":
    sys.exit(main())
