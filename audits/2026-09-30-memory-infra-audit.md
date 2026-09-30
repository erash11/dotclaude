# Memory & automation infrastructure audit — 2026-09-30 (Windows laptop)

Read-only investigation. Nothing edited, stopped, or reconfigured. Every number is
tagged **[M]** measured this session on this machine, or **[I]** inferred from notes,
code comments, or reasoning. Mac-side state is [I] throughout (not inspectable from here).

Scope: is the Docker/Milvus vector stack still worth running for memory recall now that
the working models carry 1M-token context, and how should the memory stack be evaluated
repeatably rather than by opinion.

---

## 1. Verdict in three lines

1. **Retire Docker/Milvus on Windows.** It exists only because `milvus-lite` ships no
   Windows wheel (memsearch's own `store.py` says so [M]). It costs ~1.7 GB of resident RAM,
   ~7 GB of disk, one more daemon that has to be up before any session ends, and it is not
   where memsearch's latency goes. A stdlib SQLite FTS5 index over the same markdown matched
   memsearch 9/10 vs 10/10 on a 10-question pilot at <10 ms vs 4.4 s per query [M].
2. **The bigger recall problem on this machine is not the backend, it is coverage.** Three
   of the 12 configured index paths point at `~/SecondBrain/...`, which does not exist on
   Windows (the vault is `~/Desktop/SecondBrain`). The hook filters missing paths silently,
   so the 1,370-note vault (~1.6M tokens) is not indexed here [M]. Real queries from 09-27
   ("Zatsiorsky", "Issurin") had 53 and 57 matching vault notes but memsearch's top hit was
   `dev-docs/Flint/QUEUE.md` [M]. Fix this regardless of backend.
3. **Evaluate, don't opine.** A 53-query seed set already exists in the transcripts (the
   actual `memsearch search` strings from the last 30 days, listed in Appendix A). Label
   expected answers for ~20 of them, run the runner in section 6 against memsearch / rg /
   FTS5 on both machines, and fold it into `claude-stack-doctor`'s weekly run.

---

## 2. What the stack is (sizes)

Token estimates are chars/4.

| Layer | Files | Size | ~Tokens | Indexed by memsearch here? |
|---|---|---|---|---|
| Tier A, Windows DEV slug `C--Users-eric-rash-Desktop-DEV/memory` [M] | 58 md | 215 KB | 55k | **No** (not in path list) — but its Mac mirror is |
| Tier A, Mac DEV slug `-Users-kristinarash-DEV/memory` [M] | 60 md | 218 KB | 56k | Yes |
| Tier A, KeystoneOS slug [M] | 18 md | 66 KB | 17k | Yes |
| Tier A, home slug `C--Users-eric-rash/memory` [M] | 16 md | 37 KB | 10k | Yes |
| global-memory `USER.md` / `MEMORY.md` [M] | 2 | 1,270 / 2,481 chars | ~1k | injected at start, not indexed |
| global-memory/transcripts (daily session digests) [M] | 106 md | 1.5 MB | 402k | Yes |
| global-memory/dev-docs (harvested STATUS/context/handoffs) [M] | 802 md | 7.7 MB | **2,013k** | Yes — 68% of the index |
| claude-memory-compiler/knowledge [M] | 180 md | 1.0 MB | 267k | Yes |
| claude-memory-compiler/daily [M] | 79 md | 337 KB | 86k | Yes |
| ~/.codex/memories [M] | 36 md | 322 KB | 82k | Yes |
| KeystoneOS/decisions [M] | 1 md | 57 KB | 15k | Yes |
| SecondBrain vault (`~/Desktop/SecondBrain`) [M] | 1,370 md | 6.1 MB | 1,604k | **No — path unresolvable on Windows** |
| **Indexed corpus actually reachable here** [M] | **1,298 md** | **11.2 MB** | **~2.95M** | 18,360 chunks in Milvus [M] |

"Curated memory" (everything except dev-docs, transcripts, vault) is roughly **590k tokens**
[M-derived]. That is 59% of a 1M window, so "just load it all every session" is not viable
even now; "grep/FTS, then read the 3–5 top files in full" is, and each memory note is
2–8k chars so reading whole files is cheap.

Note: `~/.claude/projects` is synced between machines, so both machines' Tier A slugs exist
on both machines [M]. memsearch's pilot hits all resolved to the Mac-slug copies of
Windows-authored notes.

### What loads at SessionStart (the "heavy injected context" question)

| Source | Chars (this machine) |
|---|---|
| compiler `session-start.py` (pointer + recent daily log) [M] | 3,230 |
| `keystone-unified-snapshot.js` (USER.md + MEMORY.md + snapshot pointer) [M] | 4,240 |
| `superpowers-quiet.mjs` [M] | 55 |
| `herdr-agent-state.sh`, `context-mode-cache-heal.mjs` [M] | 0 |
| `~/.claude/CLAUDE.md` + `machine.md` + `DEV/CLAUDE.md` + Tier A `MEMORY.md` index [M] | 16,266 |
| Transcript-measured `source=startup` injection records, 30 d [M] | n=4,993, avg 5,166, max 21,068 |

Total hook+guidance context at startup is roughly **24k chars ≈ 6k tokens ≈ 0.6% of a 1M
window** [M-derived]. This layer is already lean; it is not a place to look for savings.
(The 200k+ char "injections" first seen in the scan were compiler flush SDK prompts that
happen to contain the words SessionStart/additionalContext, not hooks [M].)

---

## 3. memsearch / Milvus: the evidence

### 3.1 What runs and why

- memsearch **0.4.3**, plain pip install into Python 3.14 (`AppData\Local\Python\pythoncore-3.14-64`), not a uv tool as on the Mac [M]. Deps: click, openai, pymilvus 3.0.0, watchdog [M].
- Backend: `~/.memsearch/config.toml` → `[milvus] uri = "http://localhost:19530"`, embedding `provider = "onnx"` (default model `gpahal/bge-m3-onnx-int8`), `batch_size = 8` since 09-28 [M].
- `memsearch/store.py` lines 38–44 [M]: local `.db` URIs use Milvus Lite; on Windows it raises *"milvus-lite does not support Windows (no wheels on PyPI)"* and tells you to run a server. PyPI confirms: milvus-lite 3.2.1 ships `tar.gz` + `any` only, and `import milvus_lite` fails here [M]. **The Docker stack is a Windows workaround, nothing more.** The Mac uses `~/.memsearch/milvus.db` embedded [I, from memory notes].
- Docker Desktop: AutoStart = True [M]; `milvus-standalone` (v2.6.4), `milvus-minio`, `milvus-etcd`, restart `unless-stopped` [M]. Compose file at `~/.memsearch/milvus/docker-compose.yml` [M].

### 3.2 Footprint [M]

| Resource | Value |
|---|---|
| Containers' own RSS | 178 + 296 + 91 = **565 MiB** |
| WSL VM (`vmmemWSL`) working set / private | **1,318 MB / 3,297 MB** (capped at 4 GB by `.wslconfig`) |
| Docker Desktop host processes (backend, agent, UI) | ~396 MB working set |
| Total resident cost attributable to running Milvus | **~1.7 GB** on a 15.6 GB laptop |
| Disk: images / Docker named volumes / `~/.memsearch` (compose file + `volumes/` bind dir) | 3.83 GB / 2.74 GB / 1.0 GB = **6.6–7.6 GB** (whether the 1.0 GB bind dir overlaps the named-volume figure was not resolved) |
| HF model cache (`~/.cache/huggingface`, bge-m3 ONNX) | 2.5 GB — needed by any *local-embedding* option, not Milvus-specific |

### 3.3 Usage, last 30 days (transcripts under `~/.claude/projects/*/*.jsonl`) [M]

| Metric | Value |
|---|---|
| Session files modified in 30 d | 1,259 (683 MB) — **1,101 are headless/one-shot** (608 compiler `flush.py` SDK sessions, 318 TypeSafe drive-triage) |
| Sessions with ≥2 human prompts | **158** (both machines; ~/.claude/projects syncs) |
| `memsearch search` calls | **57 tool calls carrying 67 query strings (53 unique)**, in 32–37 human sessions (~20–23%) |
| `memsearch expand` / `transcript` calls | 0 |
| `ms-search` wrapper calls | 0 (wrapper does not exist on Windows [M]) |
| Grep/rg tool calls targeting memory/vault/compiler dirs | **697** across 127 sessions |
| `ctx_search` (context-mode FTS5) calls | **448** |
| Read tool calls on memory files | 65 |

Interpretation: when the model wants to recall something it reaches for grep roughly 10×
more often than for memsearch, and it never uses memsearch's second and third rungs.

### 3.4 Latency [M]

| Step | Time |
|---|---|
| `memsearch --version` (CLI import) | 0.87 s |
| `memsearch stats` (import + Milvus connect, no embedding) | 0.98 s |
| `memsearch search … --top-k 5` (pilot mean, 10 queries; range 3.6–8.0 s) | **4.38 s** |
| ⇒ ONNX bge-m3 load + embed + rerank (remainder) | **~3.4 s** [I: by subtraction] |

**Milvus contributes ~0.1 s of the 4.4 s.** Swapping Milvus for another vector store
(sqlite-vec, LanceDB, DuckDB-VSS) would remove the daemon and the RAM, but not the
per-query 3.4 s or the ~5 s/chunk CPU indexing cost on this laptop (232 min for 8,764
chunks on 09-28 [M, drain log]). Only dropping the embedder (keyword/BM25) removes those.

### 3.5 Reliability ledger, 30 days (reconstructed — see gap note)

`.errors.log` was truncated to 0 bytes at 07:51 today [M], so there is no persisted
30-day error ledger. Reconstructed from `flush.log`, the drain log, `.memsearch-index.log`,
daily compiled logs, and memory notes:

| Component | Failures / incidents | Source |
|---|---|---|
| memsearch-sync (SessionEnd) | 09-28: streak of **33** runs killed at 600 s, each peaking 2.7–3.1 GB; low-memory reaper killed other jobs. Cause: 10,138-chunk never-indexed backlog + 257 headless SessionEnds/3 h. | memory note [I], `.memsearch-index.log` [M] |
| memsearch drain task | 09-28 12:01 run died with no exit line; 17:31 run OK, 232 min, 8,764 chunks | `memsearch-drain.log` [M] |
| Milvus reachability | Today 11:48 (pre-reboot; boot 11:59): `Fail connecting to server on localhost:19530`, streak 1/6. Any session ending while Docker is down logs a miss and defers to "next session". | `.memsearch-index.log` [M] |
| Index path config | **3 of 12 paths unresolvable on Windows, skipped silently** (hook uses `existsSync` and logs nothing) — vault unindexed since the Windows machine became active (~09-10 [I]) | [M] |
| Index path config | Windows DEV Tier A slug absent from the list (covered only by the Mac mirror) | [M] |
| compiler flush (`flush.py`) | 407 SessionEnd hook fires; outcomes: 406 FLUSH_OK, **106 FLUSH_ERROR — 102 of them "You've hit your session limit", all on 09-27**, 66 SKIP transcript-missing (outcomes exceed hook fires because `flush.py` also runs from PreCompact and manual backfills) | `flush.log` [M] |
| Hooks generally (transcript `system` lines) | 2 in 30 d: `router.py` timeout ×1, unclassified ×1 | [M] |
| `settings.json` PreToolUse | first hook entry is a hard Mac path `/Users/kristinarash/.local/bin/dcg`, unguarded, fires on every Bash/PowerShell call; the guarded entry is the second one. Measured impact low (see row above). | [M] |
| Codex Stop hook | `KeystoneOS/scripts/codex-hooks/stop.ps1` → `memsearch-sync.ps1` (45 s, no cooldown) still wired [M] |

---

## 4. Pilot recall eval [M]

Ten questions with known answer files, run against three retrieval options over the same
roots (the 9 resolvable index paths + the Windows DEV slug; 1,356 files, 11.8 MB).

| # | Question (abridged) | expected file | memsearch (Milvus + bge-m3) | rg, one keyword | SQLite FTS5 BM25, NL query |
|---|---|---|---|---|---|
| 1 | fix for memsearch SessionEnd timeout | project_memsearch-hook-timeout-cap | HIT 8.0 s | HIT 0.15 s | HIT |
| 2 | where renv libraries live on Windows | transcripts/2026-09-22 | HIT 4.0 s | HIT | HIT |
| 3 | live OKR doc for the status report | project_status-report-sourcing | HIT 3.7 s | HIT | miss |
| 4 | milvus-lite "incompatible" = lock | project_milvus-lock-misdiagnosis | HIT 4.5 s | HIT | HIT |
| 5 | Fireflies CLI OOM on Mac | project_fireflies-cli-broken-on-mac | HIT 3.6 s | HIT | HIT |
| 6 | SDF vs n-HAp | user_child-dental-plan | HIT 3.6 s | HIT | HIT |
| 7 | DailyBackup benign exit code | project_backup-task-sleepkill-signature | HIT 4.4 s | HIT | HIT |
| 8 | ingest-book arithmetic gate | feedback_ingest-review-gate | HIT 4.1 s | HIT | HIT |
| 9 | department names never to use | user_baylor-department-names | HIT 4.2 s | miss (54 files match "S&C") | HIT |
| 10 | CFB forecast freeze wrapper | project_cfb-forecast-capture | HIT 3.7 s | miss (35 files match "freeze") | HIT |
| | **hit@5** | | **10/10** | **8/10** | **9/10** |
| | **mean latency** | | **4.38 s** | **0.07 s** | **<0.01 s** (17 s one-time in-memory build) |

Honest caveats:
- **Bias:** 9/10 expected files are Tier A notes whose titles already sit in the injected
  `MEMORY.md` index — the layer that needs vector search least. The layers where semantic
  recall would earn its keep (transcripts 402k, dailies 86k, dev-docs 2.0M, vault 1.6M) got
  one question. The seed set in Appendix A fixes that: it is what Eric actually searched.
- rg's misses are keyword-choice failures (a generic word); FTS5's miss is a ranking failure
  (BM25 preferred longer OKR notes). Both are within one question of memsearch; n=10 cannot
  separate them. It *can* say keyword retrieval is not obviously worse on this corpus, whose
  notes are written with distinctive terms on purpose.
- FTS5 was Python's stdlib `sqlite3` with `porter unicode61` and a naive OR query — no
  tuning, no trigram, no phrase boosting. context-mode's FTS5 (stemming + trigram + RRF +
  proximity rerank) is a stronger keyword engine and is already installed and used 448×/30 d.

### 4.1 Real-query coverage check [M]

For 10 of the real 09-27 Windows queries: files matching in the reachable index vs in the
unindexed vault, and what memsearch actually returned.

| Real query | matches in indexed roots | matches in vault (unindexed) | memsearch top-1 |
|---|---|---|---|
| Zatsiorsky | 8 | **53** | dev-docs/Flint/QUEUE.md |
| Issurin block periodization | 10 | **57** | dev-docs/Flint/QUEUE.md |
| stretching matrix system | 1 | 3 | dev-docs/FaceComps/fall-camp/… |
| Omegawave sympathetic parasympathetic | 1 | 5 | dev-docs/…EOS_Football_Analys… |
| Gallucci research project approval | 9 | 18 | dev-docs/BAIR_Steering_Committee/… |
| kitman labs AMS | 51 | 36 | knowledge/concepts/at-utilization… |
| Kaigi decision meeting structure | 7 | 5 | daily/2026-09-24.md |
| Anthony Mauro | 10 | 0 | knowledge/concepts/anthony-mauro… |
| Old Bull Running The Room | 7 | 1 | transcripts/2026-09-24.md |
| perch duckdb owner | 88 | 29 | dev-docs/_INBOX/STATUS.md |

Five of ten real questions had most of their answers in the corpus that is not indexed on
this machine, and the vector search confidently returned queue/status files instead.
No backend fixes that; the path config does.

---

## 5. Docker/Milvus: recommendation, migration, rollback

### 5.1 Verdict

Retire the Docker/Milvus stack on Windows and move memory recall to SQLite FTS5 (no
server, stdlib Python, identical on both machines). Keep the vector option as an
*evaluated* upgrade, not a default: if the seed-set eval ever shows FTS5 losing by more
than one hit@5 on n≥30, add embeddings back via `sqlite-vec` (embedded, Windows-capable)
with the same ONNX model — that restores semantics without the daemon, but also restores
the 3–5 s embedder cost.

Why now and not before: with 1M context and stronger models, the retrieval layer's job
shrank to "find the right 3–5 files", after which the model reads them whole. Chunk-level
semantic precision mattered when the budget was 200k and the model needed the exact
paragraph; it matters much less when reading five whole notes costs 10k tokens.

### 5.2 Recommended replacement path (one code path on both machines)

Two viable shapes. Prefer **A**; **B** is the zero-build alternative.

**A. `mem` — a ~150-line stdlib script (`~/.claude/scripts/mem.py`, wrapped as `mem`;
put it wherever the memory repo that `daily-backup.ps1` pushes already syncs — verify which
directories that covers before relying on both machines having it).**
- `mem index` — walks the same `memory-index-paths.json` (with a `{VAULT}` token resolved
  from `~/.claude/skills/_shared/config.<platform>.json`), splits markdown by heading,
  upserts into `~/.claude/mem-fts.db` (FTS5, `porter unicode61`, content hash per section,
  file mtime skip). Full build ≈ 17 s for 11.8 MB in memory [M]; incremental is sub-second.
- `mem search "q" --top-k 5` — BM25 with phrase boost, prints memsearch's `Source:` /
  `Heading:` / snippet layout so `memory-write`, `session-miner`, and `stack-check.ps1` keep
  working with a one-word substitution.
- `mem stats`, `mem coverage` (prints each configured root as EXISTS/MISSING — the check
  that would have caught the vault gap).
- No embeddings, no model cache needed, no Docker, no lock (SQLite handles concurrent
  readers; single writer via the existing PID lock in the hook).

**B. context-mode `ctx_index` over the same roots.** Already installed, already FTS5 with a
better ranker, already the model's most-used recall tool (448 calls/30 d). Downsides: MCP
is the tested path (Codex hooks and PowerShell scripts cannot call MCP tools); an npm CLI
shim exists at `~/AppData/Roaming/npm/context-mode` and was **not tested** — if it exposes
search from the shell, B also covers scripts and Codex and `mem.py` may be unnecessary.
Its store is project-scoped and its content DB is already 70 MB of session captures. As
tested, B is the *interactive* path and A is still needed for scripts and Codex.

Both machines: A runs identically on macOS and Windows (Python 3 stdlib). The Mac's Milvus
Lite can stay as an untouched fallback since it costs nothing while idle [I], but the
two-copies trap says run the *same* retriever on both, so switch the Mac once the Windows
eval holds for ~30 days.

### 5.3 Migration steps (ordered; nothing destructive until step 7)

0. **Prerequisite, both machines:** add `{VAULT}` to `memory-index-paths.json`, resolve it
   from `_shared/config.<platform>.json` in `memsearch-sync.js` and `daily-backup.ps1`, add
   the Windows DEV slug, and make the hook **log every skipped path** to `.errors.log`. Do
   this even if nothing else changes.
1. Write `mem.py` + `mem` wrapper; `mem index`; run the section-6 eval against memsearch,
   rg, and `mem` on the seed set. Record the result file.
2. Point `memory-write` L1 at `mem search` (keep `memsearch search` as L1b on Mac for now);
   update `session-miner`, `closeout`, `dev-sync`, `harvest`, `backup`, `meeting-prep`,
   `ingest-book`, `library-*` SKILL.md mentions (13 skill files + 13 `~/.codex/skills` copies
   [M], 51 files total mention memsearch — grep list in Appendix B).
3. `memsearch-sync.js` worker: call `mem index` instead of `memsearch index` (seconds, no
   RAM spike, no 600 s cap needed). Same for `KeystoneOS/scripts/codex-hooks/memsearch-sync.ps1`
   and `daily-backup.ps1`'s index step.
4. Disable `\Eric\memsearch-drain-once` and `memsearch-drain-weekly` scheduled tasks.
5. Replace the `memsearch search "healthcheck"` + `docker ps` block in `stack-check.ps1`
   with `mem coverage` + a 5-question eval subset.
6. `docker compose -f ~/.memsearch/milvus/docker-compose.yml stop` (not `down`); turn off
   Docker Desktop AutoStart. Reclaims ~1.7 GB RAM and removes the "Docker must be up before
   any session ends" dependency. Leave images/volumes for 30 days.
7. After 30 clean days and one passing eval: `docker compose down -v`, `docker image prune`,
   optionally uninstall Docker Desktop (unless something else needs it — only the Milvus
   containers were running and the only extra image is unused [M]; "nothing else uses
   Docker" is inferred from that [I], so check before uninstalling).
8. Mac: repeat 1–3 with the same script; leave `milvus.db` in place as fallback.

### 5.4 Rollback

- `config.toml` is untouched throughout. `docker compose up -d` from the same compose file
  restores the stack; re-enable AutoStart; restore the three hook lines from the `.bak`
  files the hooks already keep. The Milvus index survives in the volumes until step 7.
- If volumes were pruned: `Start-ScheduledTask -TaskPath '\Eric\' -TaskName memsearch-drain-weekly`
  rebuilds; measured 232 min for 8,764 chunks, so budget ~8 h for the full 18k [I: scaled].
- Skills keep working during rollback because `mem search` and `memsearch search` share an
  output format.

---

## 6. Repeatable evaluation method

Goal: a number, not a feeling, every time a model or a retrieval component changes.

### 6.1 Artifacts (all under `~/.claude/audits/recall-eval/`, git-synced with the memory repo)

- `questions.jsonl` — one line per case:
  `{"id","query","keyword","expected":[basename…],"layer":"tierA|daily|transcript|vault|dev-docs","source_session","added","machine"}`.
  Seed with Appendix A (53 real queries) + the 10 pilot cases. Labelling rule: the
  expected file is the one the *session that asked* ended up reading or citing — pull it
  from the same transcript. Budget: ~30 min to label 20; grow by 5 per month from new
  sessions (the extraction script in 6.2 prints candidates).
- `recall-eval.py` — stdlib only. Backends: `memsearch`, `mem` (FTS5), `rg` (uses the
  `keyword` field), optionally `ctx` (via a tiny MCP client, or skip). Per case it records
  rank of first expected file, latency, chars returned, exit status/timeout, and
  **coverage** (does any expected file exist under the configured roots on *this* machine —
  the check that exposes path drift).
- `telemetry.py` — the 30-day transcript scan used in this audit: human vs headless
  sessions, `memsearch`/`mem`/rg/`ctx_search` call counts, hook error lines, flush
  outcomes. Cheap (streams 683 MB in ~2 min [M]).
- `results/<date>-<machine>-<model>.json` + one appended row in `ledger.md`:
  `date | machine | model | backend | n | hit@1 | hit@5 | MRR | p50 ms | p95 ms | fail% | coverage%`.

### 6.2 Metrics and decision rule

- **hit@5** (primary), hit@1, MRR; **p50/p95 latency**; **failure rate** (non-zero exit,
  timeout, backend unreachable); **coverage** (expected file reachable by the index on this
  machine); **chars returned** as the token-cost proxy.
- Retire or demote a retrieval layer when the cheaper one is within **1 hit@5 on n≥30** and
  beats it on failure rate and latency for **two consecutive runs**. Reinstate embeddings
  only if FTS5 falls >1 hit@5 behind on the same rule.
- Report per-layer, not just overall: a backend can be perfect on Tier A and useless on
  transcripts.

### 6.3 When to rerun

- Any model change in `settings.json` (`model`, `advisorModel`) or a Claude Code major.
- Any memsearch / context-mode / `mem.py` upgrade; any edit to `memory-index-paths.json`.
- Monthly via `claude-stack-doctor`'s existing `weekly-check.ps1` (run the 5-case smoke
  subset weekly, full set monthly); on both machines, so the ledger shows drift between them.

### 6.4 Where it lives

Fold into **`claude-stack-doctor`**, not the others: it already owns the memsearch smoke
test, the weekly scheduled run, the cross-machine handoff check, and the `.errors.log`
read. `doctor-plus` audits guidance-file principles, `brain-audit` scores the vault,
`improve-system` finds vault rot — none of them measure retrieval. Add two findings codes to
`stack-check.ps1`: `recall-coverage` (any configured root MISSING) and `recall-regress`
(hit@5 dropped ≥2 vs last ledger row).

---

## 7. Other infrastructure: keep / simplify / retire (ranked by evidence × payoff)

| # | Component | Call | Evidence | Risk of acting |
|---|---|---|---|---|
| 1 | Docker Desktop + Milvus + MinIO + etcd | **Retire (Windows)** | §3, §4, §5 | Low with the 30-day volume hold; rollback is one compose command |
| 2 | `memory-index-paths.json` vault paths + silent skip | **Fix now** | 3/12 roots MISSING; Zatsiorsky 8 vs 53; hook has no log line for skipped roots [M] | None — pure gain; do it before any backend work |
| 3 | compiler per-session SDK flush | **Simplify** | 608 flush sessions/30 d; 102 "session limit" failures on 09-27 alone; 66 transcript-missing skips [M]. Options: batch to one flush per day (or per `/closeout`), back off on rate-limit, use the cheapest model for the flush (check which model `flush.py` requests — not measured) | Medium: same-day "Recent Daily Log" freshness drops from per-session to daily; the SessionStart pointer already tolerates that |
| 4 | dev-docs in the memory index | **Simplify** | 802 files / 2.0M tokens = 68% of the index; polluted 5/10 real-query results with QUEUE/STATUS files [M] | Keep them indexed but as a separate FTS table/collection with a `--scope` flag; default `mem search` to memory + vault |
| 5 | context-mode (FTS5 plugin) | **Keep** | 448 `ctx_search`/30 d; 70 MB content DB; strongest keyword ranker on the machine [M] | It overlaps memsearch's role; after §5 it and `mem` are the two keyword paths (interactive vs scripted). Acceptable; document the split |
| 6 | `skill-router` UserPromptSubmit hook | **Evaluate, likely retire** | 21 KB Python + 220 KB roster, 5 s cap, 1 timeout/30 d; sample recall prompt routed to `ctx-search` instead of `memory-write` [M]. Claude 5 selects from skill descriptions unaided | Unknown benefit — run 2 weeks logging its suggestion vs the skill actually invoked (both are in transcripts), then decide. [I] that it is a pre-Claude-4 compensator |
| 7 | Hard char caps (USER 1,375 / MEMORY 2,500; compiler 20k) | **Keep as editorial discipline, relabel** | Startup injection is 6k tokens = 0.6% of 1M [M]; the compiler's 20k cap truncated a 47k `index.md` and was already replaced by a pointer [M] | Raising caps costs nothing now; the value of the caps was curation, not budget. Say so in `memory-write` so nobody "optimises" them away |
| 8 | Duplicated Tier A slugs (Mac + Windows copies of the same notes) | **Keep, dedupe in the index** | Both slug families exist on both machines; memsearch hits resolve to the Mac copy [M] | Index one family per note (prefer the current machine's) to avoid double hits |
| 9 | Hook hygiene | **Fix** | Dead unguarded Mac-path `dcg` entry runs per Bash call; `.errors.log` truncated rather than rotated (no 30-day ledger possible today); `ms-search` referenced by `memory-write` but absent on Windows; Codex `memsearch-sync.ps1` 45 s/no cooldown still wired [M] | Trivial edits; the two-copies trap applies (`~/.codex/skills` mirrors 13 SKILL.md files) |
| 10 | graphify (6 `graphify-out` dirs) | **Not assessed** | Usage not measured; different job (structure/relations), no overlap with recall | — |
| 11 | permission-gate shadow hook | **Not assessed** | Shadow-mode logger only (`shadow.jsonl`); 1.7 KB | — |
| 12 | Scheduled tasks | **Prune with #1** | `memsearch-drain-once` still Ready after finishing; `-weekly` becomes moot | — |

### 7.1 Overlap: what each recall-related layer uniquely does

| Layer | Corpus | Retrieval type | Callable from | Unique job |
|---|---|---|---|---|
| memsearch + Milvus | 12 configured roots (9 reachable here), 18,360 chunks | dense (bge-m3) + keyword hybrid, chunk-level | shell → Claude Bash, Codex hooks, PowerShell scripts | Only layer with semantic matching; only one that indexes transcripts/dailies/dev-docs/codex memories together |
| context-mode (FTS5 plugin) | Whatever was captured or `ctx_index`ed: session outputs, tool results, auto-memory events (70 MB content DB) | BM25 + trigram + RRF + proximity rerank | Claude via MCP only (as tested) | Keeps large tool outputs out of context; session-timeline recall of decisions/errors. Does **not** index the memory roots unless told to |
| graphify (6 `graphify-out` dirs) | Per-repo code/docs | graph query (communities, paths, god nodes) | Claude via skill | Structure and relationships within a project; not fact recall |
| claude-memory-compiler | Writes `daily/` and `knowledge/` from transcripts; injects a pointer at start | none — it is a **writer**, not a retriever | hooks (SessionEnd/PreCompact/SessionStart) | Produces the curated daily log and 180 articles that the retrievers then search |
| Tier A memory + `MEMORY.md` index + global USER/MEMORY | ~58 notes per machine slug, 1-line index each | auto-injected (Tier 0), then Read by name | harness | Zero-cost recall for anything with a line in the index; the layer the pilot mostly exercised |
| rg / Grep over the same directories | any file on disk | exact/regex, file-level | everywhere | What the model reaches for 10× more often than memsearch [M]; no index to drift |

The overlap is between the first two and rg: three keyword-capable retrievers over
partly-overlapping corpora, plus one dense retriever whose unique contribution the pilot
could not distinguish from BM25 at n=10. graphify and the compiler do not overlap with them.

---

## 8. Gaps and things not measured

- Mac state (Milvus Lite, launchd, its `.errors.log`) is inferred from notes only.
- `.errors.log` history: truncated at 07:51 today; the reliability ledger is reconstructed.
  Recommend rotating (`.errors.log.YYYY-MM`) instead of clearing.
- Pilot n=10 with a Tier A bias; the seed set fixes both n and layer mix.
- The 4.4 s memsearch latency breakdown is by subtraction, not profiling.
- Docker Desktop's boot-time cost and the compiler flush model were not measured.
- No test of `sqlite-vec`/LanceDB (would have required installing packages).
- "memsearch hook injections": only 3 of 3,943 SessionStart injection records contained the
  literal `memsearch search`, although the compiler pointer is supposed to name it. Likely
  a transcript-encoding artifact (escaped quotes); not verified.
- Measurement wrote scratch files to the OS temp dir (`/tmp/ss.err`, `/tmp/ks.err`,
  `/tmp/fl.txt`, `/tmp/ms_*.out`); nothing under `~/.claude` or `~/DEV` was created except
  this report.

---

## Appendix A — seed eval set: real `memsearch search` queries, last 30 days [M]

53 unique strings from 57 tool calls (34 from Mac slugs, 33 from Windows). Five are
placeholders (`<query>` ×2, `$q`, `test`, `--help`) and are dropped below, leaving 48.

```
2026-08-29 mac  WHOOP HRV acute stress response webinar
2026-08-30 mac  technology inventory survey
2026-08-30 mac  Kenny Boyd technology inventory deliverable
2026-09-02 mac  ecological dynamics constraints-led approach
2026-09-02 mac  return to performance return to play criteria football
2026-09-02 mac  Sarama
2026-09-02 mac  command centre os view
2026-09-02 mac  arms graph graphify gemini
2026-09-03 mac  opposed unopposed practice defender removed skill transfer Parry
2026-09-03 mac  docker
2026-09-03 mac  backup schedule
2026-09-04 mac  force plate
2026-09-04 mac  GPS load
2026-09-04 mac  athlete monitoring
2026-09-07 mac  data inventory departments missing
2026-09-09 mac  backup manifest DEV migration unmanaged
2026-09-11 mac  dev sync conflict
2026-09-11 mac  backup manifest
2026-09-15 mac  Gallucci research project approval data sets
2026-09-15 win  tech inventory TECH_LISTS 2026-09-01 exec summary
2026-09-17 mac  sleep scheduler
2026-09-17 win  kitman labs AMS
2026-09-17 win  DexaProject
2026-09-19 mac  typesafe key keychain
2026-09-19 mac  TypeSafe
2026-09-19 mac  dev-sync Mac reconcile GitHub Windows activity
2026-09-19 mac  graphify-out automated daily job not work pick-up repo
2026-09-19 mac  un-fetched pass claimed 140 clean repos
2026-09-19 win  typesafe api key
2026-09-21 win  perch duckdb owner
2026-09-21 win  perch owner
2026-09-24 win  Old Bull Running The Room course
2026-09-25 win  Old Bull course
2026-09-25 win  run specific isometrics push hold switch catch
2026-09-26 win  Anthony Mauro
2026-09-26 win  sprint film observation projection switching stiffness Moyer
2026-09-27 win  Issurin block periodization taper realization mesocycle
2026-09-27 win  Omegawave sympathetic parasympathetic overtraining
2026-09-27 win  Kaigi decision meeting structure
2026-09-27 win  stretching matrix system
2026-09-27 win  stretching matrix system reverse of contraction
2026-09-27 win  Hill equation curvature ratio force velocity
2026-09-27 win  electrostimulation Kots strength claims
2026-09-27 win  sensitive periods motor ability sex
2026-09-27 win  Zatsiorsky Hill equation a:Fmm ratio quick-release isokinetic limits
2026-09-27 win  raise Fmm or cut the explosive strength deficit
2026-09-28 win  interview-me questions to ask Eric
2026-09-29 win  BAIR letter report styling template
```

Layer mix by inspection [I]: ~40% vault/book content, ~30% project/ops (backup, dev-sync,
TypeSafe, graphify), ~20% Baylor deliverables (tech inventory, BAIR, Gallucci), ~10% people.
That mix is why the vault path fix outranks the backend change.

## Appendix B — blast radius of a memsearch replacement [M]

51 non-backup files mention `memsearch` (excluding `.bak`, logs, transcripts). The ones
that execute or instruct:

- Hooks: `~/.claude/hooks/memsearch-sync.js`, `~/.claude/hooks/keystone-unified-snapshot.js` (pointer text), `~/.claude/claude-memory-compiler/hooks/session-start.py` (pointer text), `KeystoneOS/scripts/codex-hooks/stop.ps1` → `memsearch-sync.ps1`
- Scripts: `~/.claude/scripts/{daily-backup.ps1, memsearch-drain.ps1, backup-ai-sessions.ps1, harvest-dev-docs.{ps1,sh}, dev-activity.{ps1,sh}}`, `KeystoneOS/scripts/harden-scheduled-tasks.ps1`, compiler `scripts/{flush.py, compile.py, connections.py, textsim.py}`
- Config: `~/.memsearch/config.toml`, `KeystoneOS/data/memory-index-paths.json`, `~/.claude/skill-router/roster.json`
- Skills (13, each mirrored under `~/.codex/skills`): backup, claude-stack-doctor (+`stack-check.ps1`), closeout, dev-sync, harvest, ingest-book, library-advisor, library-review, meeting-prep, memory-write, session-miner, doctor-plus (findings only)
- Guidance: `~/.claude/CLAUDE.md`, `~/.claude/AGENTS.md`, `~/.claude/machine.md`, `DEV/CLAUDE.md`, `DEV/COMMANDS.md`
- Scheduled tasks: `\Eric\memsearch-drain-once`, `\Eric\memsearch-drain-weekly`
- Memory notes (10 project_* files) — leave as history; add one note recording the switch.

## Appendix C — how this audit measured things (so it can be rerun)

- Corpus sizes: walk each root in `memory-index-paths.json` after `{HOME}`/`{DEV}` substitution, count `*.md`, sum bytes, tokens = bytes/4.
- Usage: stream every `~/.claude/projects/*/*.jsonl` with mtime <30 d; count `tool_use` blocks whose Bash/PowerShell command matches `memsearch\s+search`, Grep/rg calls whose input mentions memory/vault/compiler dirs, `ctx_search` tool names, SessionStart records with `additionalContext` (grouped by `source`); human session = ≥2 non-tool user messages.
- Latency: wall-clock around `memsearch --version`, `memsearch stats`, `memsearch search`.
- Footprint: `docker stats --no-stream`, `docker system df`, `Get-Process` working sets for `vmmemWSL`/Docker, `du` on `~/.memsearch` and `~/.cache/huggingface`.
- Pilot eval: Python stdlib `sqlite3` FTS5 in `:memory:`, `rg -l -c -F -i` per keyword ranked by count, `memsearch search --top-k 5` parsed on `Source:` lines; hit = expected basename in top 5.
- Reliability: `flush.log` filtered to ≥2026-08-31; `.memsearch-index.log`, streak and last-run files; drain log; daily compiled logs grepped for failure phrases.
