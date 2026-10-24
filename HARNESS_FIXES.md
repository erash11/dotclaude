# Harness fix list

Work this list as fixes come up (the Friday slot was dropped 2026-10-11).
Rules: `projects/-Users-kristinarash-DEV/memory/feedback_harness-time-budget.md`.

Top of the list = do first. Move done items to **Done** with the date.
**Never run `dcg install` on this setup**; ignore `dcg doctor` asking for it (it re-adds a
duplicate Mac-only hook line; see Done 2026-10-24).

## Open

(none)

## Done

- 2026-10-24 — **#3 memsearch index logging patch: PORTED** to the current `daily-backup.ps1`
  index step. `INDEX full set` now carries `<n>/<m> paths exist, <k> .md files scanned` and the
  exit code, adds "no new content since last index" on 0, and records `memsearch-index:no-input`
  (nothing to index; memsearch not run) or `memsearch-index:unexpected-output`. Offline-tested with
  a fake memsearch (`scripts/test_daily_backup.ps1`); first real run not yet seen.
- 2026-10-24 — **#4 run died mid-index with no error: DONE, both halves.** Next run: before its
  start line, `Get-IndexIncompleteRun` reads the last `DryRun=False` block and records
  `index-incomplete:<runId>` when it has `INDEX path set` but no `INDEX full set`/`INDEX skipped`
  (skipped while another backup pwsh is alive). In-run: a `catch` logs
  `INDEX full set: NO RESULT` and records `memsearch-index:no-result` when the step throws. The
  2026-10-20 00:05 run was the same failure. Offline-tested.
- 2026-10-24 — **#7 backup logs never rotated: FIXED by mechanism.** Section 4 of `daily-backup.ps1`
  trims `daily-backup.log`, `daily-backup.out` and 8 other logs (R22) to their last 2000 lines once
  over 2 MB. Both backup logs are under 2 MB today (775 KB and 123 KB), so no trim has fired yet.

- 2026-10-24 — **#1 duplicate `dcg` hook: GONE.** `settings.json` holds one dcg PreToolUse
  entry and is clean against git.
- 2026-10-24 — **#2 check the 10-03 backup run: OBSOLETE.** Backups end OK daily (10-22 audit).
- 2026-10-24 — **#6 push retry: DONE** (`daily-backup.ps1` R10-04 retries a transient push failure).
- 2026-10-24 — **#9 Windows Milvus: OBSOLETE.** The Windows laptop has had no automation since 10-14.
- 2026-10-24 — **#10 nightly-digest on the Mac: DONE.** `com.keystone.nightlydigest` is loaded.
- 2026-10-23 — **#8 `~/Library/LaunchAgents` not backed up: FIXED.** `daily-backup.ps1`
  snapshots it to `_MACHINE/Backups/Machine/launchagents.tgz`; launchagents.tgz OK 2026-10-22/23.
- 2026-10-03 — **memsearch "Indexed 0 chunks" on 2026-09-19: NOT A BUG.** No sessions and
  no changed .md files that day; memsearch dedups by content hash, and ~56 zero runs since
  08-06 are routine. The real gaps became items #3 and #4 (both Done 2026-10-24).
- 2026-10-03 — **#5 `CommandCentre/server.out`**: untracked and added to `.gitignore`
  (CommandCentre commit, pushed). File stays on disk.
- 2026-10-03 — **#4 `dcg` blocks `$CLAUDE_JOB_DIR/tmp` redirects: WON'T FIX.** dcg 0.11.0
  allows no exemption for `redirect-truncate-dynamic-path` by design. Write the literal
  absolute path (`/Users/kristinarash/.claude/jobs/<id>/tmp/...`); that passes.
