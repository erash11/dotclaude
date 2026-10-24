---
name: recall-bench
description: "How to re-prove recall.py against a default session (13-question bench, 30-case eval, pass line), and how to add a question when Eric says 'add that to the recall test'"
metadata:
  node_type: memory
  type: reference
  originSessionId: 63512f11-b2b6-4527-80b7-1b13ddd0e4e8
  modified: 2026-10-24T02:35:26.479Z
---

Bench: `bash ~/.claude/scripts/recall-bench/run.sh C` (about $0.60; `run.sh A` adds the default session; `ASET=<set>` / `CSET=<set>` limit arm A / C to one set), then `python3 -I ~/.claude/scripts/recall-bench/score.py`; history in `~/.claude/scripts/recall-bench/results.md`. Move `out/` to `out-runN/` first and add it to `~/.claude/.gitignore` (evidence can hold athlete names). Eval: `python3 ~/.claude/audits/recall-eval/recall-eval.py --backends fts5,recall --label <label>` (30 cases, seconds, rows in `ledger.md`). Results 2026-10-23: recall.py 9/9 (run 5) and 4/4 on fresh Q10-13 (run 6); default session 6/9 and 3/4; memsearch 1.5/5. Related: [[brain-audit-loop]].

**"Add that to the recall test"** (Eric, after a session gave a wrong or stale answer): append one tab-separated row to `~/.claude/scripts/recall-bench/questions.tsv`: set `miss`, the question as Eric asked it, the file that holds the right answer (path relative to `~/.claude/projects/` or the vault, as the other rows do), and the right answer in one line. Confirm the answer with Eric if the session did not establish it. Then run `CSET=miss bash ~/.claude/scripts/recall-bench/run.sh C` (about $0.06 a question) and record the result in `results.md`. Do not tune recall.py on that question without re-running the 30-case eval.

**Why:** PDF principle 5: the setup must prove itself against a fresh default session on tokens, time and correctness, and keep being tuned. Real misses are the best new test questions.

**How to apply:** Run the eval after any ranking change (no model cost); run the bench before changing routing. Pass line: no new misses on Q1-5 vs the default arm.
