"""Session sweep: which background sessions are safe to delete from the home screen.

A session is safe to delete once its work is committed, pushed, and in STATUS.md.
The session itself is a scratchpad; the repo is the record.

KEEP when the session is still working or blocked on you, finished in the last
24 hours (tonight's backup has not picked up its transcript yet), or owns a git
worktree that still exists. Also lists every repo under DEV with uncommitted or
unpushed work, since deleting a session never deletes the repo but the work there
is unfinished.

Read-only. It never deletes anything.

Usage:
    python ~/.claude/scripts/session-sweep.py
"""
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

HOME = os.path.expanduser("~")
JOBS = os.path.join(HOME, ".claude", "jobs")
DEV = os.path.join(HOME, "Desktop", "DEV") if os.name == "nt" else os.path.join(HOME, "DEV")


def git(repo, *args):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    return r.stdout.strip() if r.returncode == 0 else ""


def sessions():
    now = datetime.now(timezone.utc)
    keep, delete = [], []
    for d in sorted(os.listdir(JOBS)):
        p = os.path.join(JOBS, d, "state.json")
        if not os.path.isfile(p):
            continue
        s = json.load(open(p, encoding="utf-8"))
        name = s.get("name") or "(unnamed)"
        state = s.get("state")
        updated = s.get("updatedAt") or ""
        reasons = []
        try:
            age = now - datetime.fromisoformat(updated.replace("Z", "+00:00"))
        except ValueError:
            age = timedelta(0)
        if state in ("working", "blocked"):
            stale = " (no activity in 3+ days: open it; if its work is merged, delete)" if age > timedelta(days=3) else ""
            reasons.append(f"state={state}{stale}")
        if age < timedelta(hours=24):
            reasons.append("finished <24h ago (backup not yet run)")
        tmp = os.path.join(JOBS, d, "tmp")
        if os.path.isdir(tmp):
            for sub in os.listdir(tmp):
                if os.path.exists(os.path.join(tmp, sub, ".git")):
                    reasons.append(f"holds worktree tmp/{sub}")
        row = (updated[:10], d, name, reasons)
        (keep if reasons else delete).append(row)
    return keep, delete


def repo_flags(repo):
    flags = []
    if git(repo, "status", "--porcelain"):
        flags.append("uncommitted")
    for line in git(repo, "for-each-ref", "--format=%(refname:short)|%(upstream:track)", "refs/heads").splitlines():
        b, _, t = line.partition("|")
        if "ahead" in t:
            flags.append(f"unpushed:{b}")
    return repo, flags


def repos():
    found = [os.path.join(HOME, ".claude"), os.path.join(HOME, ".claude", "global-memory")]
    for root, dirs, files in os.walk(DEV):
        depth = root[len(DEV):].count(os.sep)
        if ".git" in dirs or ".git" in files:
            found.append(root)
        dirs[:] = [x for x in dirs if not x.startswith((".", "_ARCHIVE", "node_modules"))] if depth < 2 else []
    with ThreadPoolExecutor(12) as ex:
        return [r for r in ex.map(repo_flags, found) if r[1]]


def main():
    keep, delete = sessions()
    print(f"KEEP ({len(keep)})")
    for when, d, name, why in sorted(keep, reverse=True):
        print(f"  {when}  {d}  {name}  <- {'; '.join(why)}")
    print(f"\nSAFE TO DELETE ({len(delete)}) — oldest first")
    for when, d, name, _ in sorted(delete):
        print(f"  {when}  {d}  {name}")
    dirty = repos()
    print(f"\nREPOS WITH UNSAVED WORK ({len(dirty)}) — finish these with /closeout, not by keeping sessions")
    for repo, flags in dirty:
        print(f"  {os.path.relpath(repo, HOME)}: {', '.join(flags)}")


if __name__ == "__main__":
    main()
