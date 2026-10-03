# Harness fix list

Work this list only in the Friday 1:00–2:00 PM Central harness slot.
Rules: `projects/-Users-kristinarash-DEV/memory/feedback_harness-time-budget.md`.

During the week, add one line and go back to work. Fix something outside the slot only if it
blocks real work today. Top of the list = do first. Move done items to **Done** with the date.

## Open

1. **Duplicate `dcg` hook in the Mac `settings.json` working copy.** ERIC ONLY (auto mode
   blocks Claude from editing its own settings). Cause found 2026-10-03: `dcg doctor` only
   counts the absolute-path entry as "its" hook, so it tells you to run `dcg install`, which
   re-adds the Mac-only line; the next settings commit then sweeps it into git (happened in
   e72c374). The line also reappeared within seconds of a manual removal at 11:04, cause of
   that still unknown. Steps: close all Claude sessions, run
   `git -C ~/.claude restore settings.json`, then open one session and run
   `git -C ~/.claude diff --stat settings.json`. If it is back, `dcg` rewrites its own hook.
   **Never run `dcg install` on this setup**; ignore `dcg doctor` asking for it.
2. **Check the 2026-10-03 21:00 `daily-backup` run.** It is the first test of two fixes:
   `global-memory` behind GitHub, and `42Analytics` missing from the backup list.
3. **memsearch `INDEX full set: Indexed 0 chunks`** (first seen 2026-09-19, 91 chunks the day
   before). The script does not count it as an error, so it fails without a warning.
6. **`daily-backup` has no retry** after a short network failure on push. The next try is the
   next day's run.
7. **`daily-backup.out` and `daily-backup.log` are never rotated.** They grow without limit.
8. **`~/Library/LaunchAgents` is not backed up.** The launchd job files exist only on this Mac.

Items 6–8 wait until after the 2026-10-03 21:00 backup run is checked (item 2), so that
run tests only the two earlier fixes.

## Done

- 2026-10-03 — **#5 `CommandCentre/server.out`**: untracked and added to `.gitignore`
  (CommandCentre commit, pushed). File stays on disk.
- 2026-10-03 — **#4 `dcg` blocks `$CLAUDE_JOB_DIR/tmp` redirects: WON'T FIX.** dcg 0.11.0
  allows no exemption for `redirect-truncate-dynamic-path` by design. Write the literal
  absolute path (`/Users/kristinarash/.claude/jobs/<id>/tmp/...`); that passes.
