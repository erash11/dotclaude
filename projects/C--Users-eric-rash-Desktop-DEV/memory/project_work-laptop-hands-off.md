---
name: work-laptop-hands-off
description: Baylor Windows work laptop is hands-off since 2026-10-08 — no automation there; all 17 scheduled tasks disabled
metadata:
  node_type: memory
  type: project
  originSessionId: 788f361d-8aa2-49b2-ba0b-3402ca8b2f41
  modified: 2026-10-08T21:08:57.174Z
---

Since **2026-10-08** the Baylor Windows work laptop (BU-1979FJ4, "My Laptop (2)" in Google Drive) is hands-off. Eric does not want any automation running on it. All 17 of its scheduled tasks (the Eric folder plus the root-library KeystoneOS, MorningBriefing, DailyGmailDigest and Refresh_All_Data tasks) are **disabled**. Their XML exports are in `My Drive/_FROM_WORK_LAPTOP/scheduled-tasks`.

Everything that lived only on the laptop was copied to `My Drive/_FROM_WORK_LAPTOP` (11 zips, `pff-data`, `_tools`) and to the CRASHBOX drive. Handoff doc with the Mac to-do list: `My Drive/_FROM_WORK_LAPTOP/HANDOFF.md`. Vault note: `~/SecondBrain/Projects/work-laptop-handoff-2026-10-08.md`.

**Why:** Eric chose to stop running jobs on the Baylor machine.

**How to apply:** Do not re-enable, create, or fix scheduled tasks or hooks on the Windows laptop. Port a needed job to the Mac instead (a VPS job that touches Baylor data needs IT approval). Treat Windows-side entries in [[automation-cadence]] as historical. The Mac is now the only machine that runs automation.
