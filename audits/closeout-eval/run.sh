#!/bin/zsh
# Usage: run.sh <old|new> <n>. Tool-less, no MCP, no session saved, $1 cap per call.
cd ${0:A:h}; v=$1; n=$2
safe=(--model sonnet --output-format json --tools "" --strict-mcp-config --no-session-persistence --max-budget-usd 1)
claude -p "$(cat scenario.txt)

$(cat $v.md)" $safe < /dev/null > plan-$v-$n.json 2> plan-$v-$n.err
python3 -c "import json,sys;print(json.load(open('plan-$v-$n.json'))['result'])" > plan-$v-$n.txt
claude -p "$(cat rubric.txt)

$(cat plan-$v-$n.txt)" $safe < /dev/null > judge-$v-$n.json 2> judge-$v-$n.err
