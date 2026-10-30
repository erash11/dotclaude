---
name: zsh-shell-traps
description: "zsh-specific shell traps hit repeatedly on this macOS machine — path/UID/status reserved variables, word-splitting, leading = words, unmatched globs"
metadata: 
  node_type: memory
  type: project
  originSessionId: a86cfb00-e6d1-46b9-8cdc-35e21acd9931
  modified: 2026-08-07T00:53:25.947Z
---

zsh quirks that have repeatedly broken scripts in Claude sessions on this machine:

- **Never use `path` as a variable name** — zsh ties lowercase `path` (array) to `PATH`; assigning it a scalar clobbers PATH mid-script ("command not found" for everything after).
- `UID` and `status` are read-only in zsh — use `ZUID`, `st`, etc.
- Unquoted `$VAR` does NOT word-split in zsh — use `${=VAR}` when splitting is intended.
- Background-task shells get a minimal PATH; start scripts with `export PATH="/usr/bin:/bin:/opt/homebrew/bin:$PATH"` and use `$HOME/go/bin` for Go CLIs.
- `head` at the end of a pipeline masks grep's exit code — use `grep -q` for presence tests, never `grep -l ... | head && echo FOUND`.
- **git fetch/push/pull to private repos hangs silently** in sandboxed/background shells — no keychain access means git blocks on an invisible credential prompt (looks exactly like a network outage; `ls-remote` on public paths still works). Fix: `GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c 'credential.helper=!gh auth git-credential' <cmd>`.
- A word starting with `=` is a command lookup in zsh (`echo =====` fails: `===== not found`). Quote separators: `echo '====='`.
- An unquoted glob that matches nothing is an error (`no matches found`), not a literal. Quote it: `--include='*.py'`, `ls '*test*'`, or use `find`/`xargs`. Both hit 2026-10-29/30, and again 10-30 in the session that saved this.

**Why:** each cost a debugging round in the Aug 2026 restore/printing sessions.
**How to apply:** prefer these idioms proactively in any zsh/bash-on-macOS scripting here.
