# Machine

Machine-specific shell, paths, and traps live in `~/.claude/machine.md`. Read that file first. On a new machine copy `machine.macos.md` or `machine.windows.md` to `machine.md`.

Two machines share this setup: the MacBook (`~/DEV`) and the Baylor Windows laptop (`~/Desktop/DEV`). Projects sync through GitHub (`erash11`), documents through Google Drive. Every project repo carries a Session routine in its `AGENTS.md`: `git pull` + read `docs/STATUS.md` at start; update `STATUS.md`, commit, `git push` at end.
# Workflow Expectations

- One home: the "Workflow Expectations" section of `~/.claude/CLAUDE.md`. Read it there.

# graphify

- **graphify** (`~/.claude/skills/graphify/SKILL.md`) — turns any input into a knowledge graph. Trigger: `/graphify`. When the user types `/graphify`, run that skill's workflow before doing anything else.

---

> **Why this file is not identical to `CLAUDE.md`.** Claude Code has a Skill tool, so `CLAUDE.md` routes memory work to the `memory-write` skill instead of restating it. Harnesses reading this file have no such tool, so the memory rules are spelled out below in full. The divergence is deliberate. **Do not symlink these two files together.** The canonical, most detailed copy is `~/.claude/skills/memory-write/SKILL.md` — if a rule below ever disagrees with that file, that file wins.

# Memory System

Two tiers.

## Tier A — per-project structured facts
`~/.claude/projects/<slug>/memory/` — one file per durable fact, indexed by `MEMORY.md`. The active project's Tier A memory is **auto-injected each session**. Write here for stable facts: user profile entries, project conventions, feedback rules. Also indexed by memsearch, so recallable cross-project.

File naming by type: `user_*.md`, `project_*.md`, `feedback_*.md`, `reference_*.md`. Each needs frontmatter (`name`, `description`, `metadata.type`) plus a one-line pointer added to that slug's `MEMORY.md`.

**Slugs.** The slug is the cwd with `/` and `.` replaced by `-`:
`~` → `-Users-kristinarash` · `~/DEV` → `-Users-kristinarash-DEV` · `~/.claude/skills` → `-Users-kristinarash--claude-skills`

**Slugs differ per machine.** The same project is `-Users-kristinarash-DEV-<X>` on the Mac and `C--Users-eric-rash-Desktop-DEV-<X>` on Windows. Tier A written on one machine is not auto-injected on the other; memsearch still finds it. Prefer writing durable project facts to the repo's `docs/` so both machines see them.

## Tier B — global working memory
`~/.claude/global-memory/`, loaded every session regardless of cwd:
- `USER.md` — durable user profile. **1,375 character cap.**
- `MEMORY.md` — active threads, environment notes, pending decisions. **2,500 character cap.**
- `transcripts/YYYY-MM-DD.md` — auto-captured turn summaries (Stop hook).

Check `wc -c` before writing. If over cap, consolidate existing entries before adding.

## Daily compiled logs (separate system, read-only)
`~/.claude/claude-memory-compiler/daily/{YYYY-MM-DD}.md`, produced by `claude-memory-compiler` via its own hooks. **Never write to them manually. Never read them eagerly** — treat the injected snapshot as the source of truth.

## Session startup (silent — output nothing)

> Kept as a manual instruction on purpose. Claude Code does this with the
> `keystone-unified-snapshot.js` SessionStart hook, so `CLAUDE.md` no longer
> states it. Codex has no equivalent hook, so the steps stay spelled out here.
> Do not "align" the two files by deleting this section.
Read in this order: `global-memory/USER.md`, then `global-memory/MEMORY.md`, then `global-memory/transcripts/.errors.log`. If `.errors.log` is non-empty, surface its contents once on the first response, then continue. It should normally be empty; entries indicate hook failures.

These are a **frozen snapshot** — loaded once. Mid-session writes persist to disk but take effect next session. This preserves the prefix cache. Never load more than this proactively.

## Writing — the steps
On "remember this", "note that", "update memory", "save this", "forget about":
1. Decide tier — "will this be true and useful in 3 months, across projects?" Yes → Tier A. No / only matters now → Tier B.
2. Read the target file in full.
3. Dedup check (substring scan).
4. Cap check (`wc -c`) for Tier B.
5. If over cap, consolidate before adding.
6. Write.
7. Confirm in one line: `Saved — will be active from next session.`

For **remove**: confirm with the user before deleting.

## Retrieval — the tiered ladder
Climb in order; stop as soon as the question is answered. Do not run memsearch when the answer is already in the injected snapshot.

1. **Tier 0** — scan what is already in context (USER.md, MEMORY.md, today's compiled log). Zero cost.
2. **L1** — `memsearch search "query" --top-k 5`. Hybrid vector + keyword across all indexed paths.
3. **L2** — `memsearch expand <chunk_hash>`. Full markdown section around a hit.
4. **L3** — `memsearch transcript <session_id>`. Raw dialogue. Last resort.
5. **Fallback** — "I don't have a record of that."
