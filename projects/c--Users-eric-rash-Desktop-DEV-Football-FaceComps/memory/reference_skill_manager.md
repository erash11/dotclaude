---
name: skill-manager
description: How cross-harness agent skills are installed/updated on this machine (npx skills + ~/.agents/skills). Read before touching any installed skill files.
metadata: 
  node_type: memory
  type: reference
  originSessionId: 3c2767c5-0c2c-4fdc-8a06-37cf5473967f
---

Eric manages agent skills across harnesses with **Vercel's `npx skills` CLI** (vercel-labs/skills, browse at skills.sh). Do NOT hand-copy or hand-edit installed skill files — it breaks the junction pattern and desyncs the lock file.

**Architecture (verified 2026-06-09):**
- Single source of truth: `~/.agents/skills/<skill>/` (REAL folders).
- Claude Code reads via **junctions**: `~/.claude/skills/<skill>` -> `~/.agents/skills/<skill>`.
- Codex, Gemini CLI, GitHub Copilot read `~/.agents/skills` directly ("universal" — no per-agent copy).
- Manifest/lockfile: `~/.agents/.skill-lock.json` (tracks `source`, `skillPath`, `skillFolderHash` = git tree SHA of the skill folder). `check`/`update` compare lock hash vs upstream folder SHA.
- Default agent set for global installs: claude-code, codex, gemini-cli, github-copilot.

**Commands (run from ~, CLI auto-detects agent => non-interactive):**
- List: `npx skills list -g --json`
- Available in a repo: `npx skills add <owner/repo> -g -l --full-depth`
- Install: `npx skills add <owner/repo> -g --skill <name> --agent claude-code codex gemini-cli github-copilot -y --full-depth`
- Update: `npx skills update [name] -g -y` (plain `check` is project-scope only)
- Remove: `npx skills remove -g -s <name> -a claude-code codex gemini-cli github-copilot -y`

**Gotcha:** `npx skills update` FAILS on a skill whose on-disk content was hand-modified (refuses to clobber local changes). Fix = `remove` then `add` fresh (restores canonical content + correct lock hash). This is how to-prd was reconciled after a manual edit. Matt Pocock skills come from `mattpocock/skills` (nested `skills/<category>/<name>`, needs `--full-depth`). [[camp-models]]
