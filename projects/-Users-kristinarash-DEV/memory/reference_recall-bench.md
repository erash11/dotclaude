---
name: recall-bench
description: "How to re-prove recall.py against a default session: the 9-question bench, the 30-case eval, and the pass line"
metadata:
  type: reference
---

Bench: `bash ~/.claude/scripts/recall-bench/run.sh C` (about $0.60; `run.sh A` adds the default session), then `python3 -I ~/.claude/scripts/recall-bench/score.py`; history in `~/.claude/scripts/recall-bench/results.md`. Move `out/` to `out-runN/` first (gitignored; evidence can hold athlete names). Eval: `python3 ~/.claude/audits/recall-eval/recall-eval.py --backends fts5,recall --label <label>` (30 cases, seconds, rows in `ledger.md`). Run 4 (2026-10-23): recall.py 8/9, default 6/9, memsearch 1.5/5. Each headless bench run adds harmless `transcript_path does not exist` lines to `.errors.log`. Related: [[brain-audit-loop]].

**Why:** PDF principle 5: the setup must prove itself against a fresh default session on tokens, time and correctness.

**How to apply:** Run the eval after any ranking change (no model cost); run the bench before changing routing. Pass line: no new misses on Q1-5 vs the default arm.
