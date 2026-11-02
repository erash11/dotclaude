---
name: automation-cadence
description: "Standing automation schedule (Mac only since 2026-10-08) — digests, ritual nudges, memsearch reindex + recall eval timing, OS audit cadence, gws/Gmail capability limits, reMarkable OCR entry point"
metadata: 
  node_type: memory
  type: project
  originSessionId: 330c1f71-242a-47c7-ac7b-129bd6f5dd3c
  modified: 2026-10-24T14:51:51.848Z
---

Durable schedule and capability facts for the Mac automation stack. These are stable
settings, not active threads — health-check them with `/claude-stack-doctor`.

## Ritual nudges — OFF on both machines (updated 2026-10-03)

- Mac `com.keystone.rituals` was booted out and disabled **2026-09-24**; Windows
  `KeystoneOS-Rituals` (weekdays 17:00, Fri 15:30) is disabled and Eric chose to **keep it
  off** on 2026-10-03. Nothing nudges `/interview-me` or `/weekly-review` any more.
- The reminder now is `~/DEV/WORKFLOW.md` (the ideal day/week) plus the status lines.
  `ritual-check.ps1` still works by hand. It has **five** rituals (interview-me,
  weekly-review, harvest, forecast-capture, `slate` added 09-14); `Name    = ` in
  `KeystoneOS/scripts/ritual-check.ps1` is the authoritative list. Due/overdue is computed
  from each ritual's own output (forecast-capture is Monday-anchored and season-bounded —
  see [[cfb-forecast-capture]]).

**The output artifact is the record**, not a reminder firing.

## memsearch reindex

**Mac:** reindex **rides the daily backup task** rather than running on its own timer
(00:30 → 09:00 on 2026-08-29 → 21:00 on 2026-09-24 → **hourly 12:00-17:00 since 2026-10-22**,
gated by `daily-backup-login.sh`: AC power only, max 2 tries/day, stops after an OK run). The
backup's uncapped full reindex absorbs backlogs the short SessionEnd hook can't finish.
See [[backup-sync-system]].

**Windows (historical — superseded 2026-10-23: this chain was retired and its scripts
deleted; see "Windows tasks, final state" below):** no nightly reindex — the
`KeystoneOS-DailyBackup` task is disabled (since 2026-08-13). Task Scheduler
`\Eric\memsearch-drain-weekly` (**Sundays 02:00**) had ONE action from 2026-10-04: `audits/recall-eval/weekly-chain.ps1`, which runs
`memsearch-drain.ps1` → `run-eval.ps1` (memsearch, fts5, rg, jev; label `weekly`) →
`after-run.ps1` (commits+pushes results, writes `LATEST.md`, appends to `.errors.log` only on
a problem), retrying a step that exits 0xC0000142. Log: `audits/recall-eval/logs/weekly-chain.log`.
Why: as three separate actions, action 2 died at 02:10 with 0xC0000142 (DLL init failed, never
ran a line) on 10-01 and 10-04; it runs fine by hand. `\Eric\memsearch-drain-once` no longer exists.

## Mac is the only scheduler (since 2026-10-08)

The Windows laptop is hands-off ([[work-laptop-hands-off]]); every Windows entry in this file
is historical. Ported to the Mac on 2026-10-08 (scripts made OS-aware, `~/.claude` commit `08d3113`):

- **Claude files digest** — launchd `com.keystone.filesdigest`, daily **06:30** (runs on wake if
  missed). Emails Eric_Rash@baylor.edu the files added the PREVIOUS day in Claude co-authored
  commits, by repo, via `gws`. `~/.claude/scripts/claude-files-digest.py` (`--date`, `--dry-run`).
- **Nightly digest** — launchd `com.keystone.nightlydigest`, daily **21:00**, installed 2026-10-23
  (tracked plist `~/.claude/scripts/com.keystone.nightlydigest.plist`; first launchd send OK 23:29).
  `nightly-digest.py` emails Eric_Rash@baylor.edu via `gws`. The Mac version skips the Drive section
  (launchd cannot list Drive; mount walks hang); a crash or failed send goes to `.errors.log`.
- **Windows tasks, final state (audit 2026-10-23,** `~/.claude/audits/2026-10-23-windows-holdover-audit.md`**):**
  memsearch-drain-weekly recall-eval chain retired (`recall-bench/check.py` in the daily backup replaces
  it; the .ps1 chain and `LATEST.md` deleted). Backup AI Sessions retired (daily backup Snapshot-Gws
  covers it; script deleted). CFB-ForecastCaptureReminder is dead code (it calls the archived
  morning-briefing package); nothing nudged the in-season CFB forecast capture until 2026-11-02 (now the `forecastcapture` job runs it). DailyGmailDigest
  (`DEV/agy/daily_digest.py`) is dormant, not retired; porting is minutes (gws path + a plist).
- **A launchd install by an agent worked 2026-10-23, with Eric's chat approval for that work.** An agent copied a plist into
  `~/Library/LaunchAgents` and ran `launchctl bootstrap` without a block, after Eric said in chat
  "I approve you to schedule jobs on your own". Keep a tracked copy of every plist (KeystoneOS jobs:
  `~/DEV/KeystoneOS/ops/`; ~/.claude jobs: `~/.claude/scripts/`). The daily backup runs
  `harvest-dev-docs.sh` (step 2b-harvest) since the same day.

## Mac launchd agents (from the plists, 2026-10-23)

Times are each plist's `StartCalendarInterval`. Re-read the plist before quoting one.

| Agent (`com.keystone.*`) | When |
|---|---|
| morning | daily 06:00 |
| filesdigest | daily 06:30 |
| nightlydigest | daily 21:00 (installed 2026-10-23) |
| reconcile | daily 07:00 + RunAtLoad |
| clouddrivepush | daily 07:00 and 17:30 (via Terminal, see [[cloud-push-launchd-blocked]]) |
| graphextract | daily 09:30 |
| gpspull | daily 10:00 and 16:30 |
| perchpull | daily 10:05 and 16:35 |
| valdpull | daily 10:10 and 16:40 |
| pffpull | Wed 10:20 (installed 2026-10-31 with Eric's chat approval, "Go A"). Tracked plist `~/DEV/Football/PFF_Data_Project/ops/com.keystone.pffpull.plist`; runs `scripts/weekly_pull.sh` (rolling backup, `run_pipeline.py --catch-up`). Failures and `config/checkpoints.txt` DUE notices go to `.errors.log` |
| dailybackup | hourly 12:00-17:00 (gate: `daily-backup-login.sh`) |
| dailybackup-login | RunAtLoad (same gate) |
| stackdoctor | Mon 10:30 |
| forecastcapture | Wed 10:40 + Thu 10:40 backup (installed 2026-11-02 by Eric; headless, commits + pushes the capture data with Eric's approval). Tracked plist `~/DEV/CFB_Victory_Model/ops/com.keystone.forecastcapture.plist`; runs `scripts/scheduled_capture.sh`, texts Eric, failures to `.errors.log`. See [[cfb-forecast-capture]] |
| adjudicate | Sun 02:30 |
| aiosaudit | monthly, day 1, 14:00 |
| agysync | every 6 h (StartInterval 21600) |
| rituals, commandcentre | disabled |

## OS audits

Full OS audit last run **2026-07-24** (reports under `audits/`, guards auto-run);
**next due 2026-10-24**.

## Capability limits worth remembering

- **gws `invalid_client: The provided client secret is invalid` = stale client SECRET, not
  token rot** — re-auth alone never fixes it. The secret for client `208643585660-3ogm…`
  (project `baylor-gws`) was rotated 2026-09-17 to one ending `Xyjf`; the Mac kept the
  June one until 2026-09-30, when the Windows copy was carried over via Drive. Console no
  longer shows or downloads a secret: copy the other machine's `client_secret.json`, or
  Add secret (shown once). Then login, then delete `token_cache.json`.
- **gws** re-auth requires explicit full scope URLs — the `-s drive`
  shorthand silently grants no scopes (v0.22.5 bug), and `~/.config/gws/token_cache.json`
  must be deleted after re-auth or the stale token is served. See [[gws-forms-api]].
- **MCP Gmail sends to Eric himself are approved** (2026-10-04): `send_message`/`forward` work. Since 2026-10-22 the default for Google APIs is `gws` ([[gws-cli-default]]); use MCP Gmail only where gws cannot do the job.
  Eric OK'd sending to eric.rash11@gmail.com and his Outlook, Eric_Rash@Baylor.edu. Anyone
  else still gets a draft, not a send.

## reMarkable OCR

`remarkable_extract.py` — USB-first with a `--cloud` fallback; Vision API key lives in
`.env`.

## Claude Code routines (cloud, since 2026-10-14)

- **skills-health-check** — Claude Code routine `trig_01Te3Xg9bkFKLDypiFnssC6J`, cron `0 12 * * *` UTC (07:00 CDT; 06:00 after DST ends 11-01). Opus 5.5, repo erash11/claude-skills, tools Bash/Read/Glob/Grep, no connectors. Read-only; replies "OK <date> - no issues" or 3 sentences per problem. Runs with the Mac off. Manage: https://claude.ai/code/routines/trig_01Te3Xg9bkFKLDypiFnssC6J
- **Cloudroom dropped.** 2026-10-14: Cloudroom automations and the drive-cloud-copy script automation were deleted (Eric stayed with Claude Code). 2026-10-24: Eric dropped Cloudroom Local too; app, `dev.cloudroom.preview.*` LaunchAgent and `room-cli` skill removed (Trash and `skills-archive/2026-10-24/`). The Drive copy ran by hand until 2026-10-23; since then launchd runs it at 07:00 and 17:30 through Terminal (see [[cloud-push-launchd-blocked]]).
