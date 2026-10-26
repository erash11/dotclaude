---
name: third-party-skill-install
description: "How a vendored third-party skill installs across all five harnesses — clone into ~/.agents/skills, symlink out — plus the Windows ln -s copy trap and the pre-commit/daily-backup jam that sync-to-codex clears"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0804822d-4ddb-4933-801e-9a07f13445ae
  modified: 2026-09-18T18:12:58.161Z
---

Installing a third-party (vendored, upstream-owned) skill on this setup: **clone the repo
into `~/.agents/skills/<name>` — the one real directory — then symlink it into the four
harness folders.** Established by the six that predate it (`humanizer`, `pp-espn`,
`articulation-skill`, `game-film-timestamps`, `pp-fireflies`, `session-handoff`).

```
~/.agents/skills/<name>        ← the clone; Codex/Cursor/Copilot read here natively
~/.claude/skills/<name>   →    symlink    Claude Code
~/.gemini/skills/<name>   →    symlink    Gemini CLI
~/.codex/skills/<name>    →    symlink    Codex
~/.cursor/skills/<name>   →    symlink    Cursor
```

One clone means one `git pull` updates every harness. Claude Code registers a new skill
**live, mid-session** — no restart needed.

**Windows trap — `ln -s` silently copies.** Git Bash's default `ln -s` duplicates the
directory instead of linking. Claude Code still finds the skill, so it *looks* installed,
but the copy has no `.git` and `git pull` silently stops being the update path. Use
`MSYS=winsymlinks:nativestrict ln -s <target> <link>`, and verify from PowerShell —
`(Get-Item <path> -Force).LinkType` must print `SymbolicLink`. `ls -la` in Git Bash shows
`l... ->` for both cases, so it is **not** sufficient proof on its own. Same MSYS family as
[[git-bash-msys-ad-stall]], different mechanism.

**The nightly-backup jam.** `~/.claude/skills` is its own repo with a `pre-commit` hook
that refuses any symlink (git mode 120000), while `daily-backup.ps1` runs `git add -A` on
it. So a freshly added third-party symlink sits as `?? <name>` and will **jam the nightly
backup commit** until the exclude block is regenerated.

**The fix is `~/.claude/skills/sync-to-codex.ps1`, not a hand edit.** It classifies every
symlink in `~/.claude/skills` as THIRD_PARTY, drops it from the git index ("removed
third-party link '<name>' from the index (left on disk)"), and rewrites the generated block
in `.git/info/exclude` — which is marked *"Rewritten on every sync. Per-machine. Do not
edit by hand."* Supports `DRY_RUN=1`; dry-run first and confirm zero `retire`/`REFUSE`/
`FATAL` lines before applying.

**Why the sync cannot clobber the clone:** its copy loop touches only `$MANAGED` entries
(real directories in canonical with a SKILL.md), and its retirement loop only removes names
present in the *previous* manifest. A third-party name enters neither list, so
`~/.agents/skills/<name>` and its `.git` survive every sync. Verified — sync ran clean over
41 managed + 7 third-party with the clone intact on `main`.

**Do not route these through `CreateSkill`.** Canonicalizing an upstream repo (TitleCase,
`Workflows/`) rewrites files git tracks and breaks `git pull`. The `skills/CLAUDE.md`
mandate governs skills Eric *owns*, not vendored ones.

**Nothing propagates to the Mac.** `skills/` is gitignored out of the dotclaude repo and
`~/.agents` is not a repo at all, so each machine needs its own clone + symlinks.

Established 2026-09-18 installing `grill-with-ui`. Related:
[[dev-layout-and-discovery]], [[keystoneos-verification-habits]]
