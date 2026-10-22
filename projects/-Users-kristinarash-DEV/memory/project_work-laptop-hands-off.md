---
name: work-laptop-hands-off
description: Baylor Windows work laptop retired 2026-10-14 (hands-off since 10-08, Docker removed); the Mac plus Google Drive is the only machine
metadata:
  node_type: memory
  type: project
  originSessionId: 788f361d-8aa2-49b2-ba0b-3402ca8b2f41
  modified: 2026-10-22T11:07:57.119Z
---

Since **2026-10-08** the Baylor Windows work laptop (BU-1979FJ4, "My Laptop (2)" in Google Drive) is hands-off. Eric does not want any automation running on it. All 17 of its scheduled tasks (the Eric folder plus the root-library KeystoneOS, MorningBriefing, DailyGmailDigest and Refresh_All_Data tasks) are **disabled**. Their XML exports are in `My Drive/_FROM_WORK_LAPTOP/scheduled-tasks`.

Everything that lived only on the laptop was copied to `My Drive/_FROM_WORK_LAPTOP` (11 zips, `pff-data`, `_tools`) and to the CRASHBOX drive. Handoff doc with the Mac to-do list: `My Drive/_FROM_WORK_LAPTOP/HANDOFF.md`. Vault note: `~/SecondBrain/Projects/work-laptop-handoff-2026-10-08.md`.

**Update 2026-10-14 (Eric):** the Windows laptop is **retired**, not just hands-off. Docker was removed from it. Everything was ported to the Mac and Google Drive. There is no Milvus standalone, no Windows scheduled task, and no Windows-slug memory being written any more. The `C--Users-eric-rash-*` memory folders and the Windows entries in `memory-index-paths.json` are historical; memsearch skips them as "not on this machine".

**Why:** Eric chose to stop running jobs on the Baylor machine.

**How to apply:** Do not re-enable, create, or fix scheduled tasks or hooks on the Windows laptop. Port a needed job to the Mac, a VPS, or a Cloudroom automation instead (cloud servers and schedulers approved 2026-10-14, see [[cloud-copy-approval]]). Treat Windows-side entries in [[automation-cadence]] as historical. The Mac is now the only machine, full stop. Do not plan two-machine sync, Windows ports, or Docker fixes.

Historical Windows trap notes (dropped from the index 2026-10-22, files kept): [[git-bash-msys-ad-stall]], [[backup-task-sleepkill-signature]], [[settings-json-bom-trap]]. Open the BOM one if a config file ever arrives from a Windows editor.
