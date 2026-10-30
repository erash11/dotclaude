"""Unattended recall check: does recall.py still open the right file? No model call, seconds.

Asks recall.py every question in the 30-case eval (audits/recall-eval/questions.jsonl) and the
bench (questions.tsv here), and compares with baseline.json. Prints one line. Exit 1 when a
score drops below the baseline, so the daily backup logs it to .errors.log, which every
session shows at startup. Nobody has to remember to run it.

Usage:
    python3 -I ~/.claude/scripts/recall-bench/check.py                     # check
    python3 -I ~/.claude/scripts/recall-bench/check.py --update-baseline   # after a deliberate change
"""
import argparse
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
HOME = os.path.expanduser("~")
EVAL = os.path.join(HOME, ".claude/audits/recall-eval/questions.jsonl")
BENCH = os.path.join(HERE, "questions.tsv")
BASELINE = os.path.join(HERE, "baseline.json")

_spec = importlib.util.spec_from_file_location("recall", os.path.join(HERE, "..", "recall.py"))
recall = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(recall)


def rank_of(files, expected):
    """1-based rank of the first file whose path contains an expected fragment (recall-eval's rule)."""
    for i, f in enumerate(files, 1):
        if any(e.lower() in f.replace("\\", "/").lower() for e in expected):
            return i
    return None


def scores(db):
    cases = [json.loads(l) for l in open(EVAL, encoding="utf-8") if l.strip()]
    ranks = [rank_of(recall.rank(db, c["query"], 5), c["expected"]) for c in cases]
    rows = [l.rstrip("\n").split("\t") for l in open(BENCH, encoding="utf-8")
            if l.strip() and not l.startswith("#")]
    hits = [r[1] for r in rows if rank_of(recall.rank(db, r[1], 1), [os.path.basename(r[2])]) == 1]
    return {"eval_hit1": sum(r == 1 for r in ranks), "eval_hit5": sum(r is not None for r in ranks),
            "eval_n": len(cases), "bench_top1": len(hits), "bench_n": len(rows), "bench_hits": hits}


def drops(now, base):
    """Scores below the baseline, and any baseline bench hit now missed (so a new hit cannot hide it).
    A bigger question set with the same hits is not a drop."""
    out = [f"{k} {now[k]} < {base[k]}" for k in ("eval_hit1", "eval_hit5", "bench_top1")
           if k in base and now[k] < base[k]]
    lost = [q for q in base.get("bench_hits", []) if q not in now.get("bench_hits", [])]
    return out + [f"bench lost: {q}" for q in lost]


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--update-baseline", action="store_true")
    a = ap.parse_args(argv)
    now = scores(recall.open_index(recall.roots()))
    line = (f"eval hit@1 {now['eval_hit1']}/{now['eval_n']} hit@5 {now['eval_hit5']}/{now['eval_n']}, "
            f"bench top-1 {now['bench_top1']}/{now['bench_n']}")
    if a.update_baseline:
        with open(BASELINE, "w", encoding="utf-8") as fh:
            json.dump(now, fh, indent=2)
        print(f"recall-check: baseline set: {line}")
        return 0
    try:
        base = json.load(open(BASELINE, encoding="utf-8"))
    except (OSError, ValueError):
        print(f"recall-check: no baseline ({BASELINE}); run with --update-baseline. Now: {line}")
        return 1
    bad = drops(now, base)
    if bad:
        print(f"recall-check: DROP {'; '.join(bad)} ({line}). recall.py now opens a worse file for some "
              f"questions: compare with ~/.claude/scripts/recall-bench/results.md, or --update-baseline if intended")
        return 1
    print(f"recall-check: OK {line}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
