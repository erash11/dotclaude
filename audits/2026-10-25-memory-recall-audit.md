# Memory and recall audit — 2026-10-25 (Mac)

Asked: is our memory and recall setup the most efficient one we can have, given what
other people and repos are doing? Builds on `2026-09-30-memory-infra-audit.md` (which
chose the search engines). This one measures cost against use, and compares outside options.

[M] = measured today on this Mac. [W] = web source (survey by a research subagent; URLs below).

## 1. Decision this audit supports

**The design is right. Keep it. Cut one cost, fix one silent failure, tidy two piles.**

| # | Call | Why (short) |
|---|---|---|
| 1 | **Stop the daily compile step** of claude-memory-compiler. Keep the per-session flush into daily logs. Keep the 536 articles as a frozen, searchable archive. | $27–32/month of quota, rising; articles opened directly in 3 of ~191 sessions; a stale article has outranked a newer memory with a wrong fix [M]. Upstream repo unmaintained since 2026-04-06 [W]. |
| 2 | **Fixed today:** recall.py printed an empty memsearch section when memsearch was locked. | Reads as "no match" instead of "search was down" [M]. |
| 3 | Fold the 6 Windows-only Tier A memories into Mac slugs, then archive the `C--Users-eric-rash-*` / `c--…` / `G--…` slugs. | 145 Windows files, 139 are twins of Mac files; laptop retired [M]. |
| 4 | Split the two fattest Tier A files; add a size warning to memlint (e.g. > 6 KB). | `project_backup-sync-system.md` is 34.7 KB (~8.7k tokens per read); "one fact per file" has eroded [M]. |
| 5 | **Do not install** claude-mem, mem0, Letta, Zep/Graphiti, Cognee, Supermemory. | Each adds always-on token cost or a database; none beats BM25 + one-line index at this scale [W]. |
| 6 | Optional test later: **QMD** as one replacement for recall.py + memsearch. Adopt only if it beats recall.py on the 30-case eval and 14-question bench. | One local SQLite file: BM25 + vectors + rerank, MIT, 30k stars [W]. Not tested here. |

## 2. What exists (sizes and real use)

Use = last 30 days, Mac. 415 transcripts, of which 224 are the compiler's own background
runs, so ~191 real sessions [M].

| Layer | Size | Loads | Used (30 d) |
|---|---|---|---|
| Global USER.md + MEMORY.md (Tier B) | 1.3 + 2.1 KB | every session (hook) | always |
| Tier A `~/DEV` memory: index + 79 files | 9.2 KB index; 296 KB files | index every session; files on demand | Tier A files read in 105 sessions (463 reads) |
| Other Tier A slugs (Mac) | ~60 files | index when cwd matches | in the 105 above |
| Windows Tier A twins | 145 files | never (machine retired) | 0; recall.py needs "newest copy wins" logic to cope |
| Repo `docs/STATUS.md` (session routine) | per repo | read at start | **113 sessions, 1,508 reads** — the busiest recall path |
| `where-was-i.py` | — | on ask | 56 sessions |
| Compiler daily logs | 131 files, 1.1 MB | pointer only | read in 18 sessions; indexed by recall + memsearch |
| Compiler knowledge articles | 536 files, 4.3 MB; index.md 141 KB | pointer only | **opened in 3 sessions (7 reads); `query.py` 0 uses ever** |
| recall.py (SQLite FTS5 BM25) | in-memory index | on ask, ~1 s | 5 sessions — but only 2 days old as the L1 route |
| memsearch (Milvus Lite, local bge-m3 ONNX) | 456 MB | on ask, ~8–10 s | 28 sessions, 74 calls |
| SecondBrain vault | 2,399 notes | on ask | 39 sessions |
| graphify | 6+ graphs | on ask | 49 sessions (different job: code structure) |
| context-mode FTS5 | 170 MB | plugin | `ctx_search` 9 calls (was 448 on Windows in Sept) |
| Zotero MCP learnings/recall | — | — | 0 |

## 3. Efficiency on three axes

- **Tokens per session: fine.** Startup memory load is ~25 KB (~6k tokens): CLAUDE.md files
  10.7 KB, Tier A index 9.2 KB, KeystoneOS snapshot 3.9 KB, compiler pointer 0.9 KB [M].
  Native limit is 25 KB / 200 lines for the auto-memory index [W]; ours is 9.2 KB / ~80 lines.
- **Seconds per recall: fine.** recall.py ~1 s; memsearch ~8–10 s on a weak match.
  The recall bench shows recall.py + one call answers at ~$0.06 and ~18k tokens a question,
  vs ~100k+ tokens and $0.17+ for a default session, with equal or better accuracy on
  13 questions (results.md, runs 3–6) [M]. Honest limit: recall.py has 2 days of real use,
  and the eval was used to tune it (risk of fitting the test; noted in results.md).
- **Money (subscription quota) per month: one leak.** Compile cost by month [M, state.json]:

  | Month | Logs | Cost | Per log |
  |---|---:|---:|---:|
  | 2026-04 | 8 | $4.64 | $0.58 |
  | 2026-06 | 23 | $15.31 | $0.67 |
  | 2026-09 | 28 | $32.26 | $1.15 |
  | 2026-10 (to 24th) | 22 | $27.03 | $1.23 |

  Per-log cost doubled since April because each compile reads a bigger knowledge base.
  Total to date: $134. Flush (per session) adds roughly $4–9/month (176 flushes × $0.02–0.05).
  Everything else is free (local search, local embeddings).

## 4. Findings, ranked

1. **The compile step costs the most and is used the least.** 536 articles, opened directly
   in 3 sessions; 1 of 30 eval cases and 3 of 13 bench questions have an article as the answer.
   Of those 3 bench facts, 2 are also in the raw daily logs (CMJ counts in `daily/2026-06-10.md`;
   caffeinate fix in `daily/2026-10-21.md` and others); 1 (the FLUSH_ERROR fix command) is only in
   the article. Stopping compile keeps all existing articles searchable; only new synthesis stops.
   Risk is the one outside critics name: a wiki the model keeps rewriting drifts into confident
   wrong facts [W]. We saw it: bench run 3, Q2, an older article gave the old, wrong fix
   (Full Disk Access) with confidence while the current Tier A memory sat at #2 [M].
2. **memsearch fails silently while it re-indexes (fixed in recall.py today).** Each SessionEnd
   starts a detached `memsearch index` worker (`hooks/memsearch-sync.js`). While it runs, Milvus
   Lite holds a file lock; `memsearch search` then exits 0 with empty stdout. Today's run started
   16:08:45 and held the lock 1,362 s (~23 min) [M]; the 10-24 run indexed 7 chunks and was quick. recall.py printed an empty "## memsearch" section.
   It now prints `memsearch DID NOT RUN: an index run holds its lock ... Retry in a few minutes.`
   Test added (`scripts/test_recall.py`). Not fixed: the lock itself (search still unavailable
   during long index runs). The index log is overwritten each run, so run lengths have no history.
3. **Windows twins are dead weight.** 145 files under Windows slugs; only 6 names have no Mac twin:
   `feedback_bair-document-styling.md`, `feedback_newsletter.md`, `project_issue01_status.md`,
   `project_no-kitman-myelin-decision.md`, `project_proulx-approval-status.md`, `user_eric_rash.md` [M].
4. **Tier A files have grown fat.** Top: backup-sync-system 34.7 KB, skill-bloat 13.6 KB,
   command-centre 9.0 KB, fireflies-cli 8.4 KB, zotero-reference 8.4 KB [M]. Each read of the big
   one costs ~8.7k tokens. Outside consensus: fewer, smaller memories; load just in time [W].
5. **Keyword vs meaning search: blending did not help (measured).** Two separate lists cover
   28/30; one fused list does worse. The current recall.py shape is right. See section 5.
6. **Usage moved to repo docs.** `docs/STATUS.md` (113 sessions) and Tier A (105) carry real recall.
   That is the native, just-in-time pattern Anthropic recommends [W]. Good — keep pushing durable
   facts into repo docs and Tier A, not new stores.

## 5. Blend test: BM25 + meaning search fused (RRF)

30-case eval, top-5 [M]. Scratch script, not kept (`$CLAUDE_JOB_DIR/tmp/rrf_eval.py`).

Run after the SessionEnd index released its lock (that run held it 1,362 s). A first try during
the lock scored memsearch 4/5 of 30 — that is the silent failure in finding 2, not a ranking result.

| Ranker | hit@1 | hit@5 |
|---|---:|---:|
| recall.py (BM25) | **21** | **25** |
| memsearch (hybrid vector) | 13 | 25 |
| RRF fusion, equal weight | 19 | 25 |
| RRF fusion, BM25 weight 2 | 21 | 24 |
| Either one in its own top 5 | — | **28** |

recall.py misses s01, s02, n01, n02, n07; memsearch finds 3 of them (s01, n01, n07).
**Fusing into one list loses; showing both lists separately (recall.py's current weak-match
fallback) wins.** Keep the current shape. memsearch hit@5 was 28–29/30 on 10-01 and is 25 now
(index has changed since); not investigated.

## 6. Outside options (web survey, 2026-10-25)

| System | Verdict for us | Why |
|---|---|---|
| Claude Code native auto memory | Keep (already the base) | Index + on-demand files = Anthropic's own just-in-time advice |
| claude-mem (103k stars) | No | Own issue tracker: heavy token use per turn, worker process |
| mem0 / OpenMemory | No | Built for apps; vector + graph DB; benchmark claims disputed |
| Letta / Letta Code | No (borrow ideas) | Replaces Claude Code; its "memory in git" idea we already have (Tier A is in the `~/.claude` repo) |
| Zep / Graphiti, Cognee | No | LLM call per write + graph DB; overkill for one user |
| Basic Memory | Maybe later | Markdown + SQLite over MCP; AGPL; overlaps recall.py |
| Supermemory | No | Cloud-first; always-on profile injection |
| QMD (tobi/qmd) | **Test** | One SQLite file: BM25 + vectors + rerank; could replace recall.py + memsearch |
| memsearch | Keep as fallback | Free, local; lock issue above |
| Karpathy LLM wiki (our compiler) | Freeze | Critique: drifts past ~100–200 sources; treat raw logs as truth |

Best evidence on method [W]: a controlled LongMemEval ablation (arXiv 2608.29606, Aug 2026) gave an
agent one search channel at a time: hybrid 95.2, embeddings 94.0, grep 93.6, BM25 93.4. Inside an
agent loop the channel moves results 1–2 points; the agent matters more. Letta's LoCoMo run found
plain file tools beat a graph-memory product. This matches our numbers: BM25 + a short index is
near the ceiling; spend effort on what is stored, not on search engines.

Sources: code.claude.com/docs/en/memory · anthropic.com/engineering/effective-context-engineering-for-ai-agents ·
github.com/thedotmack/claude-mem · github.com/mem0ai/mem0 · letta.com/blog/benchmarking-ai-agent-memory ·
github.com/getzep/graphiti · github.com/basicmachines-co/basic-memory · github.com/tobi/qmd ·
github.com/zilliztech/memsearch · gist.github.com/karpathy/442a6bf555914893e9891c11519de94f ·
arxiv.org/html/2608.29606v1 · github.com/coleam00/claude-memory-compiler.
Unverified: "Auto Dream" consolidation in Claude Code (secondary posts only); exact sleep-time figures.

## 7. Not checked

- QMD was not installed or run.
- How often SessionEnd index runs are long (index log keeps only the last run).
- Whether stopping compile changes recall on new topics; re-run the bench 4 weeks after stopping.
- context-mode usage drop (448 → 9 `ctx_search`) was not investigated.
