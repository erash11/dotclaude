Reading additional input from stdin...
OpenAI Codex v0.166.0
--------
workdir: /Users/kristinarash/.claude/skills
model: gpt-6.1-terra
provider: openai
approval: never
sandbox: read-only
reasoning effort: medium
reasoning summaries: none
session id: 01a1924a-efed-7de1-9993-72ff06c2a34c
--------
user
Review the diff in this git repo from commit 3c37b4e~1 to 85f2aa3, limited to name-meetings/ (run: git diff 3c37b4e~1 85f2aa3 -- name-meetings/). It is an audit of a Claude Code skill that renames Fireflies meetings with generic titles. Check: (1) bugs in scripts/rename.py --pending (classification OK/FAIL/GONE/STOP, pending[] file rewrite, exit codes, rate-limit stop, malformed entries, network errors); (2) whether scripts/test_rename.py actually tests those branches; (3) whether SKILL.md steps are in run order, consistent with REFERENCE.md and with the script's real output and flags, and whether anything was lost from the old version that still matters; (4) contradictions with ~/.claude/skills/meeting-sync/SKILL.md step 2 (Unattended mode, review[] shape). Do not modify files. List findings by severity with file:line and a concrete fix.
2026-10-31T14:09:07.670712Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.context7.com/.well-known/oauth-protected-resource/mcp\"" })
warning: clamping SessionEnd hook timeout to 3s in /Users/kristinarash/.codex/hooks.json
warning: clamping SessionEnd hook timeout to 3s in /Users/kristinarash/.codex/hooks.json
warning: clamping SessionEnd hook timeout to 3s in /Users/kristinarash/.codex/plugins/cache/openai-codex/codex/1.0.6/hooks/hooks.json
hook: SessionStart
hook: SessionStart
hook: SessionStart
hook: SessionStart
hook: SessionStart
hook: SessionStart
hook: SessionStart Completed
hook: SessionStart Completed
hook: SessionStart Completed
hook: SessionStart Completed
hook: SessionStart Completed
hook: SessionStart Failed
hook: UserPromptSubmit
hook: UserPromptSubmit Failed
codex
I’ll review the diff and the related skill steps. I will not change any files.
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc 'cat ~/.claude/machine.md && cat ~/.claude/CLAUDE.md && cat ~/.claude/global-memory/transcripts/.errors.log' in /Users/kristinarash/.claude/skills
 succeeded in 0ms:
# Shell / Environment (macOS)

- zsh/bash is the native surface on this machine. PowerShell 7 (`pwsh`, `/opt/homebrew/bin/pwsh`) is installed only to run the KeystoneOS `.ps1` jobs natively.
- **The tool-path list has one home: `~/.claude/TOOLPATHS.md`.** Read that file when you need a path. Only the traps below are kept, because acting on them wrongly is expensive.
- **Verify, don't trust any list.** `which -a <tool>` is authoritative. To read PATH honestly, scrub the environment first:
  `env -i HOME="$HOME" USER="$USER" TERM=xterm SHELL=/bin/zsh /bin/zsh -lic 'echo $PATH'`
- Traps:
  - Python is PEP 668-managed. Use venvs or `uv`, never `pip install` globally.
  - `uv` is a standalone install at `~/.local/bin/uv`, **not** Homebrew. Claude Code hooks call `$HOME/.local/bin/uv`; do not delete or relocate it.
  - `timeout` is NOT installed (no GNU coreutils). Don't use it in scripts.
  - Homebrew owns `/opt/homebrew/bin`. `/usr/local/bin` holds only app CLI links (`code`, `tailscale`); keep them, add nothing else.
  - Secrets live in the macOS Keychain, not in `~/.zshrc`.
- DEV projects live at `~/DEV` (not `~/Desktop/DEV`). Workspace map: `~/DEV/CLAUDE.md`.
- Primary storage drive (documents, data, deliverables): `~/Library/CloudStorage/GoogleDrive-eric.rash11@gmail.com/My Drive/00_Primary_Storage_Drive`.
- Paths that differ from Windows:
  - SecondBrain vault: `~/SecondBrain` (Windows: `~/Desktop/SecondBrain`).
  - Workspace memory (Tier A for `DEV`): `~/.claude/projects/-Users-kristinarash-DEV/memory/`.
  - Printing-press CLIs: `~/go/bin/`.
# Machine

Machine-specific shell, paths, and traps live in `~/.claude/machine.md` (gitignored; copy `machine.macos.md` or `machine.windows.md` to `machine.md` on a new machine). It is imported below.

@machine.md

Projects sync through GitHub (`erash11`), documents through Google Drive.

**Session routine.** When working inside a project repo, follow the Session routine in its `AGENTS.md`: `git pull` and read `docs/STATUS.md` at the start; update `STATUS.md`, commit, and `git push` at the end. This keeps the cloud sessions and any other machine in step.

# Workflow Expectations

- When asked to **create, merge, or consolidate an artifact** (calendar, deck, doc), finish with the produced file in hand. Check what exists first, then build the file even when a similar one already exists.
- **Saving, moving, or backing up a file** → read `~/.claude/STORAGE.md` first. It says where each kind of file lives.
- When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.
- Skills are tools: invoke one when it clearly fits the task.
- **Writing code: climb the reuse ladder** and stop at the first rung that fully works: (1) does it need to exist at all; (2) already in this codebase, used the way the surrounding code uses it; (3) standard library or platform feature; (4) an installed dependency; (5) one line a reader gets at a glance; (6) only then, the minimum new code.
  - Read the code the change touches first, and finish every caller, test and fixture it breaks. Validation at trust boundaries, error handling that prevents data loss, and security stay in.
  - New logic with a branch, loop, parser, money or security leaves one small test or assert.
  - A shortcut with a known limit gets a comment: `shortcut: <the limit>, <when to upgrade>`.
  - End a coding reply with one or two lines: what was skipped or not checked, and any risk Eric must know. (Adapted from ponytail, 2026-10-20.)
- **Non-code work: decision rules** (Eric's answers, 2026-10-22):
  - Staff-facing writing: action first, clarity over polish, one page.
  - Coach reports and dashboards: open with the decision the report supports, then only the data for it.
  - Tools for staff: build on what Baylor already runs (Teams, Box, Excel, Teamworks).
  - Fast vs. thorough: thorough and checked for admin and supervisors; a small version first for coaches and Eric's own tools.
  - When Eric hands over a solution (from a video, or a named tool), restate the goal it serves, keep his idea on the table, and name a better fit if one exists before building.

# Session Startup

The `keystone-unified-snapshot.js` SessionStart hook injects `global-memory/USER.md`, `global-memory/MEMORY.md`, a summary of `transcripts/.errors.log` (only when non-empty), and a pointer to the KeystoneOS snapshot. Work from the injected copy.

- If hook failures appear, surface them once on the first response, then continue. Entries mean a hook or scheduled job failed.
- If a **"SessionStart hook could not read a required memory file"** block appears, say so on the first response.
- **If no `## User profile` block is in context at session start, the hook did not fire.** Say so, then read `USER.md`, `MEMORY.md` and `transcripts/.errors.log` by hand.
- The injection is a frozen snapshot: mid-session writes take effect next session. Load anything further only when a question needs it.

# Memory — routing only

The two-tier memory system (`~/.claude/global-memory/` and `~/.claude/projects/<slug>/memory/`) is owned by the **`memory-write` skill**, which holds the tier rules, character caps, slug rules, write steps, retrieval ladder, and daily-compiled-log rules.

The active project's Tier A memory (`~/.claude/projects/<slug>/memory/`, indexed by its `MEMORY.md`) is **auto-injected by the harness** each session. recall.py reads every Tier A folder, so they stay recallable across projects.

- Writing a fact — "remember this", "note that", "save this", "forget about" → `Skill("memory-write")`
- Recalling past context — "did we already…?", "what did we decide about X" → `Skill("memory-write")`, Recall section
- Daily compiled logs at `~/.claude/claude-memory-compiler/daily/` are written only by `claude-memory-compiler`. Read one only when a question needs that day.
- **Slugs are path-based** (Mac `-Users-kristinarash-DEV-<X>`). Tier A is not auto-injected in cloud sessions or on another machine; memsearch still finds it. Durable project facts belong in the repo's `docs/` so every session sees them.

---

Maintainer note: `AGENTS.md` diverges from this file on purpose (Codex has no Skill tool, so it spells out the memory rules). Keep them as separate files; the memory procedure's one home is the `memory-write` skill.

hook: PostToolUse
hook: PostToolUse Failed
codex
I’ll use the code-review skill to check the changes and their tests.
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Completed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Failed
hook: PreToolUse Failed
exec
/bin/zsh -lc 'cat ~/.claude/skills/meeting-sync/SKILL.md' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat /Users/kristinarash/.agents/skills/code-review/SKILL.md' in /Users/kristinarash/.claude/skills
 succeeded in 0ms:
---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/PRD asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / PRD / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

The issue tracker should have been provided to you — run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` is missing.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here — not inside two parallel sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.) — fetch via the workflow in `docs/agents/issue-tracker.md`.
2. A path the user passed as an argument.
3. A PRD/spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Send a single message with two `Agent` tool calls. Use the `general-purpose` subagent for both.

**Standards sub-agent prompt** — include:

- The full diff command and commit list.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full — the sub-agent has no other access to it.
- The brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls — documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** — include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings — the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.

 succeeded in 0ms:
---
name: meeting-sync
description: >-
  Engine that turns Fireflies transcripts into SecondBrain meeting notes: renames
  generic titles, exports new meetings, tags each note with its portfolio project.
  Use when the user says "/meeting-sync", or when invoked by weekly-review or
  fireflies-intake. Also for filename drift: "are any meeting files misnamed?", "audit
  the meeting filenames". Do not use for "ingest my meetings" requests (use
  fireflies-intake), renaming titles by hand (use name-meetings), or searching what was
  said (use pp-fireflies).
argument-hint: "[days-back]"
---

# Meeting Sync

One vault note per meeting at `Inbox/meetings/YYYY-MM-DD_<title>.md`, tagged with its project.

**Two exporters share one ledger.** The KeystoneOS 06:00 job (`keystone.ps1 meeting-sync`) exports every new meeting that has a real title, with its own header and keyword tags. It holds generic titles back for 7 days, then exports them as they are. So this skill's work is: rename and export the generic ones, then add the Jev project tag to every note in the window. Both write `.sync-state.json`, so a meeting either one exported is done for both.

Paths (`vault_inbox_meetings`, `meeting_sync_state_file`, `meeting_lookback_days`, default 14) live in `~/.claude/skills/_shared/config.<platform>.json`; the scripts read them. Below, `S=~/.claude/skills/meeting-sync/scripts`.

## Steps

1. **List pending.** `python3 $S/sync.py --list-only [--days-back N]` checks auth, refreshes the Fireflies DB, and prints `[{"id","title","date"}]` for transcripts not in the ledger. Its stderr line "N transcripts in last D days; M not yet exported" goes in the report. Exit 4 is auth: give the **Auth** message and stop. Exit 3: report stderr verbatim and stop. Other codes are in the script's docstring.
2. **Rename generic titles.** Check each pending title against `~/.claude/skills/name-meetings/REFERENCE.md` → Generic-title patterns. If any match, invoke `name-meetings` in **Unattended mode** (declare it), scoped to those ids: HIGH-confidence renames are applied, the rest go to `review[]` in the pending-renames file. Then re-run step 1.
3. **Export.** `python3 $S/sync.py --no-sync [--days-back N]` prints the new file paths. A meeting still generic after step 2 exports as it is and is named in the report.
4. **Add the header** to each step 3 path: prepend `~/.claude/skills/meeting-sync/assets/meeting-header.md` verbatim at the top. The Fireflies content below stays as it is. Notes from the 06:00 job already carry their own header.
5. **Tag the window.** Pass every note dated in the window, from both exporters, to the tagger (with `--days-back N`, use N for the 14):
   ```bash
   python3 -c "import glob,json,os,datetime as d; v=json.load(open(os.path.expanduser('~/.claude/skills/_shared/config.macos.json')))['vault_inbox_meetings']; cut=(d.date.today()-d.timedelta(days=14)).isoformat(); print('\0'.join(p for p in sorted(glob.glob(v+'/20*.md')) if os.path.basename(p)[:10]>=cut), end='')" | xargs -0 python3 $S/tag_project.py
   ```
   It skips notes that already hold a `<!-- jev-project:` marker or have no `## Project tags` header. For the rest it sends the Fireflies summary to TypeSafe's Jev (the flow Eric set up 2026-09-22), adds `- project/<PortfolioName>` when Jev is confident (≥ 0.60), and always writes one marker line. No key, no network or no transcript leaves a note untagged: relay each `WARNING` and `skip` line.
6. **Report**, three lines: transcripts in the window, new exports and notes tagged; renames applied, queued for review, and any still-generic titles; the path `Inbox/meetings/`. With nothing new and nothing to tag: "No new meetings since last sync."

**Done when** every transcript in the window is in the ledger or named as a failed export, every note in the window has a `jev-project` marker or a relayed `WARNING` or `skip` line, and the report names every generic title left.

## Auth

Auth is the `FIREFLIES_API_KEY` environment variable. On exit 4, stop and tell the user:

> Fireflies isn't authenticated yet. On the Mac, store the key in the Keychain with `security add-generic-password -U -s FIREFLIES_API_KEY -a "$USER" -w` (it prompts for the key; `~/.zshrc` exports it). Then open a new terminal. After that, `/meeting-sync` will work.

The key comes only from that env var (the Keychain on the Mac).

## The scripts

Each script's docstring is its reference; read it before changing the script. `sync.py` runs the whole export pipeline and prints a `WARNING` line for a failed export or a rebuilt ledger: relay each one.

## Filename drift audit

Weekly, from weekly-review, or when asked whether meeting files are misnamed: follow `DRIFT.md` (beside this file).

hook: PostToolUse
hook: PostToolUse
exec
/bin/zsh -lc 'git diff 3c37b4e~1 85f2aa3 -- name-meetings/' in /Users/kristinarash/.claude/skills
 succeeded in 0ms:
diff --git a/name-meetings/REFERENCE.md b/name-meetings/REFERENCE.md
index 4541c7a..79f8b2f 100644
--- a/name-meetings/REFERENCE.md
+++ b/name-meetings/REFERENCE.md
@@ -1,123 +1,95 @@
 # Name Meetings — Reference
 
-## Contents
+Read the section a step in `SKILL.md` names.
 
-- Resume mode — full loop
+- Pending-renames file
 - Generic-title patterns
 - Title construction rules
+- Unattended mode
 - CLI gotchas
 - Why renames bypass the CLI and MCP
-- Rate limits and the retry ledger
-- Unattended mode
 
-Detail split out of `SKILL.md`. Read the section you need; don't load the whole file.
+## Pending-renames file
 
-## Resume mode — full loop
+Path: `pending_renames_file` in `~/.claude/skills/_shared/config.<platform>.json`. Two arrays:
 
-Pending-renames file: `pending_renames_file` in `~/.claude/skills/_shared/config.<platform>.json`.
+- `pending[]`: approved renames, `{"id": "<meetingId>", "title": "<title>"}` (`meetingId` is accepted for `id`). `rename.py --pending` applies them without asking, so only approved titles, and only failures that could succeed later, belong here. The script itself drops the permanent ones (`GONE`) and leaves the rest of the batch queued when it hits a rate limit (`STOP`).
+- `review[]`: proposed but not approved, `{"meetingId", "current_title", "proposed_title", "reason"}`. Written by Unattended mode (here or from meeting-sync); each entry goes through the step 5 approval table before it can move to `pending[]`.
 
-Two arrays:
-- `pending[]` — approved renames awaiting apply (rate-limit leftovers, safe to auto-apply)
-- `review[]` — proposed but never approved (written by Unattended mode); these must go through the approval flow, never auto-apply
-
-If `pending[]` has entries:
-1. Tell the user: *"Found N pending renames from a prior run that hit the rate limit. Resuming."*
-2. Run `python3 ~/.claude/skills/name-meetings/scripts/rename.py --pending`. It applies every entry, verifies each by read-back, prunes the ones that verified, and re-writes the file itself.
-3. Spacing is handled inside the script — do not fan these out yourself.
-4. Entries that verified are already removed from `pending[]`; anything printed `FAIL` stays queued for the next run.
-5. On rate-limit error: keep remaining entries, report status, exit.
-6. When `pending[]` is empty: if `review[]` has entries, present them through the normal approval flow first. When both are empty — delete the file, run the step-6 re-sync, and tell the user the resume is complete.
+Read the file before writing it and keep what it holds: another run may have queued entries.
 
 ## Generic-title patterns
 
 A title is generic if it matches any of these (case-insensitive):
 
-- Empty or whitespace-only
-- Exactly: `Meeting`, `Call`, `Recording`, `Zoom Meeting`, `Microsoft Teams Meeting`, `Google Meet`, `Teams Meeting`, `Untitled`
-- A date or timestamp and **nothing else**: `2026-05-20`, `MM/DD/YYYY`, `Meeting YYYY-MM-DD`, `Jul 29, 10:49 AM`, `Mar 02, 03:32 PM`
+- Empty, whitespace-only, or under 5 characters
+- Exactly: `Meeting`, `Call`, `Recording`, `Zoom Meeting`, `Microsoft Teams Meeting`, `Google Meet`, `Teams Meeting`, `Untitled`, `Meeting on`, `Call with`
+- A date or timestamp and **nothing else**: `2026-05-20`, `MM/DD/YYYY`, `Meeting YYYY-MM-DD`, `Oct 29, 09:44 AM` (the Fireflies default for a phone or web recording, and the most common case)
 - The user's own email plus a timestamp: `eric.rash11@gmail.com - Tue, 28 Jul 2026 10:16:54 CDT - Untitled`
 - Just a participant count: `2 people`, `3 attendees`
-- Generic prefix with nothing distinctive after: `Zoom Meeting`, `Teams Meeting`, `Google Meet`, `Meeting on`, `Call with`
-- Length under 5 characters
-
-Anything else is curated. Leave it alone.
 
-### Not generic — do not touch
+Anything else is curated: leave it as it is. The test is whether **anything survives removing the date**:
 
-**A date *prefix* followed by content is the user's own naming convention**, matching the `YYYY-MM-DD_` filenames in the vault. These are curated:
-
-`2026-01-30_BAIR_Steering_Approval` · `2025-01-30_Marc_Lewis_Texans` · `2026-05-14_Applied_Planning` · `2025-12-19_KB_1v1` · `2026-01-09_SprintAI_Meeting`
-
-A naive `^\d{4}-\d{2}-\d{2}` match flags all of them. On 2026-07-30 that over-matched 19 curated titles out of 23 flagged — renaming them would have violated *curated titles are sacred*. The test is whether **anything survives removing the date**: `2026-01-09_SprintAI_Meeting` → `SprintAI_Meeting` is a real title, so it's curated. `Jul 29, 10:49 AM` → nothing, so it's generic. Note the word `Meeting` inside an otherwise descriptive title does not make it generic.
+- `Oct 29, 09:44 AM` → nothing left → generic.
+- `StaffMeet_10222026` → `StaffMeet` → curated. Eric's recurring series carry a date suffix (`SA_Leadership_10192026`, `KB_TechSync_10282026`).
+- `2026-01-30_BAIR_Steering_Approval` → `BAIR_Steering_Approval` → curated. A naive `^\d{4}-\d{2}-\d{2}` match flagged 19 curated titles out of 23 on 2026-07-30.
+- The word `Meeting` inside an otherwise descriptive title (`2026-01-09_SprintAI_Meeting`) is still curated.
 
 ## Title construction rules
 
-Format: `<context-or-participants> — <topic>`
-
-- Under **60 characters total**, and count it — a shared prefix eats the budget fast (`Baylor Performance Clinic — ` is 28 characters on its own)
-- Em dash (`—`) between context and topic, not a hyphen
-- **Context priority:**
-  1. 1-on-1 (2 participants incl. user) → other person's first name (`Sarah`, or `1on1 with Sarah` if recurring)
-  2. Small group (3–5) → first names joined with `&` (`Eric & John & Sarah`)
-  3. Large group (6+) → a context label inferred from the topic: `Internal`, `Client — <name>`, `Team Sync`, `Standup`
-- **Topic:** distill the gist to 3–6 words. Nouns and concrete action; drop filler.
-- **Forbidden words:** `meeting`, `call`, `discussion`, `sync`, `conversation`, `chat`. Exception: `1on1`, `Standup`, `Team Sync` as context labels.
-- **No date** — filenames already carry the `YYYY-MM-DD_` prefix.
-- **Fireflies strips some punctuation.** A `/` is dropped silently: `Book — Coach/Practitioner Collaboration` came back as `Book — Coach Practitioner Collaboration`. Prefer `&` or a plain space, and report the change if it happens.
-
-**Good:** `Sarah — Q2 Career Path` · `Eric & John — ForcePlate v2 Scope` · `Catapult Support — JWT Auth Issue` · `Client — Baylor Spring Football Reporting`
+**1. Recurring series first.** If the step 3 list holds curated `Series_MMDDYYYY` titles for the same kind of meeting (same weekday and time slot, same kind of topic), propose that series name with this meeting's date: `StaffMeet_10292026`. On 2026-10-24 Eric picked `StaffMeet_10222026` over the topic title `AP Staff — Olympic Sports, Facilities & Holidays`. When the match is a guess, show both titles in the table.
 
-**Bad:** `Meeting with Sarah about career stuff` (drop the verb and the filler) · `2026-05-20 Sync` (date is in the filename) · `Important discussion` (no specifics → propose `[skip — gist too vague]`)
+**2. Otherwise, a topic title:** `<context> — <topic>`, under **60 characters** (count it; a shared prefix like `Baylor Performance Clinic — ` is 28 on its own), em dash (`—`) between the parts, no date (the vault filename already starts with one).
 
-### Grouping a multi-session event
-
-When several recordings come from one event (a clinic, a conference, a webinar series), offer a shared prefix so they sort together: `<Event> — <topic>`. Ask the user what the event was rather than guessing. Budget the prefix against the 60-char cap and trim topics — dropping speaker names is usually the right trade, since they survive in the file body and action items.
-
-## CLI gotchas
+- **Context**: the people, from the step 3 `speakers` names other than Eric: one person → first name (`Sarah`); 2–4 → first names joined with `&`; more → a label from the topic (`Research Council`, `Client — <name>`, `Team`). `participants` is not usable: it is Eric alone on 240 of 244 transcripts, and `speakers` is empty on about 60%. With no names, take the label from the topic. Speaker names inside the summary's `action_items` can be wrong (`Eric Rasch`); trust `speakers`.
+- **Topic**: the gist in 3–6 words, nouns and concrete actions.
+- **Banned words** in the topic: `meeting`, `call`, `discussion`, `sync`, `conversation`, `chat` (`1on1`, `Standup` and `Team Sync` are fine as context labels).
+- **Punctuation**: Fireflies drops `/` silently (`Coach/Practitioner` came back `Coach Practitioner`). Use `&` or a space, and report any change.
 
-### `sync` must be `--full` for title edits
+**Good:** `Sarah — Q2 Career Path` · `Kenny — ForcePlate v2 Scope` · `Catapult Support — JWT Auth Issue` · `Research Council — Faculty Collaborator Outreach`
 
-`fireflies-pp-cli sync --agent` advances an incremental cursor and only fetches transcripts it hasn't seen. A **title edit on an already-synced transcript is invisible to it** — it exits 0 and reports `{"event":"sync_complete","resource":"transcripts","total":0}`, which reads like success.
+**Bad:** `Meeting with Sarah about career stuff` (filler, banned word) · `2026-05-20 Sync` (date, banned word) · `Important discussion` (nothing specific: propose `[skip — gist too vague]`)
 
-Confirmed live 2026-07-30: nine renames applied cleanly to Fireflies; plain sync reported `total: 0` twice; `transcripts find` still returned all nine *old* titles until `sync --full --resources transcripts` pulled 187 transcripts and the new titles appeared.
-
-A `total: 0` on transcripts is the tell that the cursor short-circuited. Always verify by re-running `transcripts find`, never by reading the exit code.
-
-### A stale DB hides candidates
+### Grouping a multi-session event
 
-The same cursor makes step 1's `find` under-report. On 2026-07-30 the incremental DB returned 15 transcripts; a full sync returned 17, surfacing two generic-titled meetings that were never in the candidate list. This is why step 1 also uses `--full`.
+When several recordings come from one event (a clinic, a conference, a webinar series), offer a shared prefix so they sort together: `<Event> — <topic>`. Ask Eric what the event was. Budget the prefix against the 60-character cap and trim topics; dropping speaker names is usually the right trade, since they survive in the note body.
 
-### `find` truncates at 100
+## Unattended mode
 
-`transcripts find` defaults to `--limit 100`. Pass `--limit 100000` for any backfill. (`meeting-sync`'s `sync.py` already does this — don't remove that flag there either.)
+Replaces step 5's approval when a calling skill declares it (meeting-sync, step 2). A row passes the confidence gate only when all of these hold:
 
-### Deleted transcripts linger in the local DB
+- the summary was retrieved and its gist is specific;
+- the title follows the construction rules with no guess about who was there or which event it was: either a clear recurring-series match (weekday, time slot and topic all fit), or named `speakers`;
+- you would defend the title to Eric without hedging.
 
-**`sync --full` does not prune transcripts deleted from the Fireflies cloud.** The local SQLite DB keeps them, so `transcripts find` lists meetings that no longer exist — ghosts. Renaming one fails with `GraphQL error: Transcript not found`, which is *literally accurate*: it really is gone.
+Rows that pass go to `pending[]` and are applied in step 6. Every other row is appended to `review[]` with its `reason`. Report both: "K applied (high confidence), R queued for review".
 
-Observed 2026-07-30. Four meetings surfaced by an all-time `find` all failed to rename; the user confirmed they had been deleted from the platform and are not on the web anymore. A `sync --full` immediately afterward pulled 187 transcripts and the four ghosts were still in `find` output.
+## CLI gotchas
 
-**Reads cannot be trusted to confirm existence.** `transcripts get` returned complete data for all four under **both** `--data-source live` and `--data-source local`. A genuinely unknown ID returns `[]` under `live`, so the live path does execute — but for an ID with a local row, the read still produced data. Whether that's a silent local fallback or the API serving soft-deleted records is **unresolved**. Either way: a successful read does not prove a transcript still exists.
+### `sync` must be `--full`
 
-**The only reliable existence signal is the write itself.** `Transcript not found` from `rename.py` means gone. Treat it as permanent and report it — no UI workaround exists, because there's nothing left to rename.
+`fireflies-pp-cli sync --agent` advances an incremental cursor and only fetches transcripts it has not seen, so a title edit on an already-synced transcript is invisible to it. It exits 0 and reports `{"event":"sync_complete","resource":"transcripts","total":0}`, which reads like success. Confirmed 2026-07-30: nine renames applied in Fireflies, plain sync reported `total: 0` twice, and `find` showed the old titles until `sync --full --resources transcripts` ran.
 
-**Do not infer an age rule.** The first read of this evidence was that Fireflies closes a title-edit window on old meetings (~30 days), since the four failures were 44–192 days old and 13 same-day successes were ≤20 days. That was **wrong** — age correlated only because the deleted meetings happened to be the old ones. Don't skip renames based on age.
+The same cursor makes a candidate list stale: on 2026-07-30 the incremental DB listed 15 transcripts, a full sync 17, and the two new ones were generic.
 
-### `transcripts update` GraphQL bug — regressed, and the old fallback is unsafe
+### `find` output
 
-Patched locally 2026-07-22 (upstream PR mvanhorn/printing-press-library#1571, **never merged**). The binary was rebuilt 2026-08-05, which wiped the local patch, and the bug was live again by 2026-08-29. Expect this to recur on every reinstall until the PR merges.
+- Default `--limit` is 100; pass `--limit 100000`. (meeting-sync's `sync.py` passes it too.)
+- `--agent` implies `--compact`, which keeps only `id` and `title`: no `dateString`, `speakers` or `summary`. Use `--json --no-input` when you need them.
+- `--json` emits a bare JSON array, not an envelope.
+- `dateString` is UTC (`...Z`); convert to local before showing a date. An evening meeting is the next day in UTC.
 
-⚠️ **The fallback this section used to recommend — the Fireflies MCP tool — is not safe.** It returns `success: true` without reliably writing, and delayed writes can land much later and clobber a good title. See [Why renames bypass the CLI and MCP](#why-renames-bypass-the-cli-and-mcp).
+### Deleted transcripts linger in the local DB
 
-Use `scripts/rename.py` instead. It does not depend on the CLI build at all, so a reinstall cannot regress it.
+`sync --full` does not prune transcripts deleted from the Fireflies cloud, so `find` lists ghosts. On 2026-10-31 a full sync fetched 157 transcripts while an all-time `find` listed 244. Renaming a ghost fails with `GraphQL error: Transcript not found`, which is literally true, and `rename.py` reports it as `GONE`.
 
-### Harness blocks foreground sleeps
+Reads cannot confirm existence: `transcripts get` returned full data for four deleted meetings under both `--data-source live` and `local` (2026-07-30). Whether that is a local fallback or the API serving soft-deleted records is unresolved. The write is the only reliable signal.
 
-Claude Code refuses foreground `sleep` / `Start-Sleep`. If the 30s inter-batch pause is blocked, do **not** chain shorter sleeps to work around it — apply the remaining batches sequentially, say so in the report, and rely on the 429 handling. Nine renames in one run stayed well inside the quota on 2026-07-30.
+Age is not a signal either. Those four were 44–192 days old and the successes that day were 20 days old or less, which first read as a title-edit window closing on old meetings; Eric confirmed the four had been deleted. Keep old candidates.
 
 ## Why renames bypass the CLI and MCP
 
-Diagnosed 2026-08-29, after a 45-minute misdiagnosis. Both obvious paths are broken, and one of them lies about it.
+Diagnosed 2026-08-29, after a 45-minute misdiagnosis.
 
 **`fireflies-pp-cli transcripts update` always fails.** It passes the id as a bare field argument; the schema takes one input object:
 
@@ -126,42 +98,8 @@ CLI sends: updateMeetingTitle(id: ..., title: ...)
 API wants: updateMeetingTitle(input: {id: ..., title: ...})
 ```
 
-Every call returns `HTTP 400 ... Unknown argument "id" on field "Mutation.updateMeetingTitle"`. The field name really is `id` — a direct call using `meetingId` is rejected with `Field "UpdateMeetingTitleInput.id" of required type "String!" was not provided`. The *shape* is wrong, not the field name; do not "fix" it by renaming the field. There is no Fireflies manuscript on this machine (`~/printing-press/manuscripts` holds only catapult and zotero), so the CLI cannot currently be regenerated.
-
-**The MCP tool `fireflies_update_meeting_title` returns `success: true` without reliably writing.** Its success flag carries no information. Observed in one run: 2 of 7 renames landed promptly, 5 had not landed after 8 minutes of polling, and one diagnostic write surfaced ~20–30 minutes later. **Writes are erratically delayed, not dropped** — so a rename you believe failed can still land an hour later and clobber a good title.
-
-Two rules follow:
-- Never send a throwaway "test" title through MCP. Late arrival makes the probe destructive.
-- Never treat a mutation's own response as proof. Only a read-back proves a write.
-
-**Use `scripts/rename.py`.** It calls the API directly and verifies every write by reading the title back, so it cannot report a silent failure as success. `--check <id>` reads a live title without writing.
-
-## Rate limits and the retry ledger
-
-Fireflies documents a hard daily rate limit — but **do not reach for it as an explanation first.** The 2026-08-29 incident looked exactly like rate limiting (writes accepted, nothing persisting) and was entirely the broken MCP path above. A real rate limit surfaces as an explicit `429` / `MCP error -32429`, not as silence.
-
-- Apply in batches of 5–7 in parallel, 30s between batches
-- On a rate-limit error (CLI GraphQL 429, or `MCP error -32429: Rate limit exceeded`) stop immediately and persist the remaining items to `pending[]` in the pending-renames file
-
-### Transient vs permanent — classify before queuing
-
-`pending[]` is auto-applied by Resume mode without asking. That makes it **only** safe for failures that could plausibly succeed later. Putting a permanent failure there creates a loop: every future run retries it, fails, and re-queues it.
-
-| Class | Examples | Action |
-|---|---|---|
-| **Transient** | timeout, blocked call, connection reset, 5xx, `MCP error -32429` | Retry once → `pending[]` |
-| **Permanent** | `Transcript not found` — the transcript was deleted from Fireflies; or a title under 5 / over 256 chars | **Never queue.** Report as gone, with the reason |
-| **Transient** | `read-back mismatch` from `rename.py` — the write did not land | Retry once → `pending[]` |
-
-Never leave a *transient* failure with only an inline mention — a "20/22 renamed" run must end with the 2 failures persisted so Resume mode retries them. But a permanent failure belongs in the report, not the ledger. On 2026-07-30 four `Transcript not found` failures were deliberately left unqueued for exactly this reason.
-
-## Unattended mode
-
-Only for orchestrating skills that explicitly declare unattended operation (`meeting-sync` does, in its step 2). The interactive approval flow is replaced by a confidence gate:
+Every call returns `HTTP 400 ... Unknown argument "id" on field "Mutation.updateMeetingTitle"`. The field really is `id` (a call with `meetingId` is rejected with `Field "UpdateMeetingTitleInput.id" of required type "String!" was not provided`); the shape is what is wrong. A local patch (upstream PR mvanhorn/printing-press-library#1571, never merged) was lost when the binary was rebuilt 2026-08-05. There is no Fireflies manuscript on this machine, so the CLI cannot be regenerated.
 
-- **Apply without approval only HIGH-confidence renames.** HIGH-confidence means all of: gist retrieved and specific, participants known, title follows the construction rules with no guessing.
-- **Everything else** — vague gist, missing summary, ambiguous context, anything you'd hesitate to defend — goes to `review[]` as `{meetingId, current_title, proposed_title, reason}` for later interactive review via Resume mode. Do not apply it.
-- Report both buckets: "K applied (high confidence), R queued for review in .pending-renames.json".
-- Rate-limit strategy and `pending[]` persistence apply unchanged.
+**The MCP tool `fireflies_update_meeting_title` returns `success: true` without reliably writing.** In one run 2 of 7 renames landed promptly, 5 had not landed after 8 minutes, and one diagnostic write surfaced 20–30 minutes later. Writes are delayed erratically, not dropped, so a rename that looks failed can still land an hour later and clobber a good title. It looked exactly like a rate limit and was not one: a real rate limit arrives as an explicit HTTP 429 / `too_many_requests`, which `rename.py` reports as `STOP`.
 
-This is the only sanctioned exception to the approval rule.
+`rename.py` posts the mutation straight to `https://api.fireflies.ai/graphql` and reads the title back; only a read-back proves a write. `python3 rename.py --check <id>` reads a live title with no write, the safe probe for any diagnosis.
diff --git a/name-meetings/SKILL.md b/name-meetings/SKILL.md
index f5a34b0..378d4c5 100644
--- a/name-meetings/SKILL.md
+++ b/name-meetings/SKILL.md
@@ -1,129 +1,71 @@
 ---
 name: name-meetings
 description: >-
-  Detects Fireflies meetings with generic titles (empty, "Zoom Meeting", "Recording",
-  date-only, etc.), proposes structured names based on AI summary + participants, and
-  applies approved renames via the Fireflies API. Use when user says "/name-meetings",
-  "name my meetings", "rename untitled meetings", "fix meeting titles", "my meetings
-  have no names", or when invoked by meeting-sync. Do not use to sync transcripts or
+  Renames Fireflies meetings with generic titles ("Oct 29, 09:44 AM", "Zoom Meeting",
+  empty): proposes names from the AI summary and applies the approved ones via the
+  Fireflies API. Use when the user says "/name-meetings", "name my meetings" or "fix
+  meeting titles", or when meeting-sync invokes it. Do not use to sync transcripts or
   audit vault filenames (use meeting-sync).
 argument-hint: "[days-back]"
 ---
 
 # Name Meetings
 
-The user does not name their Fireflies meetings. Without names, exported filenames are useless for retrieval (`2026-05-20_meeting.md`). This skill proposes structured titles from existing AI summaries and applies them via `scripts/rename.py`, which writes back to Fireflies as source-of-truth and verifies each write by read-back.
+Eric does not name most Fireflies recordings, and an unnamed one exports to the vault as `2026-10-29_Oct_29_0944_AM.md`. This skill finds generic titles, proposes real ones from the AI summary, and writes the approved ones back to Fireflies, the source of truth. `scripts/rename.py` is the only write path: it verifies every write by reading the title back (the CLI and the MCP rename tools are broken; [REFERENCE.md → Why renames bypass the CLI and MCP](REFERENCE.md#why-renames-bypass-the-cli-and-mcp)).
 
-Detail lives in [REFERENCE.md](REFERENCE.md) — load the section you need, not the whole file.
+Detail lives in [REFERENCE.md](REFERENCE.md); load only the section a step names. Below, `R=~/.claude/skills/name-meetings/scripts/rename.py`.
 
-## Prerequisite
+## Steps
 
-Auth is the `FIREFLIES_API_KEY` env var (see `pp-fireflies` → Auth Setup; do not use `auth set-token`). Verify:
+1. **Auth.** `fireflies-pp-cli doctor --agent` must show `"auth": "configured"`. Otherwise stop and give Eric the fix from `pp-fireflies` → Auth Setup.
 
-```bash
-fireflies-pp-cli doctor --agent
-```
+2. **Resume the ledger.** The pending-renames file is `pending_renames_file` in `~/.claude/skills/_shared/config.<platform>.json` ([REFERENCE.md → Pending-renames file](REFERENCE.md#pending-renames-file)). If `pending[]` has entries, they are already approved: say "Resuming N pending renames" and run `python3 $R --pending` (step 6 explains its output). Entries in `review[]` join the step 5 table as candidates; in Unattended mode they stay where they are.
 
-If the JSON does not show `"auth": "configured"`, halt and tell the user:
-> Fireflies isn't authenticated. On the Mac, store the key in the Keychain with `security add-generic-password -U -s FIREFLIES_API_KEY -a "$USER" -w` (it prompts for the key; `~/.zshrc` exports it); on Windows, set it under System Properties → Environment Variables. Then open a new terminal.
+3. **List the window.** Refresh the local DB in full, then list id, local date, title and speakers:
 
-## Resume mode — check this FIRST
+   ```bash
+   fireflies-pp-cli sync --full --resources transcripts --agent
+   fireflies-pp-cli transcripts find --from 30 --processed-only --limit 100000 --json --no-input \
+     | python3 -c 'import json,sys,datetime as D
+   for x in json.load(sys.stdin):
+       t = D.datetime.fromisoformat(x["dateString"].replace("Z", "+00:00")).astimezone()
+       print(x["id"], t.strftime("%Y-%m-%d %H:%M"), json.dumps(x["title"]), "speakers=" + ",".join(s["name"] for s in x.get("speakers") or []))'
+   ```
 
-Before anything else, check the pending-renames file (`pending_renames_file` in `~/.claude/skills/_shared/config.<platform>.json`). If `pending[]` has entries, tell the user you're resuming and apply them; if only `review[]` has entries, run them through the approval flow. In **Unattended mode**, apply `pending[]` (already approved), leave `review[]` for a later interactive run, and go on to the flow. Full loop: [REFERENCE.md → Resume mode](REFERENCE.md#resume-mode--full-loop).
+   Change `--from` when Eric names a window ("last 60 days"); without it `find` covers all time, which is slow to rename. When meeting-sync passes ids, keep only those. The flags each fix a trap ([REFERENCE.md → CLI gotchas](REFERENCE.md#cli-gotchas)): `--full` so the list is current, `--limit 100000` past the default 100, and no `--agent`, whose compact output drops the date and speakers.
 
-Only proceed to the flow below if the file is absent or both arrays are empty.
+4. **Detect generics.** Match each title against [REFERENCE.md → Generic-title patterns](REFERENCE.md#generic-title-patterns). Every other title is curated and stays as it is, including Eric's `Series_MMDDYYYY` names (`StaffMeet_10222026`).
 
-## Flow
+   The list can hold **ghosts**: meetings deleted from Fireflies that `sync --full` never prunes. Nothing in a read tells them apart, so keep every candidate regardless of age; the write in step 6 reports a ghost as `GONE` ([REFERENCE.md → Deleted transcripts](REFERENCE.md#deleted-transcripts-linger-in-the-local-db)).
 
-### 1. Refresh and list candidates
+5. **Propose, then approve.** For each candidate read the summary first:
 
-```bash
-fireflies-pp-cli sync --full --resources transcripts --agent
-fireflies-pp-cli transcripts find --from 30 --processed-only --limit 100000 --json --agent
-```
+   ```bash
+   fireflies-pp-cli summary <id> --format gist --json --agent
+   ```
 
-`--full` is required: an incremental sync leaves the DB stale and `find` then under-reports candidates. `--limit 100000` overrides the CLI default of 100. See [REFERENCE.md → CLI gotchas](REFERENCE.md#cli-gotchas).
+   Build the title from the gist, keywords, overview and the step 3 speakers, by [REFERENCE.md → Title construction rules](REFERENCE.md#title-construction-rules). A meeting in one of Eric's recurring series takes the series name; a gist too vague to name gets `[skip — gist too vague]`, for Eric to name in the Fireflies UI. When several candidates come from one event, ask Eric what the event was and offer a shared prefix.
 
-Default lookback is 30 days. Adjust `--from` if the user says "last 60 days" / "all meetings" (omitting it means all-time — warn that high-volume rename is slow).
+   Show a table `# | Date | Current | Proposed | Action` (`✓` apply, `—` skip), then `AskUserQuestion` "How should I apply these renames?" with **Approve all / Edit rows / Apply subset / Cancel**. Edit rows: ask which rows and what titles, then confirm the revised table. Apply subset: ask which rows ("1,3,5", "skip 2,4"). Cancel: end the run with nothing applied.
 
-### 2. Detect generics, then check they're editable
+6. **Apply.** Add each approved row to `pending[]` as `{"id": "<meetingId>", "title": "<title>"}`, keeping what the file already holds and removing any `review[]` entry for that id, then run `python3 $R --pending`. It spaces the writes, verifies each by read-back and rewrites the file. Read its lines, never just the exit code:
+   - `OK` verified; gone from `pending[]`.
+   - `FAIL` transient (timeout, 5xx, read-back mismatch); stays in `pending[]` for the next run.
+   - `GONE` permanent (`Transcript not found`, a title under 5 or over 256 characters, a malformed entry); dropped. Report it as unrenamable, with the reason.
+   - `STOP` rate limited; the rest stay in `pending[]`. Report applied vs left, and skip to step 8.
 
-Match each title against the patterns in [REFERENCE.md → Generic-title patterns](REFERENCE.md#generic-title-patterns). Skip everything else — **don't rename what the user has already curated.** A date *prefix* followed by content (`2026-01-30_BAIR_Steering_Approval`) is curated; only date-and-time-*only* titles are generic.
+   When both arrays are empty afterwards, delete the file.
 
-**Expect ghosts.** `sync --full` doesn't prune transcripts deleted from the Fireflies cloud, so `find` can list meetings that no longer exist. They fail at step 5 with `Transcript not found` — literally true, and permanent. Reads don't detect them (`transcripts get` returns full data for a deleted transcript on both `live` and `local`), so you can't pre-filter; the write is the only reliable signal. Don't skip candidates by age — see [REFERENCE.md → Deleted transcripts](REFERENCE.md#deleted-transcripts-linger-in-the-local-db).
+7. **Wait, re-sync, verify.** Fireflies' list endpoint (what `sync` and `find` read) lags the single-transcript endpoint `rename.py` verifies against by minutes. Run `sleep 270` as a background Bash job, then `fireflies-pp-cli sync --full --resources transcripts --agent` and the step 3 list again, and confirm each new title. A title still old after the wait means more lag: wait and re-sync once more. The rename already verified, so the fix is waiting; a second rename can clobber a good title.
+   - A plain `sync` (no `--full`) never picks up title edits yet exits 0 with `total: 0`; the re-run list is the proof.
+   - If the sync fails twice, the renames still stand in Fireflies; only the local DB is stale. Say so and give the command: `fireflies-pp-cli sync --full --resources transcripts --agent`.
+   - Generics you never proposed mean the step 3 DB was stale: name them and offer a second pass.
+   - A renamed meeting already in the vault (its id is in meeting-sync's `.sync-state.json`) keeps its generic filename; re-export makes a second file. Name it in the report and point to meeting-sync's filename drift audit (`DRIFT.md`).
 
-### 3. Propose titles
+8. **Report**, 3–5 lines: N scanned / M generic · K applied · F left in `pending[]` (next run resumes) · G gone · S skipped for manual naming · re-sync status (verified, or the stale-DB warning) · vault files left with a generic name.
 
-For each candidate, pull the content before proposing anything:
-
-```bash
-fireflies-pp-cli summary <id> --format gist --json --agent
-```
-
-The gist, keywords, overview, and the speaker names in `action_items` are enough to build a title. Follow [REFERENCE.md → Title construction rules](REFERENCE.md#title-construction-rules). If the gist is too vague, propose `[skip — gist too vague]` and tell the user it needs manual naming in the Fireflies UI.
-
-If several candidates come from one event, offer a shared prefix so they group — ask what the event was rather than guessing.
-
-### 4. Present batch for approval
-
-Display a markdown table with columns `# | Date | Current | Proposed | Action` (`✓` to apply, `—` to skip). Then `AskUserQuestion`: "How should I apply these renames?" with **[Approve all / Edit rows / Apply subset / Cancel]**:
-
-- **Approve all** → apply all non-skipped rows
-- **Edit rows** → ask which rows and what titles, confirm the revised table, then apply
-- **Apply subset** → ask which rows ("1,3,5" / "rows 1-2" / "skip 2,4"), apply only those
-- **Cancel** → exit without applying
-
-### 5. Apply approved renames
-
-```bash
-python3 ~/.claude/skills/name-meetings/scripts/rename.py <id> "<new title>"
-```
-
-**Never use `fireflies-pp-cli transcripts update`, and never use the Fireflies MCP tool `fireflies_update_meeting_title`.** Both are broken, and the MCP one lies — it returns `success: true` without reliably writing. `scripts/rename.py` calls the API directly and **verifies every write by reading the title back**, so it cannot report a silent failure as a success. Full diagnosis: [REFERENCE.md → Why renames bypass the CLI and MCP](REFERENCE.md#why-renames-bypass-the-cli-and-mcp).
-
-The script spaces its own writes and verifies each one. Run it once per meeting, or `python3 ~/.claude/skills/name-meetings/scripts/rename.py --pending` to apply a whole approved batch and prune the ledger as each one verifies. Trust its `OK` / `FAIL` lines — never a bare success flag. On a 429, stop and persist the rest to `pending[]`.
-
-**Classify every other failure before queuing it — the ledger is for transient errors only.**
-- *Transient* (timeout, blocked call, 5xx, connection reset) → retry once, then append to `pending[]`
-- *Permanent* (`Transcript not found`, or a title under 5 / over 256 characters) → **do not queue.** Resume mode auto-applies `pending[]`, so a permanent failure there retries forever and can never succeed. Report it as unrenamable, with the reason.
-- A `read-back mismatch` from `rename.py` is **transient** — the write did not land. Retry once, then queue it.
-
-Report each result inline. Mechanics and fallbacks: [REFERENCE.md → Rate limits and the retry ledger](REFERENCE.md#rate-limits-and-the-retry-ledger).
-
-### 6. Re-sync — must be `--full`
-
-```bash
-fireflies-pp-cli sync --full --resources transcripts --agent
-```
-
-**Plain `sync --agent` fails silently here** — it skips already-seen transcripts, so title edits never land, and it still exits 0 reporting `total: 0`. **Verify by re-running the step-1 `find` and confirming the new titles**, not by reading the exit code.
-
-If the verification `find` surfaces generics you never proposed, the earlier DB was stale — say so and offer to name them rather than ending the run silently.
-
-**Fireflies' list endpoint lags its single-transcript endpoint by minutes.** `sync` and `find` read the list; `rename.py` verifies against the single transcript. So immediately after a rename it is normal and expected for `find` to still show the old title while the rename is genuinely applied. Do **not** re-issue the rename — that is how a good title gets clobbered. Wait ~4 minutes, re-run `sync --full`, and check again. This matters most when `meeting-sync` runs next: it builds vault filenames from the synced title, so exporting too early bakes the stale title into the filename, and a later re-export creates a *second* file rather than fixing the first.
-
-**If the sync fails**, retry once. If it fails again the renames are NOT lost — Fireflies is source-of-truth and they already succeeded there; only the local DB is stale. Report explicitly: *"Renames applied in Fireflies, but the local DB re-sync failed — titles will look stale to meeting-sync/weekly-review until you run `fireflies-pp-cli sync --full --resources transcripts --agent`."* Never end with a silent DB/Fireflies mismatch.
-
-### 7. Report
-
-3–5 lines: N scanned / M generic · K applied · F queued in `.pending-renames.json` (next run auto-resumes) · S skipped for manual naming · re-sync status (OK, or the stale-DB warning).
-
-## When invoked by `meeting-sync`
-
-- Detect generics only in the **new-since-last-sync** subset (the IDs meeting-sync passes), not the full 30-day window
-- If 0 generics: return silently
-- meeting-sync has already asked the user, so go straight to proposing, then the normal approval flow
+**Done when** every generic title in the window is verified renamed in the step 7 list, queued in `pending[]` or `review[]`, or named in the report as skipped or gone, and the report says whether the local DB matches Fireflies.
 
 ## Unattended mode
 
-Only when an orchestrating skill explicitly declares it (`meeting-sync` does, in its step 2): apply HIGH-confidence renames without approval, queue everything else to `review[]`. Rules: [REFERENCE.md → Unattended mode](REFERENCE.md#unattended-mode). This is the only sanctioned exception to the approval rule.
-
-## What NOT to do
-
-- **Don't rename meetings the user already titled.** Curated titles are sacred.
-- **Don't propose without seeing the gist.** Without content you'll guess wrong; if `summary` fails, mark as skip.
-- **Don't auto-apply without approval** — except Unattended mode, and there only HIGH-confidence.
-- **Don't trust a sync's exit code.** Verify with `find`.
-- **Don't include the date in the title.** Filenames already prefix dates.
-- **Don't pad titles to meet length.** Concise > complete.
-- **Don't rename in bulk if Fireflies rate-limits** — back off and report applied vs pending.
+Only when the calling skill declares it (meeting-sync does, in its step 2, scoped to the ids it passes). Steps 1–4 and 6–8 run as above; step 5's approval is replaced by the confidence gate in [REFERENCE.md → Unattended mode](REFERENCE.md#unattended-mode): rows that pass go to `pending[]` and are applied; every other row is appended to `review[]` for Eric's next interactive run. With no generic titles among the ids, return to the caller with nothing to report. This is the only path that renames without Eric's approval.
diff --git a/name-meetings/scripts/rename.py b/name-meetings/scripts/rename.py
index 39482c2..301213f 100644
--- a/name-meetings/scripts/rename.py
+++ b/name-meetings/scripts/rename.py
@@ -21,11 +21,20 @@ back, so a silent failure can never be reported as success.
 Usage:
     rename.py <meetingId> "<new title>"     rename one meeting
     rename.py --pending                     apply every entry in pending[] of the
-                                            pending-renames file, removing each one
-                                            that verifies
+                                            pending-renames file (entries are
+                                            {"id": ..., "title": ...}; "meetingId" is
+                                            accepted for "id")
     rename.py --check <meetingId>           print the current live title, no write
 
-Exit codes: 0 all verified · 1 one or more failed to verify · 2 usage/config error
+One line per meeting:
+    OK   <id> -> 'title'     verified by read-back; removed from pending[]
+    FAIL <id> -> detail      transient (timeout, 5xx, read-back mismatch); stays queued
+    GONE <id> -> detail      permanent (`Transcript not found`, title under 5 or over
+                             256 characters, malformed entry); removed from pending[]
+    STOP rate limited ...    HTTP 429 / too_many_requests: no further writes this run;
+                             the rest stay in pending[]
+
+Exit codes: 0 all verified · 1 any FAIL, GONE or STOP · 2 usage/config error
 """
 import json
 import os
@@ -51,11 +60,17 @@ QUERY_TITLE = "query($id: String!){ transcript(id: $id){ id title } }"
 
 # Seconds to wait after a write before reading the title back. The single-transcript
 # endpoint is consistent almost immediately; the *list* endpoint (what `sync` and
-# `transcripts find` read) lags by minutes, which is a separate problem -- see
-# "after renaming" below.
+# `transcripts find` read) lags by minutes, which is a separate problem.
 READBACK_DELAY = 3
 # Spacing between writes in a --pending batch.
 WRITE_SPACING = 5
+# Fireflies rejects titles outside this range; a write can never succeed.
+TITLE_MIN, TITLE_MAX = 5, 256
+
+
+def usage_exit(msg):
+    print(msg, file=sys.stderr)
+    sys.exit(2)
 
 
 def api_key():
@@ -64,14 +79,14 @@ def api_key():
     if env_key:
         return env_key
     if sys.platform != "darwin":
-        sys.exit("FIREFLIES_API_KEY is not set in the environment.")
+        usage_exit("FIREFLIES_API_KEY is not set in the environment.")
     user = subprocess.run(["whoami"], capture_output=True, text=True).stdout.strip()
     r = subprocess.run(
         ["security", "find-generic-password", "-s", "FIREFLIES_API_KEY", "-a", user, "-w"],
         capture_output=True, text=True,
     )
     if r.returncode != 0 or not r.stdout.strip():
-        sys.exit("FIREFLIES_API_KEY not found in Keychain. See pp-fireflies -> Auth Setup.")
+        usage_exit("FIREFLIES_API_KEY not found in Keychain. See pp-fireflies -> Auth Setup.")
     return r.stdout.strip()
 
 
@@ -87,6 +102,10 @@ def gql(key, query, variables):
             return json.loads(r.read().decode())
     except urllib.error.HTTPError as e:
         return {"errors": [{"message": "HTTP %s: %s" % (e.code, e.read().decode()[:300])}]}
+    except (urllib.error.URLError, TimeoutError, ConnectionError, ValueError) as e:
+        # Network trouble is transient; return it as an error so a --pending batch
+        # still rewrites the file and keeps the entries that already verified.
+        return {"errors": [{"message": "network: %s" % (e,)}]}
 
 
 def live_title(key, meeting_id):
@@ -97,20 +116,42 @@ def live_title(key, meeting_id):
         return None
 
 
+def classify(detail):
+    """'rate' (stop the batch), 'gone' (never retry) or 'transient' (retry later)."""
+    d = detail.lower()
+    if "http 429" in d or "too_many_requests" in d or "rate limit" in d:
+        return "rate"
+    if "transcript not found" in d:
+        return "gone"
+    return "transient"
+
+
 def rename(key, meeting_id, title):
-    """Write the title, then verify by read-back. Returns (ok, detail)."""
+    """Write the title, then verify by read-back. Returns (status, detail).
+
+    status is 'ok', 'transient', 'gone' or 'rate'.
+    """
+    if not (TITLE_MIN <= len(title) <= TITLE_MAX):
+        return "gone", "title length %d outside %d-%d" % (len(title), TITLE_MIN, TITLE_MAX)
     resp = gql(key, MUTATION, {"input": {"id": meeting_id, "title": title}})
     if "errors" in resp:
-        return False, json.dumps(resp["errors"])[:300]
+        detail = json.dumps(resp["errors"])[:300]
+        return classify(detail), detail
     time.sleep(READBACK_DELAY)
     got = live_title(key, meeting_id)
     if got == title:
-        return True, got
-    return False, "read-back mismatch: got %r" % (got,)
+        return "ok", got
+    return "transient", "read-back mismatch: got %r" % (got,)
+
+
+LABEL = {"ok": "OK   ", "transient": "FAIL ", "gone": "GONE ", "rate": "STOP "}
 
 
 def load_config():
-    return json.loads(open(CONFIG, encoding="utf-8").read())
+    try:
+        return json.loads(open(CONFIG, encoding="utf-8").read())
+    except (OSError, ValueError) as e:
+        usage_exit("cannot read %s: %s" % (CONFIG, e))
 
 
 def do_pending(key):
@@ -126,46 +167,60 @@ def do_pending(key):
         return 0
 
     print("Resuming %d pending rename(s)." % len(items))
-    applied = []
+    keep, applied, gone, stopped = [], 0, 0, False
     for i, item in enumerate(items):
+        if stopped:
+            keep.append(item)
+            continue
         mid = item.get("id") or item.get("meetingId")
-        title = item["title"]
-        ok, detail = rename(key, mid, title)
-        print(("OK   " if ok else "FAIL ") + mid + " -> " + repr(detail))
-        if ok:
-            applied.append(mid)
+        title = item.get("title")
+        if not mid or not isinstance(title, str):
+            print("GONE " + repr(item) + " -> malformed entry: needs id and title")
+            gone += 1
+            continue
+        status, detail = rename(key, mid, title)
+        if status == "rate":
+            print("STOP rate limited at %s; %d left in pending[] -> %s"
+                  % (mid, len(items) - i, detail))
+            stopped = True
+            keep.append(item)
+            continue
+        print(LABEL[status] + mid + " -> " + repr(detail))
+        if status == "ok":
+            applied += 1
+        elif status == "gone":
+            gone += 1
+        else:
+            keep.append(item)
         if i < len(items) - 1:
             time.sleep(WRITE_SPACING)
 
-    data["pending"] = [
-        x for x in items if (x.get("id") or x.get("meetingId")) not in applied
-    ]
+    data["pending"] = keep
     with open(path, "w", encoding="utf-8") as fh:
         json.dump(data, fh, indent=2, ensure_ascii=False)
 
-    print("applied=%d remaining=%d" % (len(applied), len(data["pending"])))
-    return 0 if not data["pending"] else 1
+    print("applied=%d gone=%d remaining=%d" % (applied, gone, len(keep)))
+    return 0 if not keep and not gone else 1
 
 
 def main():
     if len(sys.argv) < 2:
-        sys.exit(__doc__)
-    key = api_key()
+        usage_exit(__doc__)
 
     if sys.argv[1] == "--pending":
-        return do_pending(key)
+        return do_pending(api_key())
 
     if sys.argv[1] == "--check":
         if len(sys.argv) < 3:
-            sys.exit("usage: rename.py --check <meetingId>")
-        print(repr(live_title(key, sys.argv[2])))
+            usage_exit("usage: rename.py --check <meetingId>")
+        print(repr(live_title(api_key(), sys.argv[2])))
         return 0
 
     if len(sys.argv) < 3:
-        sys.exit("usage: rename.py <meetingId> \"<new title>\"")
-    ok, detail = rename(key, sys.argv[1], sys.argv[2])
-    print(("OK   " if ok else "FAIL ") + sys.argv[1] + " -> " + repr(detail))
-    return 0 if ok else 1
+        usage_exit("usage: rename.py <meetingId> \"<new title>\"")
+    status, detail = rename(api_key(), sys.argv[1], sys.argv[2])
+    print(LABEL[status] + sys.argv[1] + " -> " + repr(detail))
+    return 0 if status == "ok" else 1
 
 
 if __name__ == "__main__":
diff --git a/name-meetings/scripts/test_rename.py b/name-meetings/scripts/test_rename.py
new file mode 100644
index 0000000..d61ccfb
--- /dev/null
+++ b/name-meetings/scripts/test_rename.py
@@ -0,0 +1,109 @@
+"""Offline tests for rename.py. No network: gql, sleep and config are patched.
+
+Run: python3 ~/.claude/skills/name-meetings/scripts/test_rename.py
+"""
+import io
+import json
+import os
+import sys
+import tempfile
+import unittest
+from contextlib import redirect_stdout
+from unittest import mock
+
+sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
+import rename  # noqa: E402
+
+
+def fake_api(errors_by_id):
+    """gql stand-in: mutations fail per errors_by_id, reads echo the last write."""
+    titles = {}
+
+    def gql(key, query, variables):
+        if "mutation" in query:
+            mid = variables["input"]["id"]
+            if mid in errors_by_id:
+                return {"errors": [{"message": errors_by_id[mid]}]}
+            titles[mid] = variables["input"]["title"]
+            return {"data": {"updateMeetingTitle": {"title": titles[mid]}}}
+        return {"data": {"transcript": {"title": titles.get(variables["id"])}}}
+
+    return gql
+
+
+class PendingTests(unittest.TestCase):
+    def run_pending(self, pending, errors_by_id):
+        with tempfile.TemporaryDirectory() as d:
+            path = os.path.join(d, ".pending-renames.json")
+            with open(path, "w") as fh:
+                json.dump({"pending": pending, "review": [{"meetingId": "r1"}]}, fh)
+            calls = []
+            api = fake_api(errors_by_id)
+
+            def gql(key, query, variables):
+                calls.append(variables)
+                return api(key, query, variables)
+
+            out = io.StringIO()
+            with mock.patch.object(rename, "gql", gql), \
+                 mock.patch.object(rename, "load_config", lambda: {"pending_renames_file": path}), \
+                 mock.patch.object(rename.time, "sleep", lambda s: None), \
+                 redirect_stdout(out):
+                code = rename.do_pending("key")
+            with open(path) as fh:
+                return code, json.load(fh), out.getvalue(), calls
+
+    def test_classifies_ok_gone_transient_and_stops_on_rate_limit(self):
+        pending = [
+            {"id": "ok1", "title": "Staff — Good Title"},
+            {"meetingId": "gone1", "title": "Deleted Meeting"},
+            {"id": "flaky", "title": "Flaky Title"},
+            {"id": "short", "title": "abc"},
+            {"title": "no id here"},
+            {"id": "limited", "title": "Rate Limited"},
+            {"id": "after", "title": "Never Attempted"},
+        ]
+        code, data, out, calls = self.run_pending(pending, {
+            "gone1": "GraphQL error: Transcript not found",
+            "flaky": "HTTP 503: upstream",
+            "limited": "HTTP 429: too_many_requests",
+        })
+        self.assertEqual(code, 1)
+        # Kept: the transient failure, the rate-limited one, and everything after it.
+        self.assertEqual([x.get("id") for x in data["pending"]], ["flaky", "limited", "after"])
+        self.assertEqual(data["review"], [{"meetingId": "r1"}])  # review[] untouched
+        self.assertIn("GONE gone1", out)
+        self.assertIn("GONE short", out)
+        self.assertIn("malformed entry", out)
+        self.assertIn("STOP rate limited at limited", out)
+        # No write after the rate limit, and none for the too-short title.
+        written = [v["input"]["id"] for v in calls if "input" in v]
+        self.assertNotIn("after", written)
+        self.assertNotIn("short", written)
+
+    def test_all_verified_exits_zero_and_empties_pending(self):
+        code, data, out, _ = self.run_pending([{"id": "a", "title": "Title A ok"}], {})
+        self.assertEqual(code, 0)
+        self.assertEqual(data["pending"], [])
+        self.assertIn("OK   a", out)
+
+
+class ClassifyTests(unittest.TestCase):
+    def test_classify(self):
+        self.assertEqual(rename.classify('[{"message": "HTTP 429: x"}]'), "rate")
+        self.assertEqual(rename.classify("Rate limit exceeded"), "rate")
+        self.assertEqual(rename.classify("GraphQL error: Transcript not found"), "gone")
+        self.assertEqual(rename.classify("network: timed out"), "transient")
+
+
+class UsageTests(unittest.TestCase):
+    def test_usage_error_exits_2(self):
+        with mock.patch.object(sys, "argv", ["rename.py"]), \
+             mock.patch("sys.stderr", io.StringIO()):
+            with self.assertRaises(SystemExit) as cm:
+                rename.main()
+        self.assertEqual(cm.exception.code, 2)
+
+
+if __name__ == "__main__":
+    unittest.main()

hook: PostToolUse
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc 'git show 85f2aa3:name-meetings/REFERENCE.md | nl -ba' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'git show 85f2aa3:name-meetings/SKILL.md | nl -ba' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'git show 3c37b4e~1:name-meetings/SKILL.md | nl -ba' in /Users/kristinarash/.claude/skills
 succeeded in 14ms:
     1	---
     2	name: name-meetings
     3	description: >-
     4	  Detects Fireflies meetings with generic titles (empty, "Zoom Meeting", "Recording",
     5	  date-only, etc.), proposes structured names based on AI summary + participants, and
     6	  applies approved renames via the Fireflies API. Use when user says "/name-meetings",
     7	  "name my meetings", "rename untitled meetings", "fix meeting titles", "my meetings
     8	  have no names", or when invoked by meeting-sync. Do not use to sync transcripts or
     9	  audit vault filenames (use meeting-sync).
    10	argument-hint: "[days-back]"
    11	---
    12	
    13	# Name Meetings
    14	
    15	The user does not name their Fireflies meetings. Without names, exported filenames are useless for retrieval (`2026-05-20_meeting.md`). This skill proposes structured titles from existing AI summaries and applies them via `scripts/rename.py`, which writes back to Fireflies as source-of-truth and verifies each write by read-back.
    16	
    17	Detail lives in [REFERENCE.md](REFERENCE.md) — load the section you need, not the whole file.
    18	
    19	## Prerequisite
    20	
    21	Auth is the `FIREFLIES_API_KEY` env var (see `pp-fireflies` → Auth Setup; do not use `auth set-token`). Verify:
    22	
    23	```bash
    24	fireflies-pp-cli doctor --agent
    25	```
    26	
    27	If the JSON does not show `"auth": "configured"`, halt and tell the user:
    28	> Fireflies isn't authenticated. On the Mac, store the key in the Keychain with `security add-generic-password -U -s FIREFLIES_API_KEY -a "$USER" -w` (it prompts for the key; `~/.zshrc` exports it); on Windows, set it under System Properties → Environment Variables. Then open a new terminal.
    29	
    30	## Resume mode — check this FIRST
    31	
    32	Before anything else, check the pending-renames file (`pending_renames_file` in `~/.claude/skills/_shared/config.<platform>.json`). If `pending[]` has entries, tell the user you're resuming and apply them; if only `review[]` has entries, run them through the approval flow. In **Unattended mode**, apply `pending[]` (already approved), leave `review[]` for a later interactive run, and go on to the flow. Full loop: [REFERENCE.md → Resume mode](REFERENCE.md#resume-mode--full-loop).
    33	
    34	Only proceed to the flow below if the file is absent or both arrays are empty.
    35	
    36	## Flow
    37	
    38	### 1. Refresh and list candidates
    39	
    40	```bash
    41	fireflies-pp-cli sync --full --resources transcripts --agent
    42	fireflies-pp-cli transcripts find --from 30 --processed-only --limit 100000 --json --agent
    43	```
    44	
    45	`--full` is required: an incremental sync leaves the DB stale and `find` then under-reports candidates. `--limit 100000` overrides the CLI default of 100. See [REFERENCE.md → CLI gotchas](REFERENCE.md#cli-gotchas).
    46	
    47	Default lookback is 30 days. Adjust `--from` if the user says "last 60 days" / "all meetings" (omitting it means all-time — warn that high-volume rename is slow).
    48	
    49	### 2. Detect generics, then check they're editable
    50	
    51	Match each title against the patterns in [REFERENCE.md → Generic-title patterns](REFERENCE.md#generic-title-patterns). Skip everything else — **don't rename what the user has already curated.** A date *prefix* followed by content (`2026-01-30_BAIR_Steering_Approval`) is curated; only date-and-time-*only* titles are generic.
    52	
    53	**Expect ghosts.** `sync --full` doesn't prune transcripts deleted from the Fireflies cloud, so `find` can list meetings that no longer exist. They fail at step 5 with `Transcript not found` — literally true, and permanent. Reads don't detect them (`transcripts get` returns full data for a deleted transcript on both `live` and `local`), so you can't pre-filter; the write is the only reliable signal. Don't skip candidates by age — see [REFERENCE.md → Deleted transcripts](REFERENCE.md#deleted-transcripts-linger-in-the-local-db).
    54	
    55	### 3. Propose titles
    56	
    57	For each candidate, pull the content before proposing anything:
    58	
    59	```bash
    60	fireflies-pp-cli summary <id> --format gist --json --agent
    61	```
    62	
    63	The gist, keywords, overview, and the speaker names in `action_items` are enough to build a title. Follow [REFERENCE.md → Title construction rules](REFERENCE.md#title-construction-rules). If the gist is too vague, propose `[skip — gist too vague]` and tell the user it needs manual naming in the Fireflies UI.
    64	
    65	If several candidates come from one event, offer a shared prefix so they group — ask what the event was rather than guessing.
    66	
    67	### 4. Present batch for approval
    68	
    69	Display a markdown table with columns `# | Date | Current | Proposed | Action` (`✓` to apply, `—` to skip). Then `AskUserQuestion`: "How should I apply these renames?" with **[Approve all / Edit rows / Apply subset / Cancel]**:
    70	
    71	- **Approve all** → apply all non-skipped rows
    72	- **Edit rows** → ask which rows and what titles, confirm the revised table, then apply
    73	- **Apply subset** → ask which rows ("1,3,5" / "rows 1-2" / "skip 2,4"), apply only those
    74	- **Cancel** → exit without applying
    75	
    76	### 5. Apply approved renames
    77	
    78	```bash
    79	python3 ~/.claude/skills/name-meetings/scripts/rename.py <id> "<new title>"
    80	```
    81	
    82	**Never use `fireflies-pp-cli transcripts update`, and never use the Fireflies MCP tool `fireflies_update_meeting_title`.** Both are broken, and the MCP one lies — it returns `success: true` without reliably writing. `scripts/rename.py` calls the API directly and **verifies every write by reading the title back**, so it cannot report a silent failure as a success. Full diagnosis: [REFERENCE.md → Why renames bypass the CLI and MCP](REFERENCE.md#why-renames-bypass-the-cli-and-mcp).
    83	
    84	The script spaces its own writes and verifies each one. Run it once per meeting, or `python3 ~/.claude/skills/name-meetings/scripts/rename.py --pending` to apply a whole approved batch and prune the ledger as each one verifies. Trust its `OK` / `FAIL` lines — never a bare success flag. On a 429, stop and persist the rest to `pending[]`.
    85	
    86	**Classify every other failure before queuing it — the ledger is for transient errors only.**
    87	- *Transient* (timeout, blocked call, 5xx, connection reset) → retry once, then append to `pending[]`
    88	- *Permanent* (`Transcript not found`, or a title under 5 / over 256 characters) → **do not queue.** Resume mode auto-applies `pending[]`, so a permanent failure there retries forever and can never succeed. Report it as unrenamable, with the reason.
    89	- A `read-back mismatch` from `rename.py` is **transient** — the write did not land. Retry once, then queue it.
    90	
    91	Report each result inline. Mechanics and fallbacks: [REFERENCE.md → Rate limits and the retry ledger](REFERENCE.md#rate-limits-and-the-retry-ledger).
    92	
    93	### 6. Re-sync — must be `--full`
    94	
    95	```bash
    96	fireflies-pp-cli sync --full --resources transcripts --agent
    97	```
    98	
    99	**Plain `sync --agent` fails silently here** — it skips already-seen transcripts, so title edits never land, and it still exits 0 reporting `total: 0`. **Verify by re-running the step-1 `find` and confirming the new titles**, not by reading the exit code.
   100	
   101	If the verification `find` surfaces generics you never proposed, the earlier DB was stale — say so and offer to name them rather than ending the run silently.
   102	
   103	**Fireflies' list endpoint lags its single-transcript endpoint by minutes.** `sync` and `find` read the list; `rename.py` verifies against the single transcript. So immediately after a rename it is normal and expected for `find` to still show the old title while the rename is genuinely applied. Do **not** re-issue the rename — that is how a good title gets clobbered. Wait ~4 minutes, re-run `sync --full`, and check again. This matters most when `meeting-sync` runs next: it builds vault filenames from the synced title, so exporting too early bakes the stale title into the filename, and a later re-export creates a *second* file rather than fixing the first.
   104	
   105	**If the sync fails**, retry once. If it fails again the renames are NOT lost — Fireflies is source-of-truth and they already succeeded there; only the local DB is stale. Report explicitly: *"Renames applied in Fireflies, but the local DB re-sync failed — titles will look stale to meeting-sync/weekly-review until you run `fireflies-pp-cli sync --full --resources transcripts --agent`."* Never end with a silent DB/Fireflies mismatch.
   106	
   107	### 7. Report
   108	
   109	3–5 lines: N scanned / M generic · K applied · F queued in `.pending-renames.json` (next run auto-resumes) · S skipped for manual naming · re-sync status (OK, or the stale-DB warning).
   110	
   111	## When invoked by `meeting-sync`
   112	
   113	- Detect generics only in the **new-since-last-sync** subset (the IDs meeting-sync passes), not the full 30-day window
   114	- If 0 generics: return silently
   115	- meeting-sync has already asked the user, so go straight to proposing, then the normal approval flow
   116	
   117	## Unattended mode
   118	
   119	Only when an orchestrating skill explicitly declares it (`meeting-sync` does, in its step 2): apply HIGH-confidence renames without approval, queue everything else to `review[]`. Rules: [REFERENCE.md → Unattended mode](REFERENCE.md#unattended-mode). This is the only sanctioned exception to the approval rule.
   120	
   121	## What NOT to do
   122	
   123	- **Don't rename meetings the user already titled.** Curated titles are sacred.
   124	- **Don't propose without seeing the gist.** Without content you'll guess wrong; if `summary` fails, mark as skip.
   125	- **Don't auto-apply without approval** — except Unattended mode, and there only HIGH-confidence.
   126	- **Don't trust a sync's exit code.** Verify with `find`.
   127	- **Don't include the date in the title.** Filenames already prefix dates.
   128	- **Don't pad titles to meet length.** Concise > complete.
   129	- **Don't rename in bulk if Fireflies rate-limits** — back off and report applied vs pending.

 succeeded in 19ms:
     1	# Name Meetings — Reference
     2	
     3	Read the section a step in `SKILL.md` names.
     4	
     5	- Pending-renames file
     6	- Generic-title patterns
     7	- Title construction rules
     8	- Unattended mode
     9	- CLI gotchas
    10	- Why renames bypass the CLI and MCP
    11	
    12	## Pending-renames file
    13	
    14	Path: `pending_renames_file` in `~/.claude/skills/_shared/config.<platform>.json`. Two arrays:
    15	
    16	- `pending[]`: approved renames, `{"id": "<meetingId>", "title": "<title>"}` (`meetingId` is accepted for `id`). `rename.py --pending` applies them without asking, so only approved titles, and only failures that could succeed later, belong here. The script itself drops the permanent ones (`GONE`) and leaves the rest of the batch queued when it hits a rate limit (`STOP`).
    17	- `review[]`: proposed but not approved, `{"meetingId", "current_title", "proposed_title", "reason"}`. Written by Unattended mode (here or from meeting-sync); each entry goes through the step 5 approval table before it can move to `pending[]`.
    18	
    19	Read the file before writing it and keep what it holds: another run may have queued entries.
    20	
    21	## Generic-title patterns
    22	
    23	A title is generic if it matches any of these (case-insensitive):
    24	
    25	- Empty, whitespace-only, or under 5 characters
    26	- Exactly: `Meeting`, `Call`, `Recording`, `Zoom Meeting`, `Microsoft Teams Meeting`, `Google Meet`, `Teams Meeting`, `Untitled`, `Meeting on`, `Call with`
    27	- A date or timestamp and **nothing else**: `2026-05-20`, `MM/DD/YYYY`, `Meeting YYYY-MM-DD`, `Oct 29, 09:44 AM` (the Fireflies default for a phone or web recording, and the most common case)
    28	- The user's own email plus a timestamp: `eric.rash11@gmail.com - Tue, 28 Jul 2026 10:16:54 CDT - Untitled`
    29	- Just a participant count: `2 people`, `3 attendees`
    30	
    31	Anything else is curated: leave it as it is. The test is whether **anything survives removing the date**:
    32	
    33	- `Oct 29, 09:44 AM` → nothing left → generic.
    34	- `StaffMeet_10222026` → `StaffMeet` → curated. Eric's recurring series carry a date suffix (`SA_Leadership_10192026`, `KB_TechSync_10282026`).
    35	- `2026-01-30_BAIR_Steering_Approval` → `BAIR_Steering_Approval` → curated. A naive `^\d{4}-\d{2}-\d{2}` match flagged 19 curated titles out of 23 on 2026-07-30.
    36	- The word `Meeting` inside an otherwise descriptive title (`2026-01-09_SprintAI_Meeting`) is still curated.
    37	
    38	## Title construction rules
    39	
    40	**1. Recurring series first.** If the step 3 list holds curated `Series_MMDDYYYY` titles for the same kind of meeting (same weekday and time slot, same kind of topic), propose that series name with this meeting's date: `StaffMeet_10292026`. On 2026-10-24 Eric picked `StaffMeet_10222026` over the topic title `AP Staff — Olympic Sports, Facilities & Holidays`. When the match is a guess, show both titles in the table.
    41	
    42	**2. Otherwise, a topic title:** `<context> — <topic>`, under **60 characters** (count it; a shared prefix like `Baylor Performance Clinic — ` is 28 on its own), em dash (`—`) between the parts, no date (the vault filename already starts with one).
    43	
    44	- **Context**: the people, from the step 3 `speakers` names other than Eric: one person → first name (`Sarah`); 2–4 → first names joined with `&`; more → a label from the topic (`Research Council`, `Client — <name>`, `Team`). `participants` is not usable: it is Eric alone on 240 of 244 transcripts, and `speakers` is empty on about 60%. With no names, take the label from the topic. Speaker names inside the summary's `action_items` can be wrong (`Eric Rasch`); trust `speakers`.
    45	- **Topic**: the gist in 3–6 words, nouns and concrete actions.
    46	- **Banned words** in the topic: `meeting`, `call`, `discussion`, `sync`, `conversation`, `chat` (`1on1`, `Standup` and `Team Sync` are fine as context labels).
    47	- **Punctuation**: Fireflies drops `/` silently (`Coach/Practitioner` came back `Coach Practitioner`). Use `&` or a space, and report any change.
    48	
    49	**Good:** `Sarah — Q2 Career Path` · `Kenny — ForcePlate v2 Scope` · `Catapult Support — JWT Auth Issue` · `Research Council — Faculty Collaborator Outreach`
    50	
    51	**Bad:** `Meeting with Sarah about career stuff` (filler, banned word) · `2026-05-20 Sync` (date, banned word) · `Important discussion` (nothing specific: propose `[skip — gist too vague]`)
    52	
    53	### Grouping a multi-session event
    54	
    55	When several recordings come from one event (a clinic, a conference, a webinar series), offer a shared prefix so they sort together: `<Event> — <topic>`. Ask Eric what the event was. Budget the prefix against the 60-character cap and trim topics; dropping speaker names is usually the right trade, since they survive in the note body.
    56	
    57	## Unattended mode
    58	
    59	Replaces step 5's approval when a calling skill declares it (meeting-sync, step 2). A row passes the confidence gate only when all of these hold:
    60	
    61	- the summary was retrieved and its gist is specific;
    62	- the title follows the construction rules with no guess about who was there or which event it was: either a clear recurring-series match (weekday, time slot and topic all fit), or named `speakers`;
    63	- you would defend the title to Eric without hedging.
    64	
    65	Rows that pass go to `pending[]` and are applied in step 6. Every other row is appended to `review[]` with its `reason`. Report both: "K applied (high confidence), R queued for review".
    66	
    67	## CLI gotchas
    68	
    69	### `sync` must be `--full`
    70	
    71	`fireflies-pp-cli sync --agent` advances an incremental cursor and only fetches transcripts it has not seen, so a title edit on an already-synced transcript is invisible to it. It exits 0 and reports `{"event":"sync_complete","resource":"transcripts","total":0}`, which reads like success. Confirmed 2026-07-30: nine renames applied in Fireflies, plain sync reported `total: 0` twice, and `find` showed the old titles until `sync --full --resources transcripts` ran.
    72	
    73	The same cursor makes a candidate list stale: on 2026-07-30 the incremental DB listed 15 transcripts, a full sync 17, and the two new ones were generic.
    74	
    75	### `find` output
    76	
    77	- Default `--limit` is 100; pass `--limit 100000`. (meeting-sync's `sync.py` passes it too.)
    78	- `--agent` implies `--compact`, which keeps only `id` and `title`: no `dateString`, `speakers` or `summary`. Use `--json --no-input` when you need them.
    79	- `--json` emits a bare JSON array, not an envelope.
    80	- `dateString` is UTC (`...Z`); convert to local before showing a date. An evening meeting is the next day in UTC.
    81	
    82	### Deleted transcripts linger in the local DB
    83	
    84	`sync --full` does not prune transcripts deleted from the Fireflies cloud, so `find` lists ghosts. On 2026-10-31 a full sync fetched 157 transcripts while an all-time `find` listed 244. Renaming a ghost fails with `GraphQL error: Transcript not found`, which is literally true, and `rename.py` reports it as `GONE`.
    85	
    86	Reads cannot confirm existence: `transcripts get` returned full data for four deleted meetings under both `--data-source live` and `local` (2026-07-30). Whether that is a local fallback or the API serving soft-deleted records is unresolved. The write is the only reliable signal.
    87	
    88	Age is not a signal either. Those four were 44–192 days old and the successes that day were 20 days old or less, which first read as a title-edit window closing on old meetings; Eric confirmed the four had been deleted. Keep old candidates.
    89	
    90	## Why renames bypass the CLI and MCP
    91	
    92	Diagnosed 2026-08-29, after a 45-minute misdiagnosis.
    93	
    94	**`fireflies-pp-cli transcripts update` always fails.** It passes the id as a bare field argument; the schema takes one input object:
    95	
    96	```
    97	CLI sends: updateMeetingTitle(id: ..., title: ...)
    98	API wants: updateMeetingTitle(input: {id: ..., title: ...})
    99	```
   100	
   101	Every call returns `HTTP 400 ... Unknown argument "id" on field "Mutation.updateMeetingTitle"`. The field really is `id` (a call with `meetingId` is rejected with `Field "UpdateMeetingTitleInput.id" of required type "String!" was not provided`); the shape is what is wrong. A local patch (upstream PR mvanhorn/printing-press-library#1571, never merged) was lost when the binary was rebuilt 2026-08-05. There is no Fireflies manuscript on this machine, so the CLI cannot be regenerated.
   102	
   103	**The MCP tool `fireflies_update_meeting_title` returns `success: true` without reliably writing.** In one run 2 of 7 renames landed promptly, 5 had not landed after 8 minutes, and one diagnostic write surfaced 20–30 minutes later. Writes are delayed erratically, not dropped, so a rename that looks failed can still land an hour later and clobber a good title. It looked exactly like a rate limit and was not one: a real rate limit arrives as an explicit HTTP 429 / `too_many_requests`, which `rename.py` reports as `STOP`.
   104	
   105	`rename.py` posts the mutation straight to `https://api.fireflies.ai/graphql` and reads the title back; only a read-back proves a write. `python3 rename.py --check <id>` reads a live title with no write, the safe probe for any diagnosis.

exec
/bin/zsh -lc 'git show 85f2aa3:name-meetings/scripts/test_rename.py | nl -ba' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'git status --short' in /Users/kristinarash/.claude/skills
 succeeded in 41ms:
     1	---
     2	name: name-meetings
     3	description: >-
     4	  Renames Fireflies meetings with generic titles ("Oct 29, 09:44 AM", "Zoom Meeting",
     5	  empty): proposes names from the AI summary and applies the approved ones via the
     6	  Fireflies API. Use when the user says "/name-meetings", "name my meetings" or "fix
     7	  meeting titles", or when meeting-sync invokes it. Do not use to sync transcripts or
     8	  audit vault filenames (use meeting-sync).
     9	argument-hint: "[days-back]"
    10	---
    11	
    12	# Name Meetings
    13	
    14	Eric does not name most Fireflies recordings, and an unnamed one exports to the vault as `2026-10-29_Oct_29_0944_AM.md`. This skill finds generic titles, proposes real ones from the AI summary, and writes the approved ones back to Fireflies, the source of truth. `scripts/rename.py` is the only write path: it verifies every write by reading the title back (the CLI and the MCP rename tools are broken; [REFERENCE.md → Why renames bypass the CLI and MCP](REFERENCE.md#why-renames-bypass-the-cli-and-mcp)).
    15	
    16	Detail lives in [REFERENCE.md](REFERENCE.md); load only the section a step names. Below, `R=~/.claude/skills/name-meetings/scripts/rename.py`.
    17	
    18	## Steps
    19	
    20	1. **Auth.** `fireflies-pp-cli doctor --agent` must show `"auth": "configured"`. Otherwise stop and give Eric the fix from `pp-fireflies` → Auth Setup.
    21	
    22	2. **Resume the ledger.** The pending-renames file is `pending_renames_file` in `~/.claude/skills/_shared/config.<platform>.json` ([REFERENCE.md → Pending-renames file](REFERENCE.md#pending-renames-file)). If `pending[]` has entries, they are already approved: say "Resuming N pending renames" and run `python3 $R --pending` (step 6 explains its output). Entries in `review[]` join the step 5 table as candidates; in Unattended mode they stay where they are.
    23	
    24	3. **List the window.** Refresh the local DB in full, then list id, local date, title and speakers:
    25	
    26	   ```bash
    27	   fireflies-pp-cli sync --full --resources transcripts --agent
    28	   fireflies-pp-cli transcripts find --from 30 --processed-only --limit 100000 --json --no-input \
    29	     | python3 -c 'import json,sys,datetime as D
    30	   for x in json.load(sys.stdin):
    31	       t = D.datetime.fromisoformat(x["dateString"].replace("Z", "+00:00")).astimezone()
    32	       print(x["id"], t.strftime("%Y-%m-%d %H:%M"), json.dumps(x["title"]), "speakers=" + ",".join(s["name"] for s in x.get("speakers") or []))'
    33	   ```
    34	
    35	   Change `--from` when Eric names a window ("last 60 days"); without it `find` covers all time, which is slow to rename. When meeting-sync passes ids, keep only those. The flags each fix a trap ([REFERENCE.md → CLI gotchas](REFERENCE.md#cli-gotchas)): `--full` so the list is current, `--limit 100000` past the default 100, and no `--agent`, whose compact output drops the date and speakers.
    36	
    37	4. **Detect generics.** Match each title against [REFERENCE.md → Generic-title patterns](REFERENCE.md#generic-title-patterns). Every other title is curated and stays as it is, including Eric's `Series_MMDDYYYY` names (`StaffMeet_10222026`).
    38	
    39	   The list can hold **ghosts**: meetings deleted from Fireflies that `sync --full` never prunes. Nothing in a read tells them apart, so keep every candidate regardless of age; the write in step 6 reports a ghost as `GONE` ([REFERENCE.md → Deleted transcripts](REFERENCE.md#deleted-transcripts-linger-in-the-local-db)).
    40	
    41	5. **Propose, then approve.** For each candidate read the summary first:
    42	
    43	   ```bash
    44	   fireflies-pp-cli summary <id> --format gist --json --agent
    45	   ```
    46	
    47	   Build the title from the gist, keywords, overview and the step 3 speakers, by [REFERENCE.md → Title construction rules](REFERENCE.md#title-construction-rules). A meeting in one of Eric's recurring series takes the series name; a gist too vague to name gets `[skip — gist too vague]`, for Eric to name in the Fireflies UI. When several candidates come from one event, ask Eric what the event was and offer a shared prefix.
    48	
    49	   Show a table `# | Date | Current | Proposed | Action` (`✓` apply, `—` skip), then `AskUserQuestion` "How should I apply these renames?" with **Approve all / Edit rows / Apply subset / Cancel**. Edit rows: ask which rows and what titles, then confirm the revised table. Apply subset: ask which rows ("1,3,5", "skip 2,4"). Cancel: end the run with nothing applied.
    50	
    51	6. **Apply.** Add each approved row to `pending[]` as `{"id": "<meetingId>", "title": "<title>"}`, keeping what the file already holds and removing any `review[]` entry for that id, then run `python3 $R --pending`. It spaces the writes, verifies each by read-back and rewrites the file. Read its lines, never just the exit code:
    52	   - `OK` verified; gone from `pending[]`.
    53	   - `FAIL` transient (timeout, 5xx, read-back mismatch); stays in `pending[]` for the next run.
    54	   - `GONE` permanent (`Transcript not found`, a title under 5 or over 256 characters, a malformed entry); dropped. Report it as unrenamable, with the reason.
    55	   - `STOP` rate limited; the rest stay in `pending[]`. Report applied vs left, and skip to step 8.
    56	
    57	   When both arrays are empty afterwards, delete the file.
    58	
    59	7. **Wait, re-sync, verify.** Fireflies' list endpoint (what `sync` and `find` read) lags the single-transcript endpoint `rename.py` verifies against by minutes. Run `sleep 270` as a background Bash job, then `fireflies-pp-cli sync --full --resources transcripts --agent` and the step 3 list again, and confirm each new title. A title still old after the wait means more lag: wait and re-sync once more. The rename already verified, so the fix is waiting; a second rename can clobber a good title.
    60	   - A plain `sync` (no `--full`) never picks up title edits yet exits 0 with `total: 0`; the re-run list is the proof.
    61	   - If the sync fails twice, the renames still stand in Fireflies; only the local DB is stale. Say so and give the command: `fireflies-pp-cli sync --full --resources transcripts --agent`.
    62	   - Generics you never proposed mean the step 3 DB was stale: name them and offer a second pass.
    63	   - A renamed meeting already in the vault (its id is in meeting-sync's `.sync-state.json`) keeps its generic filename; re-export makes a second file. Name it in the report and point to meeting-sync's filename drift audit (`DRIFT.md`).
    64	
    65	8. **Report**, 3–5 lines: N scanned / M generic · K applied · F left in `pending[]` (next run resumes) · G gone · S skipped for manual naming · re-sync status (verified, or the stale-DB warning) · vault files left with a generic name.
    66	
    67	**Done when** every generic title in the window is verified renamed in the step 7 list, queued in `pending[]` or `review[]`, or named in the report as skipped or gone, and the report says whether the local DB matches Fireflies.
    68	
    69	## Unattended mode
    70	
    71	Only when the calling skill declares it (meeting-sync does, in its step 2, scoped to the ids it passes). Steps 1–4 and 6–8 run as above; step 5's approval is replaced by the confidence gate in [REFERENCE.md → Unattended mode](REFERENCE.md#unattended-mode): rows that pass go to `pending[]` and are applied; every other row is appended to `review[]` for Eric's next interactive run. With no generic titles among the ids, return to the caller with nothing to report. This is the only path that renames without Eric's approval.

hook: PostToolUse
hook: PostToolUse
hook: PostToolUse
 succeeded in 0ms:
 M project/REGISTRY-EDITS.md
 M project/SKILL.md

 succeeded in 0ms:
     1	"""Offline tests for rename.py. No network: gql, sleep and config are patched.
     2	
     3	Run: python3 ~/.claude/skills/name-meetings/scripts/test_rename.py
     4	"""
     5	import io
     6	import json
     7	import os
     8	import sys
     9	import tempfile
    10	import unittest
    11	from contextlib import redirect_stdout
    12	from unittest import mock
    13	
    14	sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    15	import rename  # noqa: E402
    16	
    17	
    18	def fake_api(errors_by_id):
    19	    """gql stand-in: mutations fail per errors_by_id, reads echo the last write."""
    20	    titles = {}
    21	
    22	    def gql(key, query, variables):
    23	        if "mutation" in query:
    24	            mid = variables["input"]["id"]
    25	            if mid in errors_by_id:
    26	                return {"errors": [{"message": errors_by_id[mid]}]}
    27	            titles[mid] = variables["input"]["title"]
    28	            return {"data": {"updateMeetingTitle": {"title": titles[mid]}}}
    29	        return {"data": {"transcript": {"title": titles.get(variables["id"])}}}
    30	
    31	    return gql
    32	
    33	
    34	class PendingTests(unittest.TestCase):
    35	    def run_pending(self, pending, errors_by_id):
    36	        with tempfile.TemporaryDirectory() as d:
    37	            path = os.path.join(d, ".pending-renames.json")
    38	            with open(path, "w") as fh:
    39	                json.dump({"pending": pending, "review": [{"meetingId": "r1"}]}, fh)
    40	            calls = []
    41	            api = fake_api(errors_by_id)
    42	
    43	            def gql(key, query, variables):
    44	                calls.append(variables)
    45	                return api(key, query, variables)
    46	
    47	            out = io.StringIO()
    48	            with mock.patch.object(rename, "gql", gql), \
    49	                 mock.patch.object(rename, "load_config", lambda: {"pending_renames_file": path}), \
    50	                 mock.patch.object(rename.time, "sleep", lambda s: None), \
    51	                 redirect_stdout(out):
    52	                code = rename.do_pending("key")
    53	            with open(path) as fh:
    54	                return code, json.load(fh), out.getvalue(), calls
    55	
    56	    def test_classifies_ok_gone_transient_and_stops_on_rate_limit(self):
    57	        pending = [
    58	            {"id": "ok1", "title": "Staff — Good Title"},
    59	            {"meetingId": "gone1", "title": "Deleted Meeting"},
    60	            {"id": "flaky", "title": "Flaky Title"},
    61	            {"id": "short", "title": "abc"},
    62	            {"title": "no id here"},
    63	            {"id": "limited", "title": "Rate Limited"},
    64	            {"id": "after", "title": "Never Attempted"},
    65	        ]
    66	        code, data, out, calls = self.run_pending(pending, {
    67	            "gone1": "GraphQL error: Transcript not found",
    68	            "flaky": "HTTP 503: upstream",
    69	            "limited": "HTTP 429: too_many_requests",
    70	        })
    71	        self.assertEqual(code, 1)
    72	        # Kept: the transient failure, the rate-limited one, and everything after it.
    73	        self.assertEqual([x.get("id") for x in data["pending"]], ["flaky", "limited", "after"])
    74	        self.assertEqual(data["review"], [{"meetingId": "r1"}])  # review[] untouched
    75	        self.assertIn("GONE gone1", out)
    76	        self.assertIn("GONE short", out)
    77	        self.assertIn("malformed entry", out)
    78	        self.assertIn("STOP rate limited at limited", out)
    79	        # No write after the rate limit, and none for the too-short title.
    80	        written = [v["input"]["id"] for v in calls if "input" in v]
    81	        self.assertNotIn("after", written)
    82	        self.assertNotIn("short", written)
    83	
    84	    def test_all_verified_exits_zero_and_empties_pending(self):
    85	        code, data, out, _ = self.run_pending([{"id": "a", "title": "Title A ok"}], {})
    86	        self.assertEqual(code, 0)
    87	        self.assertEqual(data["pending"], [])
    88	        self.assertIn("OK   a", out)
    89	
    90	
    91	class ClassifyTests(unittest.TestCase):
    92	    def test_classify(self):
    93	        self.assertEqual(rename.classify('[{"message": "HTTP 429: x"}]'), "rate")
    94	        self.assertEqual(rename.classify("Rate limit exceeded"), "rate")
    95	        self.assertEqual(rename.classify("GraphQL error: Transcript not found"), "gone")
    96	        self.assertEqual(rename.classify("network: timed out"), "transient")
    97	
    98	
    99	class UsageTests(unittest.TestCase):
   100	    def test_usage_error_exits_2(self):
   101	        with mock.patch.object(sys, "argv", ["rename.py"]), \
   102	             mock.patch("sys.stderr", io.StringIO()):
   103	            with self.assertRaises(SystemExit) as cm:
   104	                rename.main()
   105	        self.assertEqual(cm.exception.code, 2)
   106	
   107	
   108	if __name__ == "__main__":
   109	    unittest.main()

hook: PostToolUse
hook: PostToolUse
exec
/bin/zsh -lc 'git show 85f2aa3:name-meetings/scripts/rename.py | nl -ba' in /Users/kristinarash/.claude/skills
 succeeded in 9ms:
     1	#!/usr/bin/env python3
     2	"""Apply Fireflies meeting-title renames via the GraphQL API, with read-back verification.
     3	
     4	Why this exists (2026-08-29): the two obvious paths are both broken.
     5	
     6	  1. `fireflies-pp-cli transcripts update` builds the mutation with the id as a bare
     7	     field argument -- `updateMeetingTitle(id: ..., title: ...)` -- but the schema takes
     8	     a single input object. Every call fails with HTTP 400
     9	     `Unknown argument "id" on field "Mutation.updateMeetingTitle"`.
    10	
    11	  2. The Fireflies MCP tool `fireflies_update_meeting_title` returns
    12	     `{"success": true}` and then does not reliably write. Observed: 2 of 7 renames
    13	     landed promptly, 5 had not landed after 8 minutes of polling, and one landed
    14	     ~20-30 minutes later. Its success flag carries no information, so never use it
    15	     for renames and never send a throwaway "test" title through it -- a late arrival
    16	     will clobber a good title.
    17	
    18	This script talks to the API directly and verifies every write by reading the title
    19	back, so a silent failure can never be reported as success.
    20	
    21	Usage:
    22	    rename.py <meetingId> "<new title>"     rename one meeting
    23	    rename.py --pending                     apply every entry in pending[] of the
    24	                                            pending-renames file (entries are
    25	                                            {"id": ..., "title": ...}; "meetingId" is
    26	                                            accepted for "id")
    27	    rename.py --check <meetingId>           print the current live title, no write
    28	
    29	One line per meeting:
    30	    OK   <id> -> 'title'     verified by read-back; removed from pending[]
    31	    FAIL <id> -> detail      transient (timeout, 5xx, read-back mismatch); stays queued
    32	    GONE <id> -> detail      permanent (`Transcript not found`, title under 5 or over
    33	                             256 characters, malformed entry); removed from pending[]
    34	    STOP rate limited ...    HTTP 429 / too_many_requests: no further writes this run;
    35	                             the rest stay in pending[]
    36	
    37	Exit codes: 0 all verified · 1 any FAIL, GONE or STOP · 2 usage/config error
    38	"""
    39	import json
    40	import os
    41	import subprocess
    42	import sys
    43	import time
    44	import urllib.error
    45	import urllib.request
    46	from pathlib import Path
    47	
    48	ENDPOINT = "https://api.fireflies.ai/graphql"
    49	CONFIG = str(
    50	    Path(__file__).resolve().parents[2]
    51	    / "_shared"
    52	    / ("config.windows.json" if sys.platform == "win32" else "config.macos.json")
    53	)
    54	
    55	MUTATION = (
    56	    "mutation($input: UpdateMeetingTitleInput!){"
    57	    " updateMeetingTitle(input: $input){ title } }"
    58	)
    59	QUERY_TITLE = "query($id: String!){ transcript(id: $id){ id title } }"
    60	
    61	# Seconds to wait after a write before reading the title back. The single-transcript
    62	# endpoint is consistent almost immediately; the *list* endpoint (what `sync` and
    63	# `transcripts find` read) lags by minutes, which is a separate problem.
    64	READBACK_DELAY = 3
    65	# Spacing between writes in a --pending batch.
    66	WRITE_SPACING = 5
    67	# Fireflies rejects titles outside this range; a write can never succeed.
    68	TITLE_MIN, TITLE_MAX = 5, 256
    69	
    70	
    71	def usage_exit(msg):
    72	    print(msg, file=sys.stderr)
    73	    sys.exit(2)
    74	
    75	
    76	def api_key():
    77	    """Read FIREFLIES_API_KEY from the environment or the macOS Keychain."""
    78	    env_key = os.environ.get("FIREFLIES_API_KEY", "").strip()
    79	    if env_key:
    80	        return env_key
    81	    if sys.platform != "darwin":
    82	        usage_exit("FIREFLIES_API_KEY is not set in the environment.")
    83	    user = subprocess.run(["whoami"], capture_output=True, text=True).stdout.strip()
    84	    r = subprocess.run(
    85	        ["security", "find-generic-password", "-s", "FIREFLIES_API_KEY", "-a", user, "-w"],
    86	        capture_output=True, text=True,
    87	    )
    88	    if r.returncode != 0 or not r.stdout.strip():
    89	        usage_exit("FIREFLIES_API_KEY not found in Keychain. See pp-fireflies -> Auth Setup.")
    90	    return r.stdout.strip()
    91	
    92	
    93	def gql(key, query, variables):
    94	    req = urllib.request.Request(
    95	        ENDPOINT,
    96	        data=json.dumps({"query": query, "variables": variables}).encode(),
    97	        headers={"Content-Type": "application/json", "Authorization": "Bearer " + key},
    98	        method="POST",
    99	    )
   100	    try:
   101	        with urllib.request.urlopen(req, timeout=60) as r:
   102	            return json.loads(r.read().decode())
   103	    except urllib.error.HTTPError as e:
   104	        return {"errors": [{"message": "HTTP %s: %s" % (e.code, e.read().decode()[:300])}]}
   105	    except (urllib.error.URLError, TimeoutError, ConnectionError, ValueError) as e:
   106	        # Network trouble is transient; return it as an error so a --pending batch
   107	        # still rewrites the file and keeps the entries that already verified.
   108	        return {"errors": [{"message": "network: %s" % (e,)}]}
   109	
   110	
   111	def live_title(key, meeting_id):
   112	    r = gql(key, QUERY_TITLE, {"id": meeting_id})
   113	    try:
   114	        return r["data"]["transcript"]["title"]
   115	    except (KeyError, TypeError):
   116	        return None
   117	
   118	
   119	def classify(detail):
   120	    """'rate' (stop the batch), 'gone' (never retry) or 'transient' (retry later)."""
   121	    d = detail.lower()
   122	    if "http 429" in d or "too_many_requests" in d or "rate limit" in d:
   123	        return "rate"
   124	    if "transcript not found" in d:
   125	        return "gone"
   126	    return "transient"
   127	
   128	
   129	def rename(key, meeting_id, title):
   130	    """Write the title, then verify by read-back. Returns (status, detail).
   131	
   132	    status is 'ok', 'transient', 'gone' or 'rate'.
   133	    """
   134	    if not (TITLE_MIN <= len(title) <= TITLE_MAX):
   135	        return "gone", "title length %d outside %d-%d" % (len(title), TITLE_MIN, TITLE_MAX)
   136	    resp = gql(key, MUTATION, {"input": {"id": meeting_id, "title": title}})
   137	    if "errors" in resp:
   138	        detail = json.dumps(resp["errors"])[:300]
   139	        return classify(detail), detail
   140	    time.sleep(READBACK_DELAY)
   141	    got = live_title(key, meeting_id)
   142	    if got == title:
   143	        return "ok", got
   144	    return "transient", "read-back mismatch: got %r" % (got,)
   145	
   146	
   147	LABEL = {"ok": "OK   ", "transient": "FAIL ", "gone": "GONE ", "rate": "STOP "}
   148	
   149	
   150	def load_config():
   151	    try:
   152	        return json.loads(open(CONFIG, encoding="utf-8").read())
   153	    except (OSError, ValueError) as e:
   154	        usage_exit("cannot read %s: %s" % (CONFIG, e))
   155	
   156	
   157	def do_pending(key):
   158	    path = load_config()["pending_renames_file"]
   159	    try:
   160	        data = json.loads(open(path, encoding="utf-8").read())
   161	    except FileNotFoundError:
   162	        print("No pending-renames file at %s - nothing to do." % path)
   163	        return 0
   164	    items = data.get("pending", [])
   165	    if not items:
   166	        print("pending[] is empty - nothing to do.")
   167	        return 0
   168	
   169	    print("Resuming %d pending rename(s)." % len(items))
   170	    keep, applied, gone, stopped = [], 0, 0, False
   171	    for i, item in enumerate(items):
   172	        if stopped:
   173	            keep.append(item)
   174	            continue
   175	        mid = item.get("id") or item.get("meetingId")
   176	        title = item.get("title")
   177	        if not mid or not isinstance(title, str):
   178	            print("GONE " + repr(item) + " -> malformed entry: needs id and title")
   179	            gone += 1
   180	            continue
   181	        status, detail = rename(key, mid, title)
   182	        if status == "rate":
   183	            print("STOP rate limited at %s; %d left in pending[] -> %s"
   184	                  % (mid, len(items) - i, detail))
   185	            stopped = True
   186	            keep.append(item)
   187	            continue
   188	        print(LABEL[status] + mid + " -> " + repr(detail))
   189	        if status == "ok":
   190	            applied += 1
   191	        elif status == "gone":
   192	            gone += 1
   193	        else:
   194	            keep.append(item)
   195	        if i < len(items) - 1:
   196	            time.sleep(WRITE_SPACING)
   197	
   198	    data["pending"] = keep
   199	    with open(path, "w", encoding="utf-8") as fh:
   200	        json.dump(data, fh, indent=2, ensure_ascii=False)
   201	
   202	    print("applied=%d gone=%d remaining=%d" % (applied, gone, len(keep)))
   203	    return 0 if not keep and not gone else 1
   204	
   205	
   206	def main():
   207	    if len(sys.argv) < 2:
   208	        usage_exit(__doc__)
   209	
   210	    if sys.argv[1] == "--pending":
   211	        return do_pending(api_key())
   212	
   213	    if sys.argv[1] == "--check":
   214	        if len(sys.argv) < 3:
   215	            usage_exit("usage: rename.py --check <meetingId>")
   216	        print(repr(live_title(api_key(), sys.argv[2])))
   217	        return 0
   218	
   219	    if len(sys.argv) < 3:
   220	        usage_exit("usage: rename.py <meetingId> \"<new title>\"")
   221	    status, detail = rename(api_key(), sys.argv[1], sys.argv[2])
   222	    print(LABEL[status] + sys.argv[1] + " -> " + repr(detail))
   223	    return 0 if status == "ok" else 1
   224	
   225	
   226	if __name__ == "__main__":
   227	    sys.exit(main())

hook: PostToolUse
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
codex
I found **six issues**. I did not change any files. I reviewed the tests but did not run them.

1. **High — A rate limit during the read-back does not stop the batch.**  
   [rename.py:111](/Users/kristinarash/.claude/skills/name-meetings/scripts/rename.py:111) turns every read error into `None`. A rate-limit response then becomes `FAIL`, and the script writes to the next meeting.  
   **Fix:** Keep the read error. Return `STOP` for a rate limit and keep the current entry queued.

2. **High — Bad queue entries can stop the script before it saves progress.**  
   [rename.py:175](/Users/kristinarash/.claude/skills/name-meetings/scripts/rename.py:175) assumes each entry is an object. A number or `null` causes a crash. A non-string ID can also cause a crash at line 188. Earlier successful entries then stay in the queue.  
   **Fix:** Check that each entry is an object with a non-empty string ID and a string title. Report bad entries as `GONE`.

3. **High — A rate limit in step 2 does not stop the run.**  
   [SKILL.md:22](/Users/kristinarash/.claude/skills/name-meetings/SKILL.md:22) resumes the queue but does not say what to do on `STOP`. The skill can continue to step 6 and try the queue again. Step 6 also skips the sync after `STOP`, even if earlier writes succeeded.  
   **Fix:** On `STOP` in either step, make no more writes. Sync and check any successful writes before reporting.

4. **Medium — The queue rewrite can lose both lists.**  
   [rename.py:199](/Users/kristinarash/.claude/skills/name-meetings/scripts/rename.py:199) opens the file for writing before the new data is safely saved. A write error can leave an empty or partial file. This can lose `pending[]` and `review[]`.  
   **Fix:** Write to a temporary file in the same folder. Then replace the original file.

5. **Medium — The tests miss key failure paths.**  
   [test_rename.py:48](/Users/kristinarash/.claude/skills/name-meetings/scripts/test_rename.py:48) replaces `gql`, so the tests do not exercise real network-error handling. They also miss read-back errors, malformed non-object entries, bad ID types, and queue write errors.  
   **Fix:** Add tests for those cases. Check the output, exit code, and saved queue.

6. **Medium — The unattended steps are unclear.**  
   [SKILL.md:71](/Users/kristinarash/.claude/skills/name-meetings/SKILL.md:71) says unattended mode skips step 5. But step 5 contains the summary and title work needed for the confidence check. [REFERENCE.md:17](/Users/kristinarash/.claude/skills/name-meetings/REFERENCE.md:17) gives the `review[]` fields, but does not say how to handle a row with no proposed title when the summary fails.  
   **Fix:** Say that unattended mode still reads summaries and builds proposals. Skip only the approval prompt. Define the value of `proposed_title` when no title can be made.

The next step is to fix these issues and run the tests.
hook: Stop
hook: Stop
hook: Stop
hook: Stop Completed
hook: Stop Completed
hook: Stop Failed
tokens used
53,842
I found **six issues**. I did not change any files. I reviewed the tests but did not run them.

1. **High — A rate limit during the read-back does not stop the batch.**  
   [rename.py:111](/Users/kristinarash/.claude/skills/name-meetings/scripts/rename.py:111) turns every read error into `None`. A rate-limit response then becomes `FAIL`, and the script writes to the next meeting.  
   **Fix:** Keep the read error. Return `STOP` for a rate limit and keep the current entry queued.

2. **High — Bad queue entries can stop the script before it saves progress.**  
   [rename.py:175](/Users/kristinarash/.claude/skills/name-meetings/scripts/rename.py:175) assumes each entry is an object. A number or `null` causes a crash. A non-string ID can also cause a crash at line 188. Earlier successful entries then stay in the queue.  
   **Fix:** Check that each entry is an object with a non-empty string ID and a string title. Report bad entries as `GONE`.

3. **High — A rate limit in step 2 does not stop the run.**  
   [SKILL.md:22](/Users/kristinarash/.claude/skills/name-meetings/SKILL.md:22) resumes the queue but does not say what to do on `STOP`. The skill can continue to step 6 and try the queue again. Step 6 also skips the sync after `STOP`, even if earlier writes succeeded.  
   **Fix:** On `STOP` in either step, make no more writes. Sync and check any successful writes before reporting.

4. **Medium — The queue rewrite can lose both lists.**  
   [rename.py:199](/Users/kristinarash/.claude/skills/name-meetings/scripts/rename.py:199) opens the file for writing before the new data is safely saved. A write error can leave an empty or partial file. This can lose `pending[]` and `review[]`.  
   **Fix:** Write to a temporary file in the same folder. Then replace the original file.

5. **Medium — The tests miss key failure paths.**  
   [test_rename.py:48](/Users/kristinarash/.claude/skills/name-meetings/scripts/test_rename.py:48) replaces `gql`, so the tests do not exercise real network-error handling. They also miss read-back errors, malformed non-object entries, bad ID types, and queue write errors.  
   **Fix:** Add tests for those cases. Check the output, exit code, and saved queue.

6. **Medium — The unattended steps are unclear.**  
   [SKILL.md:71](/Users/kristinarash/.claude/skills/name-meetings/SKILL.md:71) says unattended mode skips step 5. But step 5 contains the summary and title work needed for the confidence check. [REFERENCE.md:17](/Users/kristinarash/.claude/skills/name-meetings/REFERENCE.md:17) gives the `review[]` fields, but does not say how to handle a row with no proposed title when the summary fails.  
   **Fix:** Say that unattended mode still reads summaries and builds proposals. Skip only the approval prompt. Define the value of `proposed_title` when no title can be made.

The next step is to fix these issues and run the tests.
