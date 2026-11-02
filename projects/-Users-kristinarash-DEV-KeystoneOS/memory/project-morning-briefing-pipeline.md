---
name: morning-briefing-pipeline
description: "morning-briefing pipeline architecture, on-ramp integration, and the 6-day silent-outage incident (2026-06-17)"
metadata: 
  node_type: memory
  type: project
  originSessionId: edb9fb24-d71a-4337-9d52-a2f61c01fbc3
---

> **History.** The morning briefing is retired and archived (DEV Tier A `morning-briefing-retired`). The venv lesson below still holds.

`C:\Users\eric_rash\Desktop\DEV\morning-briefing`: `run.py` orchestrator → `morning_briefing/` package (config.py, deliver.py, sources/, carryover.py, synthesize.py) → Windows Task Scheduler at 07:20 weekdays via `scripts/run_with_logging.cmd`.

**Incident (2026-06-17):** the briefing's `.venv` pointed at a Python install deleted by a Python Install Manager migration (old path `C:\Python314`). The scheduled task failed *silently* every weekday from 6/12–6/17 (last successful send 6/11 09:00:34) — no error surfaced to Eric because the failure email path itself depends on the broken venv. Fixed by rebuilding `.venv` against the current interpreter `C:\Users\eric_rash\AppData\Local\Python\pythoncore-3.14-64\python.exe` and reinstalling deps from `pyproject.toml` directly (NOT `pip install -e .` — that fails with a flat-layout multi-package discovery error because `logs/`, `secrets/`, `morning_briefing/` all get discovered as top-level packages; worked around, not fixed, since the package doesn't need installing — script dir is on `sys.path`). Verified via `--dry-run --force`.

**Lesson:** after any Python Install Manager migration, check venvs built against the old interpreter path across *all* projects, not just the one being actively worked — this one broke and stayed broken for 6 days with zero visible signal. General pattern, not morning-briefing-specific.

**On-ramp integration (2026-06-17, commit `edc06e4`):** folded the old standalone `onramp.sh` (manual run, never wired to email) into `run.py` — new module `morning_briefing/onramp.py` renders a "▸ ON-RAMP" section (today's calendar + OKR big rocks parsed from `SCOREBOARD.md`) prepended via `config.toml`'s `[onramp]` block. Calendar fetch uses the `gws` CLI. The calendar scope gap (was 403 `insufficientPermissions`) was **resolved 2026-06-22**: re-authed via `gws auth login --scopes https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/cloud-platform` (union form — preserves the existing `cloud-platform` scope; a bare `--services calendar` would have narrowed and dropped it). gws now has 7 scopes incl. `calendar.readonly`; live `gws calendar events list` on `primary` returns 200/owner. Note: `gws auth login` must run in a real interactive terminal — the Claude `!` in-session shell is non-interactive and can't launch the browser or hold the loopback redirect.

Related: [[auto-commit-push]] (this repo has no `origin` remote configured, so push isn't applicable here — commit only).
