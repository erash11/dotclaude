#!/bin/bash
# new-session.sh <dir> <command> [args...]
# Open <command> in a new Ghostty window, in <dir>, with every CLAUDE* and CODEX_COMPANION_*
# variable removed first.
# Why: a session started from inside Claude Code inherits the parent's CLAUDE_CODE_SESSION_ID and
# CLAUDE_CODE_CHILD_SESSION, so it writes no transcript of its own (2026-11-02: the AIOS audit
# session 15d95b4f; Terminal, newly launched by `open`, copied the parent's environment).
# Only those variables go. HOME, PATH and the login keychain stay: `env -i` deleted the gws login
# the same day.
# Example: ~/.claude/scripts/new-session.sh ~/DEV/KeystoneOS claude "audit my AI OS"
set -euo pipefail
[ $# -ge 2 ] || { echo "usage: new-session.sh <dir> <command> [args...]" >&2; exit 2; }
dir="$1"; shift
[ -d "$dir" ] || { echo "no such folder: $dir" >&2; exit 1; }
tmp="$(mktemp -d "${TMPDIR:-/tmp}/new-session.XXXXXX")"
launcher="$tmp/start.command"
{
  echo '#!/bin/zsh -l'
  echo 'for v in ${(k)parameters[(I)(CLAUDE*|CODEX_COMPANION_*)]}; do unset "$v"; done'
  printf 'cd %q || exit 1\n' "$dir"
  printf 'exec'; printf ' %q' "$@"; echo
} > "$launcher"
chmod +x "$launcher"
/usr/bin/open -a Ghostty "$launcher"
echo "opened in Ghostty: $* (in $dir)"
