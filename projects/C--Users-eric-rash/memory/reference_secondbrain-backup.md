---
name: reference-secondbrain-backup
description: SecondBrain vault is git-backed to private GitHub erash11/SecondBrain; canonical project hub location
metadata:
  type: reference
---

**SecondBrain vault** (`~/Desktop/SecondBrain`) is a **git repo backed up to private GitHub `erash11/SecondBrain`** (set up 2026-06-01). Desktop is **NOT** OneDrive-synced — git push is the backup path. **To back up: run `./backup.sh` from the vault** (idempotent: stages all, commits with timestamp, pushes; no-op if clean). Optional message: `./backup.sh "msg"`. No scheduler/cron (per user constraint). `.gitignore` excludes Obsidian volatile workspace + OS cruft.

**Canonical project hub:** `Projects/Applied-Performance-Hub.md` — single source of truth linking the unit OKRs (`Applied-Performance-OKRs-2026-27.md`), the operating cadence (`Applied-Performance-Operating-Cadence.md`), readable project briefs (`Project_FaceComps-Practice-Simulator.md`, `Project_AI-Integration.md`, `Project_Athlete-Data-Governance.md`), and the symposium reference.

**OKR tracking:** `Projects/okr-tracker/` — hand-edit `okrs.yaml`, run `python okr.py` (or `okr.py check <KR> <conf 0-1> <green|yellow|red|met> "note" --next "next action" [--blocker ..]`) → regenerates `SCOREBOARD.md` (status/confidence/progress bar/trend/**next action**, grouped by objective). PyYAML-only. Every KR carries exactly one next action.

**OKR operating playbook:** `Projects/Applied-Performance-Operating-Cadence.md` — rollout script (folded into the first check-in, no separate kickoff), Thursday check-in facilitation, outcome-based assignment, progression/escalation, and the summer red→green arc (June stand-up / July build / Aug adopt → gate). **Eric DRI on all 9 KRs; AJ/Blake co-own. Weekly check-in Thursdays** (→ biweekly in-season); first check-in + rollout = 2026-06-04. Unit = Eric/AJ/Blake only. Strategy/notes are canonical in the vault; executable tools stay in their own `~/Desktop/DEV/` repos and are linked from the hub. Don't duplicate these into DEV — link instead.

Related: [[project-facecomps-practice-simulator]], [[project-ai-integration-initiative]], [[project-athlete-data-governance]].
