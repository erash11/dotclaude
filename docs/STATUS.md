# STATUS

## Current state
- Windows and macOS share this configuration repo through GitHub. The 2026-09-14 closeout captured the current Windows Claude session logs and synchronized the repository with the Mac changes.
- Managed skills are authored in the separate `~/.claude/skills` repo and published to generated Windows views.
- 2026-09-19: `scripts/daily-backup.ps1` no longer treats "behind + dirty" as divergence.
  `DIVERGED` now means behind AND ahead; behind-only tries `git pull --ff-only` and errors
  only if git itself refuses. This repo and `global-memory` are permanently dirty during a
  session, so the old check produced a false `repo-diverged` error on every day the other
  machine pushed. Commit `bd6b451`; previous file kept as `daily-backup.ps1.bak-2026-09-19`.
- 2026-09-19: `scripts/backup-manifest.json` now covers `DEV/AppliedPerformance-Site` and
  `DEV/Linda_Projects` (both `institutional`, both private GitHub repos). A concurrent
  session added `DEV/TypeSafe_Sandbox` the same morning (`7528c06`).

## Next
- Let active session transcripts finish writing before the next closeout snapshot.
- Watch the next 09:0x `daily-backup` run: expect no `repo-diverged` line and no manifest
  error. Log at `scripts/logs/daily-backup.log`.
- Two known `daily-backup.ps1` bugs are still unfixed: it counts a no-op push
  (`Everything up-to-date`) as an error, and it writes every log line twice.

## Open questions
- `INDEX full set: Indexed 0 chunks` on the 2026-09-19 run, against 91 the day before. The
  script does not count it as an error, so it fails silently. Not yet investigated.

## Gotchas
- `projects/**.jsonl` files are live session logs and may change again after a closeout commit when the stop hook writes its final entry.
- `scripts/backup-manifest.json` is **not** globally sorted — some `DEV/` entries were appended
  after the non-`DEV` block. Insert new entries in place; a full re-sort churns unrelated lines.
  `json.dumps(d, indent=1, ensure_ascii=False) + "\n"` round-trips the file byte-identically.
- Two sessions can write to this repo at once. Check `git log` before assuming a change is yours.
