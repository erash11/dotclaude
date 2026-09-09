---
name: FaceComps repo is not an Obsidian vault
description: User decided May 2026 to remove all Obsidian config and notes from the FaceComps repo; don't reintroduce
type: feedback
originSessionId: 2780ff32-7bee-4e10-a90c-d6239c3c4e1e
---
The `FaceComps/` directory is a code+data project, not an Obsidian vault. `.obsidian/` is gitignored and should stay that way. Loose markdown notes (Class.md, Jo Clubb.md, context.md, raw/, media/) were removed in commit `b9c8383` (2026-05-08).

**Why:** Eric had been casually using the folder as both a code repo and an Obsidian vault. The `.obsidian/workspace.json` and `graph.json` files were causing constant churn in `git status` and producing meaningless commits like "fix: update workspace configuration." The two purposes mixed in one folder generated confusion (e.g., Graphify experiment outputs ending up in `raw/` next to source code). Articles he wanted to keep were moved to `~/Desktop/DEV/_obsidian_extracted_from_FaceComps/` for relocation to his main vault.

**How to apply:** Don't add `.obsidian/`, don't write loose top-level reference notes (articles, scratch logs) into this repo. If the user wants to capture project knowledge for future sessions, use `CLAUDE.md` or files under `docs/`. If he asks to "save this article" or similar Obsidian-style work, ask whether he wants it in his main vault (outside this repo) rather than committing it here.
