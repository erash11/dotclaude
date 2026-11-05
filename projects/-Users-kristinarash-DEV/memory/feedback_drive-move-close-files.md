---
name: drive-move-close-files
description: "Before moving Drive files, Eric closes every Drive file open on Windows"
metadata:
  type: feedback
---

Drive moves break the save path of files open on Windows: get Eric's 'closed' before moving.

**Why:** 2026-11-05: files open in Word on Windows lost their save path after a Drive move; Eric had to pick a save location and closed one without saving (no edits lost that time).

**How to apply:** Ask Eric to close open Drive files and wait for his 'closed' before any move. Moves with addParents/removeParents keep IDs and links. Tell him the new folder path to reopen from. Rule lives in DEV/docs/FILE-ORGANIZATION-PLAN.md Task 15.
