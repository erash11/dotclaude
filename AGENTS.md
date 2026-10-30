# Machine

Machine-specific shell, paths, and traps live in `~/.claude/machine.md`. Read that file first. On a new machine copy `machine.macos.md` or `machine.windows.md` to `machine.md`.

The Mac (`~/DEV`) runs everything. The Baylor Windows laptop (`~/Desktop/DEV`) is used only for desktop-app sessions since 2026-10-21, with no automation. Projects sync through GitHub (`erash11`), documents through Google Drive.

**Session routine.** When working inside a project repo, follow the Session routine in its `AGENTS.md`: `git pull` and read `docs/STATUS.md` at the start; update `STATUS.md`, commit, and `git push` at the end.

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

File naming by type: `user_*.md`, `project_*.md`, `feedback_*.md`, `reference_*.md`. Each needs frontmatter (`name`, `description`, `metadata.type`) plus a one-line pointer added to that slug's `MEMORY.md`. `python3 ~/.claude/scripts/remember.py --type <t> --name <slug> --desc "..." --hook "..." [--why ... --how ...] "fact"` does both, refuses duplicates (`--update` replaces), and runs the read-back check; run it from the project folder so the slug is right.

**Slugs.** The slug is the absolute cwd with every character other than a letter or digit replaced by `-`:
- Mac: `~/DEV` → `-Users-kristinarash-DEV` · `~/.claude/skills` → `-Users-kristinarash--claude-skills`
- Windows: `~/Desktop/DEV` → `C--Users-eric-rash-Desktop-DEV` · `~/.claude/skills` → `C--Users-eric-rash--claude-skills`

**Slugs differ per machine.** The same project is `-Users-kristinarash-DEV-<X>` on the Mac and `C--Users-eric-rash-Desktop-DEV-<X>` on Windows. Tier A written on one machine is not auto-injected on the other; memsearch still finds it. Prefer writing durable project facts to the repo's `docs/` so both machines see them.

## Tier B — global working memory
`~/.claude/global-memory/`, loaded every session regardless of cwd:
- `USER.md` — durable user profile. **1,375 character cap.**
- `MEMORY.md` — active threads, environment notes, pending decisions. **2,500 character cap.**
- `transcripts/YYYY-MM-DD.md` — auto-captured turn summaries (Stop hook).

Check `wc -c` before writing. If over cap, consolidate existing entries before adding.

## Daily compiled logs (separate system, read-only)
`~/.claude/claude-memory-compiler/daily/{YYYY-MM-DD}.md`, produced by `claude-memory-compiler` via its own hooks. Only the compiler writes them. Read one only when a question needs that day; the injected snapshot is the source of truth.

## Session startup (read without comment)

> Kept as a manual instruction on purpose. Claude Code does this with the
> `keystone-unified-snapshot.js` SessionStart hook, so `CLAUDE.md` no longer
> states it. Codex runs the same snapshot hook (`~/.codex/hooks.json` SessionStart →
> `keystone-unified-snapshot.js`); if its output is not in your context, read the files by hand as below.
> Do not "align" the two files by deleting this section.
Read in this order: `global-memory/USER.md`, then `global-memory/MEMORY.md`, then `global-memory/transcripts/.errors.log`. The one thing to say out loud: if `.errors.log` is non-empty, give a one-line-per-kind summary (kind, count, latest message) on the first response, then continue. Entries mean a hook or scheduled job failed.

These are a **frozen snapshot** — loaded once. Mid-session writes persist to disk but take effect next session. This preserves the prefix cache. Load anything further only when a question needs it.

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
Climb in order; stop as soon as the question is answered. Do not run a search when the answer is already in the injected snapshot.

1. **Tier 0** — scan what is already in context (USER.md, MEMORY.md). Zero cost. The daily compiled log arrives as a pointer only; open it when the question names that day.
2. **L1** — `python3 ~/.claude/scripts/recall.py "question"`. Plain code, ~1 s: opens the best file and prints the matching paragraphs; on a weak or no match it also runs memsearch (~10 s). If they miss the answer, open the #2 or #3 candidate it lists.
3. **L2** — when L1's output (memsearch hits included) still misses: `python3 ~/.claude/scripts/recall.py "<reworded query>" --deep`. Always adds memsearch's hybrid vector + keyword search, ~10 s, memory files first.
4. **L3** — `memsearch expand <chunk_hash>`. Full markdown section around a hit.
5. **L4** — `memsearch transcript <session_id>`. Raw dialogue. Last resort.
6. **Fallback** — "I don't have a record of that."

When Eric corrects a recalled fact, or a recalled answer proves stale, add it to the bench unasked: one `miss` row in `~/.claude/scripts/recall-bench/questions.tsv` (question, file with the right answer, answer), then `CSET=miss bash ~/.claude/scripts/recall-bench/run.sh C`. Then run `python3 -I ~/.claude/scripts/recall-bench/check.py`; when it prints `OK`, run it again with `--update-baseline` (the daily check guards each question that was a hit in `baseline.json`, so the new question is guarded only after this, and only once recall.py ranks it first). Say so in one line.
