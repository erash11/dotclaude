---
name: work-laptop-hands-off
description: "Baylor Windows laptop: no automation or terminal work since 2026-10-14; desktop-app sessions only since 2026-10-21 (session-end auto-push)"
metadata:
  node_type: memory
  type: project
  originSessionId: 788f361d-8aa2-49b2-ba0b-3402ca8b2f41
  modified: 2026-10-24T14:51:56.005Z
---

Since **2026-10-08** the Baylor Windows work laptop (BU-1979FJ4, "My Laptop (2)" in Google Drive) is hands-off. Eric does not want any automation running on it. All 17 of its scheduled tasks (the Eric folder plus the root-library KeystoneOS, MorningBriefing, DailyGmailDigest and Refresh_All_Data tasks) are **disabled**. Their XML exports are in `My Drive/_FROM_WORK_LAPTOP/scheduled-tasks`.

Everything that lived only on the laptop was copied to `My Drive/_FROM_WORK_LAPTOP` (11 zips, `pff-data`, `_tools`) and to the CRASHBOX drive. Handoff doc with the Mac to-do list: `My Drive/_FROM_WORK_LAPTOP/HANDOFF.md`. Vault note: `~/SecondBrain/Projects/work-laptop-handoff-2026-10-08.md`.

**Update 2026-10-14 (Eric):** the Windows laptop is **retired**, not just hands-off. Docker was removed from it. Everything was ported to the Mac and Google Drive. There is no Milvus standalone, no Windows scheduled task, and no Windows-slug memory being written any more. The `C--Users-eric-rash-*` memory folders are historical; they are still on disk and removing them is Eric's call. Since 2026-10-24 `memory-index-paths.json` has no C--Users paths (swapped for their Mac twins), so memsearch no longer indexes them; recall.py still reads every `projects/*/memory` folder.

**Timeline:** 2026-08-14 ended Windows as primary; 2026-09-10 active again (both machines); 2026-10-14 retired as a work box; 2026-10-21 back for desktop-app sessions only.

**Why:** Eric chose to stop running jobs on the Baylor machine.

**How to apply:** Do not re-enable, create, or fix scheduled tasks or hooks on the Windows laptop. Port a needed job to the Mac, a VPS, or a Claude Code cloud routine instead (cloud servers and schedulers approved 2026-10-14, see [[cloud-copy-approval]]; routines are listed in [[automation-cadence]]). Cloudroom was dropped entirely on 2026-10-24, so it is not an option. Treat Windows-side entries in [[automation-cadence]] as historical. The Mac is the only machine that runs automation or terminal Claude Code. Windows runs desktop-app sessions only and pushes to GitHub at session end; do not add jobs, hooks or Docker there.

Historical Windows trap notes (dropped from the index 2026-10-22, files kept): [[git-bash-msys-ad-stall]], [[backup-task-sleepkill-signature]], [[settings-json-bom-trap]]. Open the BOM one if a config file ever arrives from a Windows editor.
