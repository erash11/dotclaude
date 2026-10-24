#!/usr/bin/env python3
"""Context floor: the smallest first-turn input size of recent sessions, per app.

The first API call of a session carries the system prompt, tools, CLAUDE.md files,
memory and hook text, plus the first prompt. The smallest one over a few days is the
"floor": what every session pays before Eric types anything. It grew from 71k
(desktop, 10-16) to 113k (10-24) with nobody noticing. stack-check runs this and
flags a rise of more than 10% over the stored baseline.

    python3 context-floor.py            # print floors, exit 1 if one grew
    python3 context-floor.py --set      # store today's floors as the new baseline
"""
import datetime, glob, json, os, sys

DAYS = 3
GROWTH = 1.10
APPS = ("claude-desktop", "cli")
BASE = os.path.expanduser("~/.claude/scripts/context-floor-baseline.json")


def floors(days=DAYS):
    since = (datetime.date.today() - datetime.timedelta(days=days)).isoformat()
    low = {}
    for f in glob.glob(os.path.expanduser("~/.claude/projects/*/*.jsonl")):
        if datetime.date.fromtimestamp(os.path.getmtime(f)).isoformat() < since:
            continue
        try:
            with open(f, errors="ignore") as fh:
                for line in fh:
                    if '"usage"' not in line:
                        continue
                    d = json.loads(line)
                    u = d.get("message", {}).get("usage")
                    if not u or d.get("isSidechain"):
                        continue
                    app, day = d.get("entrypoint"), d.get("timestamp", "")[:10]
                    n = u.get("input_tokens", 0) + u.get("cache_creation_input_tokens", 0) + u.get("cache_read_input_tokens", 0)
                    # shortcut: under 5k is a broken or synthetic turn, not a real session start.
                    if app in APPS and day >= since and n > 5000:
                        low[app] = min(n, low.get(app, n))
                    break
        except (OSError, ValueError):
            continue
    return low


def main():
    now = floors()
    if "--set" in sys.argv:
        json.dump({"set": datetime.date.today().isoformat(), **now}, open(BASE, "w"), indent=1)
        print("baseline set:", now)
        return 0
    base = json.load(open(BASE)) if os.path.exists(BASE) else {}
    grew = False
    for app in APPS:
        if app not in now:
            print(f"context-floor {app}: no sessions in {DAYS} days")
            continue
        b = base.get(app)
        if b and now[app] > b * GROWTH:
            grew = True
            print(f"context-floor {app}: {now[app]} tokens, baseline {b} ({base.get('set')}) - GREW {round(100 * (now[app] / b - 1))}%")
        else:
            print(f"context-floor {app}: {now[app]} tokens, baseline {b} - OK")
    return 1 if grew else 0


if __name__ == "__main__":
    sys.exit(main())
