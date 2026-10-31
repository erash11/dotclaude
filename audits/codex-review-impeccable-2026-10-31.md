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
session id: 01a192c5-8b4d-7d61-840d-b94f445ad3a1
--------
user
Review the git diff of commits HEAD~2..HEAD in /Users/kristinarash/.claude/skills (impeccable skill). Check: exec bit change on impeccable/scripts/impeccable is correct for macOS/Linux and harmless on Windows; SKILL.md description keeps Use when and has Do not use, under ~650 chars; the added permission-denied advice and Done when line are accurate and not contradicting the rest of SKILL.md. Report real problems only, briefly.
2026-10-31T16:23:04.016833Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.context7.com/.well-known/oauth-protected-resource/mcp\"" })
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
I’ll use the code-review skill to check the two commits and the rest of the skill file.
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc 'git status --short && git diff --summary HEAD~2..HEAD && git diff HEAD~2..HEAD -- impeccable/SKILL.md impeccable/scripts/impeccable && git log -2 --oneline' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat /Users/kristinarash/.agents/skills/code-review/SKILL.md' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat ~/.claude/machine.md && cat ~/.claude/global-memory/transcripts/.errors.log' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat ~/.claude/CLAUDE.md' in /Users/kristinarash/.claude/skills
 succeeded in 143ms:
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

 succeeded in 143ms:
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

hook: PostToolUse
hook: PostToolUse
 succeeded in 157ms:
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

hook: PostToolUse
 succeeded in 396ms:
 mode change 100644 => 100755 impeccable/scripts/impeccable
diff --git a/impeccable/SKILL.md b/impeccable/SKILL.md
index 30536bd..987698d 100644
--- a/impeccable/SKILL.md
+++ b/impeccable/SKILL.md
@@ -1,6 +1,6 @@
 ---
 name: impeccable
-description: Use when the user wants to design, redesign, shape, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, extract, or otherwise improve a frontend interface. Covers websites, landing pages, dashboards, product UI, app shells, components, forms, settings, onboarding, and empty states. Handles UX review, visual hierarchy, information architecture, cognitive load, accessibility, performance, responsive behavior, theming, anti-patterns, typography, fonts, spacing, layout, alignment, color, motion, micro-interactions, UX copy, error states, edge cases, i18n, and reusable design systems or tokens. Also use for bland designs that need to become bolder or more delightful, loud designs that should become quieter, live browser iteration on UI elements, or ambitious visual effects that should feel technically extraordinary. Not for backend-only or non-UI tasks.
+description: Use when the user wants to design, redesign, shape, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, or extract a frontend interface (website, landing page, dashboard, app UI, component, form, design system or tokens), or to run live browser iteration on UI elements. Covers UX review, hierarchy, accessibility, performance, responsive behavior, typography, layout, color, motion, UX copy. Also for bland designs to make bolder, loud ones quieter. Do not use for backend-only or non-UI tasks.
 version: 4.5.0
 user-invocable: true
 argument-hint: "[shape · audit|critique · animate|bolder|colorize|delight|layout|overdrive|quieter|typeset · adapt|clarify|distill · harden|onboard|optimize|polish · init|document|extract|live|generate] [target]"
@@ -20,7 +20,7 @@ Core principles:
 2. Load the request's playbook: its Commands-table reference for an explicit/implied sub-command, or [reference/new-work.md](reference/new-work.md) for a new surface or replacement visual world. Inspect target and incumbent visual truth before editing. When the app cannot run, start with committed visual-regression goldens or screenshot fixtures; verify target and freshness against current tokens, CSS, components, or assets, resolve conflicts, and compare theme/variant captures.
 3. After resolving analysis and direction, read [reference/craft-floor.md](reference/craft-floor.md) immediately before any UI edit, including small refinements. It carries the quality floor, the absolute bans, and the reflexes no detector catches. Do not load it for planning-only work.
 
-**Launcher unavailable:** On refusal or failure, send a separate message **before the next tool call**: “Context loading did not run; I’ll read the existing project context directly.” Then read existing PRODUCT.md and DESIGN.md without inventing missing context, follow applicable steps 2–3, and continue through permitted tools. This applies to planning and editing; launcher failure alone does not block either.
+**Launcher unavailable:** On refusal or failure, send a separate message **before the next tool call**: “Context loading did not run; I’ll read the existing project context directly.” Then read existing PRODUCT.md and DESIGN.md without inventing missing context, follow applicable steps 2–3, and continue through permitted tools. This applies to planning and editing; launcher failure alone does not block either. On "permission denied", the launcher lost its executable bit: run `chmod +x <skill-base-dir>/scripts/impeccable` and rerun Setup step 1 before falling back.
 
 ## How to design
 
@@ -84,4 +84,6 @@ After init writes PRODUCT.md, resume without rerunning `impeccable context`; ini
 
 **Doctor:** `/impeccable doctor` reports and repairs drift between this project's Impeccable artifacts (PRODUCT.md, DESIGN.md and its sidecar, config, surface briefs, the hook) and what this version reads. Load [reference/doctor.md](reference/doctor.md) when the user invokes it, or when they ask what is out of date, stale, or needs refreshing. A `CONTEXT_STALE` directive in Setup's output is the cheap subset of the same report; act on it there per its own instructions rather than running doctor unasked.
 
-**Never repair drift as a side effect of a design task.** A `CONTEXT_STALE` finding is reported, not acted on, unless the user asks. The one exception is a finding marked `auto`, which the next write to that file performs anyway.
\ No newline at end of file
+**Never repair drift as a side effect of a design task.** A `CONTEXT_STALE` finding is reported, not acted on, unless the user asks. The one exception is a finding marked `auto`, which the next write to that file performs anyway.
+
+**Done when:** the command's reference file has been followed to its own finish line, any UI edit passed through craft-floor, and the final reply names what changed and what was left unverified.
diff --git a/impeccable/scripts/impeccable b/impeccable/scripts/impeccable
old mode 100644
new mode 100755
4348778 impeccable: audit — description under budget with Do-not-use; permission-denied recovery; Done when line
84b0bb9 impeccable: audit — launcher lost its exec bit (permission denied on every Setup run)

hook: PostToolUse
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
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
exec
/bin/zsh -lc 'nl -ba impeccable/SKILL.md && head -30 impeccable/scripts/impeccable && git ls-files -s impeccable/scripts/impeccable' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc "python3 -c 'from pathlib import Path; s=Path(\"impeccable/SKILL.md\").read_text().splitlines()[2]; print(len(s.removeprefix(\"description: \")))'" in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc "rg -n 'permission denied|chmod|Setup|craft-floor|finish|Windows|scripts/impeccable' impeccable" in /Users/kristinarash/.claude/skills
 succeeded in 144ms:
530

hook: PostToolUse
 succeeded in 208ms:
impeccable/reference/adapt.md:186:- **Different OS**: iOS, Android, Windows, macOS
impeccable/reference/doctor.md:16:.claude/skills/impeccable/scripts/impeccable doctor --json
impeccable/reference/doctor.md:29:- **`auto`** carries no decision. Run `.claude/skills/impeccable/scripts/impeccable doctor --fix` once to apply these, then report what it moved in one line. Do not ask permission first, and do not ask about them afterward.
impeccable/reference/layout.md:28:.claude/skills/impeccable/scripts/impeccable detect --json --scope layout [target files or dirs]
impeccable/reference/mode-operate.md:15:The comp is the product screen, in the direction's committed palette: its shell and navigation with a distinct area for each job and, where there is data, filters over what they scope and charts and tables with clear states. The world enters only through type, palette, density, and the one signature move; it never supplies the page's organisation, so a working screen never reads as a newspaper, a poster, or any other artifact of the world. Every control is a standard one the visitor already knows how to use, a web component on the web and the platform's native control in an app: buttons, tabs, inputs, selects, filters, tables with sortable headers, navigation that reads as navigation. Never a costume of the world's own interface: a terminal's function-key bar or command prompt, an instrument's bezel, ruled ledger paper standing in for a table. A comp an engineer could not build from the platform's standard components is a picture of the tool, not the tool. The finish bar is the best product in the category: an aligned grid, consistent spacing, a real type scale, and clear hierarchy. The signature move adds to a screen that is already that clean; it never stands in for it.
impeccable/reference/mode-persuade.md:9:For **Persuade**, the opening must make the offer intelligible and desirable, expose a clear action, and demonstrate something only this product can prove. The action is the one the category's visitors came to take, in its working form: an airline's route-and-dates search, a clinic's open appointment slots, a store's add to cart. A decorative link pointing at it elsewhere does not count. Conversion lives inside the form's own vocabulary: a hook that lands in one line, a visible primary action, a legible reading order. A committed form that hides the offer or the action has not finished translating. For **Experience**, the work itself leads from the first viewport.
impeccable/reference/visualize.md:30:This approval point has no substitute and no skip condition. When the structured question tool errors, fall back to the decision page; only after both fail may you treat the choice as delegated, and a delegated pick is recorded exactly as an approval is and disclosed in your first reply, not your last. The finish reviewer treats comp-round comps with no recorded approval as a material finding; decision comps under `.impeccable/mocks/decision/` are the direction round's hand, not comp-round output, and imply no approval on their own.
impeccable/reference/visualize.md:38:What the comp shows is measured, not remembered. new-work.md section 6 runs the build as phases (`impeccable build-phase`): the spec phase turns the comp into region boxes with sampled palettes (`impeccable comp-spec`), and the medium of every region follows from what the pixels are, never from what feels buildable: a figure, a product object, machinery, any illustration with perspective, shading, or drawing skill in it, and any texture by name (woven cloth, paper grain, fabric, leather, brushed metal) is a `plate` / `image` / `texture` region and ships as a raster; text, controls, chrome, diagrams with countable elements, flat shape systems, and anything that must move, scale, or respond are semantic. Writing "CSS" for a sculpted panel's finish, or a many-vertex `clip-path` for a torn edge, is the quiet deletion of the approved design; the detector's organic-clip-path and buried-raster rules and the hero gate's region scores catch it. Dropping an image-native region is a scope decision the user makes at the approval point, never a silent flattening after it. Generated imagery is a material, not a claim: evidence rules bind assertions, specs, testimonials, and photographs presented as real, never render fidelity.
impeccable/reference/visualize.md:42:Every raster region's plate is produced in the plates phase, before any page code, by the shipped asset producer or in the current thread (use `impeccable comp-spec --crop <id>` and save `impeccable comp-spec --plate-prompt <id>` to a prompt file; pass the crop and prompt to the harness image tool, or use `impeccable generate-image --ref <crop.png> --prompt-file <prompt.txt> --out <plate.png> --size <WxH> --quality high`). For isolated cutouts, add `--background transparent` to both the plate-prompt and API generation commands; use native PNG alpha and preserve white paint and clear gaps. Use `--background opaque` for full-frame imagery. Create output directories first and inspect alpha on light and dark grounds. Generation context is part of the asset: after generating any image with any tool, run `.claude/skills/impeccable/scripts/impeccable embed-prompt <image> --prompt "<prompt>"` with the exact string the tool received (`impeccable generate-image` does this itself), so the intent lives inside the file; `--read` recovers it, `--scan <dir>` lists rasters still missing one. The embedded prompt plus the region's row in the spec is the raster's **provenance**, and every raster the artifact references carries it; a sourced, stock, or pre-existing raster embeds its origin instead. A raster created or replaced later, in a fix batch or a reviewer's rebuild, is produced the same way; a raster a fix abandons is deleted in the same batch.
impeccable/reference/visualize.md:46:Return to [new-work.md](new-work.md) for the direction contract, the phased build, and the finishing pass.
impeccable/SKILL.md:15:- Verify in bounded passes, not a loop, and the ceiling covers the whole cycle: screenshots, defect scans, micro-edits, and rebuilds alike. Build fully, inspect once with a batched round (desktop and mobile together on the web; the shipped device classes on a native platform), fix everything it shows in one batch, confirm with at most one more round, and stop polishing. Open-ended self-QA burns the user's money doing worse what the finish handoffs do better.
impeccable/SKILL.md:17:## Setup
impeccable/SKILL.md:19:1. Run `<skill-base-dir>/scripts/impeccable context` once per session, where `<skill-base-dir>` is the directory that contains this SKILL.md (the skill folder, not a plugin root two levels above it); keep cwd at the user's project. That base directory resolves every `.claude/skills/impeccable/scripts/impeccable <verb>` command in this skill and its references, and `.claude/skills/impeccable/scripts` is the fallback only when the runtime reports no base directory. On a Windows shell without `sh`, call `.claude/skills/impeccable/scripts/impeccable.cmd` instead. The launcher runs a self-contained binary that ships next to it or is downloaded once on first run; no Node or other runtime is required. Pass a named source file or route as `--target <path>`. It loads PRODUCT.md, DESIGN.md, the matching surface brief, and native-platform guidance when applicable; follow its directives and do not rerun it.
impeccable/SKILL.md:21:3. After resolving analysis and direction, read [reference/craft-floor.md](reference/craft-floor.md) immediately before any UI edit, including small refinements. It carries the quality floor, the absolute bans, and the reflexes no detector catches. Do not load it for planning-only work.
impeccable/SKILL.md:23:**Launcher unavailable:** On refusal or failure, send a separate message **before the next tool call**: “Context loading did not run; I’ll read the existing project context directly.” Then read existing PRODUCT.md and DESIGN.md without inventing missing context, follow applicable steps 2–3, and continue through permitted tools. This applies to planning and editing; launcher failure alone does not block either. On "permission denied", the launcher lost its executable bit: run `chmod +x <skill-base-dir>/scripts/impeccable` and rerun Setup step 1 before falling back.
impeccable/SKILL.md:81:**Pin / Unpin:** `.claude/skills/impeccable/scripts/impeccable pin <pin|unpin> <command>` creates or removes a standalone `/<command>` shortcut. Report the script's result concisely; relay stderr verbatim on error.
impeccable/SKILL.md:85:**Doctor:** `/impeccable doctor` reports and repairs drift between this project's Impeccable artifacts (PRODUCT.md, DESIGN.md and its sidecar, config, surface briefs, the hook) and what this version reads. Load [reference/doctor.md](reference/doctor.md) when the user invokes it, or when they ask what is out of date, stale, or needs refreshing. A `CONTEXT_STALE` directive in Setup's output is the cheap subset of the same report; act on it there per its own instructions rather than running doctor unasked.
impeccable/SKILL.md:89:**Done when:** the command's reference file has been followed to its own finish line, any UI edit passed through craft-floor, and the final reply names what changed and what was left unverified.
impeccable/reference/audit.native.md:3:This is a code-level audit, not a design critique. Audit from source (SwiftUI / UIKit / Compose / React Native / Flutter); no browser tooling or `impeccable detect` applies. Score against the platform reference(s): [ios.md](ios.md) / [android.md](android.md), both for `adaptive`. Read them before scoring if Setup hasn't already. The report skeleton mirrors [audit.md](audit.md); keep the two in sync when changing it.
impeccable/reference/region-map.md:5:1. Run `.claude/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --grid` and open the original and gridded images.
impeccable/reference/region-map.md:6:2. Run `.claude/skills/impeccable/scripts/impeccable comp-spec --schema` for the JSON fields. Write `regions.json` with a `regions` array. Each region needs a stable `id`, `kind`, `note`, and exactly one of `pixelBox`, normalized `box`, or `grid`. Use the original comp’s dimensions.
impeccable/reference/region-map.md:7:3. Run `.claude/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions regions.json --inspect-map`. The output points to a report, overlay, exact crops and `COMPARE` sheets of masked references. The default prints findings; `--json` prints the entire report, with sheet paths in `comparisonSheets`.
impeccable/reference/degraded/asset-producer.md:2:This harness has no subagent capability, so you are running this role inline. Step fully out of the work you just finished, adopt only this file's instructions for the pass, and disclose the substitution in one line when you report. Where the text below addresses a parent agent, you are both parties: produce the full output contract first, then act on it yourself.
impeccable/reference/degraded/asset-producer.md:32:1. `.claude/skills/impeccable/scripts/impeccable comp-spec --crop <id>` writes the reference crop under `.impeccable/build/crops/`.
impeccable/reference/degraded/asset-producer.md:33:2. Choose the background from the approved region: an isolated figure, object, or line drawing on the page ground is a **transparent cutout**; a photograph, full-frame illustration, or texture stays **opaque**. Save `.claude/skills/impeccable/scripts/impeccable comp-spec --plate-prompt <id> --background transparent` to a UTF-8 prompt file for a cutout; use `--background opaque` otherwise. The transparent prompt preserves reference placement and clear margins, white paint, fine edges, and interior holes.
impeccable/reference/degraded/asset-producer.md:34:3. Produce the plate at its exact spec `plate` path. Create the output directory first and choose a supported output size matching the region's aspect, at least 1.5x its pixel dimensions. Prefer the harness-native image tool with the crop as input and the saved prompt; request a transparent PNG for cutouts, then run `.claude/skills/impeccable/scripts/impeccable embed-prompt <plate> --prompt-file <prompt.txt>` (if you refine the prompt, save and embed the exact text sent). With the API fallback, run `.claude/skills/impeccable/scripts/impeccable generate-image --ref <crop.png> --prompt-file <prompt.txt> --out <plate.png> --size <WxH> --quality high --background transparent` for a cutout, or `--background opaque` otherwise. The API fallback embeds the prompt and records the background in the sidecar. The output must be PNG; the fallback requests native alpha and performs no chroma-keying.
impeccable/reference/overdrive.md:60:- **WebGPU** (Chrome/Edge; Safari 26+; Firefox on Windows/macOS; flag only on Firefox Linux/Android): next-gen GPU compute, more powerful than WebGL. Always fall back to WebGL2.
impeccable/reference/hooks.md:9:Every hook is a mechanical pass. The reflexes no scanner catches live in [craft-floor.md](craft-floor.md), which the skill loads before it edits UI, so they apply whether or not a hook is wired. A session with no automatic hook gets one `MANUAL_DETECTOR_REQUIRED` directive from `impeccable context` asking for a single detector run at the end.
impeccable/reference/hooks.md:21:Gemini installs session and completion hooks in `.gemini/settings.json`, merged into the settings already there (comments are tolerated; a commented file is backed up to `settings.json.bak` before the rewrite, and a file that is not valid JSON is left alone). It does not install a per-edit detector hook. The `BeforeTool` hook only rewrites shell commands that run `build-phase`, and only on macOS and Linux; on Windows (where Gemini runs hooks through PowerShell) no session id reaches the shell, so a comp build is not tied to the session and the completion reminder stays silent.
impeccable/reference/hooks.md:45:   .claude/skills/impeccable/scripts/impeccable hooks <action> [args...]
impeccable/reference/hooks.md:75:.claude/skills/impeccable/scripts/impeccable hooks ignore-value overused-font Inter --shared --reason "User confirmed Inter is intentional"
impeccable/reference/hooks.md:81:.claude/skills/impeccable/scripts/impeccable hooks ignore-value bounce-easing bounce-ball --shared --reason "Agent: literal ball-bounce animation, bounce easing is the subject"
impeccable/reference/hooks.md:87:.claude/skills/impeccable/scripts/impeccable hooks ignore-rule overused-font --all-values --reason "User asked to ignore overused fonts generally"
impeccable/reference/hooks.md:94:.claude/skills/impeccable/scripts/impeccable hooks ignore-value design-system-font-size "*" --file "src/overlay/widget.js" --reason "Injected widget builds its own type scale; DESIGN.md's ramp describes the site"
impeccable/reference/hooks.md:100:.claude/skills/impeccable/scripts/impeccable hooks ignore-file "src/legacy/Card.tsx"
impeccable/reference/onboard.md:70:**Account Setup**:
impeccable/reference/new-work.md:39:`.claude/skills/impeccable/scripts/impeccable concept-seed --scope surface --mode <mode>`
impeccable/reference/new-work.md:48:4. Run `.claude/skills/impeccable/scripts/impeccable concept-seed --scope direction --mode <mode>` and follow what it prints. No substitute, no skip: on a new or replacement world, writing artifact code before this script has run and its assignment is acknowledged is a contract violation, whatever the harness, the model, or the time pressure; the roll is what keeps every run from converging on the category default. The script assigns the direction to build and deals catalog challengers. Fuse each challenger before judging it: the challenger supplies the form and its system grammar, the product supplies every fact, clarity wins conflicts. Weigh fused challengers against the assigned direction on exactly two axes, audience identification and product clarity. Losing to strong grounded material is a valid outcome; beating a thin or tool-monoculture list is the point. Close with a verdict per challenger, decided before any borrowing: wins (beats the assigned direction on both axes; becomes the build candidate), competitive (holds one axis; stays a full alternate), or declined (loses both). A declined challenger is not spent: name the one discipline of its system the assigned direction lacks, and raise the assigned direction to match before presenting it. A donation transfers ambition and system discipline (a palette's total commitment, a grid's density courage, a form's structural honesty), never the challenger's clothes; a lifted motif is a costume note, not a raise, and one world owns the page. Write each raise into the presented direction as its own line, named for its donor; a raise nobody can read did not happen.
impeccable/reference/new-work.md:51:The standing exit: every direction round offers one quiet, permanent alternative, the category standard, played straight. It is the user's door, never yours: never recommend it, never weigh it against the roll, never let it soften the dealt directions; the counterweights bind the unchosen default, not the chosen one. When the user takes it (the canon action, a safer-steer, or plain words asking for the familiar or competitor-like path), convention becomes the commitment: ask once for two or three products this should sit alongside, make their craft level the bar, and execute the canon at full fidelity, without irony or smuggled quirk. Record a standing preference as a brand commitment in PRODUCT.md. Re-roll eliminates every direction already shown, grounded and challenger alike; after two consecutive re-rolls, ask what quality is missing. Re-roll on your own only on named factual grounds, when the assigned direction cannot carry the product's truth or task; taste is never grounds. The user may re-roll freely, and a user- or brief-pinned direction beats the roll, always. Resolve collisions field by field: preserve every user- or brief-pinned constraint. In dimensions the brief leaves open, the assignment still binds through its topology, controls, state vocabulary, and ritual; when only its materials conflict with a pinned visual direction or PRODUCT.md brand commitment, translate that material expression and name the translation in the presented direction. A look mismatch is not grounds to re-roll. Present the decision visually: write an options payload with the assigned direction leading, its raised lines included; the pick card when one exists; the dealt challengers as alternates with their QUALITY BAR cards, verdicts, and kept lines; re-roll with its safer and bolder registers; steer; canon enabled; and `buildPath` carrying the recorded default with `toggle: true` whenever image generation exists (details in the build-path paragraph below). A degraded roll with no challengers still uses the page, as a single text-only card with re-roll. Give every card the same anatomy: thesis, palette, materials, first viewport, honest risk, and the challengers' case lines (`--schema` prints the exact shape); the page renders identity from these fields, demotes declined challengers to their row on its own, and a challenger's catalog image rides as labeled inspiration, never the promise of the build. Author `canonCard` too: the category standard as one honest card, same anatomy; the page keeps it subordinate, and the counterweights still bind you. Run `.claude/skills/impeccable/scripts/impeccable serve-question --start --payload <file>` (`--schema` first for the payload shape). It daemonizes, prints the page URL and a key, and exits; open that URL for the user, in-app browser first, then the system opener, then showing the URL. Collect the choice with `--wait --key <key>`, repeating while it exits 3; the ANSWER prints as JSON. An ANSWER of `{"optionId":"reroll"}` keeps the server alive and the page open on a loading hand: rerun concept-seed with the same `--scope` and `--mode` plus `--from <seed-key> --reroll <n>` (1 on the first re-roll, counting up), build the next payload, deliver it with `--update --key <same key> --payload <file>`, then return to `--wait` on that key. Never `--start` a second server or fall back to chat here: either strands the open tab on a hand that never arrives. Exit 4 means the page closed unanswered: re-present once through the structured question tool, and with no answer there either, proceed unattended with the assigned direction and state the assumptions. A harness that can leave a shell blocked in the background may run the script without `--start` and let it auto-open and block. A harness that cannot hold a blocking `--wait` (it backgrounds long-running commands, or reaps a backgrounded child) takes the structured tool without starting the page and discloses the substitution in the first reply, so the tab is never left unanswered. Never predict any other fallback: run the script, and only exit code 2 from starting it, or that wait check before starting, routes the decision to the structured tool; those are the fallback, never an error to retry.
impeccable/reference/new-work.md:53:When image generation exists, every card also declares a `comp` path under `.impeccable/mocks/decision/`, the canon card included. Where the harness sandboxes its shell, start the page through the least-sandboxed command path it offers: a sandboxed shell cannot bind the board's port, and the first-attempt failure costs a retry every session. Serve the page first, then produce the comps; the page shimmer-waits per slot and the user may answer before they land. Load [visualize.md](visualize.md) before writing the first decision comp prompt, not at the comp round: each card's image is that direction's north-star comp at full fidelity under its comp discipline and the MODE RULES block concept-seed printed, and a prompt written before reading them misses every rule there: the requested surface as the real page, its first viewport and the start of the section below it, held like every comp to visualize.md's rule that a template skeleton stays the template whatever world paints it (your own pick included: a safe layout under a world skin is the template), structure-led prompt, real product name and real content, no invented commercial claims, in that card's own palette, type character, and material world, committed all the way. Once a round declares comps it has not generated yet, `impeccable serve-question --start` (and `--update`, and a flip to comp) prints a `NEXT read <path>/visualize.md` line; read that file then, before the first prompt. `--wait` prints `COMP SIDECAR MISSING` for any landed decision comp with no prompt sidecar (the image's full file name plus `.json`: `a.png` gets `a.png.json`); write the missing sidecar before you continue. `COMP STALE` names a file an earlier round left at one of this hand's slots; regenerate it there. Generation takes the same time at any fidelity, so an unfinished draft pays comp cost for draft quality; fairness between cards is equal fidelity in each card's own grammar, one surface, one aspect, never shared unfinishedness. The frame's aspect is the surface's own: portrait at device viewport for a native app or mobile-first surface, landscape for desktop web; the decision page adapts to either, and a phone screen comped landscape is a broken frame, not a neutral default. Produce in reading order, the assigned card, then the pick, then the full-card hand, then canon, each file written with its prompt sidecar the moment it is done, so a re-roll's spend front-loads onto the cards read first; declined challengers get no comp, their catalog thumb is their face. With parallel subagents, fan out one agent per card: each spawn is the shipped asset producer with a single-comp packet, that card's fields, PRODUCT.md, the shared frame, the path to visualize.md for its comp discipline, the COMPS section of the MODE RULES block copied verbatim (the subagent never sees the roll's output), and the card's declared path, up to four in flight. Regenerate inline any slot still empty when its agent returns; drop without ceremony any slot still empty when the user answers. No other supervision is owed. Without parallel subagents, generate in the main thread after serving, same order, and let the harness's own generation display carry the progress; the wait for the answer follows the last file. The chosen card's comp is not spent by the choice: comp-led, it enters the comp round as compositional option one; code-led, it returns at the finish review as the critique reference, what the image dared that the build did not. Unchosen comps stay in `.impeccable/mocks/decision/` as the round's spent hand; they carry no approval and imply none. With no image generation, cards carry their identity in palette chips and facts, and that page is complete, not a lesser version; the page then also demotes every challenger's catalog art to a labeled thumbnail on its own, because salience must encode the verdict, never the accident of which cards have images.
impeccable/reference/new-work.md:55:The execution contract, comp-led or code-led, is a workflow preference, not a per-surface decision; no round asks it. The recorded default rides every round and the page's toggle handles the exception. Read the default from `.impeccable/config.json` (`buildPath`), the gitignored `.impeccable/config.local.json` winning where one machine differs from the team's committed value; with neither, comp-led is the default whenever image generation exists. Author every direction and surface payload with `buildPath: { "value": <default>, "toggle": true }`; the page renders a footer toggle with the trade stated beside it, and the ANSWER returns `buildPath` plus `buildPathFlipped`. A flipped value binds that session only and is never written back, with one exception, the only question this preference ever earns inside a round (init records it up front on projects that get the chance): when `buildPathFlipped` comes back true on a project that records no `buildPath` at all, ask once after the round closes whether to keep it as the standing default. Either answer writes `.impeccable/config.json`; the answer picks the value, never whether to record one. Yes writes the flipped value; "no, just this once" writes the value they flipped away from, the standing default they just confirmed by declining. Ask on the flip, never on the untouched default: a user who left the toggle alone told you nothing. A declined offer nothing writes down is an offer the next session makes again. When the user asks in words to change the standing default, update the file without asking. **Comp-led**: the chosen card's comp is law, generated before building when it does not yet exist, and the finish review audits the build against it; boldest composition on the table, fix rounds expected, and the comp is non-optional, no silent skipping. **Code-led**: no comp of this page and no apology for it; the QUALITY BAR boards still calibrate finish, and the ambition moves into the written contract, the FIRST VIEWPORT block plus a named signature interaction and motion grammar, which the finish reviewer audits in behavior; code-led is not a discount on commitment. A code-led round still declares each card's comp path as a flip reserve: when the user flips the toggle to comp mid-round, `--wait` returns once with BUILD PATH FLIPPED while the page shimmers the slots; generate each open card's comp into its declared path then, lead first, and wait again. The flip back is free, and a comp that already rendered rides at the finish review as the critique reference. Without image generation there is no toggle and no choice: code-led is the only path, stated in one line rather than asked. The old two-card execution-contract round is retired; `followup: true` remains the general mechanism for delivering any later round over the same table via `--update`.
impeccable/reference/new-work.md:57:Catalog worlds are working systems, not mood references. When one survives, carry its palette and material, type and composition, topology, controls and state, and responsive rules into the product, as far as the surface's mode allows. How far a source that is itself an interface language may carry its grammar is the mode's call, in the MODE RULES block. Open the QUALITY BAR board and hero for the world you build the moment the choice lands, even if you viewed another card earlier; the ANSWER line names the chosen card's images (when the harness only reads files or runs sandboxed, download them into the workspace and open the relative path; sandboxed viewers reject absolute paths outside it). They set the craft level the build must reach, a rendered reference's finish, commitment, and art direction, never the composition; your surface serves this product.
impeccable/reference/new-work.md:75:Before code, record the chosen direction as a development-only contract under `## Direction contract` in the relevant surface brief. A direction contract is durable route or artifact strategy, so create or update the brief even when no other surface strategy needs persistence. Use six short blocks, roughly 150 words; do not spend tool calls counting words. THESIS: the one idea this surface owns and the category-default arrangement it refuses. OWN-WORLD: the palette and component language, specific enough to be recognizable with all content removed. STORY: what the visitor understands, believes, and does. FIRST VIEWPORT: the exact composition, what is where and at what scale, and where the primary action sits. FORM: the chosen form, its position on your ordered list, and the seed key the script printed. Close with one more line, FINISH: the run's exit condition, verbatim "unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance". The surface brief is the reminder later agents reload across edits and sessions: a page that looks complete with the FINISH line undischarged is not done, it is abandoned at the finish line. If a block reads like a mood, the direction is not decided yet; the finishing review audits the render against this contract.
impeccable/reference/new-work.md:79:On a new or replacement world, DESIGN.md is written at finish, from the built world, by the shipped documenter (section 7); a rulebook written before the build gets defended against reality instead of describing it, and hands the design-system detector an unstable target. A new world shipped with no DESIGN.md is still an incomplete run. An ordinary extension does not rewrite DESIGN.md.
impeccable/reference/new-work.md:83:`.claude/skills/impeccable/scripts/impeccable surface-brief read <primary-target>`
impeccable/reference/new-work.md:85:`.claude/skills/impeccable/scripts/impeccable surface-brief write <primary-target> <body-file> [related-target ...]`
impeccable/reference/new-work.md:91:On a comp-led build, whenever any image generation is available (a harness-native tool or the API fallback `impeccable context` reports), the locked direction is visualized before it is built, never skipped: load [visualize.md](visualize.md) and follow it, three compositional options put before the user for approval, the chosen card's decision comp plus two variations. This step is proven to produce the most compositional and ambitious work. On a code-led build the comp round is skipped by contract, never by drift: the ambition it would have carried lives in the direction contract's FIRST VIEWPORT block and named signature interaction, and the finish reviewer audits those promises in behavior.
impeccable/reference/new-work.md:103:`.claude/skills/impeccable/scripts/impeccable build-phase start --direction <seed key> --kind <assigned|pick|challenger|canon> --artifact <entry file>` right after the direction choice (this is also the choice ping; the roll's output names the exact command), or `start --comp <approved comp> --artifact <entry file>` when a surface round already locked one.
impeccable/reference/new-work.md:105:Then, in order, each closed by `.claude/skills/impeccable/scripts/impeccable build-phase advance` (every verb below runs as `.claude/skills/impeccable/scripts/impeccable <verb>`; exit 2 means the gate failed and printed why; fix that and advance again; write nothing for a later phase while an earlier gate is open):
impeccable/reference/new-work.md:115:3. **hero.** `impeccable build-phase scaffold` first: it writes the measured layout as CSS custom properties (`.impeccable/build/scaffold/layout.css`: `--r-<id>-x/y/w/h` in % of the comp, plus cap height, font-size, family, and weight where measured) and a reference page (`hero-reference.html`) with every region at its box and every plate placed. Bind the numbers to your own semantic structure, an element per region; the reference is a check on positions, never the page, and overlapping boxes are overlapping boxes. Then build only the first viewport, at the comp's own dimensions, the comp's words copied verbatim (the user approved that comp with those words; rewording is a stated decision after the hero passes, never a silent one inside it), every text region sized from its measured cap height and set in its ranked face (served from the project: put the face's font files beside the page and load them with `@font-face`, never a hosted font stylesheet such as fonts.googleapis.com or a font data URI, because the first-viewport capture allows fonts only from the page's own files and refuses any other host as an external dependency), plates first: place every plate at its spec box (`object-fit: cover`, an `<img>`, a background image, or an inlined data URI named for it) before any text or control, capture into `.impeccable/review/hero-repro.png`, run `impeccable build-phase record hero` once so you see the plate regions read as match before any text exists, then lay the semantic layer over the plates from the spec's palette and boxes and advance. The gate first refuses while any plate is unreferenced by the source, then runs `impeccable comp-diff`, writes `.impeccable/review/diff/hero/` (side-by-side, heatmap, one paired crop per region, `report.json`; `raw-report.json` preserves the uninterpreted measurements). The report and crop labels use the gate's verdicts; `gate.reasons` lists the remaining blockers even when a region is called drift. An accepted plate is revalidated if its file, measured region, or comp changes. The gate passes at 72% overall with no hard veto outstanding (a missing region, a contradicted plate or text block, an SVG illustration, a clipped plate, invented ink block at any score); above the bar, the numeric readings become advisories printed with the pass, and the polish pass before responsive is where they get fixed: the gate also reads each text region's cap height, line count, weight, ink colour, and position against the comp, each chrome strip's height off its rule, and the frame for ink where the comp is calm (a kicker, an extra nav item, a divider), and says each miss as a number ("cap height 78px in the build, 103px in the comp"); those numbers are the edit. When it fails, open the region crops it lists, in order, before editing: a region scored `missing` needs its material, `contradicted` needs its structure re-derived from the spec box, `drift` is where size and spacing edits belong; repeated attempts do not clear unresolved blockers. After three failed attempts, present the first-viewport review from [component-review.md](component-review.md) instead of iterating. Once the user accepts a first viewport, the overall bar, the palette check and every numeric reading are advisories while the capture still matches it; a missing or unreferenced plate, an SVG illustration, an organic clip, a clipped plate, invented ink and failed rendered presence still block. When the capture drifts from what they accepted, restore it: that review is closed and is never requested again. This is where the run's ambition is won or lost, and a retry here costs minutes where a rebuild verdict at the finish costs the run.
impeccable/reference/new-work.md:122:No comp and no apology for it: the ambition lives in the direction contract's FIRST VIEWPORT block and the named signature interaction, and the finish reviewer audits those promises in behavior. The chosen decision comp rides to the finish review as the critique reference.
impeccable/reference/new-work.md:136:## 7. Inspect and finish
impeccable/reference/new-work.md:138:Inspect the surface's target sizes in one batched screenshot round: desktop and mobile on the web; on a native platform (`ios` / `android` / `adaptive`), the shipped device classes per OS, captured from the simulator or emulator the way the platform reference's Verifying the build section describes. When the harness reports the user's actual viewport (an in-app browser's size, a named resolution), add that width to the set: the width that breaks is the one the user sees first. Critique the render against the user's request and the direction contract, fix material gaps, and confirm with one final round; two rounds is the ceiling, and fixes batch between them rather than earning per-tweak screenshots. On a comp-led build, run `.claude/skills/impeccable/scripts/impeccable comp-diff --comp <approved comp> --build .impeccable/review/desktop.png --spec .impeccable/build/spec.json --out-dir .impeccable/review/diff/final` and read its region rows and paired crops as the critique: the side-by-side is the view the build thread never has on its own, and a region it scores missing or contradicted is a fix whatever the page looks like from memory. Never judge fidelity from one full-page thumbnail; it hides exactly the failures that matter. On a Persuade surface, verify the mode did its job: a first-time visitor should know what this is, why it matters, and what to do within seconds, in the form's own vocabulary.
impeccable/reference/new-work.md:142:After the second inspection round the build thread's polishing is over: no further defect hunts, micro-edit scripts, or rebuilds here; whatever remains ships through the handoffs, where a fresh context does the finding better and cheaper. On the web, where this harness runs no design hook, run `.claude/skills/impeccable/scripts/impeccable detect --json` on the changed targets once here, fix what is mechanical, and pass the remaining findings to the reviewer; a hookless web build that skips this ships every tell the hook exists to catch. A native platform skips the detector entirely: it reads HTML and CSS and has no verdict on native code, so the reviewer's floor check is the only slop gate and the input packet says so. Capture the screenshots into `.impeccable/review/`, one file per captured viewport (on the web, `desktop.png` and `mobile.png`, plus `user-<width>.png` whenever the user's viewport joined the inspected set; on native, one per device class, such as `phone.png` and `tablet.png`, suffixed per OS on adaptive), creating that directory when the harness does not; the paths you pass the reviewer are its spec, every viewport you inspected is named required in the packet, and that directory is where it looks when a passed path is missing.
impeccable/reference/new-work.md:144:Then spawn the shipped finish reviewer, `impeccable-finish-reviewer` (`impeccable_finish_reviewer` in codex; `/impeccable-finish-reviewer` in Cursor; on GitHub Copilot say "Use the impeccable-finish-reviewer agent"), with the original request, confirmed answers, the artifact path, the screenshot paths, the direction contract, existing hook findings, the QUALITY BAR card and approved comp paths (a code-led build has no approved comp; the chosen decision comp rides in that slot as the critique reference, named as such), on a comp-led build the build state (`.impeccable/build/state.json`), the spec, and the diff directories (`.impeccable/review/diff/hero/` and `.impeccable/review/diff/final/`, whose side-by-side, heatmap, region pairs, and `report.json` are the fidelity evidence), the craft-floor reference path, and on a native platform the platform reference path(s), [ios.md](ios.md) / [android.md](android.md), both on adaptive, plus one line saying no detector ran, so the reviewer judges in the platform's conventions rather than the web's. The reviewer has no browser; screenshots you fail to pass are checks it cannot run. Never read the shipped agents' definition files before spawning; the harness loads them at spawn, and you owe only the input packet. Wait on any agent with one long timeout rather than a loop of short polls, and spend the wait on the next independent step. Verify the return carries the five contract sections (a recapture return carries one, its recapture list); on an empty or thrashed return, respawn once with the same inputs. This review never runs inside the build thread and never inherits it: spawn the reviewer fresh, with no forked conversation history (`fork_turns: 0` in codex); a reviewer that inherits your transcript inherits your framing, your optimism, and your abstractions, and everything it needs travels in the inputs above. Only a harness with no subagent capability at all substitutes a fresh in-thread pass after stepping fully out of the build context, run from [degraded/finish-reviewer.md](degraded/finish-reviewer.md), and a substituted or failed-and-replaced review is disclosed in one line at finish, never silently.
impeccable/reference/new-work.md:146:Act on the disposition word; there are exactly four. **recapture**: the evidence failed, not the build. Recapture what the return names under the capture-validity rules, then run a full review over the new evidence. A review conducted on invalid evidence binds nothing, and a verdict pass may never follow it. **rebuild**: fidelity failed wholesale, not in patches. Skip the fix batch and execute the rebuild immediately: re-derive the named regions, produce the named assets, and send the result back for a fresh full review, never a verdict pass; a rebuild replaces regions wholesale, so the whole matrix runs again over the recaptures. Tell the user what is happening rather than asking permission to fix a failure. Consult the user only on a second rebuild directive, both verdicts on the table, or when rebuilding would discard content the user approved. **ship**: nothing is owed; report the verdict at its scope and continue to the documenter. **fix**: apply the material fixes in one batch, rebuild once, and recapture the same viewports over the same files. A recapture measures positions, loading, and overflow; it cannot measure whether a fix reached the quality the finding named, so send the recaptured screenshots back to the same reviewer for a verdict scoring every material fix resolved, partial, or unresolved (through the harness's agent continuation; without one, run the scoring fresh from [degraded/finish-reviewer.md](degraded/finish-reviewer.md)'s Verdict Pass). Fixes scored partial or unresolved get another batch, recapture, and verdict. Two rounds is the budget an unattended run ends at; an attended session's ceiling belongs to the user, so when the second verdict still lists open items, put the table in front of them and let them choose between shipping as it stands and funding another round. Whoever decides, stop the moment a round resolves nothing, and the reviewer's findings are the only list you work from, never your own re-opened hunt. Do not run a second detector.
impeccable/reference/new-work.md:148:A rebuild and a fix round share one asset rule: a raster either round creates or replaces is still asset work under [visualize.md](visualize.md)'s Produce section and keeps its **provenance** like every build raster, and a raster the round abandons is deleted in the same batch. Before either round's result goes back for review or verdict, run `.claude/skills/impeccable/scripts/impeccable embed-prompt --scan <asset-dir...>` over the directories the artifact's rasters ship from and clear every file it reports by embedding what it is missing: the exact generation prompt for a produced raster, the origin for a sourced, stock, or pre-existing one. The scan only reads; deletion is reserved for rasters the round abandoned, never for a file the scan flagged.
impeccable/reference/new-work.md:152:After the last correction, spawn the shipped documenter, `impeccable-documenter` (`impeccable_documenter` in codex), with the project root, artifact path, direction contract, PRODUCT.md, [document.md](document.md), and write boundary. Without subagents, load [degraded/documenter.md](degraded/documenter.md) and [document.md](document.md) before writing. Verify the outcome: new worlds and approved system changes require token-bearing DESIGN.md **and** `.impeccable/design.json`, not prose alone. Ordinary extensions compare the finished build against the incumbent system, preserve its files, and report the evidence checked; report pre-existing drift without repairing it unasked. Recheck after later edits. Finish only when review and documentation are complete.
impeccable/reference/new-work.md:154:On a comp-led build, record the final review disposition with `.claude/skills/impeccable/scripts/impeccable build-phase finish --disposition <ship|fix|rebuild|recapture>` before the final response. A refused `ship` is an unfinished build; report the outstanding phase with the verdict.
impeccable/reference/degraded/finish-reviewer.md:2:This harness has no subagent capability, so you are running this role inline. Step fully out of the work you just finished, adopt only this file's instructions for the pass, and disclose the substitution in one line when you report. Where the text below addresses a parent agent, you are both parties: produce the full output contract first, then act on it yourself.
impeccable/reference/degraded/finish-reviewer.md:6:You are the finishing reviewer for an Impeccable build: fresh eyes on a done artifact, outside the build thread's attention gravity. You edit nothing; the parent applies your fixes.
impeccable/reference/degraded/finish-reviewer.md:14:Expect: the original request; the confirmed user answers; the artifact path(s); the screenshots the parent captured, in `.impeccable/review/` (web: `desktop.png` and `mobile.png`; native: device-class names such as `phone.png` and `tablet.png`, suffixed per OS on adaptive). A screenshot path the calling brief names is authoritative when the file exists; `.impeccable/review/` is where to look when the brief names none or a named path is missing, never a filename you invent. Also expect: the direction contract (THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM); the PRODUCT.md path; existing hook or detector findings; the chosen world's QUALITY BAR card paths; on a comp-led build the approved comp path (a code-led build has none; it passes the chosen decision comp as a separate critique-reference input, labeled as such, and nothing here that binds "the approved comp" binds it); on a comp-led build the build state (`.impeccable/build/state.json`), the measured spec (`.impeccable/build/spec.json`), and the diff directories `.impeccable/review/diff/hero/` and `.impeccable/review/diff/final/` (each holds `side-by-side.png`, `heatmap.png`, `regions/<id>.png` paired crops, and `report.json` with per-region scores and verdicts from `impeccable comp-diff`); and the skill's `reference/craft-floor.md` path. On a native (`ios` / `android` / `adaptive`) build the packet adds the platform reference path(s) (`reference/ios.md` / `reference/android.md`) and a line saying no detector ran: read the platform reference alongside the craft floor, judge every check in the platform's own conventions, treat the screenshots as device captures, and know your floor check is the build's only slop gate. When the harness can view images, open the screenshots, the comp, and the card first, and inventory the comp's salient elements in your own words before reading the direction contract or any builder-authored summary: a review anchored on the contract inherits whatever the builder's abstraction dropped.
impeccable/reference/degraded/finish-reviewer.md:21:3. **Ceiling.** Against the QUALITY BAR card: name the world's native devices the build left unused, frame, depth, lettering treatment, ornament density, motion. The card governs commitment and finish, never composition.
impeccable/reference/routing.md:11:Setup has already run `impeccable context`. If that reported `NO_PRODUCT_MD`, the project has no captured context yet: lead the menu with `/impeccable init` as the top recommendation (one line on why) and still show the rest below; don't silently jump into init. Otherwise run `.claude/skills/impeccable/scripts/impeccable signals` once and read its JSON, then lead with the **2-3 highest-value next commands**, each with a one-line reason pulled from the signals, followed by the full menu (the Commands table in SKILL.md, grouped by category). **Never auto-run a command; the recommendation is a suggestion the user confirms.**
impeccable/reference/routing.md:22:**If `scan.targets` is non-empty and `setup.platform` is not `ios`/`android`/`adaptive`, run `.claude/skills/impeccable/scripts/impeccable detect --json <scan.targets joined by spaces>` once** (the bundled detector over local files: no network, no npx; it reads HTML/CSS, so skip it for native projects). `scan.via` tells you what they are: `git-changes` (the markup/style files in your dirty tree, the most relevant set), `source-dir` (e.g. `src`, `app`), `html`, or `root`. Fold the hits into your picks: many quality / contrast hits → `audit` or `polish`; a specific slop family → the matching command (gradient text or eyebrows → `quieter` / `typeset`, flat or gray palette → `colorize`, and so on). It's a real, current signal that beats guessing. If detect errors or the tree is large and slow, skip it and recommend the user run `audit` themselves; never block the suggestion on it.
impeccable/reference/harden.md:270:- Test in Windows high contrast mode
impeccable/reference/degraded/manual-edit-applier.md:2:This harness has no subagent capability, so you are running this role inline. Step fully out of the work you just finished, adopt only this file's instructions for the pass, and disclose the substitution in one line when you report. Where the text below addresses a parent agent, you are both parties: produce the full output contract first, then act on it yourself.
impeccable/reference/generate.md:7:The plumbing is where the lane saves time: one command starts the session around the page your harness already shows, one call replies and waits, and nothing here is a browser you have to babysit. The design work is not where it saves time. Setup runs as for any command (`impeccable context`, this reference, craft-floor.md before the edit), and the variants are planned, written, and accepted exactly the way a live session plans, writes, and accepts them.
impeccable/reference/generate.md:49:.claude/skills/impeccable/scripts/impeccable live-generate --target src/App.jsx --dev-url http://127.0.0.1:5173/ --selector ".pricing-grid" --action bolder --count 3 --boot --wait-for-browser 60000
impeccable/reference/generate.md:66:- **`event: null`** with `ok: true`: the event was slower than the wait; run `.claude/skills/impeccable/scripts/impeccable live-poll` once to collect it, then continue.
impeccable/reference/generate.md:72:The event is a standard `generate` event: the picked element's context, a preflighted scaffold, and `_instructions` naming the action's reference, the planning section, and the exact splice. Handle it exactly per live.md's **Handle generate**, which owns everything from the identity lock to the done reply: read the action's reference and craft-floor.md as it says, plan per section 4 (identity first, then mode, then three different primary axes, then the squint test), declare knobs per section 7, and deliver per section 6 (a complete replacement of the element per variant, the preview CSS plus every variant in one edit at the scaffold's splice). The lane changes nothing about what a variant may be: the moves a live session would make on this element (a promoted tier, a restructured set, a reordered card, a different surface) are open here too. Never screenshot the page; the overlay preview is the review channel until accept.
impeccable/reference/generate.md:77:.claude/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID done --file src/App.jsx --then-poll
impeccable/reference/generate.md:88:The call from Step 3 returns the user's choice. **`discard`**: nothing to do. **`accept`**: `_acceptResult.carbonize: true` is the normal case, and the cleanup is live.md's **Required after accept**, unchanged: move the accepted variant's rules into the stylesheet that already owns the element with real selectors, bake the chosen knob values in, unwrap the element and drop every `data-impeccable-*` attribute, delete the inline `<style>` block and both `impeccable-carbonize` markers, then `.claude/skills/impeccable/scripts/impeccable live-complete --id SESSION_ID` and confirm `phase: "completed"`. (`baked: true` appears only when the accept was run with `--bake`; then the helper already made the variant permanent and no `live-complete` is owed.)
impeccable/reference/generate.md:93:.claude/skills/impeccable/scripts/impeccable live-server stop
impeccable/reference/generate.md:99:- **Interrupted or unsure of the state**: `.claude/skills/impeccable/scripts/impeccable live-status`, then `live-resume`; the journal under `.impeccable/live/sessions/` is canonical.
impeccable/reference/craft.md:3:`craft` is a deprecated alias for an ordinary request to make new visual work. It adds no setup, interview, checkpoint, tool, or quality behavior. Apply SKILL.md's normal routing: create missing PRODUCT.md through [init.md](init.md), then follow [new-work.md](new-work.md) for visual authority, world and surface decisions, implementation, and finish.
impeccable/reference/init.md:15:Never silently overwrite an existing file or offer DESIGN.md during init. If another request invoked init, finish PRODUCT.md and resume it. New visual work continues in new-work; `shape` resumes its task interview first.
impeccable/reference/init.md:112:When image generation is available and no `buildPath` is recorded yet, ask once how new surfaces should be built. Availability means a harness-native image tool or the API fallback that `impeccable context` reports as `IMAGE_GEN_AVAILABLE`, and the first of those leaves no trace in the boot output: `impeccable context` only sees the key, so a silent boot on a harness that generates images is not evidence there is nothing to ask about. This is its own question, never a clause riding inside another one. The stack round asks what to build with; this asks how the building starts, and an answer to the first carries no consent about the second. State the trade in the question the user actually reads, because the two names mean nothing to someone meeting them for the first time: **comp-first** (an image sets the bar before any code; bolder composition, slower, and the build must match the image) or **code-first** (build directly; the ambition is written into the direction contract and audited at the finish; leaner, faster).
impeccable/reference/live-setup.md:50:.claude/skills/impeccable/scripts/impeccable detect-csp
impeccable/reference/bolder.md:26:## Before you finish
impeccable/reference/operate.md:3:When design SERVES the product: app UIs, admin dashboards, settings panels, data tables, tools, authenticated surfaces, anything where the user is in a task. The essentials live in SKILL.md's modes and [craft-floor.md](craft-floor.md); this file is extended depth, written for Operate surfaces. Read surfaces (docs, guides, long-form) take SKILL.md's Read mode plus this file's typography and consistency rules; their prose measure and navigation matter more than component density.
impeccable/reference/degraded/documenter.md:2:This harness has no subagent capability, so you are running this role inline. Step fully out of the work you just finished, adopt only this file's instructions for the pass, and disclose the substitution in one line when you report. Where the text below addresses a parent agent, you are both parties: produce the full output contract first, then act on it yourself.
impeccable/reference/degraded/documenter.md:20:5. Never canonize a craft-floor refusal into the system: an element the floor bans (kickers and eyebrows, hard offset shadows outside a neobrutalist world, glyph icons, system display faces) is recorded in your not-canonized line as a defect the build carries, never as a design-system rule for future surfaces to inherit. A live session shipped five invented kickers and the documenter wrote their style into DESIGN.md; that is how one violation becomes the house style.
impeccable/reference/adapt.native.md:3:Adapt an existing **native** design (`ios` / `android` / `adaptive`) to a different context: another device class, orientation, platform, or origin. The trap is treating adaptation as scaling. The job is rethinking the experience for the new context, inside the platform conventions of [ios.md](ios.md) / [android.md](android.md); read the target platform's reference before planning if Setup hasn't already.
impeccable/reference/polish.md:26:- known constraints or deliberately unfinished work;
impeccable/reference/polish.md:32:.claude/skills/impeccable/scripts/impeccable critique-storage latest "<resolved target>" --json
impeccable/reference/polish.md:85:## 5. Verify and finish
impeccable/reference/polish.md:97:Finish with a source diff: remove accidental churn, orphaned code, redundant values, and temporary artifacts. Ship only when the feature is functionally complete and consistently finished across the path.
impeccable/reference/polish.md:102:.claude/skills/impeccable/scripts/impeccable critique-storage close "<resolved target>" "<snapshot_file returned by latest>"
impeccable/reference/critique.md:10:- Assessment A must finish before detector findings enter the parent synthesis context. Detector output is deterministic, but it still anchors judgment.
impeccable/reference/critique.md:16:- A run that ends with neither the targeted questions nor a literal `Questions skipped: <reason>` line is an incomplete run. The report is not the finish; the close is.
impeccable/reference/critique.md:18:### Setup
impeccable/reference/critique.md:26:   .claude/skills/impeccable/scripts/impeccable critique-storage slug "<resolved-path-or-url>"
impeccable/reference/critique.md:38:- If and only if sub-agents are unavailable, fall back sequentially: finish and record Assessment A, then run Assessment B, then synthesize, and emit the degraded banner.
impeccable/reference/critique.md:62:.claude/skills/impeccable/scripts/impeccable detect --json [target]
impeccable/reference/critique.md:76:4. If mutation is available, start `.claude/skills/impeccable/scripts/impeccable live-server --background`, present the browser if supported, label `[Human]`, scroll top, inject `http://localhost:PORT/detect.js`, wait 2-3 seconds, read `impeccable` console messages, then stop the live server.
impeccable/reference/critique.md:189:Skip this step if the Setup slug was null (vague or root-level target).
impeccable/reference/critique.md:198:     .claude/skills/impeccable/scripts/impeccable critique-storage write "<resolved target>" <body-file>
impeccable/reference/critique.md:206:   .claude/skills/impeccable/scripts/impeccable critique-storage trend "<resolved target>" 5
impeccable/scripts/impeccable.cmd:3:rem Impeccable launcher (Windows). Runs bin\windows-<arch>\impeccable.exe next
impeccable/scripts/impeccable.cmd:7:rem tests, not yet on a real Windows machine):
impeccable/scripts/impeccable.cmd:19:rem   fallback (Windows on ARM runs x64 binaries).
impeccable/reference/live.md:7:Live editing requires a local checkout; injection into deployed production sites (including HTTPS) is unsupported. For production inspection, use `.claude/skills/impeccable/scripts/impeccable detect <url>` or the browser extension, not the live helper. Do not disable browser security or weaken production CSP to enable live mode.
impeccable/reference/live.md:13:1. `impeccable live`: boot. If the request names or implies a file, route, or app inside a monorepo, infer the concrete path and run `.claude/skills/impeccable/scripts/impeccable live --target <path>` instead; then run the rest of this live session from the returned `projectRoot`. The boot resolves the app root from dev-server config files and persists it in `.impeccable/live/roots.json`; every helper re-anchors to that manifest at startup (a wrong cwd cannot fork session state), PRODUCT.md / DESIGN.md are discovered upward to the git root, and relative helper args like `--file` resolve against the app root.
impeccable/reference/live.md:16:4. On `generate`: reuse `event.scaffold` when present; read the screenshot if present; load the action's reference; deliver variants; `--reply done`; poll again. Generate in this thread: you already hold the project's tokens and layout. The overlay preview IS the verification channel; do not screenshot, re-render, or QA variants between generate and accept. Apply craft-floor's contrast, spacing, and type floors by construction as you write; full verification runs once at accept on the chosen variant.
impeccable/reference/live.md:36:  .claude/skills/impeccable/scripts/impeccable live-poll   # default long timeout; no --timeout=
impeccable/reference/live.md:57:.claude/skills/impeccable/scripts/impeccable live
impeccable/reference/live.md:71:.claude/skills/impeccable/scripts/impeccable live-status      # helper state, active sessions, queued events; works with the helper down
impeccable/reference/live.md:72:.claude/skills/impeccable/scripts/impeccable live-resume --id SESSION_ID   # active snapshot, pending event, next safe action
impeccable/reference/live.md:73:.claude/skills/impeccable/scripts/impeccable live-complete --id SESSION_ID # canonical manual final acknowledgement after verified cleanup
impeccable/reference/live.md:92:.claude/skills/impeccable/scripts/impeccable live-insert --id EVENT_ID --count EVENT_COUNT --position after \
impeccable/reference/live.md:96:`--position` ← `event.insert.position`; anchor flags map exactly like wrap's. The scaffold has **no** `data-impeccable-variant="original"`; variants are net-new HTML+CSS at `insertLine`. On source-preview targets the scaffold carries `sourceWritten: false` with `wrapperBlock` and `replaceEndLine < replaceStartLine` (an insertion): splice variants into `wrapperBlock` at the marker and insert at `replaceStartLine` in ONE edit, exactly as the wrap section describes. Decide the visitor mode from the surface and load [craft-floor.md](craft-floor.md) before writing net-new markup. Svelte targets follow the same component flow as wrap below (`mode: "insert"` in the manifest): each variant is a real single-root component under `componentDir` with no `data-impeccable-*` attributes; never edit the route during generation; accept splices the chosen markup into `sourceFile` mechanically. For non-Svelte targets, accept/discard removes the wrapper; the anchor is untouched.
impeccable/reference/live.md:108:When `event.scaffold` is present, the helper already found the source and computed the wrapper; treat it as the successful output and skip the command. `event.scaffoldAttempted` with `scaffoldError` means preflight could not finish; use the command below.
impeccable/reference/live.md:113:.claude/skills/impeccable/scripts/impeccable live-wrap --id EVENT_ID --count EVENT_COUNT --element-id "ELEMENT_ID" --classes "class1,class2" --tag "div" --text "TEXT_SNIPPET"
impeccable/reference/live.md:135:`event.action` is `impeccable` (freeform): work from SKILL.md's design rules plus [craft-floor.md](craft-floor.md); decide the visitor mode from the surface; do not load a sub-command reference. Freeform is not a pass to skip parameters: follow the budget and freeform bias in section 7. Any other action (`bolder`, `quieter`, `distill`, `polish`, `typeset`, `colorize`, `layout`, `adapt`, `animate`, `delight`, `overdrive`): read `reference/<action>.md` before planning; its MUST params layer on top of the section 7 budget.
impeccable/reference/live.md:245:.claude/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID done --file RELATIVE_PATH
impeccable/reference/live.md:252:If wrap or generation fails after the browser flipped to GENERATING, tell the **browser** so its bar resets: `.claude/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID error "Short reason"`. Never use `live-accept --discard` for this (pure file mutator, browser never sees it, bar sticks on dots); `--discard` is only source-side cleanup for a discard the browser itself initiated.
impeccable/reference/live.md:268:- `_completionAck.ok !== true`: do not poll yet. Run `impeccable live-status` / `impeccable live-resume`, finish cleanup manually if needed, then `impeccable live-complete --id EVENT_ID`.
impeccable/reference/live.md:293:Event: `{id, message, pageUrl}`: page-level direction from the global bar's Steer control (typed or spoken), no element context, no variant cycling. Read `message`, inspect the page or files as needed, make edits or answer in prose. Reply `.claude/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID steer_done ["Optional short toast"]`, or on failure `--reply EVENT_ID error "Short reason"`, then poll immediately. No separate pickup reply; the Steer bar unlocks on `steer_done` or `error`.
impeccable/reference/live.md:309:After source edits finish, reply exactly once with `.claude/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID done --data '{"status":"done","appliedEntryIds":["8hexid"],"failed":[],"files":["src/page.html"],"notes":[]}'`. Use `status:"partial"` or `status:"error"` with `failed[]` when not every entry applied. Then poll again. Never reply without the event id; `--reply done --file ...` is invalid for manual Apply.
impeccable/reference/live.md:318:.claude/skills/impeccable/scripts/impeccable live-server stop
impeccable/reference/typeset.md:27:.claude/skills/impeccable/scripts/impeccable detect --json --scope type [target files or dirs]
impeccable/scripts/impeccable:48:  MINGW*|MSYS*|CYGWIN*|Windows_NT) os=windows ;;
impeccable/scripts/impeccable:65:  chmod +x "$bin" 2>/dev/null && exec "$bin" "$@"
impeccable/scripts/impeccable:67:# On Windows (an MSYS/Git Bash shell) the cached names carry .exe so this
impeccable/scripts/impeccable:143:    # Windows on ARM runs x64 binaries; fall back when no arm64 asset exists.
impeccable/scripts/impeccable:182:    if ! chmod +x "$tmp" 2>/dev/null; then
impeccable/scripts/impeccable:205:echo "Download impeccable-$os-$arch from https://github.com/pbakaus/impeccable/releases (tag engine-v$version) into $cache_root/bin/$version/impeccable$exe (then chmod +x), or set IMPECCABLE_BIN to a preinstalled engine binary. Docs: https://impeccable.style" >&2
impeccable/reference/component-review.md:7:Run `.claude/skills/impeccable/scripts/impeccable component-review plan`. It writes `.impeccable/review/components.json` from the measured spec, the comp and the plate files, and refuses, naming each one, while any raster region lacks its plate. Never write or edit that file for this stage: the packet is derived from the spec, so every change belongs in the regions file.
impeccable/reference/component-review.md:11:Otherwise run `.claude/skills/impeccable/scripts/impeccable component-review capture --manifest .impeccable/review/components.json`, then start `.claude/skills/impeccable/scripts/impeccable component-review serve --session <returned session>` in the background. Open the URL it prints in the available browser and wait for the user; `serve` exits 0 once they submit. Read the decisions with `.claude/skills/impeccable/scripts/impeccable component-review status --session <id>`; `.claude/skills/impeccable/scripts/impeccable component-review verify --manifest .impeccable/review/components.json` confirms approval and refuses pending, needs-work and stale input. Never submit the page or write a receipt on the user's behalf.
impeccable/reference/component-review.md:21:- **revise with split** (an asset): replace that region in the regions file with its layers: a frame plate with a transparent opening (kind `plate`, same box), the content as its own `image` region at the opening's box, and each moving part (a shutter, a door) as its own plate. Name each layer after the original region, as `<id>-frame`, `<id>-view` or `<id>-shutter-left`, so the next round shows it as part of the user's request. Rerun `.claude/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions <regions.json>` and produce the plates.
impeccable/reference/component-review.md:22:- **revise** (a plan item): change the regions file as the feedback says (resize or extend a raster region, split material into its own plate region, or adjust the code region), rerun `.claude/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions <regions.json>`, and produce any new plates.
impeccable/reference/component-review.md:23:- **reclassify** (a code region): in the regions file, change that region's `kind` to the one the user chose and rewrite its `note` to describe the material. Rerun `.claude/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions <regions.json>`, then produce the new plates, with the asset producer when subagents are available.
impeccable/reference/component-review.md:24:- **missing**: add the region to the regions file, rerun `.claude/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions <regions.json>`, and produce its plate if it is raster.
impeccable/reference/component-review.md:61:Acceptance closes human review for this build: never request plan, asset or assembly approval again. While the page renders what the user accepted, the hero score, the palette check and every numeric reading are advisories; material vetoes still hold (a missing or unreferenced plate, an SVG illustration, an organic clip, a clipped plate, invented ink, failed rendered presence). When the capture no longer matches the accepted screenshot, restore what the user accepted; until then the readings apply. Complete the rest of the page, responsive behavior, finish checks and documentation with the accepted first viewport as the visual direction. This is first-viewport calibration, not a claim that the user reviewed the rest of the page. Shared stylesheet edits do not reopen approval. Preserve the accepted direction; a later explicit user change is a new task.
impeccable/scripts/command-metadata.json:83:    "description": "Performs a final quality pass fixing alignment, spacing, consistency, and micro-detail issues before shipping. Use when the user mentions polish, finishing touches, pre-launch review, something looks off, or wants to go from good to great.",
impeccable/scripts/live-browser.js:3881:    pendingIntroAnimation.addEventListener('finish', () => { pendingIntroAnimation = null; }, { once: true });
impeccable/scripts/live-browser.js:3897:    showToast('Apply is still running. Wait for it to finish.', 2800);
impeccable/scripts/live-browser.js:6332:        // Generation finished, yet the read shows only the scaffold: the
impeccable/scripts/live-browser.js:6377:   * opts.generationCompleted marks callers that KNOW the agent finished (a
impeccable/scripts/live-browser.js:6788:    const finishIfGone = function() {
impeccable/scripts/live-browser.js:6794:    if (finishIfGone()) return;
impeccable/scripts/live-browser.js:6795:    observer = new MutationObserver(finishIfGone);
impeccable/scripts/live-browser.js:6798:      if (finishIfGone()) return;
impeccable/scripts/live-browser.js:7218:    const finish = () => {
impeccable/scripts/live-browser.js:7221:      removeEventListener('scrollend', finish, true);
impeccable/scripts/live-browser.js:7227:    addEventListener('scrollend', finish, true);
impeccable/scripts/live-browser.js:7228:    fallback = setTimeout(finish, 1200);
impeccable/scripts/live-browser.js:9216:        // generation epoch is fenced. Source promotion/carbonize can finish in
impeccable/scripts/live-browser.js:9259:      // Pick → Go loop while carbonize finishes in the background.
impeccable/scripts/live-browser.js:9654:  // every connect compare it against our own progress and pull the finished
impeccable/scripts/live-browser.js:9711:    // resuming it freezes the picker behind an unfinishable banner.
impeccable/scripts/live-browser.js:9984:    // Accept releases the picker before carbonize finishes, so a replacement
impeccable/scripts/live-browser.js:10085:    // that generation already finished.
impeccable/scripts/live-browser.js:10112:    // transition the observer would have finished. Without hideShaderOverlay
impeccable/scripts/live-browser.js:10295:  const AGENT_BUSY_TIP = 'Agent is working - steering resumes when it finishes';
impeccable/scripts/live-browser.js:10486:   * will not see the steer until it finishes. Saying so beats three dots that
impeccable/scripts/live-browser.js:11049:  function finishVoiceSession() {
impeccable/scripts/live-browser.js:11120:      finishVoiceSession();

 succeeded in 234ms:
     1	---
     2	name: impeccable
     3	description: Use when the user wants to design, redesign, shape, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, or extract a frontend interface (website, landing page, dashboard, app UI, component, form, design system or tokens), or to run live browser iteration on UI elements. Covers UX review, hierarchy, accessibility, performance, responsive behavior, typography, layout, color, motion, UX copy. Also for bland designs to make bolder, loud ones quieter. Do not use for backend-only or non-UI tasks.
     4	version: 4.5.0
     5	user-invocable: true
     6	argument-hint: "[shape · audit|critique · animate|bolder|colorize|delight|layout|overdrive|quieter|typeset · adapt|clarify|distill · harden|onboard|optimize|polish · init|document|extract|live|generate] [target]"
     7	license: Apache 2.0
     8	---
     9	
    10	This skill gives you the tools and permission to create design that earns to be called out-of-distribution craft: Whereas before, your design work would have been safe, timid and measured, you now approach every design task as an award-winning design director with impeccable understanding for what makes exceptional design work: production-grade code, peak creativity, a clear POV, deep understanding of the needs of the client and users, and exceptional craft.
    11	
    12	Core principles:
    13	- Go all out. No hedging, no shortcuts. The deliverable must be complete (except assets the user must provide).
    14	- Dream big and bold. Distinct, beautiful, outstanding and highly inspiring work.
    15	- Verify in bounded passes, not a loop, and the ceiling covers the whole cycle: screenshots, defect scans, micro-edits, and rebuilds alike. Build fully, inspect once with a batched round (desktop and mobile together on the web; the shipped device classes on a native platform), fix everything it shows in one batch, confirm with at most one more round, and stop polishing. Open-ended self-QA burns the user's money doing worse what the finish handoffs do better.
    16	
    17	## Setup
    18	
    19	1. Run `<skill-base-dir>/scripts/impeccable context` once per session, where `<skill-base-dir>` is the directory that contains this SKILL.md (the skill folder, not a plugin root two levels above it); keep cwd at the user's project. That base directory resolves every `.claude/skills/impeccable/scripts/impeccable <verb>` command in this skill and its references, and `.claude/skills/impeccable/scripts` is the fallback only when the runtime reports no base directory. On a Windows shell without `sh`, call `.claude/skills/impeccable/scripts/impeccable.cmd` instead. The launcher runs a self-contained binary that ships next to it or is downloaded once on first run; no Node or other runtime is required. Pass a named source file or route as `--target <path>`. It loads PRODUCT.md, DESIGN.md, the matching surface brief, and native-platform guidance when applicable; follow its directives and do not rerun it.
    20	2. Load the request's playbook: its Commands-table reference for an explicit/implied sub-command, or [reference/new-work.md](reference/new-work.md) for a new surface or replacement visual world. Inspect target and incumbent visual truth before editing. When the app cannot run, start with committed visual-regression goldens or screenshot fixtures; verify target and freshness against current tokens, CSS, components, or assets, resolve conflicts, and compare theme/variant captures.
    21	3. After resolving analysis and direction, read [reference/craft-floor.md](reference/craft-floor.md) immediately before any UI edit, including small refinements. It carries the quality floor, the absolute bans, and the reflexes no detector catches. Do not load it for planning-only work.
    22	
    23	**Launcher unavailable:** On refusal or failure, send a separate message **before the next tool call**: “Context loading did not run; I’ll read the existing project context directly.” Then read existing PRODUCT.md and DESIGN.md without inventing missing context, follow applicable steps 2–3, and continue through permitted tools. This applies to planning and editing; launcher failure alone does not block either. On "permission denied", the launcher lost its executable bit: run `chmod +x <skill-base-dir>/scripts/impeccable` and rerun Setup step 1 before falling back.
    24	
    25	## How to design
    26	
    27	- **The brief wins.** Honor pinned aesthetics, eras, materials, fonts, and palettes even when they conflict with a saturated-pattern warning. Redirecting a clear brief toward your taste is failure.
    28	- **Refinement preserves; redesign replaces.** Refinement keeps the incumbent identity, behavior, copy, and everything outside scope. Ask before replacing factual copy or adding claims. Redesign keeps product truth, content, function, native affordances, and constraints, but treats the old look as evidence and anti-reference; choose a replacement world in new-work and replace DESIGN.md. Never split the difference into polish on the discarded look.
    29	- **Visual authority is evidence, not a filename.** Missing DESIGN.md alone does not make a project greenfield; new-work decides whether to preserve, expand, or replace the incumbent world.
    30	
    31	## Modes
    32	
    33	The mode names what the visitor's success looks like on this surface.
    34	
    35	- **Persuade:** the visitor decides and acts; design is the product. Landing pages, marketing, campaigns, pricing. Earn attention and action. Ship real imagery when the brief needs it; follow the committed world, not category habit.
    36	- **Operate:** the visitor completes a task. App UI, dashboards, editors, admin, settings, tools. Scanability, consistency, native expectations, and the real usage scene outrank expression. Brand lives in precise details.
    37	- **Read:** the visitor understands something. Docs, articles, guides, help, changelogs. Structure for comprehension, then make the reading experience worth staying in.
    38	- **Experience:** the visitor is inside the work itself. Portfolios, galleries, showcases. Let the artifact lead from the first viewport; the interface recedes.
    39	
    40	Choose the mode from the requested surface, not the product, and persist it only in that surface brief. A tool's landing page is still Persuade; a fashion house's documentation is still Read; a docs index is Read, not Persuade. See [new-work.md](reference/new-work.md) for new surfaces and [operate.md](reference/operate.md) for deeper Operate/Read guidance.
    41	
    42	## Commands
    43	
    44	| Command | Category | Description | Reference |
    45	|---|---|---|---|
    46	| `craft [feature]` | Build | Deprecated alias for an ordinary new-work request | [reference/craft.md](reference/craft.md) |
    47	| `shape [feature]` | Build | Plan UX/UI before writing code | [reference/shape.md](reference/shape.md) |
    48	| `init` | Build | Capture durable product context in PRODUCT.md | [reference/init.md](reference/init.md) |
    49	| `document` | Build | Generate DESIGN.md from existing project code | [reference/document.md](reference/document.md) |
    50	| `extract [target]` | Build | Pull reusable tokens and components into design system | [reference/extract.md](reference/extract.md) |
    51	| `critique [target]` | Evaluate | UX design review with heuristic scoring | [reference/critique.md](reference/critique.md) |
    52	| `audit [target]` | Evaluate | Technical quality checks (a11y, perf, responsive) | [reference/audit.md](reference/audit.md) · native: [reference/audit.native.md](reference/audit.native.md) |
    53	| `polish [target]` | Refine | Final quality pass before shipping | [reference/polish.md](reference/polish.md) |
    54	| `bolder [target]` | Refine | Amplify safe or bland designs | [reference/bolder.md](reference/bolder.md) |
    55	| `quieter [target]` | Refine | Tone down aggressive or overstimulating designs | [reference/quieter.md](reference/quieter.md) |
    56	| `distill [target]` | Refine | Strip to essence, remove complexity | [reference/distill.md](reference/distill.md) |
    57	| `harden [target]` | Refine | Production-ready: errors, i18n, edge cases | [reference/harden.md](reference/harden.md) |
    58	| `onboard [target]` | Refine | Design first-run flows, empty states, activation | [reference/onboard.md](reference/onboard.md) |
    59	| `animate [target]` | Enhance | Add purposeful animations and motion | [reference/animate.md](reference/animate.md) |
    60	| `colorize [target]` | Enhance | Add strategic color to monochromatic UIs | [reference/colorize.md](reference/colorize.md) |
    61	| `typeset [target]` | Enhance | Improve typography hierarchy and fonts | [reference/typeset.md](reference/typeset.md) |
    62	| `layout [target]` | Enhance | Fix spacing, rhythm, and visual hierarchy | [reference/layout.md](reference/layout.md) |
    63	| `delight [target]` | Enhance | Add personality and memorable touches | [reference/delight.md](reference/delight.md) |
    64	| `overdrive [target]` | Enhance | Push past conventional limits | [reference/overdrive.md](reference/overdrive.md) |
    65	| `clarify [target]` | Fix | Improve UX copy, labels, and error messages | [reference/clarify.md](reference/clarify.md) |
    66	| `adapt [target]` | Fix | Adapt for different devices and screen sizes | [reference/adapt.md](reference/adapt.md) · native: [reference/adapt.native.md](reference/adapt.native.md) |
    67	| `optimize [target]` | Fix | Diagnose and fix UI performance | [reference/optimize.md](reference/optimize.md) |
    68	| `live` | Iterate | Visual variant mode: pick elements in the browser, iterate on alternatives | [reference/live.md](reference/live.md) |
    69	| `generate [n] [action] [element]` | Iterate | Variants, versions, or alternatives of a named element to choose from in the live browser; no manual picking | [reference/generate.md](reference/generate.md) |
    70	
    71	Routing:
    72	
    73	- **No argument:** read [routing.md](reference/routing.md) and present its context-aware menu; never auto-run a command.
    74	- **Explicit or clearly implied request to run a command:** load its reference (native variant on native platforms) and follow it. Ask once if two commands fit.
    75	- **Workflow or command-selection question:** read [Workflow questions](reference/routing.md#workflow-questions).
    76	- **Otherwise:** treat the request as general design work. Missing PRODUCT.md routes a new surface or replacement world through init, then new-work; a narrow refinement of existing code proceeds on the incumbent implementation as `impeccable context` directs, offering init afterward rather than blocking on it.
    77	- `teach` aliases `init`. `craft` is a deprecated alias for ordinary new-work and adds nothing. `shape` owns task discovery, then enters new-work only for visual-world and surface-concept decisions.
    78	
    79	After init writes PRODUCT.md, resume without rerunning `impeccable context`; init loads the native platform reference itself when the platform it recorded is `ios`, `android`, or `adaptive`.
    80	
    81	**Pin / Unpin:** `.claude/skills/impeccable/scripts/impeccable pin <pin|unpin> <command>` creates or removes a standalone `/<command>` shortcut. Report the script's result concisely; relay stderr verbatim on error.
    82	
    83	**Hooks:** `/impeccable hooks <on|off|status|ignore-rule|ignore-file|ignore-value|reset>` manages the design detector hook for this project (auto-runs the detector after UI file edits and surfaces findings). Load [reference/hooks.md](reference/hooks.md) when the user invokes it with any argument.
    84	
    85	**Doctor:** `/impeccable doctor` reports and repairs drift between this project's Impeccable artifacts (PRODUCT.md, DESIGN.md and its sidecar, config, surface briefs, the hook) and what this version reads. Load [reference/doctor.md](reference/doctor.md) when the user invokes it, or when they ask what is out of date, stale, or needs refreshing. A `CONTEXT_STALE` directive in Setup's output is the cheap subset of the same report; act on it there per its own instructions rather than running doctor unasked.
    86	
    87	**Never repair drift as a side effect of a design task.** A `CONTEXT_STALE` finding is reported, not acted on, unless the user asks. The one exception is a finding marked `auto`, which the next write to that file performs anyway.
    88	
    89	**Done when:** the command's reference file has been followed to its own finish line, any UI edit passed through craft-floor, and the final reply names what changed and what was left unverified.
#!/bin/sh
# Impeccable launcher. Runs the platform binary shipped next to this script:
#   <this dir>/bin/<os>-<arch>/impeccable
# Order: $IMPECCABLE_BIN, the sibling binary, ~/.impeccable/bin/impeccable,
# the version-pinned cache, then `impeccable` on PATH. Never needs Node.
# The unversioned home binary and the PATH candidate are validated with the
# engine-probe handshake first: the retired 3.x npm CLI also installed a bin
# named `impeccable`, and exec'ing it would fail every verb with
# "Unknown command". Trusted candidates (IMPECCABLE_BIN, the sibling binary,
# the version-pinned cache) are exec'd without a probe: hooks run them on
# every edit and must stay fast.
set -eu

# True when the candidate answers the engine handshake (prints
# "impeccable-engine <version>", exit 0). Quiet and fast (<100ms).
# IMPECCABLE_LAUNCHER_PROBE marks the child as a probe: a copy of this
# launcher reached recursively (e.g. symlinked onto PATH as `impeccable`)
# then skips its own probes and refuses to download, so probing stays cheap
# and can never loop.
probe_ok() {
  case "$(IMPECCABLE_LAUNCHER_PROBE=1 "$1" engine-probe 2>/dev/null || true)" in
    impeccable-engine*) return 0 ;;
  esac
  return 1
}
probing=${IMPECCABLE_LAUNCHER_PROBE:-}

dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

# What the binary needs to know about its home: the skill directory (for
100755 eb60f8667dd6924bc6271e9e1a0761ea5f945751 0	impeccable/scripts/impeccable

hook: PostToolUse
hook: PostToolUse
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
codex
I found two problems:

- [SKILL.md:23](/Users/kristinarash/.claude/skills/impeccable/SKILL.md:23): “Permission denied” can have other causes. The advice should check the launcher’s permissions before running `chmod`.
- [SKILL.md:23](/Users/kristinarash/.claude/skills/impeccable/SKILL.md:23): The new advice says to retry before using the fallback. The same paragraph says to use the fallback after any failure. This gives two different orders.

The file mode change looks correct. The description is 530 characters. The “Done when” line fits the rest of the file.
hook: Stop
hook: Stop
hook: Stop
hook: Stop Completed
hook: Stop Completed
hook: Stop Failed
tokens used
18,783
I found two problems:

- [SKILL.md:23](/Users/kristinarash/.claude/skills/impeccable/SKILL.md:23): “Permission denied” can have other causes. The advice should check the launcher’s permissions before running `chmod`.
- [SKILL.md:23](/Users/kristinarash/.claude/skills/impeccable/SKILL.md:23): The new advice says to retry before using the fallback. The same paragraph says to use the fallback after any failure. This gives two different orders.

The file mode change looks correct. The description is 530 characters. The “Done when” line fits the rest of the file.
