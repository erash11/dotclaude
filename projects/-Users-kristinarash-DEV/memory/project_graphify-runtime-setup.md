---
name: graphify-runtime-setup
description: "graphify's Python package lives in a venv inside the skill dir, not globally; SKILL.md's own pip install step fails under PEP 668"
metadata: 
  node_type: memory
  type: project
  originSessionId: 53bc7e39-8ea3-4b0c-9787-4ed6d66f5acc
  modified: 2026-08-29T19:34:51.928Z
---

**Set up 2026-08-29.** The `graphify` skill's Step 1 says `pip install graphifyy` — that
**fails on this Mac** (Python 3.14 is PEP 668-managed). The package is instead installed
in a dedicated venv:

```
/Users/kristinarash/.claude/skills/graphify/.venv/bin/python
```

Run every `scripts/*.py` step with that interpreter, not bare `python3`. `graphify install`
does not touch the venv, so an upgrade leaves it intact.

**Two skill copies exist and both carry a version stamp** (`.graphify_version`):

- `~/.claude/skills/graphify/` — Claude Code
- `~/.agents/skills/graphify/` — the generic `agents` convention, read by Codex-style harnesses

`graphify install` updates **one platform at a time**. Running only `--platform claude`
leaves `~/.agents` stale, and the version warning keeps firing from there even though the
Claude copy is current. Update both: `--platform claude` **and** `--platform agents`.
(Two more stamps exist under `~/.codex-migration-backups/` — those are backups, leave them.)

**The old manifest was Windows-era.** A `--update` in `~/SecondBrain/Inbox/meetings` reported
all 264 files as new because the June manifest held `graphify-out\GRAPH_REPORT.md`
(backslash). After a path migration, `--update` is not incremental — plan a full rebuild.

**Two traps when rebuilding a folder that already has a graph:**
1. Move the old `graphify-out` **outside** the corpus before re-detecting. Left as a sibling
   backup inside the folder it inflated the corpus from 265 to 327 files (its cache JSON got
   scanned as code).
2. The semantic cache keys on file paths, so a path change makes it a 0% hit — budget for
   full re-extraction, not a cheap top-up.

**Extraction agents can die mid-write.** A session rate limit killed 3 of 12 agents and left
one chunk's JSON truncated. Do not re-run blindly — a truncated chunk is usually salvageable
by `raw_decode`-ing each complete object out of the `nodes`/`edges` arrays and dropping the
partial tail. That recovered all 22 files of the dead chunk with nothing lost.

Related: [[dev-layout-and-discovery]]
