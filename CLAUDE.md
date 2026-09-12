# Machine

Machine-specific shell, paths, and traps live in `~/.claude/machine.md` (gitignored; copy `machine.macos.md` or `machine.windows.md` to `machine.md` on a new machine). It is imported below.

@machine.md

Both machines are active as of 2026-09-10: the MacBook (`~/DEV`) and the Baylor Windows laptop (`~/Desktop/DEV`). Projects sync through GitHub (`erash11`), documents through Google Drive. Every project repo carries a Session routine in its `AGENTS.md`: `git pull` + read `docs/STATUS.md` at start; update `STATUS.md`, commit, `git push` at end.
# Workflow Expectations

- When asked to **create, merge, or consolidate an artifact** (calendar, deck, doc), the expected deliverable is always a produced file. Verify what exists first, then create the artifact regardless — never conclude with "it already exists" instead of delivering the file.
- When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.

# Session Startup

Handled by the `keystone-unified-snapshot.js` SessionStart hook — do not read these files by hand. It injects `global-memory/USER.md`, `global-memory/MEMORY.md`, `transcripts/.errors.log` (only when non-empty), and a pointer to the KeystoneOS snapshot.

- If `.errors.log` content appears, surface it once on the first response, then continue. It is normally empty; entries mean hook failures.
- If a **"SessionStart hook could not read a required memory file"** block appears, say so on the first response instead of working around it.
- **If no `## User profile` block is in context at session start, the hook did not fire.** Say so, then read `USER.md`, `MEMORY.md` and `transcripts/.errors.log` by hand.
- What the hook injects is a frozen snapshot. Mid-session writes take effect next session. Never load more than this proactively.

# Memory — routing only

The two-tier memory system (`~/.claude/global-memory/` and `~/.claude/projects/<slug>/memory/`) is owned by the **`memory-write` skill**, which holds the tier rules, character caps, slug rules, write steps, retrieval ladder, and daily-compiled-log rules.

The active project's Tier A memory (`~/.claude/projects/<slug>/memory/`, indexed by its `MEMORY.md`) is **auto-injected by the harness** each session. Tier A files are also indexed by memsearch, so they stay recallable across projects.

- Writing a fact — "remember this", "note that", "save this", "forget about" → `Skill("memory-write")`
- Recalling past context — "did we already…?", "what did we decide about X" → `Skill("memory-write")`, retrieval-ladder section
- Daily compiled logs at `~/.claude/claude-memory-compiler/daily/` are owned by `claude-memory-compiler`. Never hand-edit them; never read them eagerly.
- **Slugs differ per machine** (Mac `-Users-kristinarash-DEV-<X>`, Windows `C--Users-eric-rash-Desktop-DEV-<X>`; both active as of 2026-09-10). Tier A written on one is not auto-injected on the other; memsearch still finds it. Durable project facts belong in the repo's `docs/` so both machines see them.

Do not restate the memory procedure in this file. It has one home, and that home is the skill.

---

`AGENTS.md` is the sibling of this file for harnesses that have no Skill tool (Codex and similar). It intentionally carries the memory rules as plain prose instead of routing to a skill. **The two files are not meant to be identical — do not "fix" the difference by symlinking them.**
