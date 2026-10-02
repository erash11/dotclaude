"""Where was I? One line per project: the first item under `## Next` in docs/STATUS.md.

Sorted by when STATUS.md was last committed, newest first. Flags repos with
uncommitted or unpushed work, since those are the ones a closeout missed.

Usage:
    python ~/.claude/scripts/where-was-i.py            # last 14 days
    python ~/.claude/scripts/where-was-i.py --days 60
    python ~/.claude/scripts/where-was-i.py --all
"""
import argparse
import glob
import os
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta

DEV = os.path.expanduser("~/Desktop/DEV") if os.name == "nt" else os.path.expanduser("~/DEV")


def git(repo, *args):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    return r.stdout.strip()


def first_next(path):
    text = open(path, encoding="utf-8", errors="replace").read()
    m = re.search(r"^## Next\s*\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    if not m:
        return "(no ## Next section)"
    parts = []
    for line in m.group(1).splitlines():
        s = line.strip()
        if not parts:
            s = re.sub(r"^(\d+[.)]|[-*])\s*", "", s)
            if re.search(r"\w", s) and not s.startswith(("#", "```", "|")):
                parts.append(s)
        elif not s or re.match(r"^(\d+[.)]|[-*])\s", s) or s.startswith("#"):
            break
        else:
            parts.append(s)
    if not parts:
        return "(## Next is empty)"
    item = " ".join(parts)
    return item[:160] + ("…" if len(item) > 160 else "")


def inspect(status_path):
    repo = os.path.dirname(os.path.dirname(status_path))
    when = git(repo, "log", "-1", "--format=%cs", "--", "docs/STATUS.md") or "uncommitted"
    flags = []
    status = git(repo, "status", "-sb", "--porcelain").splitlines()
    if len(status) > 1:
        flags.append("DIRTY")
    if status and "ahead" in status[0]:
        flags.append("UNPUSHED")
    return os.path.relpath(repo, DEV), when, first_next(status_path), flags


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=14)
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args()

    paths = glob.glob(os.path.join(DEV, "*", "docs", "STATUS.md")) + \
        glob.glob(os.path.join(DEV, "*", "*", "docs", "STATUS.md"))
    paths = [p for p in paths if "_ARCHIVE" not in p and "worktrees" not in p]
    with ThreadPoolExecutor(12) as ex:
        rows = list(ex.map(inspect, paths))

    cutoff = (datetime.now() - timedelta(days=a.days)).strftime("%Y-%m-%d")
    rows = [r for r in rows if a.all or r[1] == "uncommitted" or r[1] >= cutoff]
    rows.sort(key=lambda r: r[1], reverse=True)

    print(f"Where was I — {len(rows)} projects" + ("" if a.all else f" touched in the last {a.days} days"))
    for name, when, nxt, flags in rows:
        flag = f"  [{' '.join(flags)}]" if flags else ""
        print(f"\n{when}  {name}{flag}\n    NEXT: {nxt}")


if __name__ == "__main__":
    main()
