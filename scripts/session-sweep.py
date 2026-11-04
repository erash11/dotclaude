"""Session sweep: which background sessions are safe to delete from the home screen.

A session is safe to delete once its work is committed, pushed, and in STATUS.md.
The session itself is a scratchpad; the repo is the record.

KEEP when the session is still working or blocked on you, its transcript is not
yet committed and pushed in ~/.claude (the backup or /closeout commits it), or it
owns a git worktree that still exists. Also lists every repo under DEV with uncommitted or
unpushed work, since deleting a session never deletes the repo but the work there
is unfinished.

Read-only by default. With --delete it runs `claude rm <id>` on each SAFE
session (claude rm itself refuses a session whose worktree has unpushed work).

Usage:
    python ~/.claude/scripts/session-sweep.py            # list only
    python ~/.claude/scripts/session-sweep.py --delete   # list, then delete the SAFE ones
"""
import argparse
import glob
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

HOME = os.path.expanduser("~")
CLAUDE = os.path.join(HOME, ".claude")
JOBS = os.path.join(CLAUDE, "jobs")
DEV = os.path.join(HOME, "Desktop", "DEV") if os.name == "nt" else os.path.join(HOME, "DEV")


def git(repo, *args):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    return r.stdout.strip() if r.returncode == 0 else ""


def transcript_unsaved(sid, root=CLAUDE):
    """Why session sid's transcript is not yet safe on GitHub, or "" when it is.

    Safe = every file under projects/*/<sid>* (the .jsonl plus any subagent files)
    is tracked, has no uncommitted change, and its last commit is on the upstream.
    """
    spec = f"projects/*/{sid}*"  # git pathspec: * also crosses /, so subagent files match
    if not git(root, "ls-files", "--", spec):
        on_disk = glob.glob(os.path.join(root, "projects", "*", sid + "*"))
        return "transcript not committed" if on_disk else "no transcript found"
    if git(root, "status", "--porcelain", "--untracked-files=all", "--", spec):
        return "transcript has uncommitted changes"
    if not git(root, "rev-parse", "--verify", "-q", "@{u}"):
        return "~/.claude has no upstream"
    if git(root, "rev-list", "@{u}..HEAD", "--", spec):
        return "transcript commit not pushed"
    return ""


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
        unsaved = transcript_unsaved(d)
        if unsaved:
            reasons.append(unsaved)
        tmp = os.path.join(JOBS, d, "tmp")
        if os.path.isdir(tmp):
            for sub in os.listdir(tmp):
                if os.path.exists(os.path.join(tmp, sub, ".git")):
                    reasons.append(f"holds worktree tmp/{sub}")
        row = (updated[:10], d, name, reasons)
        (keep if reasons else delete).append(row)
    return keep, delete


def still_idle(sid, jobs=JOBS):
    """Re-read state just before deleting: a SAFE session may have restarted since the scan."""
    try:
        s = json.load(open(os.path.join(jobs, sid, "state.json"), encoding="utf-8"))
    except (OSError, ValueError):
        return False
    state = s.get("state") if isinstance(s, dict) else None
    return isinstance(state, str) and state not in ("working", "blocked")


def delete_safe(rows, run=subprocess.run, idle=still_idle):
    """Run `claude rm` on each SAFE row. Returns (deleted, failed, skipped) id lists."""
    deleted, failed, skipped = [], [], []
    for _, d, name, _ in sorted(rows):
        if not idle(d):
            print(f"  SKIP    {d}  {name}  <- active again, or state.json unreadable")
            skipped.append(d)
            continue
        try:
            r = run(["claude", "rm", d], capture_output=True, text=True)
            ok, msg = r.returncode == 0, ((r.stdout or "") + (r.stderr or "")).strip().splitlines()
        except OSError as e:  # claude missing from PATH or not runnable
            ok, msg = False, [str(e)]
        print(f"  {'DELETED' if ok else 'FAILED '} {d}  {name}" + ("" if ok or not msg else f"  <- {msg[-1]}"))
        (deleted if ok else failed).append(d)
    return deleted, failed, skipped


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
    ap = argparse.ArgumentParser(description="List (and optionally delete) background sessions.")
    ap.add_argument("--delete", action="store_true", help="run `claude rm` on each SAFE session")
    args = ap.parse_args()
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
    if args.delete and delete:
        print(f"\nDELETING {len(delete)} SAFE session(s)")
        deleted, failed, skipped = delete_safe(delete)
        print(f"Done: {len(deleted)} deleted, {len(failed)} failed, {len(skipped)} skipped.")
        return 1 if failed else 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
