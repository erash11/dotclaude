---
name: graphify-obsidian-discipline
description: "Rules for Graphify skill output and Obsidian vault usage — both vaults archived 2026-05-20, memory system is sole knowledge surface"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3a2e9560-72d2-4a8d-972f-70547df31d13
---

**Rule:** Graphify output is throwaway. Never let it land in a managed Obsidian vault.

**Why:** On 2026-05-20 we audited two vaults on Desktop. Vault41 (~1,400 files, 3 MB) and BigHouse (PARA-structured but ~empty) were both archived to `Desktop/Archive/`. Vault41 was 100% graphify auto-output across two runs (Python codebases + sport-science research corpus) with no hand-curated layer. User had not opened either vault since creation — they were costing attention without paying it back.

Graphify is a one-shot codebase/document visualization tool, not a persistent knowledge layer. Its output goes stale fast (function names/paths drift as code evolves) and is too dense/noisy to scan by eye.

**How to apply:**
- If `/graphify` is invoked, route output to `Desktop/graphify-runs/<repo>-<date>/` — explicitly throwaway. Look at the Canvas view, get the insight, then offer to delete.
- Do NOT suggest graphify output as a memory or knowledge layer. It complements neither Tier A/B memory nor memsearch.
- If user mentions starting a new Obsidian vault: ask first what daily input habit will feed it. Empty PARA folders are decoration. The memory system + memsearch is the working knowledge surface; a second human-facing layer is only worth it with an attached daily habit.
- Skill stays installed at `~/.claude/skills/graphify/SKILL.md` (49K, idle = zero context cost). Removal is unnecessary.

Related: [[vscode-terminal-flicker]]
