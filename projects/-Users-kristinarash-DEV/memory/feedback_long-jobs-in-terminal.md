---
name: long-jobs-in-terminal
description: "Jobs over ~30 min run in Eric's Terminal under caffeinate, not inside Claude Code; never auto-restart one after a kill"
metadata:
  type: feedback
---

Long jobs (about 30 minutes or more) run in Eric's own Terminal under caffeinate, not as Claude Code background tasks. If one is killed, do not restart it on your own; resume only when Eric asks.

**Why:** Claude Code kills long background jobs under memory pressure and cannot reap them: the 10-26 Drive trash run died at ~7,500 of 30,968 files (session b1b9233e). Eric set the rule 2026-10-27.

**How to apply:** Hand Eric one command to paste in Terminal, wrapped in 'caffeinate -i -s' (-s holds only on AC power). Make it resumable (skips done work). After a kill, report where it stopped and resume only when Eric asks. Example: ~/DEV/drive-tools/docs/STATUS.md (trash_twins.py).
