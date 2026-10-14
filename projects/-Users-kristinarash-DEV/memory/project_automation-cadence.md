---
name: automation-cadence
description: "Standing automation schedule (Mac only since 2026-10-08) — digests, ritual nudges, memsearch reindex + recall eval timing, OS audit cadence, gws/Gmail capability limits, reMarkable OCR entry point"
metadata: 
  node_type: memory
  type: project
  originSessionId: 330c1f71-242a-47c7-ac7b-129bd6f5dd3c
  modified: 2026-10-08T23:02:03.657Z
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
(00:30 → 09:00 on 2026-08-29 → **21:00 since 2026-09-24**, per claude-stack-doctor). The
backup's uncapped full reindex absorbs backlogs the short SessionEnd hook can't finish.
See [[backup-sync-system]].

**Windows:** no nightly reindex — the `KeystoneOS-DailyBackup` task is disabled (since
2026-08-13). Task Scheduler `\Eric\memsearch-drain-weekly` (**Sundays 02:00**) has ONE
action since 2026-10-04: `audits/recall-eval/weekly-chain.ps1`, which runs
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
- **Nightly digest** — plist `com.keystone.nightlydigest` (21:00) is built but **not installed**:
  it waits in `~/handoff-staging/launchd/` until a `--dry-run` passes (its Drive-tree walk ran
  >25 min on 10-08 while other Drive jobs were running).
- **Run nowhere now:** memsearch-drain-weekly (the recall eval), DailyGmailDigest
  (`DEV/agy/daily_digest.py`), Backup AI Sessions (`backup-ai-sessions.ps1`; the Mac daily backup
  already snapshots `.codex/sessions`), CFB-ForecastCaptureReminder.
- Agents cannot write `~/Library/LaunchAgents` (auto-mode blocks it as persistence): stage the
  plist and Eric installs with `cp … && launchctl bootstrap gui/$(id -u) <plist>`.

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
- **MCP Gmail sends to Eric himself are approved** (2026-10-04): `send_message`/`forward` work.
  Eric OK'd sending to eric.rash11@gmail.com and his Outlook, Eric_Rash@Baylor.edu. Anyone
  else still gets a draft, not a send.

## reMarkable OCR

`remarkable_extract.py` — USB-first with a `--cloud` fallback; Vision API key lives in
`.env`.

## Cloudroom cloud automations (since 2026-10-14)

- **skills-health-check** — Cloudroom cloud automation `6d0487ca-3523-4aae-a5cb-84503972fcdb`, daily 07:00 America/Chicago, runs with the Mac off. Re-prompts cloud thread `thr_xq2fh4m8p3` (project skills, Opus 5.5 medium). Read-only: pulls main, checks SKILL.md frontmatter and dead paths, replies "OK <date> - no issues" or 3 sentences. Pause: `room-cli automation pause 6d0487ca-3523-4aae-a5cb-84503972fcdb`. Runs: `room-cli automation runs 6d0487ca-3523-4aae-a5cb-84503972fcdb`.
- **drive-cloud-copy** — Cloudroom LOCAL script automation `auto_xeoiqyfly1q` (project DEV `proj_494djs26ru`), 18:00 and 21:00 America/Chicago, no model. Runs `~/.claude/scripts/cloud-push.py`; replaces the failing launchd `com.keystone.clouddrivepush`. Needs the Cloudroom app open; max script timeout is 15 min.
