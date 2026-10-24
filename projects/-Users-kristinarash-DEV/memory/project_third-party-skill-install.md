---
name: third-party-skill-install
description: "After installing a vendored third-party skill: the pre-commit/daily-backup jam that sync-to-codex.sh clears, why the install never reaches the other machine, and the CreateSkill warning; layout and steps are in vendored-skill-install"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0804822d-4ddb-4933-801e-9a07f13445ae
  modified: 2026-10-24T14:54:46.918Z
---

Layout and install steps (real files in `~/.agents/skills/<name>`, symlinked out; checked
on the Mac): see [[vendored-skill-install]]. This file covers what happens after.

One clone means one `git pull` updates every harness. Claude Code registers a new skill
**live, mid-session** — no restart needed.

**Windows trap — `ln -s` silently copies** (historical: the laptop has had no terminal work
since 2026-10-14, see [[work-laptop-hands-off]]). Git Bash's default `ln -s` duplicates the
directory instead of linking. Claude Code still finds the skill, so it *looks* installed,
but the copy has no `.git` and `git pull` silently stops being the update path. Use
`MSYS=winsymlinks:nativestrict ln -s <target> <link>`, and verify from PowerShell —
`(Get-Item <path> -Force).LinkType` must print `SymbolicLink`. `ls -la` in Git Bash shows
`l... ->` for both cases, so it is **not** sufficient proof on its own. Same MSYS family as
[[git-bash-msys-ad-stall]], different mechanism.

**The daily-backup jam.** `~/.claude/skills` is its own repo with a `pre-commit` hook
that refuses any symlink (git mode 120000), while `daily-backup.ps1` runs `git add -A` on
it. So a freshly added third-party symlink sits as `?? <name>` and will **jam the daily
backup commit** until the exclude block is regenerated.

**The fix is `bash ~/.claude/skills/sync-to-codex.sh` on the Mac, not a hand edit**
(`sync-to-codex.ps1` is the Windows twin). It classifies every
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

**A third-party install never reaches the other machine.** Corrected 2026-10-24: the
reason is not the dotclaude gitignore. `~/.claude/skills/` is its own git repo
(`erash11/claude-skills`), and owned skills do travel through it
([[skill-bloat-and-promotion]]). But the sync above keeps third-party links out of that
repo on purpose, and `~/.agents` is not a repo at all. So each machine needs its own install.

Established 2026-09-18 on Windows, installing `grill-with-ui` (not installed on the Mac). Related:
[[dev-layout-and-discovery]], [[keystoneos-verification-habits]]
