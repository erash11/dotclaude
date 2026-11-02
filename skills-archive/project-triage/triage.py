"""
DEV/ project triage report generator.

Scans top-level folders in ~/DEV/, classifies each by activity heuristics,
and renders an HTML dashboard at ~/DEV/project-triage/YYYY-MM-DD.html.

Heuristic classification:
  resume   — mtime within last 14 days, recent activity inside the tree
  pause    — mtime within last 30 days; needs a decision
  done     — older than 30d, has STATUS.md / SHIPPED.md / explicit completion marker
  kill     — older than 30d, < 5 files (likely stub/scaffold)
  archive  — older than 30d, otherwise (legacy or reference)

Curation extension point:
  If ~/DEV/project-triage/.curation.json exists, it's a dict keyed by
  project folder name with optional `purpose`, `action`, and `status_override`
  fields. Values are used in place of the auto-generated heuristic output.

Usage:
  python triage.py                  # generate today's report
  python triage.py --date 2026-05-21  # backfill a specific date
  python triage.py --open           # also open in default browser
  python triage.py --root <path>    # override scan root (default: ~/DEV)
"""

from __future__ import annotations

import argparse
import datetime as _dt
import html
import json
import os
import subprocess
import sys
import time
import webbrowser
from pathlib import Path


# ──────────────────────────────────────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────────────────────────────────────

DEFAULT_ROOT = (
    Path.home() / "Desktop" / "DEV"
    if sys.platform == "win32"
    else Path.home() / "DEV"
)
OUTPUT_SUBDIR = "project-triage"
CURATION_FILENAME = ".curation.json"

# Folder names to skip entirely (own output dir, build artifacts, etc.)
SKIP_FOLDERS = {
    "project-triage",
    "node_modules",
    "__pycache__",
    ".git",
    ".venv",
    "venv",
    ".idea",
    ".vscode",
}

DONE_MARKERS = ["STATUS.md", "SHIPPED.md", "DONE.md", "COMPLETED.md"]

# Files the OS or tooling writes on its own. Their mtimes say nothing about
# whether the user worked on a project — Finder alone will stamp a .DS_Store
# into every folder it displays, which makes dormant projects look active.
JUNK_FILENAMES = {".DS_Store", "Thumbs.db", "desktop.ini", ".localized"}

# A bulk event (restore, migration, mass copy) rewrites mtimes across many
# projects at once. Real work touches a handful of projects on a given day, so
# a date appearing in this share of all projects is treated as machine-made and
# excluded from activity. Detected dates are printed, never silently dropped.
BULK_DATE_PROJECT_SHARE = 0.15
BULK_DATE_MIN_PROJECTS = 8


# ──────────────────────────────────────────────────────────────────────────────
# Heuristics
# ──────────────────────────────────────────────────────────────────────────────

def collect_stats(path: Path) -> tuple[int, int, dict[_dt.date, int], dict[_dt.date, float]]:
    """Walk a project once and return (file_count, total_bytes, files_per_date,
    newest_mtime_per_date).

    One walk instead of three. The per-date breakdown is what lets the caller
    subtract machine-made activity (junk files, bulk restores) afterwards
    without re-reading the tree — which matters when a project holds 10k files.
    """
    total_bytes = 0
    file_count = 0
    per_date: dict[_dt.date, int] = {}
    newest_per_date: dict[_dt.date, float] = {}
    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in SKIP_FOLDERS]
        for f in files:
            if f in JUNK_FILENAMES:
                continue
            try:
                st = (Path(root) / f).stat()
            except OSError:
                continue
            total_bytes += st.st_size
            file_count += 1
            day = _dt.date.fromtimestamp(st.st_mtime)
            per_date[day] = per_date.get(day, 0) + 1
            if st.st_mtime > newest_per_date.get(day, 0):
                newest_per_date[day] = st.st_mtime
    return file_count, total_bytes, per_date, newest_per_date


def detect_bulk_dates(per_project_dates: dict[str, dict[_dt.date, int]]) -> set[_dt.date]:
    """Return dates that look machine-made rather than worked.

    Breadth is the signal, not volume: a restore that stamps one file into
    twenty projects is as bogus as one that stamps a thousand, while a genuinely
    busy day still only spans a few projects.
    """
    if not per_project_dates:
        return set()
    breadth: dict[_dt.date, int] = {}
    for dates in per_project_dates.values():
        for day in dates:
            breadth[day] = breadth.get(day, 0) + 1
    threshold = max(BULK_DATE_MIN_PROJECTS,
                    int(len(per_project_dates) * BULK_DATE_PROJECT_SHARE))
    return {day for day, n in breadth.items() if n >= threshold}


def has_done_marker(path: Path) -> bool:
    return any((path / m).exists() for m in DONE_MARKERS)


def classify(
    days_since_mtime: float,
    file_count: int,
    files_changed_30d: int,
    has_marker: bool,
) -> str:
    if days_since_mtime <= 14 and files_changed_30d > 0:
        return "resume"
    if days_since_mtime <= 30:
        return "pause"
    if has_marker:
        return "done"
    if file_count < 5:
        return "kill"
    return "archive"


def humanize_bytes(n: int) -> str:
    for unit in ("B", "K", "M", "G"):
        if n < 1024 or unit == "G":
            return f"{n:.0f}{unit}" if unit == "B" else f"{n/1024**('BKMG'.index(unit)):.1f}{unit}".replace(".0", "")
        n = n
    return f"{n}B"


def humanize_size_simple(n: int) -> str:
    """Plain size formatting that matches the original dashboard style."""
    if n < 1024:
        return f"{n}B"
    if n < 1024**2:
        return f"{n/1024:.0f}K"
    if n < 1024**3:
        return f"{n/1024**2:.0f}M"
    return f"{n/1024**3:.1f}G"


# ──────────────────────────────────────────────────────────────────────────────
# Scan
# ──────────────────────────────────────────────────────────────────────────────

def scan_projects(root: Path) -> list[dict]:
    now = time.time()

    # Pass 1: read every tree once, keeping the per-date breakdown.
    raw: dict[str, tuple] = {}
    for entry in sorted(root.iterdir()):
        if not entry.is_dir() or entry.name in SKIP_FOLDERS or entry.name.startswith("."):
            continue
        try:
            raw[entry.name] = (entry,) + collect_stats(entry)
        except OSError as e:
            sys.stderr.write(f"[warn] {entry.name}: {e}\n")

    # Pass 2: a bulk date can only be spotted by comparing projects to each
    # other, so it has to wait until every tree has been read.
    bulk = detect_bulk_dates({name: v[3] for name, v in raw.items()})
    if bulk:
        sys.stderr.write(
            "[info] bulk dates excluded from activity: "
            + ", ".join(d.isoformat() for d in sorted(bulk)) + "\n"
        )

    cutoff_day = _dt.date.fromtimestamp(now - 30 * 86400)
    projects = []
    for name, (entry, file_count, total_bytes, per_date, newest_per_date) in raw.items():
        worked_days = [d for d in per_date if d not in bulk]
        if worked_days:
            mtime = newest_per_date[max(worked_days)]
        else:
            # Nothing but machine-made timestamps. Fall back to the raw newest
            # so the project still dates and sorts instead of disappearing.
            mtime = max(newest_per_date.values(), default=entry.stat().st_mtime)
        changed_30d = sum(
            n for d, n in per_date.items() if d not in bulk and d >= cutoff_day
        )
        marker = has_done_marker(entry)
        days_since = (now - mtime) / 86400
        status = classify(days_since, file_count, changed_30d, marker)
        projects.append({
            "name": name,
            "mtime": mtime,
            "mtime_date": _dt.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d"),
            "days_since": days_since,
            "file_count": file_count,
            "size_bytes": total_bytes,
            "size_str": humanize_size_simple(total_bytes),
            "changed_30d": changed_30d,
            "has_done_marker": marker,
            "status": status,
        })
    # Sort by mtime desc — most recent first
    projects.sort(key=lambda p: p["mtime"], reverse=True)
    return projects


def apply_curation(projects: list[dict], curation_path: Path) -> list[dict]:
    if not curation_path.exists():
        return projects
    try:
        curation = json.loads(curation_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        sys.stderr.write(f"[warn] curation file unreadable: {e}\n")
        return projects
    now = _dt.datetime.now()
    for p in projects:
        entry = curation.get(p["name"])
        if not entry:
            continue
        heuristic_status = p["status"]
        if "purpose" in entry:
            p["purpose"] = entry["purpose"]
        if "action" in entry:
            p["action"] = entry["action"]
        if "status_override" in entry:
            p["status"] = entry["status_override"]
            p["status_overridden"] = True
        # Drift detection: curated status disagrees with current heuristic
        if p.get("status_overridden") and entry.get("status_override") != heuristic_status:
            p["heuristic_status"] = heuristic_status
            p["drift"] = True
        # Aging: curation written > 30 days ago
        if "curated_at" in entry:
            try:
                curated_at = _dt.datetime.fromisoformat(entry["curated_at"])
                age_days = (now - curated_at).days
                p["curated_at"] = entry["curated_at"]
                p["curation_age_days"] = age_days
                if age_days > 30:
                    p["curation_stale"] = True
            except ValueError:
                pass
    return projects


def detect_drift(projects: list[dict]) -> list[dict]:
    """Return projects whose curated state needs the user's attention."""
    return [
        p for p in projects
        if p.get("drift") or p.get("curation_stale") or
        # New project never curated — only flag if it's a "resume" (active) one
        (p["status"] == "resume" and "purpose" not in p)
    ]


# ──────────────────────────────────────────────────────────────────────────────
# Render
# ──────────────────────────────────────────────────────────────────────────────

STATUS_ORDER = ["resume", "pause", "done", "archive", "kill"]
STATUS_LABELS = {
    "resume": "Resume — active work",
    "pause": "Pause — needs decision",
    "done": "Done — shipped or reference",
    "archive": "Archive",
    "kill": "Kill — delete candidate",
}

CSS = """
:root {
  --bg: #0f1115;
  --panel: #161922;
  --panel-2: #1c2030;
  --ink: #e6e8ee;
  --ink-mute: #8b91a2;
  --line: #262a37;
  --accent: #6ea8ff;
  --resume: #34d399;
  --pause: #fbbf24;
  --kill: #f87171;
  --done: #a78bfa;
  --archive: #94a3b8;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--ink);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
.wrap { max-width: 1180px; margin: 0 auto; padding: 28px 24px 80px; }
header { display: flex; justify-content: space-between; align-items: baseline;
  border-bottom: 1px solid var(--line); padding-bottom: 14px; margin-bottom: 22px; }
h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; margin: 0; }
.sub { color: var(--ink-mute); font-size: 13px; }
.stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 26px; }
.stat { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; }
.stat .n { font-size: 22px; font-weight: 600; }
.stat .l { font-size: 11px; color: var(--ink-mute); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-mute);
  margin: 30px 0 10px; font-weight: 600; }
table { width: 100%; border-collapse: collapse; background: var(--panel);
  border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
th, td { text-align: left; padding: 10px 12px; font-size: 13px;
  border-bottom: 1px solid var(--line); vertical-align: top; }
th { background: var(--panel-2); color: var(--ink-mute); font-weight: 500;
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
tr:last-child td { border-bottom: none; }
td.name { font-weight: 600; white-space: nowrap; }
td.meta { color: var(--ink-mute); font-size: 12px; white-space: nowrap; }
td.purpose { color: var(--ink); }
td.action { color: var(--ink-mute); font-size: 12px; font-style: italic; }
.pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px;
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-left: 6px; }
.pill.resume  { background: rgba(52,211,153,.15); color: var(--resume); }
.pill.pause   { background: rgba(251,191,36,.15); color: var(--pause); }
.pill.kill    { background: rgba(248,113,113,.15); color: var(--kill); }
.pill.done    { background: rgba(167,139,250,.15); color: var(--done); }
.pill.archive { background: rgba(148,163,184,.15); color: var(--archive); }
.empty { color: var(--ink-mute); font-style: italic; padding: 14px; text-align: center; }
.curated-flag { color: var(--accent); font-size: 10px; margin-left: 6px; }
.drift-flag { color: var(--pause); font-size: 11px; margin-left: 6px; }
.stale-flag { color: var(--ink-mute); font-size: 11px; margin-left: 6px; }
footer { text-align: center; color: var(--ink-mute); font-size: 11px; margin-top: 40px; }
.legend { color: var(--ink-mute); font-size: 12px; margin-top: 4px; line-height: 1.6; }
.legend code { background: var(--panel-2); padding: 1px 5px; border-radius: 3px; font-size: 11px; }
"""


def render_html(projects: list[dict], date_str: str, root: Path) -> str:
    by_status: dict[str, list[dict]] = {s: [] for s in STATUS_ORDER}
    for p in projects:
        by_status[p["status"]].append(p)

    counts = {s: len(v) for s, v in by_status.items()}
    total = len(projects)

    parts = [
        "<!doctype html>",
        '<html lang="en"><head><meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        f"<title>DEV/ Project Triage — {date_str}</title>",
        f"<style>{CSS}</style>",
        "</head><body>",
        '<div class="wrap">',
        '<header><div>',
        '<h1>DEV/ Project Triage</h1>',
        f'<div class="sub">{total} projects in <code>{html.escape(str(root))}</code> — sorted by last modified</div>',
        f'</div><div class="sub">{date_str}</div></header>',
        '<div class="stats">',
        f'<div class="stat"><div class="n">{total}</div><div class="l">total</div></div>',
        f'<div class="stat"><div class="n" style="color:var(--resume)">{counts["resume"]}</div><div class="l">resume</div></div>',
        f'<div class="stat"><div class="n" style="color:var(--pause)">{counts["pause"]}</div><div class="l">pause</div></div>',
        f'<div class="stat"><div class="n" style="color:var(--done)">{counts["done"]}</div><div class="l">done</div></div>',
        f'<div class="stat"><div class="n" style="color:var(--archive)">{counts["archive"] + counts["kill"]}</div><div class="l">archive / kill</div></div>',
        '</div>',
        '<div class="legend">',
        'Heuristics: <code>resume</code> = mtime ≤ 14d &amp; recent activity · ',
        '<code>pause</code> = mtime ≤ 30d, decision needed · ',
        '<code>done</code> = STATUS.md present · ',
        '<code>kill</code> = stale &amp; &lt;5 files · ',
        '<code>archive</code> = stale otherwise.',
        '</div>',
    ]

    for status in STATUS_ORDER:
        items = by_status[status]
        parts.append(f'<h2>{STATUS_LABELS[status]} ({len(items)})</h2>')
        if not items:
            parts.append('<div class="empty">— none —</div>')
            continue
        parts.append('<table><thead><tr><th>Project</th><th>Last mod</th><th>Size / files</th><th>Purpose</th><th>Action</th></tr></thead><tbody>')
        for p in items:
            purpose = html.escape(p.get("purpose", ""))
            action = html.escape(p.get("action", ""))
            curated_flag = ' <span class="curated-flag">curated</span>' if ("purpose" in p or "action" in p) else ""
            override_flag = ' <span class="curated-flag">override</span>' if p.get("status_overridden") else ""
            drift_flag = (
                f' <span class="drift-flag" title="Heuristic now says: {p.get("heuristic_status", "")}">⚠ drift</span>'
                if p.get("drift") else ""
            )
            stale_flag = (
                f' <span class="stale-flag" title="Curated {p.get("curation_age_days", 0)}d ago">⏰ {p.get("curation_age_days", 0)}d</span>'
                if p.get("curation_stale") else ""
            )
            parts.append(
                f'<tr>'
                f'<td class="name">{html.escape(p["name"])} <span class="pill {p["status"]}">{p["status"]}</span>{override_flag}{curated_flag}{drift_flag}{stale_flag}</td>'
                f'<td class="meta">{p["mtime_date"]}<br><span style="font-size:11px">{int(p["days_since"])}d ago</span></td>'
                f'<td class="meta">{p["size_str"]} · {p["file_count"]:,} files<br>{p["changed_30d"]:,} changed (30d)</td>'
                f'<td class="purpose">{purpose or "—"}</td>'
                f'<td class="action">{action or "—"}</td>'
                f'</tr>'
            )
        parts.append('</tbody></table>')

    parts.append(
        f'<footer>Generated {date_str} by <code>project-triage</code> skill · '
        f'curation file: <code>{html.escape(str(Path(OUTPUT_SUBDIR) / CURATION_FILENAME))}</code></footer>'
    )
    parts.append('</div></body></html>')
    return "\n".join(parts)


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="DEV/ project triage report")
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT, help="Root dir to scan")
    parser.add_argument("--date", default=None, help="Date label & filename (YYYY-MM-DD)")
    parser.add_argument("--open", action="store_true", help="Open the report in browser after generation")
    args = parser.parse_args()

    root: Path = args.root.expanduser().resolve()
    if not root.exists():
        sys.stderr.write(f"[error] root does not exist: {root}\n")
        return 2

    date_str = args.date or _dt.date.today().strftime("%Y-%m-%d")
    out_dir = root / OUTPUT_SUBDIR
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{date_str}.html"
    curation_path = out_dir / CURATION_FILENAME

    projects = scan_projects(root)
    projects = apply_curation(projects, curation_path)
    html_doc = render_html(projects, date_str, root)
    out_path.write_text(html_doc, encoding="utf-8")

    drift = detect_drift(projects)
    print(f"wrote {out_path}")
    print(f"projects: {len(projects)} · curation: {'yes' if curation_path.exists() else 'no'}")
    if drift:
        print(f"drift: {len(drift)} project(s) need attention")
        for p in drift:
            reasons = []
            if p.get("drift"):
                reasons.append(f"heuristic now says {p.get('heuristic_status')}")
            if p.get("curation_stale"):
                reasons.append(f"curated {p.get('curation_age_days')}d ago")
            if p["status"] == "resume" and "purpose" not in p:
                reasons.append("active but uncurated")
            print(f"  · {p['name']}: {'; '.join(reasons)}")

    if args.open:
        webbrowser.open(out_path.as_uri())

    return 0


if __name__ == "__main__":
    sys.exit(main())
