# Shell / Environment (macOS)

- zsh/bash is the native surface on this machine. PowerShell 7 (`pwsh`, `/opt/homebrew/bin/pwsh`) is installed only to run the KeystoneOS `.ps1` jobs natively.
- Verified tool paths (all on PATH via Homebrew unless noted):
  - Python: `/opt/homebrew/bin/python3` (3.14, PEP 668-managed — use venvs or `uv`, never `pip install` globally)
  - uv: `/Users/kristinarash/.local/bin/uv`
  - Go: `/opt/homebrew/bin/go`
  - Go-installed CLIs (fireflies-pp-cli, espn-pp-cli, etc.): `/Users/kristinarash/go/bin/`
  - Node: `/opt/homebrew/bin/node`
- DEV projects live at `~/DEV` (not `~/Desktop/DEV`).

# Workflow Expectations

- When asked to **create, merge, or consolidate an artifact** (calendar, deck, doc), the expected deliverable is always a produced file. Verify what exists first, then create the artifact regardless — never conclude with "it already exists" instead of delivering the file.

# graphify
- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.

# Memory System

This is a two-tier memory system. **Read this before doing any memory reads or writes.**

## Tier A — Per-project structured facts (existing)
Lives at `~/.claude/projects/<slug>/memory/`. One file per durable fact, indexed by `MEMORY.md`. The harness auto-injects this. Continue to **write** here for stable facts: user profile entries, project-specific conventions, feedback rules. This tier is indexed by memsearch (Tier B) so it's also recallable cross-project.

## Tier B — Global working memory (new)
Lives at `~/.claude/global-memory/`. Loaded at every session start regardless of cwd:
- `USER.md` (~1.4 KB cap) — durable user profile
- `MEMORY.md` (~2.5 KB cap) — active threads, environment notes, pending decisions
- `transcripts/YYYY-MM-DD.md` — auto-captured turn summaries (Stop hook)

## Daily compiled logs (separate system)
Daily decision/lesson/action summaries are produced by `claude-memory-compiler` (its own SessionEnd/PreCompact hooks) and live at `~/.claude/claude-memory-compiler/daily/{YYYY-MM-DD}.md`. These are injected by the compiler's own SessionStart hook — do **not** write to them manually, and do **not** read them eagerly; treat the injected snapshot as the source of truth.

## Session Startup (silent — do not output anything)

On every session start, read these files silently, in this order:
1. `~/.claude/global-memory/USER.md`
2. `~/.claude/global-memory/MEMORY.md`
3. `~/.claude/global-memory/transcripts/.errors.log` — if non-empty, surface the contents to the user once on the first response of the session, then continue normally. This file should normally be empty; entries indicate hook failures (e.g. memsearch flush patch was stripped after a pip upgrade).

These are a **frozen snapshot** — loaded once. Mid-session writes persist to disk but take effect next session. This preserves the prefix cache. Total injected at startup is small (~3,000 tokens); never load more than this proactively.

## Memory Budget

- `~/.claude/global-memory/MEMORY.md`: **2,500 character cap**. Before writing, check `wc -c`. If over cap, consolidate existing entries before adding.
- `~/.claude/global-memory/USER.md`: **1,375 character cap**. Same rule.
- Mid-session writes appear in context **next session**, not this one.

## Memory Write — which tier to use

Decide tier first, then write.

**Tier A (per-project structured)** — when the fact is:
- A durable claim about the user (role, preferences, working style) → update or add a `user_*.md` file
- A stable project convention or gotcha (e.g. "Catapult API v6 uses /stats not v4 /statistics") → `project_*.md`
- A feedback rule that should govern future behavior → `feedback_*.md`

Write the file with proper frontmatter (`name`, `description`, `metadata.type`) and add a one-line pointer to the current project's `~/.claude/projects/<slug>/memory/MEMORY.md` (the harness injects the correct `<slug>` each session; on this Mac the home-directory slug is `-Users-kristinarash`). Do not write to the `C--Users-eric-rash*` slugs — those are the pre-migration Windows keys.

**Tier B (global scratchpad)** — when the fact is:
- An active thread (currently-in-progress work that will be referenced soon)
- An environment note (URLs, tool versions, project structure currently in play)
- A pending decision

When the user says "remember this", "note that", "update memory", "save this", "forget about":
1. Decide tier (durable+structured = A; active+scratchpad = B)
2. Read the target file in full
3. Dedup check (substring scan)
4. Cap check (`wc -c`) for Tier B
5. If over cap: consolidate (merge similar entries, prune stale) before adding
6. Write
7. Confirm: "Saved — will be active from next session."

For **remove**: confirm with the user before deleting.

## Memory Retrieval — tiered ladder

When the user asks about past context, decisions, or "did we already…?":

1. **Tier 0** — scan what's already in context (USER.md, MEMORY.md, today's log). Zero cost.
2. **L1** — `memsearch search "query" --top-k 5`. Hybrid vector + keyword. Finds semantic matches across all indexed paths (Tier A files, daily logs, transcripts).
3. **L2** — `memsearch expand <chunk_hash>`. Full markdown section around a hit.
4. **L3** — `memsearch transcript <session_id>`. Raw dialogue, last resort.
5. **Fallback** — "I don't have a record of that."

Only escalate if the previous tier didn't answer the question. Don't run memsearch when the answer is already in the injected snapshot.

## Tier boundary — when in doubt

Ask: "Will this fact still be true and useful in 3 months, across multiple projects?"
- **Yes** → Tier A
- **No / only matters right now** → Tier B
