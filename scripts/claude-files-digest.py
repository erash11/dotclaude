"""Daily email: the files Claude created on a given day, grouped by repo, with full paths.

"Created by Claude" = added in a git commit whose Co-Authored-By trailer names Claude.
Files Claude writes outside git (Drive deliverables, scratch) are not attributable, so
they are not listed. Repos are fetched first and read with --all, so the Mac's pushed
commits count too.

Runs from Task Scheduler (\\Eric\\claude-files-digest, 06:30, reports the previous day).
  python claude-files-digest.py                 # yesterday, send
  python claude-files-digest.py --date 2026-10-03 --dry-run   # write HTML, no send
"""
import argparse
import datetime as dt
import html
import os
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HOME = Path.home()
WINDOWS = os.name == "nt"
# Mac since 2026-10-08 (the Windows laptop is hands-off); Windows values kept for reference.
DEV = HOME / "Desktop" / "DEV" if WINDOWS else HOME / "DEV"
SECONDBRAIN = HOME / "Desktop" / "SecondBrain" if WINDOWS else HOME / "SecondBrain"
TO = "Eric_Rash@baylor.edu"
NODE = "node"
GWS_JS = HOME / r"AppData\Roaming\npm\node_modules\@googleworkspace\cli\run.js"
# Windows calls run.js through node to dodge cmd.exe parsing; the Mac has a plain gws binary.
GWS = [NODE, str(GWS_JS)] if WINDOWS else [shutil.which("gws") or "/opt/homebrew/bin/gws"]
LOG = HOME / ".claude" / "scripts" / "logs" / "claude-files-digest.log"
ERR_LOG = HOME / ".claude" / "global-memory" / "transcripts" / ".errors.log"
PER_REPO = 30          # paths listed per repo before "+N more"
COUNT_ONLY = {"Flint", "SecondBrain"}   # bulk generated notes: show the count, not the list
MAX_BODY = 28000      # Windows command line caps the whole call at 32767 chars

# Same health-data filter as project-triage/landed.py, plus session transcripts.
SKIP = re.compile(
    r"(?i)DEXA[_ ]?Project|athlete-snapshots|pff-snapshots|Injur(y|ies)|/Roster/|roster[^/]*\.(xlsx?|csv)$"
    r"|/Personnel(_Interview_Docs)?/|WBB_athletes|Athlete_Performance_Overview|Spirit Squad|ICE ?Form"
    r"|^projects/.*\.jsonl$|/tool-results/")


def log(msg: str) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{dt.datetime.now():%Y-%m-%dT%H:%M:%S}] {msg}\n")


def git(repo: Path, *args: str, timeout: int = 60) -> str:
    r = subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True,
                       encoding="utf-8", errors="replace", timeout=timeout)
    return r.stdout


def repos() -> list[Path]:
    found = []
    for parent in (DEV, DEV / "Football", DEV / "SpecialRequests"):
        if parent.is_dir():
            found += [p for p in parent.iterdir() if (p / ".git").exists()]
    found += [HOME / ".claude", HOME / ".claude" / "skills", HOME / ".claude" / "global-memory",
              SECONDBRAIN]
    # DEV/claude-global-memory is a second clone of ~/.claude/global-memory: count it once.
    return [p for p in found if (p / ".git").exists() and p.name != "claude-global-memory"]


def created(repo: Path, day: dt.date) -> list[str]:
    try:
        git(repo, "fetch", "-q", "origin", timeout=45)
    except subprocess.TimeoutExpired:
        pass
    out = git(repo, "log", "--all", f"--since={day} 00:00", f"--until={day + dt.timedelta(days=1)} 00:00",
              "--diff-filter=A", "--name-only",
              "--format=%x1e%(trailers:key=Co-Authored-By,valueonly,separator=;)")
    paths = []
    for block in out.split("\x1e")[1:]:
        lines = block.strip("\n").splitlines()
        if not lines or "claude" not in lines[0].lower():
            continue
        paths += [p for p in lines[1:] if p.strip() and not SKIP.search(p)]
    return sorted(set(paths))


def build(day: dt.date, found: dict[Path, list[str]]) -> tuple[str, str]:
    total = sum(len(v) for v in found.values())
    subject = f"Files Claude created: {day:%a %b %d, %Y} ({total} file{'s' * (total != 1)})"
    parts = [f"<p>Files added in Claude co-authored commits on {day:%A, %B %d}, across DEV and ~/.claude "
             f"(both machines, as pushed). {total} files in {len(found)} repos.</p>"]
    if not found:
        parts.append("<p>Nothing created that day.</p>")
    listed = sorted((kv for kv in found.items() if kv[0].name not in COUNT_ONLY), key=lambda kv: -len(kv[1]))
    counted = [kv for kv in found.items() if kv[0].name in COUNT_ONLY]
    if counted:
        parts.append("<p style='color:#666'>Generated notes, count only: " + "; ".join(
            f"{html.escape(r.name)} {len(p)} ({html.escape(str(r))})" for r, p in counted) + "</p>")
    for repo, paths in listed:
        items = "".join(f"<li>{html.escape(p)}</li>" for p in paths[:PER_REPO])
        more = f"<li><i>+{len(paths) - PER_REPO} more</i></li>" if len(paths) > PER_REPO else ""
        block = (f"<h3 style='margin-bottom:2px'>{html.escape(repo.name)} ({len(paths)})</h3>"
                 f"<div style='color:#666;font-size:0.85em'>{html.escape(str(repo))}</div>"
                 f"<ul style='margin-top:4px'>{items}{more}</ul>")
        if sum(map(len, parts)) + len(block) > MAX_BODY:
            parts.append(f"<p><i>Truncated to fit one email. Full list: "
                         f"python {html.escape(__file__)} --date {day} --dry-run</i></p>")
            break
        parts.append(block)
    return subject, "<div style='font-family:Arial,sans-serif'>" + "".join(parts) + "</div>"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="YYYY-MM-DD (default: yesterday)")
    ap.add_argument("--dry-run", action="store_true", help="write the HTML next to the log, do not send")
    a = ap.parse_args()
    day = dt.date.fromisoformat(a.date) if a.date else dt.date.today() - dt.timedelta(days=1)

    rs = repos()
    with ThreadPoolExecutor(8) as ex:
        results = dict(zip(rs, ex.map(lambda r: created(r, day), rs)))
    found = {r: p for r, p in results.items() if p}
    subject, body = build(day, found)

    if a.dry_run:
        out = LOG.parent / f"claude-files-digest-{day}.html"
        out.write_text(f"<h2>{html.escape(subject)}</h2>{body}", encoding="utf-8")
        print(f"{subject}\n{out}")
        return 0

    r = subprocess.run([*GWS, "gmail", "+send", "--to", TO, "--subject", subject,
                        "--body", body, "--html"], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode == 0:
        log(f"sent {day}: {subject}")
        return 0
    log(f"FAILED {day}: {r.stderr.strip()[:500]}")
    with ERR_LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{dt.datetime.now().astimezone().isoformat()}] claude-files-digest: send failed for {day}"
                f" - see ~/.claude/scripts/logs/claude-files-digest.log\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())
