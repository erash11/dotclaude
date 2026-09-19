# STATUS

## Current state
- Windows and macOS share this configuration repo through GitHub. The 2026-09-14 closeout captured the current Windows Claude session logs and synchronized the repository with the Mac changes.
- Managed skills are authored in the separate `~/.claude/skills` repo and published to generated Windows views.
- 2026-09-19: `scripts/daily-backup.ps1` no longer treats "behind + dirty" as divergence.
  `DIVERGED` now means behind AND ahead; behind-only tries `git pull --ff-only` and errors
  only if git itself refuses. This repo and `global-memory` are permanently dirty during a
  session, so the old check produced a false `repo-diverged` error on every day the other
  machine pushed. Commit `bd6b451`; previous file kept as `daily-backup.ps1.bak-2026-09-19`.
- 2026-09-19: `scripts/backup-manifest.json` now covers `DEV/AppliedPerformance-Site`
  (`institutional`, private GitHub repo). A concurrent session added `DEV/TypeSafe_Sandbox`
  the same morning (`7528c06`). The `DEV/Linda_Projects` entry added earlier that day was
  later REMOVED: it described a redundant clone, and the real folder `DEV/Linda Projects`
  (with a space) was already covered. That entry now states the truth - it is a private
  GitHub repo holding I-983 files, and it must stay private.
- 2026-09-19: **double-logging fixed.** Every `daily-backup` line was written twice: the
  script's `Log` function appends to `daily-backup.log` AND writes to stdout, and the launchd
  plist pointed `StandardOutPath` at that same file. Proven on the 09:1x run - 36 lines, 18
  unique. `StandardOutPath` now points at `daily-backup.out`, so the script's own append is the
  single copy. Verified by a real launchd run: 28 lines, 28 unique, zero duplicates.
  Plist backup at `~/Library/LaunchAgents/com.keystone.dailybackup.plist.bak-2026-09-19`.
- 2026-09-19: the dry run no longer claims a fast-forward it never attempted. It compares dirty
  paths against the incoming changed paths and reports REFUSED with the clashing file names.

## Next
- Let active session transcripts finish writing before the next closeout snapshot.
- Watch the next 09:0x `daily-backup` run: expect no `repo-diverged` line and no manifest
  error. Log at `scripts/logs/daily-backup.log`.
- The "no-op push counted as an error" bug **does not exist** - checked 2026-09-19 and the
  2026-09-17 diagnosis was wrong. See Gotchas. All four known `daily-backup.ps1` bugs are
  now either fixed or disproven.

## Open questions
- `INDEX full set: Indexed 0 chunks` on the 2026-09-19 run, against 91 the day before. The
  script does not count it as an error, so it fails silently. Not yet investigated.

## Gotchas
- `projects/**.jsonl` files are live session logs and may change again after a closeout commit when the stop hook writes its final entry.
- `scripts/backup-manifest.json` is **not** globally sorted — some `DEV/` entries were appended
  after the non-`DEV` block. Insert new entries in place; a full re-sort churns unrelated lines.
  `json.dumps(d, indent=1, ensure_ascii=False) + "\n"` round-trips the file byte-identically.
- Two sessions can write to this repo at once. Check `git log` before assuming a change is yours.
- `~/Library/LaunchAgents` is **not backed up** - not in `backup-manifest.json`, not snapshotted.
  The launchd job definitions exist in exactly one place on this machine.
- After editing a launchd plist, reload it or the change does nothing:
  `launchctl bootout gui/$(id -u)/<label>` then `launchctl bootstrap gui/$(id -u) <plist>`.
  Confirm with `launchctl print gui/$(id -u)/<label>`.
- `daily-backup.out` now grows with every run, as `daily-backup.log` already did. Neither is
  rotated.
- **There is no "no-op push" bug, despite the 2026-09-17 note saying so.** A genuine no-op push
  prints `Everything up-to-date` to stderr and exits **0**, and the script only records an error
  on a non-zero exit, so it stays silent. Verified on a throwaway repo 2026-09-19.
  The 2026-09-17 `repo-push:dotclaude` error was a REAL failure - the full block reads
  `RPC failed; curl 55 Recv failure`, `send-pack: unexpected disconnect`,
  `fatal: the remote end hung up unexpectedly`, and `Everything up-to-date` was merely the last
  of git's four stderr lines. Reading one line out of four produced the wrong diagnosis, and the
  double-logging made that block twice as long and easy to misread.
- That 2026-09-17 failure was a transient network error, and the job has **no retry**. A push
  that fails this way is not reattempted until the next day's run.
