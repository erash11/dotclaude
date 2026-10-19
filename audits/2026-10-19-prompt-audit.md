# Prompt audit: `~/.claude` (Windows), 2026-10-19

> **Applied 2026-10-19:** hunks 1-3 committed in claude-skills `6213750` and synced to the Codex/agents views. Flags G-1 to G-4 are still open.

## Assumptions

- **Scope.** The Claude Code instruction surface under `~/.claude` that loads in a session:
  `CLAUDE.md`, `AGENTS.md`, `machine.md` (plus the `machine.macos.md` / `machine.windows.md`
  templates), `skills/CLAUDE.md`, the 38 live `skills/*/SKILL.md`, and `agents/*.md` (4).
  These are user-level files, so **any edit affects every project on this machine**, and the
  Mac picks it up through the dotclaude / claude-skills repos.
- **Vendored, so flag only, no diff:** the six symlinked skills (`humanizer`, `pp-espn`,
  `pp-fireflies`, `game-film-timestamps`, `grill-with-ui`, `session-handoff`). The rule comes
  from `skills/CLAUDE.md:15-16`: "Don't rewrite vendored skills."
- **Not read:** `settings*.json`, `hooks/`, `.credentials.json`, `CREDENTIALS.md`, and
  `.claude.json` (secrets risk). Also skipped: `skills-archive/`, `skills-backup-20260609/`,
  `_to_delete/`, `skills/synced/` (generated session copies), `LIFEOS/`, and docs that no
  session loads (`START-HERE.md`, `RESTORE.md`, `MIGRATION-MACOS.md`, …). Skill reference
  files were not read line by line; the greps covered only the `SKILL.md` bodies.
- **Target model.** `claude-opus-5-5`, the model running this audit. The four agents use
  `model: inherit` and no skill pins a model, so the same target applies to everything.

## Summary

This setup has already been cleaned up. The Group 1 greps found no step-by-step thinking
scaffolds, no `<scratchpad>` instructions, no retired model names, no "do not narrate" or
anti-formatting rules, and no "be thorough / don't be lazy" boosters. Only one passage uses
shouting that has no reason attached. All 20 named paths and commands that were spot-checked
exist on disk.

The finding that matters most is in Group 2. **`memory-write` and `AGENTS.md` give different
rules for building a memory slug, and the repository shows that `memory-write` has it wrong.**
`AGENTS.md` also says that `memory-write` wins when the two disagree, so the wrong rule is the
one that applies. The real-world damage is limited because both files say to use the slug the
harness injects. Even so, a Codex session following `AGENTS.md`, or anyone who rebuilds a slug
by hand, gets conflicting instructions.

| Group | Findings |
|---|---|
| 1. Dated prompt text | 1 (medium) |
| 2. Skill and config files | 2 (1 high, 1 medium), plus 4 flags |
| 3. Tool / skill descriptions | 0. Every description is under the repo's 1,024-char cap and names its neighbours with "Do not use for X (use Y)". |
| 4. Request config and architecture | Not applicable: there is no request-building code. The sub-agent roster (4 impeccable agents) has no duplicates. |

## Findings

### F1 · High · rewrite (proposed only) — slug rule contradicted by the repo

- **Location:** `skills/memory-write/SKILL.md:100`
- **Evidence:** "the slug is the current cwd with `/` and `.` replaced by `-`"
- **Pattern:** Group 2, two instruction files that disagree, plus a volatile specific
  that the repository contradicts.
- **Why it's wrong:** `AGENTS.md:31` says "every character other than a letter or digit
  replaced by `-`". The repo backs `AGENTS.md`. The slug
  `C--Users-eric-rash-OneDrive---Baylor-University-00-Primary-Storage-Drive-…` shows that `:`,
  `\`, spaces and `_` all become `-`. The `memory-write` rule can't even produce a Windows slug.
  `AGENTS.md:15` also says "if a rule below ever disagrees with that file, that file wins", so
  the stale version takes precedence.
- **Action:** rewrite `memory-write:100` to match `AGENTS.md` (hunk 1). Leave `AGENTS.md` as it
  is. This hunk changes a rule other files rely on, so it is proposed for you to confirm and is
  never applied as part of a blanket cleanup.

### F2 · Medium · rewrite — shouting with no reason in graphify

- **Location:** `skills/graphify/SKILL.md:214`
- **Evidence:** "**MANDATORY: You MUST use the Agent tool here. Reading files yourself
  one-by-one is forbidden - it is 5-10x slower. If you do not use the Agent tool you are doing
  this wrong.**"
- **Pattern:** 1a, pressure language.
- **Why it's obsolete:** current models follow a plainly stated instruction, so four stacked
  emphasis markers and a scolding sentence only add rigidity. The useful content is the
  instruction and its reason ("5-10x slower"). Keep both and drop the volume.
- **Action:** rewrite (hunk 2). Caveat: `graphify` is a real directory, so `skills/CLAUDE.md`
  treats it as owned, but its content is upstream. If you reinstall it from upstream, this edit
  is lost. See flag G-3.

### F3 · Medium · remove — leftover history note in skills/CLAUDE.md

- **Location:** `skills/CLAUDE.md:8-9`
- **Evidence:** "(CreateSkill, a LifeOS fork with 17 broken pointers, was deleted 2026-09-22.
  Recover it from git history if ever needed.)"
- **Pattern:** Group 2, history narratives.
- **Why it's obsolete:** the note states no rule, only an old event. It loads in every session
  that works in `skills/`, and git history already records the deletion.
- **Action:** remove (hunk 3).

### Flags (no edit proposed)

- **G-1 · Low · dated gotcha lines.** `backup`, `claude-stack-doctor`, `dev-sync`,
  `forecast-capture`, `decision-audit`, `new-project` and `interview-me` include dates and past
  events ("Seen 2026-09-04", "found 2026-09-24"). The pattern table counts these as history
  narratives. However, `skills/CLAUDE.md:25` deliberately asks for `## Gotchas` built from real
  failures, and most of these lines are the *reason* behind a rule, which should stay. The one
  type worth trimming later is a schedule written as a diff of past values, as in
  `claude-stack-doctor:135`: "**21:00 daily** since 2026-09-24; 09:00 from 2026-08-29". State
  only the current value. Your call.
- **G-2 · Low · graphify's subagent mandate vs USER.md.** `graphify:214` requires fanning out
  to subagents. `USER.md` says "few subagents, no parallel fan-outs… unless asked". Typing
  `/graphify` probably counts as asking, but nothing written says so. Decide whether graphify is
  an exception and record the answer in one of the two places.
- **G-3 · Low · vendoring convention vs reality.** `skills/CLAUDE.md:15` says a symlink marks a
  vendored skill. `impeccable` (`version: 4.5.0`) and `graphify` are clearly upstream but are
  installed as real directories, so the repo rule labels them owned. Either symlink them like
  the other six, or note them as exceptions.
- **G-4 · Low · Windows "hands-off" vs a scheduled Windows job.** `MEMORY.md` says "Win laptop
  hands-off 10/8, no automation". `claude-stack-doctor:119` describes a Windows scheduled task,
  `\Eric\memsearch-drain-weekly`, as active. One of them is out of date. History can't show
  which, because `MEMORY.md` is working memory, not a versioned instruction file.

### Checked and kept

- `pbir-report-builder:18/102/105/264`: the NEVER/MUST lines protect a fragile file format
  (GUIDs, schema references) and give their reason. Keep-list items 3 and 10.
- `graphify:263`: "Do NOT use `Explore`" names a real failure (Explore can't write chunk files).
- `project-triage:61`: "ALWAYS offer the curation pass — never silently update entries" is a
  consent gate, not volume.
- The duplication between `CLAUDE.md` and `AGENTS.md` is deliberate and documented
  (`CLAUDE.md:43`, `AGENTS.md:13-15`). Apart from F1, the copies agree on caps, file naming and
  the retrieval ladder.
- `machine.md` matches `machine.windows.md` except for a UTF-8 BOM. That is a file-hygiene
  issue, not a prompt issue. `machine.md.encoding-bak` looks like a leftover from that fix.

## Proposed diff

Nothing has been applied. Each hunk is one finding, so you can take them separately.

### Hunk 1 — F1 (`skills/memory-write/SKILL.md`)

```diff
-- For Tier A, the slug is the current cwd with `/` and `.` replaced by `-` (so `~` → `-Users-kristinarash`, `~/DEV` → `-Users-kristinarash-DEV`, `~/.claude/skills` → `-Users-kristinarash--claude-skills`). The harness injects the correct slug each session — use that, don't reconstruct it.
+- For Tier A, the slug is the absolute cwd with every character other than a letter or digit replaced by `-` (Mac `~/DEV` → `-Users-kristinarash-DEV`, `~/.claude/skills` → `-Users-kristinarash--claude-skills`; Windows `~/Desktop/DEV` → `C--Users-eric-rash-Desktop-DEV`; `00_Primary_Storage_Drive` → `00-Primary-Storage-Drive`). The harness injects the correct slug each session — use that, don't reconstruct it.
```

### Hunk 2 — F2 (`skills/graphify/SKILL.md`)

```diff
-**MANDATORY: You MUST use the Agent tool here. Reading files yourself one-by-one is forbidden - it is 5-10x slower. If you do not use the Agent tool you are doing this wrong.**
+Use the Agent tool for this step rather than reading the files yourself: parallel subagents are 5-10x faster here.
```

### Hunk 3 — F3 (`skills/CLAUDE.md`)

```diff
 is the companion reference. Use your judgement on everything else.
 
-(CreateSkill, a LifeOS fork with 17 broken pointers, was deleted 2026-09-22.
-Recover it from git history if ever needed.)
-
 ## Owned vs vendored
```

## Verify after applying

- Hunk 1: in a new session, check that a memory written from a folder whose path has an
  underscore lands in the existing slug folder, not a new one.
- Hunk 2: the next time you run `/graphify` on a multi-file corpus, confirm it still dispatches
  subagents.
- Commit in `claude-skills`, then pull on the Mac.
