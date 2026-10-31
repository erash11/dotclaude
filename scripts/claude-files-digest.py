"""Daily email: the docs made on a given day, as clickable links, real docs first.

Sections, in order:
  1. New deliverables on Drive - docx/pdf/pptx/xlsx and Google Docs/Sheets/Slides created in Eric's
     Drive that day (any author: Drive has no co-author trail), linked, with their Drive folder.
     The _MACHINE tree (daily all-DEV copy, backups) is left out: git already lists those files.
  2. Docs in git - DOC_EXT files added in a commit whose Co-Authored-By trailer names Claude,
     grouped by repo then commit message, each linked to GitHub at that commit.
  3. Other files - every other added file (data, code, logs): one count line per repo.
A day with nothing in any section sends no email; the log still gets an "empty" line.
Repos are fetched first and read with --all, so the Mac's pushed commits count too.

Runs from launchd com.keystone.filesdigest (06:30, runs on wake if missed; reports the previous
day). The send and the Drive list are retried while the network wakes up.
nightly-digest.py imports this file: keep git, SKIP, already_sent, repos, send, MAX_BODY and
drive_deliverables working.
  python claude-files-digest.py                 # yesterday, send
  python claude-files-digest.py --date 2026-10-03 --dry-run   # write HTML, no send
  python test_claude_files_digest.py            # asserts for the parsing helpers
"""
import argparse
import datetime as dt
import html
import json
import os
import re
import shutil
import subprocess
import sys
import time
from collections import Counter
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
PER_REPO = 30          # doc links listed per repo before "+N more"
PER_FOLDER = 10        # Drive links listed per folder before "+N more" (a re-filing day moves dozens)
COUNT_ONLY = {"Flint", "SecondBrain"}   # bulk generated notes: show the count, not the list
MAX_BODY = 28000      # Windows command line caps the whole call at 32767 chars
SEND_TRIES, SEND_WAIT = 4, 60   # a run on wake can start before DNS is up (failed 10-21, 10-23)
# The one rule for "doc" in git: by extension. Everything else (csv, txt, json, py...) is counted only.
DOC_EXT = {".md", ".html", ".docx", ".pdf", ".pptx", ".xlsx"}
DRIVE_MIME = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/pdf",
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.presentation",
    "application/vnd.google-apps.spreadsheet",
)
DRIVE_PRUNE = ("_MACHINE/",)   # Drive folders (from My Drive) whose new files are mirrors, not deliverables
# shortcut: caps the folder-name lookups (~2.5 s each) on a day the mirror uploads many PDFs;
# past the cap a path stays partial and the _MACHINE filter can miss. Raise it if that shows up.
MAX_LOOKUPS = 60
A = "color:#154734"
GREY = "color:#666;font-size:0.85em"

# Same health-data filter as project-triage/landed.py, plus session transcripts.
SKIP = re.compile(
    r"(?i)DEXA[_ ]?Project|athlete-snapshots|pff-snapshots|Injur(y|ies)|/Roster/|roster[^/]*\.(xlsx?|csv)$"
    r"|/Personnel(_Interview_Docs)?/|WBB_athletes|Athlete_Performance_Overview|Spirit Squad|ICE ?Form"
    r"|^projects/.*\.jsonl$|/tool-results/|(^|/)transcripts/")


def log(msg: str) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{dt.datetime.now():%Y-%m-%dT%H:%M:%S}] {msg}\n")


def send(subject: str, body: str, *extra: str, to: str = TO, cwd: Path | None = None,
         note=log) -> tuple[subprocess.CompletedProcess, int]:
    """gws gmail +send, retried SEND_TRIES times. Returns the last attempt and its number."""
    for attempt in range(1, SEND_TRIES + 1):
        r = subprocess.run([*GWS, "gmail", "+send", "--to", to, "--subject", subject,
                            "--body", body, "--html", *extra], cwd=cwd, capture_output=True, text=True,
                           encoding="utf-8", errors="replace")
        if r.returncode == 0 or attempt == SEND_TRIES:
            return r, attempt
        note(f"send try {attempt} failed, retrying in {SEND_WAIT}s: {r.stderr.strip()[:200]}")
        time.sleep(SEND_WAIT)


def already_sent(log_path: Path, day: dt.date) -> bool:
    """A by-hand run, or a launchd re-run on wake, must not email the same day twice."""
    if not log_path.exists():
        return False
    text = log_path.read_text(encoding="utf-8", errors="replace")
    return f"] sent {day}:" in text or f"] empty {day}:" in text


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


def github_base(remote: str) -> str | None:
    """git@github.com:o/r.git or https://github.com/o/r(.git) -> https://github.com/o/r."""
    m = re.match(r"(?:git@github\.com:|https://github\.com/)([^/\s]+/[^/\s]+?)(?:\.git)?/?$", remote.strip())
    return f"https://github.com/{m[1]}" if m else None


def parse_log(out: str) -> list[tuple[str, str, str]]:
    """Read the created() git log: (path, commit hash, commit subject) for Claude co-authored adds."""
    seen: dict[str, tuple[str, str, str]] = {}
    for block in out.split("\x1e")[1:]:
        lines = block.strip("\n").splitlines()
        head = lines[0].split("\x1f") if lines else []
        if len(head) < 3 or "claude" not in head[2].lower():
            continue
        for p in lines[1:]:
            if p.strip() and not SKIP.search(p) and p not in seen:
                seen[p] = (p, head[0], head[1])
    return sorted(seen.values())


def created(repo: Path, day: dt.date) -> list[tuple[str, str, str]]:
    try:
        git(repo, "fetch", "-q", "origin", timeout=45)
    except subprocess.TimeoutExpired:
        pass
    out = git(repo, "log", "--all", f"--since={day} 00:00", f"--until={day + dt.timedelta(days=1)} 00:00",
              "--diff-filter=A", "--name-only",
              "--format=%x1e%H%x1f%s%x1f%(trailers:key=Co-Authored-By,valueonly,separator=;)")
    return parse_log(out)


def gws_json(*args: str, tries: int = 1) -> dict:
    """Run gws and parse its JSON (gws prints a keyring line first). Raises after the last try."""
    for attempt in range(1, tries + 1):
        r = subprocess.run([*GWS, *args], capture_output=True, text=True, encoding="utf-8",
                           errors="replace", timeout=120)
        if r.returncode == 0 and "{" in r.stdout:
            return json.loads(r.stdout[r.stdout.find("{"):])
        if attempt == tries:
            raise RuntimeError(f"gws {' '.join(args[:3])}: {r.stderr.strip()[:300]}")
        time.sleep(SEND_WAIT)


def utc(day: dt.date) -> str:
    """Local midnight of `day` as a UTC timestamp: Drive times are UTC, the digest day is local."""
    return dt.datetime.combine(day, dt.time()).astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def drive_deliverables(day: dt.date) -> list[dict] | None:
    """Deliverable files created in Eric's Drive on `day`: [{name, link, folder}]. None if the lookup failed."""
    mimes = " or ".join(f"mimeType = '{m}'" for m in DRIVE_MIME)
    q = (f"createdTime >= '{utc(day)}' and createdTime < '{utc(day + dt.timedelta(days=1))}'"
         f" and 'me' in owners and trashed = false and ({mimes})")
    try:
        files, token = [], None
        while True:
            params = {"q": q, "pageSize": 200, "fields": "nextPageToken,files(name,webViewLink,parents)"}
            if token:
                params["pageToken"] = token
            page = gws_json("drive", "files", "list", "--params", json.dumps(params), tries=SEND_TRIES)
            files += page.get("files", [])
            token = page.get("nextPageToken")
            if not token:
                break
    except Exception as e:
        log(f"drive lookup failed for {day}: {e}")
        return None

    cache: dict[str, tuple[str, str | None]] = {}    # folder id -> (name, parent id)

    def folder_path(fid: str | None) -> str:
        parts = []
        while fid:
            if fid not in cache:
                if len(cache) >= MAX_LOOKUPS:
                    parts.append("…")
                    break
                try:
                    f = gws_json("drive", "files", "get", "--params",
                                 json.dumps({"fileId": fid, "fields": "name,parents"}))
                except Exception:
                    f = {"name": "?"}
                cache[fid] = (f.get("name", "?"), (f.get("parents") or [None])[0])
            name, fid = cache[fid]
            parts.append(name)
        path = "/".join(reversed(parts))
        return path.removeprefix("My Drive").lstrip("/")

    found = []
    for f in files:
        folder = folder_path((f.get("parents") or [None])[0])
        if folder.startswith(DRIVE_PRUNE) or SKIP.search(f"/{folder}/{f['name']}"):
            continue
        found.append({"name": f["name"], "link": f.get("webViewLink", ""), "folder": folder or "My Drive"})
    return sorted(found, key=lambda d: (d["folder"], d["name"]))


def is_doc(path: str) -> bool:
    return Path(path).suffix.lower() in DOC_EXT


def build(day: dt.date, found: dict[Path, list[tuple[str, str, str]]], drive: list[dict] | None,
          gh: dict[Path, str | None]) -> tuple[str, str]:
    docs = {r: [f for f in fs if is_doc(f[0])] for r, fs in found.items() if r.name not in COUNT_ONLY}
    docs = {r: fs for r, fs in docs.items() if fs}
    n_docs = sum(map(len, docs.values()))
    n_drive = len(drive or [])
    subject = f"New docs: {day:%a %b %d, %Y} ({n_drive} on Drive, {n_docs} in git)"
    parts = []

    # 1. Drive deliverables
    if drive is None:
        parts.append("<p style='color:#b00'>Drive lookup failed; Drive deliverables are missing today. "
                     "See ~/.claude/scripts/logs/claude-files-digest.log</p>")
    elif drive:
        parts.append(f"<h2 style='{A}'>New deliverables on Drive ({n_drive})</h2>"
                     f"<div style='{GREY}'>Office files, PDFs and Google Docs created in your Drive that day "
                     f"(a moved or re-uploaded file counts as new).</div>")
        folders: dict[str, list[dict]] = {}
        for d in drive:
            folders.setdefault(d["folder"], []).append(d)
        for folder, ds in folders.items():
            items = "".join(f"<li><a style='{A}' href='{html.escape(d['link'])}'>{html.escape(d['name'])}</a></li>"
                            for d in ds[:PER_FOLDER])
            more = f"<li><i>+{len(ds) - PER_FOLDER} more</i></li>" if len(ds) > PER_FOLDER else ""
            parts.append(f"<div style='{GREY};margin-top:8px'>{html.escape(folder)}</div>"
                         f"<ul style='margin:2px 0'>{items}{more}</ul>")

    # 2. Docs in git, grouped by commit message
    if docs:
        parts.append(f"<h2 style='{A}'>Docs in git ({n_docs})</h2>")
    for repo, fs in sorted(docs.items(), key=lambda kv: -len(kv[1])):
        base, shown, groups = gh.get(repo), fs[:PER_REPO], {}
        for f in shown:
            groups.setdefault(f[2], []).append(f)
        rows = []
        for subj, gfs in groups.items():
            links = "".join(
                f"<li><a style='{A}' href='{html.escape(f'{base}/blob/{sha}/{p}')}'>{html.escape(p)}</a></li>"
                if base else f"<li>{html.escape(p)}</li>" for p, sha, _ in gfs)
            rows.append(f"<div style='margin-top:4px'><i>{html.escape(subj)}</i></div><ul style='margin:2px 0'>{links}</ul>")
        more = f"<div><i>+{len(fs) - PER_REPO} more</i></div>" if len(fs) > PER_REPO else ""
        block = (f"<h3 style='margin:12px 0 0'>{html.escape(repo.name)} ({len(fs)})</h3>"
                 f"<div style='{GREY}'>{html.escape(str(repo))}</div>{''.join(rows)}{more}")
        if sum(map(len, parts)) + len(block) > MAX_BODY - 3000:
            parts.append(f"<p><i>Truncated to fit one email. Full list: "
                         f"python3 {html.escape(__file__)} --date {day} --dry-run</i></p>")
            break
        parts.append(block)

    # 3. Everything else: one count line per repo
    other = []
    for repo, fs in sorted(found.items(), key=lambda kv: kv[0].name.lower()):
        rest = fs if repo.name in COUNT_ONLY else [f for f in fs if not is_doc(f[0])]
        if rest:
            kinds = Counter(Path(f[0]).suffix.lower().lstrip(".") or "no ext" for f in rest)
            mix = ", ".join(f"{k} {n}" for k, n in kinds.most_common(4))
            other.append(f"<li>{html.escape(repo.name)}: {len(rest)} ({html.escape(mix)})</li>")
    if other:
        parts.append(f"<h3 style='margin:18px 0 0;color:#666'>Other files, count only</h3>"
                     f"<ul style='{GREY}'>{''.join(other)}</ul>")
    return subject, "<div style='font-family:Arial,sans-serif'>" + "".join(parts) + "</div>"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="YYYY-MM-DD (default: yesterday)")
    ap.add_argument("--dry-run", action="store_true", help="write the HTML next to the log, do not send")
    ap.add_argument("--force", action="store_true", help="send even if this day was already sent")
    a = ap.parse_args()
    day = dt.date.fromisoformat(a.date) if a.date else dt.date.today() - dt.timedelta(days=1)
    if not a.dry_run and not a.force and already_sent(LOG, day):
        log(f"skip {day}: already sent (use --force to resend)")
        return 0

    rs = repos()
    with ThreadPoolExecutor(8) as ex:
        dfut = ex.submit(drive_deliverables, day)
        results = dict(zip(rs, ex.map(lambda r: created(r, day), rs)))
        gh = dict(zip(rs, ex.map(lambda r: github_base(git(r, "remote", "get-url", "origin")), rs)))
        drive = dfut.result()
    found = {r: p for r, p in results.items() if p}
    empty = not found and drive == []
    subject, body = build(day, found, drive, gh)

    if a.dry_run:
        out = LOG.parent / f"claude-files-digest-{day}.html"
        out.write_text(f"<h2>{html.escape(subject)}</h2>{body}", encoding="utf-8")
        print(f"{subject}{' (empty: would not send)' if empty else ''}\n{out}")
        return 0
    if empty:
        log(f"empty {day}: nothing to send")
        return 0

    r, tries = send(subject, body)
    if r.returncode == 0:
        log(f"sent {day}: {subject}" + (f" (try {tries})" if tries > 1 else ""))
        return 0
    log(f"FAILED {day} after {tries} tries: {r.stderr.strip()[:500]}")
    with ERR_LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{dt.datetime.now().astimezone().isoformat()}] claude-files-digest: send failed for {day}"
                f" - see ~/.claude/scripts/logs/claude-files-digest.log\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())
