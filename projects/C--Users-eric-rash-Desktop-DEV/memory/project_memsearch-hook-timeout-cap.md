---
name: memsearch-hook-timeout-cap
description: "the SessionEnd memsearch hook's fixed 45s cap was outrun by corpus growth, so every session-end index timed out and incremental recall silently degraded to the 09:00 nightly; fixed 2026-09-02 by detaching the indexer"
metadata: 
  node_type: memory
  type: project
  modified: 2026-09-02T12:33:29.526Z
  originSessionId: 00fe7fc2-f53c-471d-b407-c777e8cc679c
---

`~/.claude/hooks/memsearch-sync.js` (SessionEnd) ran `memsearch index <10 paths>` through
`spawnSync` with a **45s cap**, sized in July against a "~17s fixed floor, ~5s incremental"
measurement. Measured again 2026-09-02 against the current corpus (~1,450 files;
`SecondBrain/Inbox/meetings` alone is 593 and `SecondBrain/Knowledge` 334):

| run | time |
|---|---|
| no-op, nothing new to embed | **33s** (was ~17s) |
| one day of accumulated content | **278s** (232 chunks, ~1s/chunk) |

So the cap left ~12s of embedding budget — under a dozen new chunks. **Every ordinary
session-end index was timing out.** Incremental indexing had quietly degraded to "whatever
the 09:00 nightly full reindex picks up", leaving search up to 24h stale.

**Why it stayed invisible for weeks.** Three dampers stacked:
`daily-backup.ps1` resets `.memsearch-timeout-streak` every morning, the escalation
threshold is 6 consecutive timeouts, and the hook writes only to `.memsearch-index.log`
below that. So a normal day of 2-4 session-ends never reached the threshold and never
surfaced. It took **six session-ends inside 47 minutes** (2026-09-01, 21:09-21:56) to
produce a 7-long streak and one `.errors.log` line. The alarm fired on burst *frequency*,
never on the underlying constant failure.

**The misread that line invites:** ETIMEDOUT + a clustered burst pattern-matches
[[milvus-lock-misdiagnosis]] (session-end lock contention), and the hook's own comments
say exactly that. It was not contention — `pgrep`/`lsof` showed no holder and the DB was
healthy. **Time the actual command before believing the comment.**

**Fix (2026-09-02): detached background worker.** The hook now re-execs itself as
`node memsearch-sync.js --worker` with `detached: true, stdio: 'ignore'` and `.unref()`,
then exits — measured **42ms**. The worker keeps the entire original body, so it owns the
PID lock (clustered session-ends still elect one indexer), writes `INDEX_LOG`, and runs
every error branch. Its `spawnSync` cap is now 600s: a runaway guard, not a budget, so an
ETIMEDOUT there genuinely means ">10 minutes".

- `stdio: 'ignore'` is **not optional** — inherited or piped stdio keeps the harness's pipe
  open and it waits for the child anyway, rebuilding the timeout with extra steps.
- Self-respawn, **not** an `sh -c` wrapper: the wrapper would discard the lock ownership
  and all four error-classification branches.
- The old header justified staying synchronous with a **Windows** process-group race.
  That rationale died with the 2026-08-05 migration; the comment now says so, because the
  next reader would otherwise "restore" the bug.

**How to apply:**
- A fixed timeout sized against a measured corpus is a **dated** number. When the corpus is
  something that grows every day (the vault, meetings, dailies), the cap has an expiry date
  nobody writes down. Prefer detaching over raising a cap; if a cap must stay, record the
  measurement and the date beside it so drift is visible.
- Never size a SessionEnd hook to block. Session teardown cannot wait minutes, so any
  design where "correct" means minutes must be asynchronous.
- Both harnesses wire their own copy. `~/.codex/hooks/memsearch-sync.js` is now a
  **symlink** to the Claude copy (2026-09-02) so the pair cannot drift again — same fix as
  `~/.codex/AGENTS.md`. Before "fixing a hook", ask which copy the harness wires; see
  [[memsearch-index-path-drift]] for the four-copy history.
- `~/DEV/KeystoneOS/scripts/codex-hooks/memsearch-sync.ps1` still has a 45s
  `WaitForExit(45000)`, but nothing wires it (Codex uses `hooks.json` → the `.js`). Dead
  Windows-era code; left alone deliberately.

Related: [[milvus-lock-misdiagnosis]], [[memsearch-index-path-drift]],
[[memory-compiler-pipeline]], [[backup-sync-system]], [[keystoneos-verification-habits]]

**2026-09-22 — a slow nightly index was the Mac sleeping, not memsearch.** The daily backup's
full index took 18 min for 0 new chunks (09-21 09:44) and 15 min for 309 chunks (09-21 18:12).
Timed while awake: no-op ~9s fixed startup, `dev-docs` (763 files) no-op 26s, full set 83s with
79 new chunks (~0.7s/chunk). `pmset -g log` showed 5-second DarkWakes in the morning window and
Idle Sleep twice mid-run in the evening. Fix: launchd `dailybackup` + the three data pulls now run
under `/usr/bin/caffeinate -i -s` (`-s` holds only on AC; lid-shut on battery still sleeps).
**How to apply:** before tuning memsearch, line the slow window up against `pmset -g log`.
Same session: `daily-backup.ps1` now resolves `{DEV}` in index paths (it had skipped
`KeystoneOS/decisions`). Jev/TypeSafe does not help indexing: it judges, it does not embed.

**2026-09-28 (Windows laptop) — the 600s cap is machine-speed-dependent, and headless sessions fanned it out.**
`memsearch-sync.js` ran back-to-back 600s-killed runs all day (streak 33), each peaking 2.7–3.1 GB, and
Claude Code's low-memory reaper killed other sessions' background jobs. Not a full reindex — memsearch is
incremental per file. Two causes stacked:
- A **10,138-chunk never-indexed backlog** (all of `transcripts/`, plus `dev-docs` sorted after
  `printing-press-library/…`). bge-m3 on this CPU embeds ~5 s/chunk (Mac 0.7–1 s), so each run cleared ~110.
- **Headless TypeSafe drive-triage `claude -p` sessions** (entrypoint `sdk-cli`) ended every ~30s — 257
  SessionEnds Sun 19–22h — plus every `flush.py` SDK session (the hook lacked session-end.py's
  `CLAUDE_INVOKED_BY` guard). The PID lock serialised them into a continuous chain; it bounds overlap, not load.

Windows has **no nightly index**: `KeystoneOS-DailyBackup` is disabled and `Backup AI Sessions to Drive`
only harvests dev-docs. So nothing drains a backlog and nothing resets the streak.

Fix: the hook skips `CLAUDE_INVOKED_BY` / entrypoint `sdk*`, with a 30-min start cooldown
(`transcripts/.memsearch-last-run`, checked while holding the lock); `~/.memsearch/config.toml`
`batch_size = 8` (peak measured 921 MB vs 3.1 GB); one-off drain task `\Eric\memsearch-drain-once` →
`~/.claude/scripts/memsearch-drain.ps1`, log `~/.claude/scripts/logs/memsearch-drain.log`.
Still open: the Codex Stop hook `KeystoneOS/scripts/codex-hooks/memsearch-sync.ps1` (per turn, 45s) has no cooldown.
**How to apply:** "memsearch eats RAM" on Windows → check the streak in `.errors.log` and do a read-only backlog
dry run (memsearch's scanner + chunker + `compute_chunk_id` vs Milvus `chunk_hash`) before blaming Milvus.

**2026-09-29 — drain finished; weekly safety net added.** The one-off drain's 9/28 17:31 run finished
exit 0 in 232 min, 8,764 chunks. An earlier 12:01 run died with no exit line, cause unlogged. Next hook
run: "Indexed 1 chunks", streak cleared. Chose **no nightly index** on Windows: the hook keeps up once
the backlog is gone. Added `\Eric\memsearch-drain-weekly` (Sun 02:00, AC only, StartWhenAvailable so
a missed run fires at the next docked wake, no wake-to-run, 12h limit), running the same
`memsearch-drain.ps1`. A no-op run takes seconds. **How to apply:** after a bulk import, run the task by
hand (`Start-ScheduledTask -TaskPath '\Eric\' -TaskName memsearch-drain-weekly`) instead of waiting.
