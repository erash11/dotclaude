#!/bin/bash
# Recall bench: same questions, same model, two arms.
#   A = fresh default session in ~/DEV (finds the answer however it likes)
#   C = recall.py evidence (plain code) -> one model call, no tools
# Usage: bash ~/.claude/scripts/recall-bench/run.sh [A] [C]   (default: C only; ASET=held limits A to one set)
# Writes out/<arm><n>.json + .wall; score with: python3 -I ~/.claude/scripts/recall-bench/score.py
# Note: --no-session-persistence makes the session hooks log "transcript_path does not exist"
# to ~/.claude/global-memory/transcripts/.errors.log, one line per run. Harmless.
HERE="$(cd "$(dirname "$0")" && pwd)"; OUT="$HERE/out"; mkdir -p "$OUT"
ARMS="${*:-C}"
now() { python3 -c 'import time;print(time.time())'; }
cd ~/DEV || exit 1
n=0
grep -v '^#' "$HERE/questions.tsv" | while IFS=$'\t' read -r set q gtf gta; do
  n=$((n+1)); echo "== Q$n ($set)"
  if [[ " $ARMS " == *" A "* && ( -z "$ASET" || "$set" == "$ASET" ) ]]; then
    s=$(now)
    claude -p "$q Answer in 3 sentences or fewer." --model sonnet --output-format json \
      --permission-mode bypassPermissions --no-session-persistence --max-budget-usd 1 \
      < /dev/null > "$OUT/A$n.json" 2> "$OUT/A$n.err"
    echo "$s $(now)" > "$OUT/A$n.wall"
  fi
  if [[ " $ARMS " == *" C "* ]]; then
    s=$(now)
    python3 -I ~/.claude/scripts/recall.py "$q" > "$OUT/C$n.evidence" 2>&1
    m=$(now)
    claude -p "Answer the question using ONLY the evidence below, in 3 sentences or fewer. If the evidence does not answer it, say NOT FOUND.

Question: $q

Evidence:
$(cat "$OUT/C$n.evidence")" --model sonnet --output-format json --tools "" --strict-mcp-config \
      --no-session-persistence --max-budget-usd 1 < /dev/null > "$OUT/C$n.json" 2> "$OUT/C$n.err"
    echo "$s $m $(now)" > "$OUT/C$n.wall"
  fi
done
echo DONE
