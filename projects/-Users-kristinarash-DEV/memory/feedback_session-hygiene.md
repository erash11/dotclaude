---
name: session-hygiene
description: "When a background session can be deleted, how Eric picks up where he left off, and the two scripts that do both"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 25377000-859e-4d10-9d38-5e91339a12d3
  modified: 2026-10-02T21:24:09.290Z
---

Sessions are scratchpads; the repo (commits + `docs/STATUS.md` `## Next`) is the record.
Agreed 2026-10-02 after 79 sessions piled up on the home screen.

- **Delete a session** once its work is committed, pushed and in STATUS.md. Keep it while
  it is working/blocked, for 24 h after it finishes (the backup, hourly 12:00-17:00
  since 2026-10-22, has not taken its transcript yet), or while its `jobs/<id>/tmp/` holds a git worktree.
- `python ~/.claude/scripts/session-sweep.py` prints KEEP / SAFE TO DELETE / repos with
  unsaved work. Read-only.
- **Start the day** with `python ~/.claude/scripts/where-was-i.py` (first `## Next` item
  per project, newest first; `--days N`, `--all`), then pick ONE thread.
- **Max 5 active threads** in global MEMORY.md; park one to add one. Parked NEXTs live in
  each STATUS.md.
- **One session per project**, named for the project; resume it or start fresh from
  STATUS.md instead of spawning a new session per small task.

**Why:** Eric works on many projects in a day and lost track of where each stopped.
**How to apply:** on "what was I doing" / "where did I leave off" run where-was-i; on
"clean up sessions" run session-sweep, then delete each SAFE id with `claude rm <id>`
(supported CLI; it refuses if the session's worktree has unpushed work). Never `rm` the
`~/.claude/jobs/` folders by hand. See [[post-merge-cleanup]].
