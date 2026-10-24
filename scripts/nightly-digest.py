"""Nightly email: open items, decisions, and docs created that day, with full paths.

Sent from eric.rash11@gmail.com (the gws account) to Eric's Outlook. Sections:
  1. Active threads and pending decisions  - global-memory/MEMORY.md
  2. Decisions made today                  - daily compiled log, **Decisions Made:** per session
  3. Open items                            - daily log **Action Items:**, plus ## Next and
                                             ## Open questions from every docs/STATUS.md
                                             committed in the last STATUS_DAYS days (any branch,
                                             after fetch, so the Mac's pushed work counts)
  4. Docs created today                    - doc files added in any git commit that day, and
                                             (Windows only) doc files created that day on the
                                             Drive storage tree; the Mac skips it, see drive_docs

The daily log is gitignored and per machine, so sections 2 and the Action Items cover this
machine's sessions only.

Runs from launchd com.keystone.nightlydigest (21:00, runs on wake if missed; tracked plist
~/.claude/scripts/com.keystone.nightlydigest.plist). Retries the send while the network wakes up.
  python nightly-digest.py                          # today (yesterday if run before noon), send
  python nightly-digest.py --date 2026-10-05 --dry-run   # write HTML, no send
"""
import argparse
import datetime as dt
import html
import importlib.util
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# Runs under pythonw from Task Scheduler: give git/gws children no console window either.
if os.name == "nt":
    _run = subprocess.run
    subprocess.run = lambda *a, **k: _run(*a, **{"creationflags": subprocess.CREATE_NO_WINDOW, **k})

HOME = Path.home()
SCRIPTS = HOME / ".claude" / "scripts"
ERR_LOG = HOME / ".claude" / "global-memory" / "transcripts" / ".errors.log"


def report_crash(e: BaseException) -> None:
    """Under launchd a crash only reaches nightlydigest.err; put one line where sessions see it."""
    with ERR_LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{dt.datetime.now().astimezone().isoformat()}] nightly-digest: crashed ({e!r})"
                f" - see ~/.claude/scripts/logs/nightlydigest.err\n")


try:
    _spec = importlib.util.spec_from_file_location("files_digest", SCRIPTS / "claude-files-digest.py")
    fd = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(fd)      # reuse its repo list, git helper, SKIP filter, gws path
    MAX_BODY = fd.MAX_BODY
except Exception as e:
    report_crash(e)
    raise

TO = "Eric_Rash@baylor.edu"
MEMORY = HOME / ".claude" / "global-memory" / "MEMORY.md"
DAILY = HOME / ".claude" / "claude-memory-compiler" / "daily"
DRIVE = (Path(r"G:\My Drive\00_Primary_Storage_Drive") if os.name == "nt" else
         HOME / "Library/CloudStorage/GoogleDrive-eric.rash11@gmail.com/My Drive/00_Primary_Storage_Drive")
DRIVE_PRUNE = {"05_SYSTEMS", "_exports", "_to_delete", "__pycache__", ".git", "node_modules", ".venv"}
DOC_EXT = {".md", ".docx", ".xlsx", ".pptx", ".pdf", ".html"}
STATUS_DAYS = 7       # a STATUS.md committed within this many days counts as an active project
PER_NEXT, PER_OPEN = 5, 3   # bullets shown for a project whose STATUS.md changed on the digest day
CLIP = 240            # characters kept per bullet
PER_LIST = 40         # created-doc paths shown per repo or Drive folder
LOG = SCRIPTS / "logs" / "nightly-digest.log"

H = "font-family:Arial,sans-serif;color:#154734;border-bottom:2px solid #154734;margin:22px 0 6px"
SUB = "color:#595959;font-size:0.85em"


def log(msg: str) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{dt.datetime.now():%Y-%m-%dT%H:%M:%S}] {msg}\n")


def md(text: str) -> str:
    """Escape, then render the inline markdown the logs use: **bold**, `code`, [[links]]."""
    t = html.escape(text.strip())
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    return t


def bullets(lines: list[str]) -> list[str]:
    """Top-level '- ' or '1. ' items; indented or wrapped lines join the item above."""
    items: list[str] = []
    for ln in lines:
        if re.match(r"^[-*] |^\d+\. ", ln):
            items.append(re.sub(r"^([-*]|\d+\.) ", "", ln))
        elif ln.strip() and items and (ln.startswith(" ") or not ln.startswith("#")):
            items[-1] += " " + ln.strip().lstrip("-* ")
    return [i for i in items if i.strip()]


def clip(t: str, n: int = CLIP) -> str:
    t = " ".join(t.split())
    return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + " ..."


def ul(items: list[str], cap: int | None = None) -> str:
    shown = [clip(i) for i in (items if cap is None else items[:cap])]
    more = f"<li><i>+{len(items) - len(shown)} more</i></li>" if len(items) > len(shown) else ""
    return "<ul style='margin-top:4px'>" + "".join(f"<li>{md(i)}</li>" for i in shown) + more + "</ul>"


def section(text: str, heading: str) -> list[str]:
    """Lines under '## heading' up to the next '## '."""
    m = re.search(rf"^## {re.escape(heading)}[^\n]*\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    return m.group(1).splitlines() if m else []


# ---------- 1. MEMORY.md ----------
def memory_threads() -> tuple[list[str], list[str]]:
    text = MEMORY.read_text(encoding="utf-8") if MEMORY.exists() else ""
    threads = bullets(section(text, "Active Threads"))
    pending = [p for p in bullets(section(text, "Pending Decisions")) if p.strip().lower() != "none open."]
    return threads, pending


# ---------- 2/3. daily log ----------
def daily_sessions(day: dt.date) -> list[dict]:
    f = DAILY / f"{day}.md"
    if not f.exists():
        return []
    out = []
    for block in re.split(r"^### Session ", f.read_text(encoding="utf-8"), flags=re.M)[1:]:
        when = block.split("\n", 1)[0].strip()
        fields = {}
        for label in ("Context", "Decisions Made", "Action Items"):
            m = re.search(rf"^\*\*{label}:\*\*(.*?)(?=^\*\*[A-Za-z /]+:\*\*|\Z)", block, re.M | re.S)
            fields[label] = m.group(1) if m else ""
        out.append({"when": when, "context": fields["Context"].strip(),
                    "decisions": bullets(fields["Decisions Made"].splitlines()),
                    "actions": bullets(fields["Action Items"].splitlines())})
    return out


# ---------- 3. STATUS.md ----------
def status_open(repo: Path, day: dt.date) -> dict | None:
    rev = fd.git(repo, "log", "--all", "-1", "--format=%H %cs", "--", "docs/STATUS.md").split()
    if len(rev) != 2 or dt.date.fromisoformat(rev[1]) < day - dt.timedelta(days=STATUS_DAYS):
        return None
    text = fd.git(repo, "show", f"{rev[0]}:docs/STATUS.md")
    text = re.split(r"^## Merged from windows copy", text, flags=re.M)[0]   # skip the duplicated block
    nxt, oq = bullets(section(text, "Next")), bullets(section(text, "Open questions"))
    if not nxt and not oq:
        return None
    return {"repo": repo, "date": rev[1], "next": nxt, "open": oq}


# ---------- 4. created docs ----------
def git_docs(repo: Path, day: dt.date) -> list[str]:
    try:
        fd.git(repo, "fetch", "-q", "origin", timeout=45)
    except subprocess.TimeoutExpired:
        pass
    out = fd.git(repo, "log", "--all", f"--since={day} 00:00", f"--until={day + dt.timedelta(days=1)} 00:00",
                 "--diff-filter=A", "--name-only", "--format=")
    return sorted({p for p in out.splitlines()
                   if p.strip() and Path(p).suffix.lower() in DOC_EXT and not fd.SKIP.search(p)
                   and "transcripts/" not in p})


def drive_docs(day: dt.date) -> dict[str, list[str]]:
    """Doc files on the Drive storage tree created on `day`, grouped by parent folder. Metadata only."""
    # shortcut: no Drive section on the Mac. launchd jobs cannot list Drive folders
    # (com.apple.macl, memory cloud-push-launchd-blocked) and mount walks can hang;
    # upgrade to a gws files.list on createdTime if the digest should list Drive docs again.
    if os.name != "nt":
        return {}
    start = dt.datetime.combine(day, dt.time()).timestamp()
    end = start + 86400
    found: dict[str, list[str]] = {}
    for root, dirs, files in os.walk(DRIVE):
        dirs[:] = [d for d in dirs if d not in DRIVE_PRUNE and not d.startswith(".")]
        for name in files:
            if Path(name).suffix.lower() not in DOC_EXT or name.startswith("~$"):
                continue
            p = os.path.join(root, name)
            if fd.SKIP.search(p.replace("\\", "/")):
                continue
            try:
                st = os.stat(p)
            except OSError:
                continue
            born = getattr(st, "st_birthtime", st.st_ctime)
            if start <= born < end:
                found.setdefault(root, []).append(name)
    return {k: sorted(v) for k, v in sorted(found.items())}


# ---------- build ----------
def build(day, threads, pending, sessions, statuses, gitdocs, drivedocs):
    n_dec = sum(len(s["decisions"]) for s in sessions)
    n_act = sum(len(s["actions"]) for s in sessions)
    n_docs = sum(map(len, gitdocs.values())) + sum(map(len, drivedocs.values()))
    subject = (f"Nightly digest {day:%a %b %d}: {n_dec} decisions, {n_act} action items, "
               f"{len(statuses)} active projects, {n_docs} docs created")
    p = [f"<p style='{SUB}'>Decisions and action items come from this machine's daily log (sessions on "
         f"other machines are not in it). Open items read every STATUS.md committed in the last {STATUS_DAYS} days on any "
         f"branch, both machines as pushed. Docs = .md/.docx/.xlsx/.pptx/.pdf/.html added that day.</p>"]

    p.append(f"<h2 style='{H}'>Active threads</h2>{ul(threads)}")
    if pending:
        p.append(f"<p><b>Pending decisions (MEMORY.md)</b></p>{ul(pending)}")

    p.append(f"<h2 style='{H}'>Decisions made today ({n_dec})</h2>")
    dec = [s for s in sessions if s["decisions"]]
    if not dec:
        p.append("<p>None recorded in today's daily log.</p>")
    for s in dec:
        p.append(f"<p style='margin-bottom:0'><b>Session {html.escape(s['when'])}</b> "
                 f"<span style='{SUB}'>{md(s['context'][:220])}</span></p>{ul(s['decisions'])}")

    p.append(f"<h2 style='{H}'>Open items from today's sessions ({n_act})</h2>")
    act = [s for s in sessions if s["actions"]]
    if not act:
        p.append("<p>None recorded in today's daily log.</p>")
    for s in act:
        p.append(f"<p style='margin-bottom:0'><b>Session {html.escape(s['when'])}</b> "
                 f"<span style='{SUB}'>{md(s['context'][:160])}</span></p>{ul(s['actions'])}")
    p.append(f"<h2 style='{H}'>Docs created today ({n_docs})</h2>")
    if not n_docs:
        p.append("<p>None.</p>")
    for repo, paths in sorted(gitdocs.items(), key=lambda kv: -len(kv[1])):
        items = "".join(f"<li>{html.escape(str(repo / x))}</li>" for x in paths[:PER_LIST])
        more = f"<li><i>+{len(paths) - PER_LIST} more</i></li>" if len(paths) > PER_LIST else ""
        p.append(f"<p style='margin-bottom:0'><b>{html.escape(repo.name)}</b> (git, {len(paths)})</p>"
                 f"<ul style='margin-top:4px'>{items}{more}</ul>")
    if drivedocs:
        p.append(f"<p style='{SUB}'>Drive ({html.escape(str(DRIVE))}, excluding 05_SYSTEMS, "
                 f"_exports, _to_delete). Files made on another machine show the day Drive synced them.</p>")
    for folder, names in drivedocs.items():
        items = "".join(f"<li>{html.escape(os.path.join(folder, x))}</li>" for x in names[:PER_LIST])
        more = f"<li><i>+{len(names) - PER_LIST} more</i></li>" if len(names) > PER_LIST else ""
        p.append(f"<ul style='margin-top:4px'>{items}{more}</ul>")
    today = [st for st in statuses if st["date"] == str(day)]
    recent = [st for st in statuses if st["date"] != str(day)]
    p.append(f"<h2 style='{H}'>Open items by project</h2>"
             f"<h3>STATUS.md updated today ({len(today)})</h3>")
    if not today:
        p.append("<p>None.</p>")
    for st in today:
        blk = (f"<p style='margin-bottom:0'><b>{html.escape(st['repo'].name)}</b> "
               f"<span style='{SUB}'>{html.escape(str(st['repo'] / 'docs' / 'STATUS.md'))}</span></p>")
        if st["next"]:
            blk += f"<div style='margin-left:8px'><i>Next</i>{ul(st['next'], PER_NEXT)}</div>"
        if st["open"]:
            blk += f"<div style='margin-left:8px'><i>Open questions</i>{ul(st['open'], PER_OPEN)}</div>"
        p.append(blk)
    if recent:
        rows = "".join(
            f"<li><b>{html.escape(st['repo'].name)}</b> <span style='{SUB}'>({st['date'][5:]}"
            f"{', ' + str(len(st['open'])) + ' open q' if st['open'] else ''})</span> "
            f"{md(clip(st['next'][0] if st['next'] else st['open'][0], 160))}</li>" for st in recent)
        p.append(f"<h3>Updated in the last {STATUS_DAYS} days ({len(recent)}): first Next item</h3>"
                 f"<ul style='margin-top:4px'>{rows}</ul>")
    return subject, p


def wrap(parts: list[str]) -> str:
    return "<div style='font-family:Arial,sans-serif;font-size:14px'>" + "".join(parts) + "</div>"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="YYYY-MM-DD (default: today, or yesterday if run before noon)")
    ap.add_argument("--dry-run", action="store_true", help="write the HTML, do not send")
    ap.add_argument("--force", action="store_true", help="send even if this day was already sent")
    a = ap.parse_args()
    now = dt.datetime.now()
    day = dt.date.fromisoformat(a.date) if a.date else (now.date() if now.hour >= 12
                                                        else now.date() - dt.timedelta(days=1))
    if not a.dry_run and not a.force and fd.already_sent(LOG, day):
        log(f"skip {day}: already sent (use --force to resend)")
        return 0

    threads, pending = memory_threads()
    sessions = daily_sessions(day)
    rs = fd.repos()
    with ThreadPoolExecutor(8) as ex:
        dfut = ex.submit(drive_docs, day)
        gd = dict(zip(rs, ex.map(lambda r: git_docs(r, day), rs)))
        sts = [s for s in ex.map(lambda r: status_open(r, day), rs) if s]
        drivedocs = dfut.result()
    gitdocs = {r: v for r, v in gd.items() if v}
    statuses = sorted(sts, key=lambda s: s["date"], reverse=True)

    subject, parts = build(day, threads, pending, sessions, statuses, gitdocs, drivedocs)
    full = LOG.parent / f"nightly-digest-{day}.html"
    full.parent.mkdir(parents=True, exist_ok=True)
    full.write_text(f"<h2>{html.escape(subject)}</h2>{wrap(parts)}", encoding="utf-8")

    attach = []
    body = wrap(parts)
    if len(body) > MAX_BODY:          # Windows caps the command line: send what fits, attach the rest
        kept, note = [], ("<p><b>Truncated to fit one email. The full digest is attached "
                          f"({html.escape(full.name)}).</b></p>")
        for part in parts:
            if len(wrap(kept + [part, note])) > MAX_BODY:
                break
            kept.append(part)
        body, attach = wrap(kept + [note]), ["-a", full.name]   # gws only attaches from its cwd

    if a.dry_run:
        print(f"{subject}\n{full}\nbody {len(body)} chars{' + attachment' if attach else ''}")
        return 0

    r, tries = fd.send(subject, body, *attach, to=TO, cwd=full.parent, note=log)   # retried in fd
    if r.returncode == 0:
        log(f"sent {day}: {subject}" + (f" (try {tries})" if tries > 1 else ""))
        return 0
    log(f"FAILED {day} after {tries} tries: {r.stderr.strip()[:500]}")
    with ERR_LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{dt.datetime.now().astimezone().isoformat()}] nightly-digest: send failed for {day}"
                f" - see ~/.claude/scripts/logs/nightly-digest.log\n")
    return 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        log(f"CRASHED: {e!r}")
        report_crash(e)
        raise
