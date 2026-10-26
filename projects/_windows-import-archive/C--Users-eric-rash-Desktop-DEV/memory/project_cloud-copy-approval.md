---
name: cloud-copy-approval
description: Approved scope of the daily cloud copy of all ~/DEV files (including athlete data) to personal Google Drive; what stays local
metadata:
  node_type: memory
  type: project
  originSessionId: c9825473-6f03-41cb-a8cb-fe6eb00fded2
  modified: 2026-10-12T23:16:29.623Z
---

On 2026-10-12 Eric stated that Baylor data governance approved copying ALL of `~/DEV`, including athlete data, to his personal Google Drive (eric.rash11@gmail.com). The copy goes to `_MACHINE/Cloud_Copy/DEV/ (moved out of Primary 2026-10-14)`, one-way, never deletes. It runs daily at 07:00 and 17:30 through `~/.claude/scripts/cloud-push.py` (launchd `com.keystone.clouddrivepush`). It is the first step toward a VPS migration.

**Kept local on purpose:** database files (DuckDB/SQLite, because sync can lock or corrupt them), password and key files (`.env`, `*.pem`, `*.key`, `id_rsa`, `credentials*`, `secrets*`), and regenerable folders (`node_modules`, `.venv`, `venv`, `__pycache__`, `.next`).

**Why:** Eric is migrating to a VPS and wants everything in the cloud where possible. He wants a copy in the cloud now.

**How to apply:** Under this approval, do not block athlete data from the personal-Drive copy. Keep databases and secrets excluded. Never send anything to Baylor OneDrive; that rule still holds (see [[no-baylor-onedrive]]). The governance approval document itself was not seen. Only Eric's statement is on record.

**Widened 2026-10-14.** Eric stated cloud servers and schedulers are now approved too (VPS, Cloudroom cloud threads and cloud automations). The old "no cloud servers or schedulers without IT approval" rule is retired. Still kept off cloud: DexaProject (per ~/DEV/CLAUDE.md), database files, and secrets. Never Baylor OneDrive.
