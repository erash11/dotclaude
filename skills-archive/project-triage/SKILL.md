---
name: project-triage
description: >-
  Generate the DEV/ project triage HTML dashboard for today or a backfill date,
  surfacing drift between curated and current state. Use when the user says "project
  triage", "/project-triage", "run my project review", "dev dashboard", "what's open in
  DEV", "morning review", or asks to see the open-projects HTML. Do not use to log ideas
  or progress in the portfolio registry (use project) or for one project's meeting brief
  (use meeting-prep).
argument-hint: "[YYYY-MM-DD]"
---

# Project Triage

The user's daily project-portfolio dashboard. Renders an HTML view of every top-level folder in `~/DEV/` with status pills (resume / pause / done / kill / archive), heuristic activity metrics, and curated purpose/action prose.

## Vault & files

- **Skill dir:** `~/.claude/skills/project-triage/`
- **Script:** `triage.py` (Python 3.11+, no deps beyond stdlib)
- **Scan root:** `~/Desktop/DEV/` on Windows; `~/DEV/` on macOS
- **Output dir:** `<scan-root>/project-triage/`
- **Output file:** `YYYY-MM-DD.html` (one per day)
- **Curation file:** `<scan-root>/project-triage/.curation.json`
- **Python:** `python` on Windows; `python3` on macOS

## Flow

### 1. Check whether today's already been generated

Glob `DEV/project-triage/*.html`. If today's date file exists, ask:
> Today's triage already exists. Regenerate, or open the existing file?

If "open existing," just `start` it in the browser and exit.

### 2. Check for a missed yesterday

If today's file doesn't exist *and* yesterday's also doesn't exist, this is the morning-after case. Offer:
> Yesterday's triage was never generated. Want me to backfill it first, then run today's? (recommended)

If yes, run with `--date <yesterday>` first, then today's.

### 3. Generate the report

```bash
python "$HOME/.claude/skills/project-triage/triage.py" --open
```

Pass `--date YYYY-MM-DD` for a backfill. The `--open` flag launches the default browser when generation succeeds.

### 4. Read the drift output

The script prints a `drift:` line listing projects whose curated state needs attention. Three drift signals:
- **Heuristic mismatch:** curated status disagrees with what the activity heuristics now say (e.g., curated "resume" but no files touched in 45d)
- **Stale curation:** the `curated_at` timestamp on the entry is > 30 days old
- **Active-but-uncurated:** a `resume`-classified project has no curated `purpose` (you haven't told the user what it does yet)

If `drift: 0`, the report stands on its own. Report:
> Today's triage at `DEV/project-triage/<date>.html` · N projects · no drift.

If drift > 0, ALWAYS offer the curation pass — never silently update entries:
> N projects show drift. Want to walk through them now, or revisit later? (the ⚠ flags will stay in the dashboard until you do)

### 5. Curation pass (only if user opted in)

For each drifting project, use `AskUserQuestion` to surface ONE focused decision per project. Possible question shapes by drift type:

**Heuristic mismatch** (curated says X, heuristic says Y):
> `<project>` is curated as `<curated>` but heuristics now classify it as `<heuristic>`. What's the right call?
> - Keep curated status (override stays)
> - Adopt new heuristic status
> - New status: [other option]

**Stale curation** (>30d old, no heuristic disagreement):
> `<project>` was last curated `N` days ago. Quick re-confirmation:
> - Still accurate, refresh timestamp
> - Update purpose/action
> - Remove curation (let heuristics drive)

**Active-but-uncurated** (resume, no purpose):
> `<project>` is active but has no curated purpose. Want to add one?
> - Yes, I'll dictate purpose + action
> - Skip — leave heuristic-only
> - Mark for later (do nothing this run)

If the user wants to dictate prose, take their reply verbatim, update `.curation.json`, and stamp `curated_at` to now.

**Curation file schema:**
```json
{
  "<project-folder-name>": {
    "purpose": "string — what this project is and what it's for",
    "action": "string — next step or context for whether to touch it",
    "status_override": "resume|pause|done|kill|archive",
    "curated_at": "ISO-8601 datetime"
  }
}
```

Only the fields you're setting need to be present per entry. `status_override` is optional — when absent, heuristics drive the status.

After updates, re-run the script (without `--open`) so the saved HTML reflects the new curation:
```bash
python "$HOME/.claude/skills/project-triage/triage.py"
```

### 6. Sign off

Three lines max:
- File: `DEV/project-triage/<date>.html`
- Status counts: N resume, N pause, N done, N archive/kill
- Drift handled: N updated, N deferred (with the project names)

## What NOT to do

- **Don't auto-update `.curation.json` without explicit user approval per entry.** This file is sacred — it's the user's working judgment about their own work.
- **Don't run the script on directories outside `~/DEV/`.** The whole point is that it's the DEV portfolio surface.
- **Don't generate prose for the user.** The user said heuristics-only + later evolves toward curation. When they're ready to add purpose/action, they tell you what to write. You don't infer it.
- **Don't reclassify a project as "kill" or "archive" without confirming.** Heuristic kill/archive in the dashboard is fine (it's just a recommendation), but if you're updating the curation file to override status, ask first.
- **Don't run more than once per day** unless the user explicitly asks to regenerate (e.g., after a curation pass, which is intentional).

## Edge cases

- **Backfill request for a date older than yesterday:** allow it (`--date YYYY-MM-DD`), but flag: *"Note: the script reads current file mtimes, not historical state. A backfill labels the report with that date but the metrics are from right now."*
- **Empty `DEV/`:** rare, but the script handles it cleanly (renders an empty dashboard). Tell the user there's nothing to triage.
- **Python missing or path differs:** fall back to `python3` then `python`. If all fail, surface the error verbatim and stop.
- **A project whose every file sits on a bulk date:** the script falls back to the raw newest mtime so it still dates and sorts, rather than dropping out of the report. Its date will read as the bulk date — treat that as "unknown", not as work.

## Gotchas

- **`.DS_Store` files silently fake activity.** Finder stamps one into every folder it displays, so merely browsing `~/DEV` in a window makes dormant projects look touched today. The script skips `JUNK_FILENAMES` (`.DS_Store`, `Thumbs.db`, `desktop.ini`, `.localized`) everywhere it reads mtimes. On 2026-08-09 this alone made 19 projects read as active off 21 files.
- **A restore or migration resets mtimes across the whole portfolio.** `detect_bulk_dates` treats any date appearing in ≥15% of projects (floor of 8) as machine-made and excludes it from activity. Breadth is the signal, not volume — real work spans a few projects a day, a restore spans twenty. Excluded dates are printed as `[info] bulk dates excluded`; if that line names a date you actually worked, raise the threshold rather than deleting the check.
- **Heuristics measure recency; curation measures intent.** A project you consider active but haven't opened in a month will always show as a mismatch. That flag is information, not an error — do not "resolve" it by overwriting the user's judgment.
- **`~/DEV/project-triage/` is a separate repo** that carries its own similarly-named scripts and a scheduled `dashboard.html`. Changes to this skill do not touch it.
