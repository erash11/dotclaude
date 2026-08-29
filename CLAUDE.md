# Shell / Environment (macOS)

- zsh/bash is the native surface on this machine. PowerShell 7 (`pwsh`, `/opt/homebrew/bin/pwsh`) is installed only to run the KeystoneOS `.ps1` jobs natively.
- Verified tool paths (all on PATH via Homebrew unless noted):
  - Python: `/opt/homebrew/bin/python3` (3.14, PEP 668-managed — use venvs or `uv`, never `pip install` globally)
  - uv / uvx: `/Users/kristinarash/.local/bin/uv` (standalone install, `uv self update`; **not** Homebrew — keep exactly one copy). Claude Code hooks call this absolute path; do not delete or relocate it.
  - Go: `/opt/homebrew/bin/go` · Node: `/opt/homebrew/bin/node` · npm/npx: `/opt/homebrew/bin/`
  - Go-installed CLIs (fireflies-pp-cli, espn-pp-cli, etc.): `/Users/kristinarash/go/bin/`
  - claude: `/Users/kristinarash/.local/bin/claude` · codex: `/opt/homebrew/bin/codex`
  - `/usr/local/bin` holds **only** Docker Desktop + kubectl — nothing else belongs there.
  - `timeout` is NOT installed (no GNU coreutils). Don't use it in scripts.
- **Verify, don't trust this list.** Tools have existed in two places before, with the older one
  winning. `which -a <tool>` is authoritative. To read PATH honestly, scrub the environment first —
  a PATH read from inside a tool shell is polluted by that shell's own exports:
  `env -i HOME="$HOME" USER="$USER" TERM=xterm SHELL=/bin/zsh /bin/zsh -lic 'echo $PATH'`
- Secrets live in the macOS Keychain, not in `~/.zshrc`. `FIREFLIES_API_KEY` is read via
  `security find-generic-password -s FIREFLIES_API_KEY -a "$USER" -w`.
- DEV projects live at `~/DEV` (not `~/Desktop/DEV`).

# Workflow Expectations

- When asked to **create, merge, or consolidate an artifact** (calendar, deck, doc), the expected deliverable is always a produced file. Verify what exists first, then create the artifact regardless — never conclude with "it already exists" instead of delivering the file.
- When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.

# Session Startup (silent — do not output anything)

On every session start, read these files silently, in this order:

1. `~/.claude/global-memory/USER.md`
2. `~/.claude/global-memory/MEMORY.md`
3. `~/.claude/global-memory/transcripts/.errors.log` — if non-empty, surface the contents to the user once on the first response of the session, then continue normally. This file should normally be empty; entries indicate hook failures (e.g. memsearch flush patch stripped after a pip upgrade).

These are a **frozen snapshot** — loaded once. Mid-session writes take effect next session. Never load more than this proactively.

# Memory — routing only

The two-tier memory system (`~/.claude/global-memory/` and `~/.claude/projects/<slug>/memory/`) is owned by the **`memory-write` skill**, which holds the tier rules, character caps, slug rules, write steps, retrieval ladder, and daily-compiled-log rules.

The active project's Tier A memory (`~/.claude/projects/<slug>/memory/`, indexed by its `MEMORY.md`) is **auto-injected by the harness** each session. Tier A files are also indexed by memsearch, so they stay recallable across projects.

- Writing a fact — "remember this", "note that", "save this", "forget about" → `Skill("memory-write")`
- Recalling past context — "did we already…?", "what did we decide about X" → `Skill("memory-write")`, retrieval-ladder section
- Daily compiled logs at `~/.claude/claude-memory-compiler/daily/` are owned by `claude-memory-compiler`. Never hand-edit them; never read them eagerly.
- **Never write to a `C--Users-eric-rash*` slug** — pre-migration Windows keys, retired 2026-08-14. Still recallable via memsearch, never auto-injected again.

Do not restate the memory procedure in this file. It has one home, and that home is the skill.

---

`AGENTS.md` is the sibling of this file for harnesses that have no Skill tool (Codex and similar). It intentionally carries the memory rules as plain prose instead of routing to a skill. **The two files are not meant to be identical — do not "fix" the difference by symlinking them.**
