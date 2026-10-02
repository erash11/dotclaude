---
name: session-hygiene
description: "When a background session can be deleted, how Eric picks up where he left off, and the two scripts that do both"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 25377000-859e-4d10-9d38-5e91339a12d3
  modified: 2026-10-02T21:10:40.984Z
---

Sessions are scratchpads; the repo (commits + `docs/STATUS.md` `## Next`) is the record.
Agreed 2026-10-02 after 79 sessions piled up on the home screen.

- **Delete a session** once its work is committed, pushed and in STATUS.md. Keep it while
  it is working/blocked, for 24 h after it finishes (nightly backup has not taken its
  transcript yet), or while its `jobs/<id>/tmp/` holds a git worktree.
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
"clean up sessions" run session-sweep. Auto-mode blocks Claude from deleting worktrees and
session folders, so Eric deletes them; Claude lists them. See [[post-merge-cleanup]].
