---
name: cfb-forecast-capture
description: "CFB Victory Model weekly forecast freeze — ideally Wednesday, Thu/Fri OK until a Big 12 kickoff; cannot be backfilled; how the capture and its reminder work"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5861c174-1bc2-463d-8c6f-6166f7525e73
  modified: 2026-07-27T22:43:14.917Z
---

The CFB Victory Model's pre-game forecasts must be frozen **before kickoff**, once per game
week of the 2026 season: ideally Wednesday, and Thursday or Friday still works while no Big 12
game has kicked off (the `forecast-capture` skill's rule; captures ran Fri 10-23 and Fri 10-30;
corrected 2026-11-02 by the AIOS audit). Fuller, current note: DEV Tier A
`project_cfb-forecast-capture.md`. A missed game week is **permanently lost** — the published Power BI report is
overwritten each week and holds no history, so there is nothing to backfill from.
This is the reason the ritual exists at all.

**Run it with `/forecast-capture`** (skill at `~/.claude/skills/forecast-capture/`).
It takes no arguments — Baylor, 2026, and the output paths are fixed, so a skill that
asked questions would be fifteen identical answers over a season.

Mechanics worth not re-deriving:

- `CFB_Victory_Model/weekly_capture.py` loads the *published* report as a browser,
  sets the slicers, and reads the rendered table. It does not hit a Power BI API —
  an earlier attempt at the `modelsAndExploration` endpoint required spoofing
  `Origin`/`Referer` to look like `app.powerbi.com` and was abandoned as the wrong
  way in. Do not revive that approach.
- Writes a dated snapshot plus an append-only log; `compare_snapshots.py` diffs weeks.
- Verified 12/12 exact against Baylor's real numbers on 2026-07-27.
- The 07:20 morning briefing surfaces a `▸ REMINDERS` block **above** the on-ramp:
  silent Mon/Tue, prompts Wed, escalates to `⚠ OVERDUE` Thu/Fri, confirms once the
  week's snapshot exists. Season window lives in `morning-briefing/config.toml`.

**Versioned since 2026-07-27** at `github.com/erash11/CFB_Victory_Model` (private).
`data/weekly_snapshots/` and `data/weekly_forecast_log.csv` are committed **on
purpose** — they are the non-backfillable part. `data/cfbd/` (101 CSVs, ~57 MB) is
gitignored as regenerable.

Backup consequence worth knowing: `daily-backup.ps1` §2b mirrors only DEV folders
*without* a `.git`, so this directory dropped out of the OneDrive non-repo mirror the
moment it became a repo. `Sync-Repo` covers just four memory repos, not this one.
Protection for everything tracked is now the GitHub remote — **so it is only as safe
as the last push**. The one thing covered by neither is `data/cfbd/`, which is fine:
`python cfbd_pull.py` rebuilds it (needs `CFBD_API_KEY`; every endpoint 401s without).

Related: [[morning-briefing-pipeline]], [[backup-coverage]].
