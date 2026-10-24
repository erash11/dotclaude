# Harness fix list

Work this list as fixes come up (the Friday slot was dropped 2026-10-11).
Rules: `projects/-Users-kristinarash-DEV/memory/feedback_harness-time-budget.md`.

Top of the list = do first. Move done items to **Done** with the date.
**Never run `dcg install` on this setup**; ignore `dcg doctor` asking for it (it re-adds a
duplicate Mac-only hook line; see Done 2026-10-24).

## Open

3. **Apply the memsearch index logging patch** to `scripts/daily-backup.ps1` (~lines 556-560):
   `audits/2026-10-03-daily-backup-index-logging.patch`. It logs path and file counts, says
   "no new content" on 0, and records errors for no input or unexpected output. Do it with
   items 6–7, after tonight's backup is checked.
4. **The 2026-09-28 21:54 backup run died mid-index** (`INDEX path set`, then nothing) and
   no error was recorded. Add a check that `INDEX path set` is always followed by
   `INDEX full set` (in `claude-stack-doctor` or the next run).
7. **`daily-backup.out` and `daily-backup.log` are never rotated.** They grow without limit
   (775 KB and 123 KB on 2026-10-24).

## Done

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
  08-06 are routine. The real gaps became items #3 and #4 above.
- 2026-10-03 — **#5 `CommandCentre/server.out`**: untracked and added to `.gitignore`
  (CommandCentre commit, pushed). File stays on disk.
- 2026-10-03 — **#4 `dcg` blocks `$CLAUDE_JOB_DIR/tmp` redirects: WON'T FIX.** dcg 0.11.0
  allows no exemption for `redirect-truncate-dynamic-path` by design. Write the literal
  absolute path (`/Users/kristinarash/.claude/jobs/<id>/tmp/...`); that passes.
