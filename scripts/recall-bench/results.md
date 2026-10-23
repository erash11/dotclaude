# Recall bench results

Model: Sonnet, both arms. A = default session; B = memsearch top-5 + 1 tool-less call (run 1 only); C = recall.py + 1 tool-less call.
Correct = judged by hand against questions.tsv ground truth.

## Run 2026-10-23 (3): recall.py on BM25 (fts5) + paragraph picker

The index-only ranker (run 2) lost to the fts5 BM25 search already in
`~/.claude/audits/recall-eval/` on its 30-case eval (hit@1 17 vs 19, hit@5 23 vs 25).
recall.py now ranks with that BM25 (one home: recall-eval.py imports it) and keeps
its own part: open the #1 file, return matching paragraphs with line numbers.
30-case eval after the swap: fts5 25/30 hit@5, 19 hit@1; recall.py's index (adds the whole vault) 25/30, 18.

```
| Q | Set | Arm | Tokens | Cost $ | Wall s | code s |
|---|---|---|---:|---:|---:|---:|
| 1 | orig | C | 18,175 | 0.062 | 50.0 | 2.4 |
| 2 | orig | C | 17,607 | 0.059 | 46.0 | 4.2 |
| 3 | orig | C | 18,015 | 0.062 | 47.3 | 6.1 |
| 4 | orig | C | 18,582 | 0.063 | 57.7 | 4.8 |
| 5 | orig | C | 18,034 | 0.061 | 47.7 | 4.7 |
| 6 | held | A | 103,278 | 0.174 | 25.8 |  |
| 6 | held | C | 17,684 | 0.060 | 48.5 | 3.1 |
| 7 | held | A | 103,366 | 0.174 | 32.2 |  |
| 7 | held | C | 17,358 | 0.058 | 30.4 | 2.7 |
| 8 | held | A | 104,479 | 0.180 | 37.8 |  |
| 8 | held | C | 18,265 | 0.063 | 31.7 | 1.2 |
| 9 | held | A | 161,605 | 0.193 | 88.7 |  |
| 9 | held | C | 18,526 | 0.062 | 32.4 | 1.5 |
TOTAL A (4 q): tokens 472,728  cost $0.721  wall 184s
TOTAL C (9 q): tokens 162,246  cost $0.551  wall 392s
```

| Set | A default | C run 2 (index lines) | C run 3 (BM25) |
|---|---|---|---|
| orig Q1-5 | 4 / 5 | 4.5 / 5 | 3 / 5 |
| held Q6-9 | 2 / 4 | 2 / 4 | 4 / 4 |
| all 9 | 6 / 9 (Q1-5 from run 1) | 6.5 / 9 | 7 / 9 |

Run 3 misses: Q2 opened an older knowledge article and gave the OLD, wrong fix (Full Disk Access)
with confidence; the current Tier A memory was #2. Q3 opened a knowledge article; the Tier A memory was #2.
Pattern: compiled knowledge can outrank the newer Tier A memory on the same topic.

## Run 2026-10-23 (2): recall.py

```
| Q | Set | Arm | Tokens | Cost $ | Wall s | code s |
|---|---|---|---:|---:|---:|---:|
| 1 | orig | C | 17,081 | 0.056 | 19.0 | 1.9 |
| 2 | orig | C | 18,056 | 0.061 | 18.4 | 2.0 |
| 3 | orig | C | 18,450 | 0.064 | 17.4 | 2.0 |
| 4 | orig | C | 17,971 | 0.061 | 18.6 | 2.4 |
| 5 | orig | C | 17,526 | 0.059 | 16.9 | 2.1 |
| 6 | held | A | 103,278 | 0.174 | 25.8 |  |
| 6 | held | C | 17,438 | 0.058 | 15.0 | 1.9 |
| 7 | held | A | 103,366 | 0.174 | 32.2 |  |
| 7 | held | C | 17,269 | 0.057 | 17.9 | 2.3 |
| 8 | held | A | 104,479 | 0.180 | 37.8 |  |
| 8 | held | C | 18,306 | 0.064 | 31.7 | 3.3 |
| 9 | held | A | 161,605 | 0.193 | 88.7 |  |
| 9 | held | C | 17,581 | 0.058 | 18.5 | 1.8 |
TOTAL A (4 q): tokens 472,728  cost $0.721  wall 184s
TOTAL C (9 q): tokens 159,678  cost $0.539  wall 173s

```

| Set | A default | B memsearch | C recall.py |
|---|---|---|---|
| orig Q1-5 (recall.py was tuned on these) | 4 / 5 | 1.5 / 5 | 4.5 / 5 |
| held Q6-9 (written before any code) | 2 / 4 | not run | 2 / 4 |

Misses. C: Q5 second half lives in another file; Q6 right file ranked #2 (tie on keyword hits); Q9 vault note not reachable from its file name.
A: Q8 did not find the fix; Q9 answered a different question. Q5 (run 1) lost its own answer to a background task.

## Run 2026-10-23 (1): default vs memsearch, Q1-5

| Q | A tokens | A s | B tokens | B s (memsearch s) |
|---|---:|---:|---:|---:|
| 1 | 101,560 | 40 | 18,390 | 150 (109) |
| 2 | 101,617 | 43 | 18,308 | 85 (67) |
| 3 | 102,138 | 31 | 18,483 | 82 (53) |
| 4 | 104,276 | 176 | 18,519 | 88 (54) |
| 5 | 57,456 | 693 | 18,147 | 207 (166) |
| total | 467,047 ($0.90) | 983 | 91,847 ($0.32) | 612 |
