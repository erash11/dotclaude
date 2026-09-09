---
name: automation-cadence
description: "Standing automation schedule on the Mac — ritual nudges, memsearch reindex timing, OS audit cadence, gws/Gmail capability limits, reMarkable OCR entry point"
metadata: 
  node_type: memory
  type: project
  originSessionId: 330c1f71-242a-47c7-ac7b-129bd6f5dd3c
  modified: 2026-08-14T20:15:14.244Z
---

Durable schedule and capability facts for the Mac automation stack. These are stable
settings, not active threads — health-check them with `/claude-stack-doctor`.

## Ritual nudges (launchd `com.keystone.rituals`)

- **Weekdays 17:00** → `/interview-me`
- **Fridays 15:30** → `/weekly-review`
- `harvest` and `forecast-capture` also run through `ritual-check.ps1`; their
  due/overdue state is computed from their own output, not from a fixed clock
  (forecast-capture is Monday-anchored and season-bounded — see
  [[cfb-forecast-capture]]). Four rituals total; `Name    = ` in
  `KeystoneOS/scripts/ritual-check.ps1` is the authoritative list.

The nudge is only a prompt; **the output artifact is the record**, not the reminder firing.

## memsearch reindex

Reindex **rides the daily backup task** rather than running on its own timer. The
nightly moved 00:30 → **09:00 on 2026-08-29** (CRASHBOX was unplugged at 00:30), so
any reasoning that assumes an overnight reindex is wrong — the backup's uncapped full reindex absorbs backlogs the
short SessionEnd hook can't finish. See [[backup-sync-system]].

## OS audits

Full OS audit last run **2026-07-24** (reports under `audits/`, guards auto-run);
**next due 2026-10-24**.

## Capability limits worth remembering

- **gws** is authenticated. Re-auth requires explicit full scope URLs — the `-s drive`
  shorthand silently grants no scopes (v0.22.5 bug), and `~/.config/gws/token_cache.json`
  must be deleted after re-auth or the stale token is served. See [[gws-forms-api]].
- **MCP Gmail is draft-only** — it can compose drafts but must not be treated as a send path.

## reMarkable OCR

`remarkable_extract.py` — USB-first with a `--cloud` fallback; Vision API key lives in
`.env`.
