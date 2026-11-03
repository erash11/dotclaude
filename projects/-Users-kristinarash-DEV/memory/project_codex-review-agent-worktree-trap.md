---
name: codex-review-agent-worktree-trap
description: codex-review inspect refuses a checkout that holds subagent worktrees under .claude/worktrees; run it from a detached worktree outside the repo
metadata:
  node_type: memory
  type: project
  originSessionId: a21541bc-7452-4153-bbfe-d9c2a6463b5a
  modified: 2026-11-03T00:28:31.445Z
---

`codex-review` inspect (claudex-loop runner) stops before the round with "claudex-loop: Changed directory/submodule needs explicit inspection: .claude/worktrees/agent-<id>/" when Agent-tool subagents with `isolation: worktree` have worktrees inside the reviewed repo. Seen 2026-11-02 in MacEverything.

**Why:** the runner treats the untracked nested worktree as a changed directory it cannot diff.

**How to apply:** review from a clean detached checkout outside the repo: `git worktree add --detach "$CLAUDE_JOB_DIR/tmp/codex-review/checkout" <sha>`, then run inspect with `--repo .` from there; for the next round `git checkout --detach <new sha>` in it. Also add `.claude/` to the repo's .gitignore so closeout sweeps stay clean. See [[codex-second-review]], [[codex-exec-stdin-hang]].
