---
name: child-session-env-leak
description: "A Claude session started from inside another (open -a Terminal/Ghostty, a .command) inherits CLAUDE_CODE_SESSION_ID and CHILD_SESSION and saves no transcript"
metadata:
  type: project
---

A Claude session opened from inside another Claude session inherits the parent's CLAUDE_* variables and saves no transcript of its own.

**Why:** 2026-11-02: the AIOS audit session 15d95b4f was opened by the main session via open -a Terminal; Terminal was not running, so it copied the parent's environment (same CLAUDE_CODE_SESSION_ID, CLAUDE_JOB_DIR, CLAUDE_CODE_CHILD_SESSION). It wrote only a subagent file, no main .jsonl, and transcript-capture.js logged 'transcript_path does not exist' 3 times. Likely also the 2026-10-23 'hidden sessions' bursts (DEV/docs/handoffs/2026-10-23-audit-followup.md), whose source was never found.

**How to apply:** Start new sessions with ~/.claude/scripts/new-session.sh <dir> <cmd> (strips CLAUDE* and CODEX_COMPANION_* only; tested 18 -> 0). Never env -i (it deletes the gws login, see [[gws-cli-default]]). An app first launched by such an open keeps the leaked environment until it quits: quit Terminal/Ghostty after.
