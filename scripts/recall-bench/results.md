# Recall bench results

Model: Sonnet, both arms. A = default session; B = memsearch top-5 + 1 tool-less call (run 1 only); C = recall.py + 1 tool-less call.
Correct = judged by hand against questions.tsv ground truth.

## Run 2026-10-24: ranking tweaks (code only, no model calls)

Asked: can recall.py beat 21/30? Of the 9 hit@1 misses, 4 have the right file in the top 5
(Issurin, Gallucci, Kitman, renv) and 5 are word gaps BM25 cannot bridge (persist vs residual,
Soviet vs Kots, "three deep" vs depth-2, unmanaged backup dirs, TypeSafe key). renv is a label
issue: the #1 handoff holds `RENV_PATHS_LIBRARY_ROOT`. Issurin's #1 is his other book.

Tried on a scratch index (grid in the session scratchpad, not kept):
- FTS5 column weights alone barely move a score: FTS5 adds weighted hits into one tf before
  saturation, so a big body tf swamps the name. Scoring name and body apart (BM25F-like) reached
  hit@1 23, but lost one hit@5 (v08) and one bench row (4). Rejected as fitting the test.
- Parent folder and camelCase words in the name: +v02/+v09 only together with the split score
  above; same losses.

Kept (eval 21/30, hit@5 25/30 unchanged; bench 11 -> 12 of 13, row 3 CMJ backfill):
- name column at weight 2 (weights 2-4 were a plateau; 8 lost bench row 4);
- best-matching Tier A in the top 3 wins, not the first (p01 had flipped when a superseded
  memory at #1 gained words);
- folders named `archive` skipped (5 archived KeystoneOS plans arrived with the 10:36 harvest
  and pushed p03 to 20/30 for old and new code alike);
- WEAK MATCH line when the opened files hold under half the question words; it names memsearch.
  On the eval it fires on 4 of 30: 3 misses (p02, s01, n07) and 1 hit (n04).

The rest needs meaning-based search. memsearch on the 5 word-gap misses (after the 10:56
index): found s01, n07 (#1) and n01 (in top 5); missed s02, n02. About 8-10 s each, not the
~1 min of 10-23. So recall.py now runs memsearch itself on a weak or no match (`--quick` skips
it, `--deep` forces it); one such run took 8.8 s and printed 6.6 KB. Baseline updated.

## Run 2026-10-23 (6): 4 fresh questions (Q10-13)

Picked blind: one random note each from Tier A ~/DEV, a Tier A project slug, the vault library,
and the compiled knowledge (seed 20261023, excluding every file used by the bench or the eval);
questions worded in Eric's voice and answers fixed before any run.

| Q | Topic | A default | C first try | C after fix |
|---|---|---|---|---|
| 10 | rsync re-sends to Drive | right | right | right |
| 11 | simulator URL + RATIO | right | half (URL missed) | right |
| 12 | Verkhoshansky deload length | right gist, unsourced ("from memory") | right, cited | right |
| 13 | Drive scan no progress | wrong (blamed the FUSE hang; cause was Mac sleep) | right | right |
| total | | 3/4, 371,491 tokens, $0.671 | 3.5/4, 71,964 tokens, $0.241 | 4/4 |

Q11 miss: the big file's opening line held the URL ("deployed at ...") with no words in common
with "web address". Fix: a big file's opening paragraph (<= 500 chars) is always shown.
That fix was made after seeing Q11, so Q10-13 are no longer held out. Q1-9 not rerun after it
(it only adds a short paragraph).

## Run 2026-10-23 (5): all memory folders + description guard

Changes since run 4: roots add every `~/.claude/projects/*/memory`; the newest Mac/Windows copy
of a memory wins; the Tier A guard counts the memory's name + description against #1's file name
(not #1's title: that lost n06). 30-case eval hit@1 21, hit@5 25/30.

C: 9/9 (orig 5/5, held 4/4). 163,387 tokens, $0.555, 85 s for all 9. Q3 now opens
`project_drive-fuse-read-hang.md`: gws API, not the mount; skip `02_Raw_Tagging`.
Default session (run 3 figures): orig 4/5, held 2/4.

## Run 2026-10-23 (4): Tier A memory first (name guard)

Change: a Tier A memory in the BM25 top 3 moves to #1 when its file name matches as many
question words as #1's name. 30-case eval (no model): hit@1 18 -> 22 (fts5 alone: 19),
hit@5 25/30 unchanged, no case worse (p03, p10, n04, n06 rose to #1). A guard on body
coverage instead let an off-topic memory jump on n03; the name guard blocks it.

| Q | Set | C tokens | C $ | C s | code s |
|---|---|---:|---:|---:|---:|
| 1 | orig | 17,808 | 0.066 | 18.5 | 1.8 |
| 2 | orig | 18,253 | 0.063 | 15.4 | 1.1 |
| 3 | orig | 17,978 | 0.062 | 14.5 | 0.4 |
| 4 | orig | 18,602 | 0.063 | 9.9 | 0.7 |
| 5 | orig | 18,063 | 0.061 | 9.1 | 0.3 |
| 6 | held | 17,692 | 0.060 | 9.9 | 0.4 |
| 7 | held | 17,340 | 0.057 | 14.5 | 0.3 |
| 8 | held | 18,250 | 0.063 | 11.6 | 0.4 |
| 9 | held | 18,702 | 0.064 | 9.3 | 0.3 |
| total | | 162,688 | 0.559 | 113 | |

A (default) is the run-3 figures for Q6-9: 472,728 tokens, $0.721, 184 s.

| Set | A default | C run 3 | C run 4 |
|---|---|---|---|
| orig Q1-5 | 4 / 5 | 3 / 5 | 4 / 5 |
| held Q6-9 | 2 / 4 | 4 / 4 | 4 / 4 |

Q2 now opens project_cloud-push-launchd-blocked.md and gives the Terminal fix.
Miss: Q3 said NOT FOUND (honest): the right memory is not in the top 3; a Drive dedupe article wins.
Pass line for routing (no new misses on Q1-5 vs default) is met.

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
