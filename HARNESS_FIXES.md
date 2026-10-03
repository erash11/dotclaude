# Harness fix list

Work this list only in the Friday 1:00–2:00 PM Central harness slot.
Rules: `projects/-Users-kristinarash-DEV/memory/feedback_harness-time-budget.md`.

During the week, add one line and go back to work. Fix something outside the slot only if it
blocks real work today. Top of the list = do first. Move done items to **Done** with the date.

## Open

1. **Duplicate `dcg` hook in the Mac `settings.json` working copy.** The git version is
   already fixed (`~/DEV` commit aa2626a). Close all Claude sessions, then run
   `git -C ~/.claude restore settings.json`. If the duplicate returns, find what writes it.
2. **Check the 2026-10-03 21:00 `daily-backup` run.** It is the first test of two fixes:
   `global-memory` behind GitHub, and `42Analytics` missing from the backup list.
3. **memsearch `INDEX full set: Indexed 0 chunks`** (first seen 2026-09-19, 91 chunks the day
   before). The script does not count it as an error, so it fails without a warning.
4. **`dcg` blocks redirects to `$CLAUDE_JOB_DIR/tmp`** (rule
   `core.filesystem:redirect-truncate-dynamic-path`). Background jobs are told to use that
   folder. Workaround today: write the literal path.
5. **`CommandCentre/server.out` makes the repo dirty at every sync.** Ignore it in git or move it.
6. **`daily-backup` has no retry** after a short network failure on push. The next try is the
   next day's run.
7. **`daily-backup.out` and `daily-backup.log` are never rotated.** They grow without limit.
8. **`~/Library/LaunchAgents` is not backed up.** The launchd job files exist only on this Mac.

## Done

(none yet)
