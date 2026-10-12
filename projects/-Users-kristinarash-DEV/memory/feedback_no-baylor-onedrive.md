---
name: no-baylor-onedrive
description: "Eric's rule (2026-10-12): never send any project output, data or document to Baylor OneDrive; check this before choosing any output or backup destination"
metadata:
  node_type: memory
  type: feedback
  originSessionId: c9825473-6f03-41cb-a8cb-fe6eb00fded2
  modified: 2026-10-12T22:48:49.188Z
---

Never send anything to Baylor OneDrive. That covers project outputs, data and documents, as well as backups.

**Why:** On 2026-10-12 Eric chose Option A: outputs go to his personal Google Drive, or stay local for data. The backup manifest already marks the `baylor` target deprecated and skips it, so nothing goes there today. Athlete-identifiable data must not go to personal Drive either, so athlete outputs stay local unless Eric names another place.

**How to apply:** When picking an output folder, a sync target or a backup destination, never choose Baylor OneDrive. If a task seems to need it, ask Eric first. Do not add or re-enable a `baylor` destination in `backup-manifest.json`.

Related: [[backup-sync-system]].
