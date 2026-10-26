#!/bin/zsh
# Usage: run2.sh <skill-file-stem> <scenario-stem> <rubric-stem> <n>. Tool-less, no MCP, no session saved, $1 cap per call.
cd ${0:A:h}; v=$1; s=$2; r=$3; n=$4; tag=$v-$s-$n
safe=(--model sonnet --output-format json --tools "" --strict-mcp-config --no-session-persistence --max-budget-usd 1)
claude -p "$(cat $s.txt)

$(cat $v.md)" $safe < /dev/null > plan-$tag.json 2> plan-$tag.err
python3 -c "import json;print(json.load(open('plan-$tag.json'))['result'])" > plan-$tag.txt
claude -p "$(cat $r.txt)

$(cat plan-$tag.txt)" $safe < /dev/null > judge-$tag.json 2> judge-$tag.err
