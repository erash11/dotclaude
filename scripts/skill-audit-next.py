#!/usr/bin/env python3
# skill-audit-next.py - the next skills for ~/DEV/docs/SKILL-AUDIT-LIST.md: owned skills ranked by
# Skill-tool calls + typed /commands in the last 60 days of session logs, minus every skill already
# in the Next or Done table (a Done skill returns only when Eric says so). Ties break by name.
# Run: python3 ~/.claude/scripts/skill-audit-next.py
import collections, glob, os, re, time
doc = open(os.path.expanduser('~/DEV/docs/SKILL-AUDIT-LIST.md'), encoding='utf-8').read()
listed = set()
for line in doc.splitlines():
    m = re.match(r'^\|\s*(\d+|\d{4}-\d{2}-\d{2})\s*\|([^|]*)\|', line)
    if m: listed |= set(re.findall(r'`([^`]+)`', m.group(2)))
owned = {d for d in os.listdir(os.path.expanduser('~/.claude/skills')) if os.path.isfile(os.path.expanduser(f'~/.claude/skills/{d}/SKILL.md'))}
cut, c = time.time() - 60 * 86400, collections.Counter()
for f in glob.glob(os.path.expanduser('~/.claude/projects/**/*.jsonl'), recursive=True):
    if os.path.getmtime(f) < cut: continue
    for line in open(f, encoding='utf-8', errors='ignore'):
        if 'Skill' not in line and 'command-name' not in line: continue
        for n in re.findall(r'"name"\s*:\s*"Skill"\s*,\s*"input"\s*:\s*\{[^}]*?"skill"\s*:\s*"([^"]+)"', line) + re.findall(r'<command-name>/([a-zA-Z0-9:_-]+)</command-name>', line):
            if n in owned and n not in listed: c[n] += 1
print('already listed or done:', ', '.join(sorted(listed)))
for n, k in sorted(c.items(), key=lambda x: (-x[1], x[0]))[:5]: print(f'{k:4d}  {n}')
