---
name: graphify-runtime-setup
description: "graphify's Python package lives in a venv inside the skill dir, not globally; SKILL.md's own pip install step fails under PEP 668"
metadata: 
  node_type: memory
  type: project
  originSessionId: 53bc7e39-8ea3-4b0c-9787-4ed6d66f5acc
  modified: 2026-09-12T22:33:10.641Z
---

**Set up 2026-08-29.** The `graphify` skill's Step 1 says `pip install graphifyy` — that
**fails on this Mac** (Python 3.14 is PEP 668-managed). The package is instead installed
in a dedicated venv:

```
/Users/kristinarash/.claude/skills/graphify/.venv/bin/python
```

Run every `scripts/*.py` step with that interpreter, not bare `python3`. `graphify install`
does not touch the venv, so an upgrade leaves it intact.

**Since 2026-09-12 there is ONE skill copy.** `~/.agents/skills/graphify` and
`~/.codex/skills/graphify` are symlinks to `~/.claude/skills/graphify/` (made by
`sync-to-codex.sh`). Upgrade with `--platform claude` ONLY.

**Never run `graphify install --platform agents` now.** Its installer writes
`~/.agents/skills/graphify/SKILL.md` and `references/` by path, so it follows the link and
overwrites the canonical Claude copy with the Codex variant ("Task tool", "AGENTS.md").
The daily backup would then commit that. Before 9/12 the advice was "update both"; that
advice is now wrong. The old Codex variant is archived at
`~/.agents/skills-archive/pre-sync-2026-09-12/graphify`.
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
