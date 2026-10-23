"""Table of tokens, cost and time per question and arm, plus each answer next to the ground truth.
Run: python3 -I ~/.claude/scripts/recall-bench/score.py
"""
import json, pathlib

here = pathlib.Path(__file__).resolve().parent
out = here / "out"
qs = [l.rstrip("\n").split("\t") for l in open(here / "questions.tsv") if not l.startswith("#")]
rows = []
for n, (st, q, gtf, gta) in enumerate(qs, 1):
    for arm in "AC":
        f = out / f"{arm}{n}.json"
        if not f.exists():
            continue
        j = json.loads(f.read_text())
        u = j.get("usage", {})
        tok = sum(u.get(k, 0) for k in ("input_tokens", "cache_creation_input_tokens",
                                       "cache_read_input_tokens", "output_tokens"))
        w = [float(x) for x in (out / f"{arm}{n}.wall").read_text().split()]
        rows.append((n, st, arm, tok, j.get("total_cost_usd", 0), w[-1] - w[0],
                     (w[1] - w[0]) if arm == "C" else None, (j.get("result") or "").replace("\n", " "), gta))
print("| Q | Set | Arm | Tokens | Cost $ | Wall s | code s |")
print("|---|---|---|---:|---:|---:|---:|")
for n, st, arm, tok, cost, wall, code, *_ in rows:
    print(f"| {n} | {st} | {arm} | {tok:,} | {cost:.3f} | {wall:.1f} | {'' if code is None else f'{code:.1f}'} |")
for arm in "AC":
    r = [x for x in rows if x[2] == arm]
    if r:
        print(f"TOTAL {arm} ({len(r)} q): tokens {sum(x[3] for x in r):,}  cost ${sum(x[4] for x in r):.3f}  wall {sum(x[5] for x in r):.0f}s")
print()
for n, st, arm, *_, ans, gta in rows:
    print(f"Q{n} {arm}: {ans}\n   TRUTH: {gta}\n")
