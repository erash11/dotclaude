# STATUS

## Current state
- Windows and macOS share this configuration repo through GitHub. The 2026-09-14 closeout captured the current Windows Claude session logs and synchronized the repository with the Mac changes.
- Managed skills are authored in the separate `~/.claude/skills` repo and published to generated Windows views.

## Next
- Let active session transcripts finish writing before the next closeout snapshot.

## Open questions
- None.

## Gotchas
- `projects/**.jsonl` files are live session logs and may change again after a closeout commit when the stop hook writes its final entry.
