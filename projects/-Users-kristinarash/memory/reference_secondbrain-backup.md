---
name: secondbrain-backup
description: SecondBrain vault is git-backed to private GitHub erash11/SecondBrain; canonical project hub location
metadata:
  type: reference
---

**SecondBrain vault** (`~/SecondBrain`; it moved off `~/Desktop/SecondBrain` on 2026-08-14, see DEV memory `project_secondbrain-vault-location.md`) is a **git repo backed up to private GitHub `erash11/SecondBrain`** (set up 2026-06-01). It is not OneDrive-synced — git push is the backup path. **By hand: run `./backup.sh` from the vault** (idempotent: stages all, commits with timestamp, pushes; no-op if clean). Optional message: `./backup.sh "msg"`. `.gitignore` excludes Obsidian volatile workspace + OS cruft. Superseded 2026-10-24: this said there was no scheduler. The Mac daily backup now commits and pushes the vault (`Sync-Repo` in `daily-backup.ps1`, hourly 12:00-17:00 on AC power) and copies it to the SSD.

**Canonical project hub:** `Projects/Applied-Performance-Hub.md` — single source of truth linking the unit OKRs (`Applied-Performance-OKRs-2026-27.md`), the operating cadence (`Applied-Performance-Operating-Cadence.md`), readable project briefs (`Project_FaceComps-Practice-Simulator.md`, `Project_AI-Integration.md`, `Project_Athlete-Data-Governance.md`), and the symposium reference.

**OKR tracking** — superseded 2026-09-14 (the prioritization system replaced it): `okr-tracker/` is retired; the files are still on disk, but do not revive it (DEV memory `project_prioritization-slate.md`). Original note: `Projects/okr-tracker/` — hand-edit `okrs.yaml`, run `python okr.py` (or `okr.py check <KR> <conf 0-1> <green|yellow|red|met> "note" --next "next action" [--blocker ..]`) → regenerates `SCOREBOARD.md` (status/confidence/progress bar/trend/**next action**, grouped by objective). PyYAML-only. Every KR carries exactly one next action.

**OKR operating playbook** — superseded 2026-09-14: `Applied-Performance-Operating-Cadence.md` is now the Prioritization Rules (it replaced the v2 playbook), and the OKR set is **v3 with 14 KRs** in `Applied-Performance-OKRs-2026-27.md` (DEV memory `project_status-report-sourcing.md`). The June details below (9 KRs, Thursday check-ins, DRIs) are history. Original note: `Projects/Applied-Performance-Operating-Cadence.md` — rollout script (folded into the first check-in, no separate kickoff), Thursday check-in facilitation, outcome-based assignment, progression/escalation, and the summer red→green arc (June stand-up / July build / Aug adopt → gate). **Eric DRI on all 9 KRs; AJ/Blake co-own. Weekly check-in Thursdays** (→ biweekly in-season); first check-in + rollout = 2026-06-04. Unit = Eric/AJ/Blake only. Strategy/notes are canonical in the vault; executable tools stay in their own `~/DEV/` repos and are linked from the hub. Don't duplicate these into DEV — link instead.

Related: [[facecomps-practice-simulator]], [[ai-integration-initiative]], [[athlete-data-governance]].
