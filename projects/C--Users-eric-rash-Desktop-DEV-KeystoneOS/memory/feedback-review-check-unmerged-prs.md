---
name: feedback-review-check-unmerged-prs
description: "Whole-feature/spec reviews must enumerate open PRs and unmerged branches before declaring a requirement missing — reading the default branch is not reading the project's state"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dd39fd68-973f-4c73-a257-dd06fb5babf6
  modified: 2026-07-21T17:31:42.104Z
---

Before a whole-feature or spec-fidelity review reports that a requirement is missing, enumerate open PRs and unmerged branches (`gh pr list --state all`, `git branch -r`, `git worktree list`) — not just the state of `main`.

**Why:** The SpeedProfiling v1 review (2026-07-20) reported "story 23 never built; ticket 07 unresolved" as its blocking finding. It was wrong. The work was complete and pushed, sitting in draft PR #5 since 7/18. The review read `main`, where the registry entry genuinely was absent, and a concurrent session was running ticket 07 at the same time. Two other tickets' work was also parked in unmerged drafts. The finding had to be withdrawn.

**How to apply:** In any review of a feature spanning repos or systems, make "list unmerged branches and open PRs" a step before the fidelity pass, and say explicitly in the report which ref was reviewed. Eric's pattern is that ticket work often completes into draft PRs that never land — so an absent artifact on `main` is weak evidence it was never built. Related: [[project-speedprofiling-data-gotchas]].
