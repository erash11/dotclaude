---
name: codex-exec-stdin-hang
description: "codex exec run from Claude's Bash tool can wait on stdin forever; add < /dev/null"
metadata:
  type: project
---

When Claude Code's Bash tool runs `codex exec ... "<prompt>"` without a tty, Codex can still read stdin for extra input and wait forever. Close stdin: `codex exec -s read-only -o out.md "<prompt>" < /dev/null`.

**Why:** 2026-10-30 dev-sync audit: codex exec -s read-only sat 10+ min printing 'Reading additional input from stdin...' until killed; rerun with < /dev/null finished in ~3 min.

**How to apply:** Always end the call with < /dev/null (and redirect output to a file). The audit Method in ~/DEV/docs/SKILL-AUDIT-LIST.md already does.
