"""Where was I? One line per project: the first item under `## Next` in docs/STATUS.md.

Sorted by when STATUS.md was last committed, newest first. Flags repos with
uncommitted or unpushed work, since those are the ones a closeout missed.

With --decisions it lists instead every open item under `## Open questions`
(decisions waiting on Eric) across the same repos, then the dated handoffs
written in the window. /startup runs this so a multi-repo day is not reduced
to one repo's "Blocked on" line.

Usage:
    python ~/.claude/scripts/where-was-i.py            # last 14 days
    python ~/.claude/scripts/where-was-i.py --days 60
    python ~/.claude/scripts/where-was-i.py --all
    python ~/.claude/scripts/where-was-i.py --decisions --days 7
"""
import argparse
import glob
import os
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta

DEV = os.path.expanduser("~/Desktop/DEV") if os.name == "nt" else os.path.expanduser("~/DEV")
SKIP = ("_ARCHIVE", "_to_delete", "_OLD_", "worktrees")


def dev_glob(*tail):
    """Glob DEV/*/<tail> and DEV/*/*/<tail>, skipping symlinked top-level folders.

    ~/DEV/_DRIVE links into the Google Drive mount: walking it can hang and
    surfaces local-only projects (DexaProject, Linda_Projects).
    """
    paths = []
    for top in os.scandir(DEV):
        if top.is_dir(follow_symlinks=False):
            paths += glob.glob(os.path.join(top.path, *tail)) + \
                glob.glob(os.path.join(top.path, "*", *tail))
    return paths


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


CLOSED = re.compile(r"^(~~|answered\b|resolved\b|settled\b|none\b|n/?a\b|nothing\b)", re.I)


def open_questions(path):
    """Open items under `## Open questions`, one string each; closed and blank items dropped."""
    text = open(path, encoding="utf-8", errors="replace").read()
    m = re.search(r"^## Open questions\s*\n(.*?)(?=^## |\Z)", text, re.M | re.S | re.I)
    if not m:
        return []
    items, cur = [], None
    for line in m.group(1).splitlines():
        s = line.strip()
        if re.match(r"^(\d+[.)]|[-*])(\s|$)", s) and not line.startswith((" ", "\t")):
            cur = [re.sub(r"^(\d+[.)]|[-*])\s*", "", s)]
            items.append(cur)
        elif s.startswith(("---", "#")):
            cur = None
        elif s and cur is not None:
            cur.append(s)
    out = []
    for parts in items:
        item = " ".join(p for p in parts if p)
        if not re.search(r"\w", item) or CLOSED.match(item):
            continue
        out.append(item[:220] + ("…" if len(item) > 220 else ""))
    return out


def recent_handoffs(cutoff):
    paths = dev_glob("docs", "handoffs", "*.md")
    rows = []
    for p in paths:
        if any(k in p for k in SKIP):
            continue
        name = os.path.basename(p)
        if re.match(r"^\d{4}-\d{2}-\d{2}", name) and name[:10] >= cutoff:
            rows.append((name[:10], os.path.relpath(p, DEV)))
    return sorted(rows, reverse=True)


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
    ap.add_argument("--decisions", action="store_true",
                    help="list open questions and recent handoffs instead of NEXT lines")
    a = ap.parse_args()

    paths = dev_glob("docs", "STATUS.md")
    paths = [p for p in paths if not any(k in p for k in SKIP)]
    assert not any(os.sep + "_DRIVE" + os.sep in p for p in paths)
    with ThreadPoolExecutor(12) as ex:
        rows = list(ex.map(inspect, paths))

    cutoff = (datetime.now() - timedelta(days=a.days)).strftime("%Y-%m-%d")
    rows = [r for r in rows if a.all or r[1] == "uncommitted" or r[1] >= cutoff]
    rows.sort(key=lambda r: r[1], reverse=True)

    if a.decisions:
        window = "" if a.all else f" (STATUS touched in the last {a.days} days)"
        found = [(name, when, open_questions(os.path.join(DEV, name, "docs", "STATUS.md")))
                 for name, when, _, _ in rows]
        found = [f for f in found if f[2]]
        print(f"Decisions waiting on you — {sum(len(f[2]) for f in found)} open in {len(found)} repos{window}")
        for name, when, qs in found:
            print(f"\n{when}  {name}")
            for q in qs:
                print(f"    - {q}")
        handoffs = recent_handoffs("0000" if a.all else cutoff)
        print(f"\nHandoffs written{'' if a.all else f' since {cutoff}'}: {len(handoffs) or 'none'}")
        for date, path in handoffs:
            print(f"    {date}  {path}")
        return

    print(f"Where was I — {len(rows)} projects" + ("" if a.all else f" touched in the last {a.days} days"))
    for name, when, nxt, flags in rows:
        flag = f"  [{' '.join(flags)}]" if flags else ""
        print(f"\n{when}  {name}{flag}\n    NEXT: {nxt}")


if __name__ == "__main__":
    main()
