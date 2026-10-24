---
name: cloud-copy-approval
description: Approved scope of the daily cloud copy of all ~/DEV files (including athlete data) to personal Google Drive; what stays local
metadata:
  node_type: memory
  type: project
  originSessionId: c9825473-6f03-41cb-a8cb-fe6eb00fded2
  modified: 2026-10-24T14:50:38.656Z
---

On 2026-10-12 Eric stated that Baylor data governance approved copying ALL of `~/DEV`, including athlete data, to his personal Google Drive (eric.rash11@gmail.com). The copy goes to `_MACHINE/Cloud_Copy/DEV/` (moved out of Primary 2026-10-14), one-way, never deletes. It runs daily at 07:00 and 17:30 through `~/.claude/scripts/cloud-push.py` (launchd `com.keystone.clouddrivepush`). It is the first step toward a VPS migration.

**Updated 2026-10-24:** under launchd the copy failed from 2026-10-12 to 10-23 (macOS blocks launchd from Terminal-made Drive files). Since 2026-10-23 the plist runs `cloud-push-launch.sh`, which opens `cloud-push.py` in Terminal. See [[cloud-push-launchd-blocked]].

**Kept off the mirror on purpose:** database files (DuckDB/SQLite, because sync can lock or corrupt them; since 2026-10-20 the live DBs go to Drive as `dev-databases.tgz` via `gws` from `daily-backup.ps1`), password and key files (`.env`, `*.pem`, `*.key`, `id_rsa`, `credentials*`, `secrets*`), regenerable folders (`node_modules`, `.venv`, `venv`, `__pycache__`, `.next`), any folder whose `CLAUDE.md` says "local only" (e.g. `SpecialRequests/TOS_ES`), and browser profiles. The script header in `cloud-push.py` is the live list.

**Why:** Eric is migrating to a VPS and wants everything in the cloud where possible. He wants a copy in the cloud now.

**How to apply:** Under this approval, do not block athlete data from the personal-Drive copy. Keep databases and secrets excluded. Never send anything to Baylor OneDrive; that rule still holds (see [[no-baylor-onedrive]]). The governance approval document itself was not seen. Only Eric's statement is on record.

**Widened 2026-10-14.** Eric stated cloud servers and schedulers are now approved too (VPS, Cloudroom cloud threads and cloud automations). The old "no cloud servers or schedulers without IT approval" rule is retired. Still kept off cloud: DexaProject (per ~/DEV/CLAUDE.md), database files, and secrets. Never Baylor OneDrive.

**Superseded 2026-10-24:** Cloudroom is gone (cloud automations deleted 2026-10-14; Cloudroom Local removed 2026-10-24). The approval for cloud servers and schedulers stands; the live cloud job is a Claude Code routine (see [[automation-cadence]]). "Kept off cloud" for DexaProject means off the mirror, cloud servers, cloud sessions and GitHub. It is not under `~/DEV`; its one home is its own personal-Drive folder, `My Drive/00_Primary_Storage_Drive/DexaProject` (see [[github-consolidation]]). It never leaves the Mac or that folder.
