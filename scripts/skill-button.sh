#!/bin/zsh
# Headless skill button - ARMS layer S, gap 4.
#
# Runs one Claude Code skill with no terminal attached, so a skill can be fired
# by launchd, a Shortcut, a Stream Deck key, or another script instead of only
# by a human typing "/name". Before this, `claude -p` appeared on this machine
# only inside documentation and lesson HTML - nothing actually fired a skill.
#
#   usage: skill-button.sh <skill> [extra args passed through to the skill]
#          skill-button.sh --list
#
# Exit codes: 0 ok | 2 unknown skill or no args | 3 environment problem
#             anything else is claude's own exit code.
set -u

CLAUDE=/Users/kristinarash/.local/bin/claude
LOGDIR=/Users/kristinarash/.claude/scripts/logs
MODEL="${SKILL_BUTTON_MODEL:-claude-sonnet-5}"

# Allowlist. A button runs unattended with permission checks bypassed, so only
# skills that are safe with nobody watching belong here. Read-mostly reporting
# skills qualify. Anything that sends mail, publishes, or deletes does not.
typeset -A BUTTONS
BUTTONS=(
  project-triage      "$HOME/DEV"
  claude-stack-doctor "$HOME/DEV"
  forecast-capture    "$HOME/DEV/CFB_Analytics_Lab"
)

if [ $# -eq 0 ] || [ "${1:-}" = "--list" ]; then
  echo "available buttons:"
  for k in ${(ko)BUTTONS}; do printf "  %-22s cwd=%s\n" "$k" "${BUTTONS[$k]}"; done
  echo ""
  echo "usage: skill-button.sh <skill> [args...]"
  echo "env:   SKILL_BUTTON_MODEL (default claude-sonnet-5)"
  [ $# -eq 0 ] && exit 2
  exit 0
fi

SKILL="$1"; shift
if [ -z "${BUTTONS[$SKILL]:-}" ]; then
  echo "ERROR: '$SKILL' is not an allowlisted button. Run --list." >&2
  exit 2
fi
if [ ! -x "$CLAUDE" ]; then
  echo "ERROR: claude CLI not found at $CLAUDE" >&2
  exit 3
fi

WD="${BUTTONS[$SKILL]}"
if [ ! -d "$WD" ]; then
  echo "ERROR: working dir $WD does not exist" >&2
  exit 3
fi

mkdir -p "$LOGDIR"
LOG="$LOGDIR/skill-button-$SKILL.log"
ARGS="$*"
PROMPT="/$SKILL${ARGS:+ $ARGS}"

echo "===== $(date '+%Y-%m-%d %H:%M:%S')  button=$SKILL  model=$MODEL  cwd=$WD  prompt='$PROMPT' =====" >> "$LOG"

cd "$WD" || exit 3
# stdin is closed deliberately: with no tty attached, any prompt the CLI issues
# would otherwise block forever with nobody there to answer it.
"$CLAUDE" -p "$PROMPT" --model "$MODEL" --dangerously-skip-permissions < /dev/null >> "$LOG" 2>&1
rc=$?
echo "===== $(date '+%Y-%m-%d %H:%M:%S')  button=$SKILL  exit=$rc =====" >> "$LOG"
if [ $rc -ne 0 ]; then
  echo "button '$SKILL' exited $rc - see $LOG" >&2
fi
exit $rc
