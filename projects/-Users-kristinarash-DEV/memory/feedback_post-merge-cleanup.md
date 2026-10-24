---
name: post-merge-cleanup
description: "Standing OK (2026-09-26) to remove merged worktrees and remote branches without asking; local git branch -d is dcg-blocked, so Eric runs it; the verify-first rule"
metadata:
  node_type: memory
  type: feedback
  originSessionId: afe0ff48-dfa7-46d6-8732-fabc387127ee
  modified: 2026-10-24T14:54:46.592Z
---

**Standing permission, given 2026-09-26:** "I trust your judgement to remove things that are
safe to remove after merges." Once a PR is merged, clean up its worktree folders and its
local and remote branches without asking. Report what was removed in one line.

**Corrected 2026-10-24: local branch deletes are Eric's to run.** The dcg guard keeps
`core.git:branch-force-delete` as a hard stop, kept on purpose in the 2026-10-11 allowlist pass. It blocks plain
`git branch -d` too (`dcg explain`, 2026-10-24). See [[dcg-guard-blocks]]. So:
- Do unasked: `git worktree remove` / `prune` and `git push origin --delete <branch>`.
  Both pass dcg.
- For local branches, give Eric the exact `git branch -d <names>` line to run with a `!`
  prefix. Never bundle it with a push: dcg rejects the whole line and the push is lost.

**Why:** Leftover worktrees and merged branches had piled up in `RTP_Constraints_Course`:
three orphan worktree folders and seven merged branches from one day's PRs. Asking about
each one is friction he does not want.

**How to apply:**
- "Safe" means verified, not assumed:
  - `git branch --merged origin/main` (and `-r`) lists a branch before it is deleted;
  - before deleting a worktree folder, every file in it is already in git history
    (`git hash-object --path=<rel> <file>`, looked up against `git rev-list --all --objects`);
  - there is no uncommitted work.
- **Anything unmerged, or holding content that is not in git, is out of scope. Ask.**
- The scope is post-merge git debris only. It does not cover deleting data, outputs, Drive
  files or anything else, and merging a PR still needs his ask.
- **Windows trap** (historical: the laptop has had no terminal work since 2026-10-14, see
  [[work-laptop-hands-off]]): `git worktree remove`/`prune` fails with "Permission denied" because the
  folders carry a read-only attribute (probably from Drive sync), not a lock. Fix:
  `attrib -r /s /d` on both `.git\worktrees\<name>` and `.claude\worktrees\<name>`, then
  `Remove-Item -Recurse -Force` both folders, then `git worktree prune`. Written into
  `RTP_Constraints_Course/docs/STATUS.md` (PR #7).
