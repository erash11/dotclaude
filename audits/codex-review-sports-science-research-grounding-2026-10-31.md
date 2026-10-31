Reading additional input from stdin...
OpenAI Codex v0.166.0
--------
workdir: /Users/kristinarash/.claude/skills/sports-science-research-grounding
model: gpt-6.1-terra
provider: openai
approval: never
sandbox: read-only
reasoning effort: medium
reasoning summaries: none
session id: 01a1929d-d0e0-7a70-9066-cd56862744cb
--------
user
Review this diff of a Claude skill (SKILL.md for answering sport-science questions from Zotero via the zotero-bridge CLI). Find factual errors, ambiguous steps, and broken instructions. Diff file: /tmp/ssrg.diff. Skill dir: ~/.claude/skills/sports-science-research-grounding. Bridge repo: ~/DEV/ZoteroInjestion.
warning: clamping SessionEnd hook timeout to 3s in /Users/kristinarash/.codex/hooks.json
warning: clamping SessionEnd hook timeout to 3s in /Users/kristinarash/.codex/hooks.json
warning: clamping SessionEnd hook timeout to 3s in /Users/kristinarash/.codex/plugins/cache/openai-codex/codex/1.0.6/hooks/hooks.json
2026-10-31T15:39:40.063896Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.context7.com/.well-known/oauth-protected-resource/mcp\"" })
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
I’ll check the diff against the skill and the bridge code. I’ll report the problems that could change the answer or break a step.
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc 'cat ~/.claude/machine.md; cat ~/.claude/global-memory/transcripts/.errors.log; cat ~/.claude/CLAUDE.md; cat /tmp/ssrg.diff' in /Users/kristinarash/.claude/skills/sports-science-research-grounding
 succeeded in 1125ms:
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
diff --git a/sports-science-research-grounding/SKILL.md b/sports-science-research-grounding/SKILL.md
index 93a1f9a..0465429 100644
--- a/sports-science-research-grounding/SKILL.md
+++ b/sports-science-research-grounding/SKILL.md
@@ -12,67 +12,70 @@ description: >-
 
 # Sports Science Research Grounding
 
-## Purpose
-
-Ground normal domain conversations in the user's research library without requiring a paper title or special
-command. This skill is harness-neutral: use the `zotero-research` MCP server when available, or the shared
-`zotero-bridge` CLI as the operational fallback.
-
-Do not use this skill for routine coding, scheduling, or administrative questions merely because the repository
-contains sport-science material.
-
-## Evidence workflow
-
-1. Resolve material applicability context before retrieval: sport code, sex, age or competition level, and injury
-   region or type. In this user's Baylor performance context, interpret unqualified `football` as `collegiate
-   American football` unless the question says soccer, association football, Australian football, or another code.
-   Pass that explicit context in the question sent to the evidence-pack tool.
-2. Call `build_research_evidence_pack` with the contextualized question, `limit=5`, and `extract=false`.
-3. Read `required_context`, `applicability_alignment`, `coverage`, `coverage_reason`, and every paper's
-   `applicability_alignment`, matches, conflicts, evidence status, citation, DOI, snippet, and page hits.
-4. Prefer `page-located` evidence. If a high-value local match is `pending-extraction` and its findings matter to
-   the answer, call the evidence-pack tool again with `extract=true`, or use `search_paper_evidence` and
-   `get_paper_pages` after preparation.
-5. If coverage is `thin` or `none`, use the current harness's native research/search capability to locate primary
-   peer-reviewed literature. Label each such citation `[External]`. Never imply an external paper is in Zotero.
-6. If external research is unavailable, say that the local coverage is incomplete and identify the gap.
+Answer a sport-science question from Eric's Zotero library first, label anything from outside it, and show the
+research basis. Routine coding, scheduling and admin questions stay out, even in a repo that holds sport-science
+files.
+
+## Answering a question
+
+1. **Add context.** Write the sport code, sex, age or competition level, and injury region or type into the
+   question. Unqualified `football` means `collegiate American football` (Baylor) unless the question names
+   soccer, association football, Australian football or another code.
+2. **Pull the evidence pack.** Run it from the `ZoteroInjestion` repo (`~/DEV/ZoteroInjestion` on the Mac):
+
+   ```bash
+   cd ~/DEV/ZoteroInjestion && uv run zotero-bridge ground "<contextualized question>" --limit 5
+   ```
+
+   If a `build_research_evidence_pack` tool (server `zotero-research`) is in your tool list, call it with
+   `limit=5, extract=false` instead; the output is the same. On the Mac it is usually absent: the registered
+   `mcp__zotero__*` tools are a different server (the Printing Press `pp-zotero-research-library`) and do not
+   build evidence packs.
+3. **Check topical fit, paper by paper.** The pack's `coverage: sufficient` counts papers that matched any
+   query variant, so papers matching only "collegiate soccer" pass while the topic term (the creatine, the
+   ACL, the sprint) appears nowhere in them. Read each paper's title, snippet and `evidence_hits` against the
+   question's main topic. Papers that miss the topic are not evidence; if none remain, treat coverage as
+   `none`. Also read `required_context`, each paper's `applicability_alignment`, matches and conflicts,
+   evidence status, citation, DOI and page hits.
+4. **Extract what matters.** Prefer `page-located` evidence. For a topically fit paper that is
+   `pending-extraction` and whose findings matter, rerun step 2 with `--extract` (or `extract=true`); this
+   writes only the local page cache. Then `search_paper_evidence` and `get_paper_pages` give page text.
+5. **Fill gaps from outside.** When coverage is `thin` or `none` (after step 3), use the harness's research
+   search for primary peer-reviewed literature and label each citation `[External]`. When no external search
+   is available, say the local coverage is incomplete and name the gap.
+6. **Write the answer** to the contract below.
+
+**Done when** every claim in the answer carries a `[Zotero: ...]` or `[External]` tag, and the answer says
+which topic gaps remain.
 
 ## Answer contract
 
-- Lead with the practical answer, then show the research basis.
-- Distinguish direct study findings, cross-paper synthesis, and practitioner interpretation.
-- Include population, setting, study design, outcomes, and material limitations when they affect transfer.
-- Cite local evidence as `[Zotero: ITEM_KEY, p. N]` when a page is available; include DOI or full citation.
-- Cite external fallback as `[External]` and link the primary source.
-- Treat systematic reviews and strong designs as higher-weight evidence, not automatic truth.
-- Explain genuine disagreement, thin evidence, and uncertainty instead of averaging it away.
-- Never use a Graphify-inferred or ambiguous edge as primary evidence. Verify graph-proposed links against the
-  original paper evidence.
+- Lead with the practical answer, then the research basis.
+- Mark each statement as a direct study finding, a cross-paper synthesis, or practitioner interpretation.
+- Give population, setting, design, outcomes and the limitations that affect transfer.
+- Cite local evidence as `[Zotero: ITEM_KEY, p. N]` with DOI or full citation. Cite external sources as
+  `[External]` with a link to the primary source; an external paper is never presented as being in Zotero.
+- Weight systematic reviews and strong designs higher, as weight and not as proof.
+- Show genuine disagreement, thin evidence and uncertainty.
+- Verify any Graphify-inferred or ambiguous link against the original paper before using it as evidence.
 
-## Existing memory and SecondBrain
+## Memory and SecondBrain
 
-The Zotero index is retrieval memory, not a replacement for personal or project memory. Use the harness's normal
-memory system for relevant user context and prior decisions, but do not cite memory as research evidence and do
-not copy the paper corpus into memory. Reviewed Paper Briefs and multi-paper syntheses belong in SecondBrain.
-Only write durable memory through the user's existing memory workflow or when explicitly asked.
+The Zotero index is retrieval memory. Use the normal memory system for user context and past decisions; cite
+research only from papers. Reviewed Paper Briefs and multi-paper syntheses belong in SecondBrain. Write durable
+memory only through the memory workflow or on request.
 
 ## Full-library processing
 
-When asked to ingest or continue the library:
+Run only when Eric asks to ingest or continue the library. Never start it for a single question.
 
-1. Read [batch-model-routing.md](references/batch-model-routing.md) and apply its automatic routing policy.
-2. Call `list_library_backlog`; the queue is the priority lane, not the boundary.
-3. Work in a bounded batch. Skip `ingested`, review `update_available`, extract `pending_extraction`, and create
+1. Read [references/batch-model-routing.md](references/batch-model-routing.md) and apply its routing.
+2. Call `list_library_backlog` (CLI: `uv run zotero-bridge backlog --limit 50 --offset 0`). The queue is the
+   priority lane, not the boundary.
+3. Work a bounded batch. Skip `ingested`, review `update_available`, extract `pending_extraction`, and write
    claims-free Reference Stubs only for `reference_stub` records.
-4. Use `prepare_paper_brief`, bounded evidence searches/pages, and the repository Paper Brief contract before
-   calling `save_paper_brief` or `save_reference_stub`.
-5. Do not overwrite locally edited notes, mutate Zotero, or silently commit SecondBrain changes.
-
-## CLI fallback
-
-From the `ZoteroInjestion` repo under the machine's DEV root (`~/Desktop/DEV` on Windows; `~/DEV` on macOS):
+4. Use `prepare_paper_brief`, bounded evidence searches and pages, and the Paper Brief contract
+   (`~/DEV/ZoteroInjestion/docs/PAPER_BRIEF_TEMPLATE.md`) before `save_paper_brief` or `save_reference_stub`.
+5. Leave locally edited notes, the Zotero library and SecondBrain commits untouched; the bridge is read-only.
 
-```powershell
-uv run zotero-bridge ground "<question>" --limit 5
-uv run zotero-bridge backlog --limit 50 --offset 0
-```
+**Done when** the checkpoint reports the batch ID, the items saved, skipped and failed, and the model route used.
diff --git a/sports-science-research-grounding/references/batch-model-routing.md b/sports-science-research-grounding/references/batch-model-routing.md
index 81778ae..488f842 100644
--- a/sports-science-research-grounding/references/batch-model-routing.md
+++ b/sports-science-research-grounding/references/batch-model-routing.md
@@ -7,30 +7,30 @@ bridge remains model-agnostic; routing belongs to the harness that orchestrates
 
 | Stage | Codex model | Reasoning | Allowed work |
 |---|---|---|---|
-| Operations | `gpt-5.6-terra` | `high` | Backlog inspection, batch creation, extraction, metadata audit, Reference Stubs, reconciliation, integrity checks, tests, lint, and documentation |
-| Scientific review | `gpt-5.6-sol` | `high` | Full-text methods/results/limitations review, applicability judgment, evidence-locator selection, Paper Brief writing, and final scientific approval |
+| Operations | `gpt-6.1-terra` | `high` | Backlog inspection, batch creation, extraction, metadata audit, Reference Stubs, reconciliation, integrity checks, tests, lint, and documentation |
+| Scientific review | `gpt-6.1-sol` | `high` | Full-text methods/results/limitations review, applicability judgment, evidence-locator selection, Paper Brief writing, and final scientific approval |
 
-Use `gpt-5.6-luna` only when the harness exposes it as an ephemeral worker and the task is strictly deterministic,
+Use `gpt-5.6-luna` (the only Luna this ChatGPT login accepts; `gpt-6.1-luna` is rejected) only when the harness exposes it as an ephemeral worker and the task is strictly deterministic,
 read-only status or hash validation. Otherwise use Terra. Never use Luna for Reference Stub relevance wording,
 Paper Brief review, synthesis, or promotion.
 
-## How to route (verified 2026-08-15)
+## How to route (verified 2026-10-31)
 
 Route with the Codex CLI directly. Do not go through the `codex:rescue` subagent — it runs on
 Sonnet and decides for itself whether to forward, so the switch is not guaranteed.
 
 ```bash
-codex exec --model gpt-5.6-terra "<operations spec>"
-codex exec --model gpt-5.6-sol   "<review spec>"
+codex exec --model gpt-6.1-terra "<operations spec>"
+codex exec --model gpt-6.1-sol   "<review spec>"
 codex exec --model gpt-5.6-luna  "<deterministic check spec>"
 ```
 
 Add `--skip-git-repo-check` outside a git repo. Reasoning effort comes from
-`~/.codex/config.toml` (`model_reasoning_effort`, currently `high`); override per call with
+`~/.codex/config.toml` (`model_reasoning_effort`, currently `medium`; the table asks for `high`, so pass `-c model_reasoning_effort="high"` on each call); override per call with
 `-c model_reasoning_effort="xhigh"`.
 
-All three model IDs were confirmed reachable on this machine on 2026-08-15 via the ChatGPT
-subscription login. Model switching IS available here — rule 10's fallback should almost never fire.
+`gpt-6.1-terra`, `gpt-6.1-sol` and `gpt-5.6-luna` answered a one-word `codex exec` call on 2026-10-31 via the
+ChatGPT subscription login (`gpt-5.6-terra` and `gpt-5.6-sol` also still answer). Model switching IS available here — rule 10's fallback should almost never fire.
 
 ## Automatic orchestration
 

hook: PostToolUse
hook: PostToolUse Failed
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc "cat SKILL.md; cat references/batch-model-routing.md; rg -n 'def (build_research_evidence_pack|search_paper_evidence|get_paper_pages)|evidence_hits|coverage_reason|pending-extraction|def ground|--extract|save_paper_brief|save_reference_stub|checkpoint' ~/DEV/ZoteroInjestion -g '*.py' -g '*.md' | head -180" in /Users/kristinarash/.claude/skills/sports-science-research-grounding
 succeeded in 784ms:
---
name: sports-science-research-grounding
description: >-
  Use when the user asks a substantive question about sport science, return to play or
  sport, rehabilitation, strength and conditioning, workload, recovery, testing, athlete
  health, injury, performance, or wants a research-backed answer, and for Zotero
  full-library batch processing. Searches the user's Zotero library first, clearly
  labels external peer-reviewed fallback sources, and applies tier-aware model routing
  during bounded batch work. Do not use for sports scores or schedules (use pp-espn) or
  for a simple Zotero search or sync (use pp-zotero-research-library).
---

# Sports Science Research Grounding

Answer a sport-science question from Eric's Zotero library first, label anything from outside it, and show the
research basis. Routine coding, scheduling and admin questions stay out, even in a repo that holds sport-science
files.

## Answering a question

1. **Add context.** Write the sport code, sex, age or competition level, and injury region or type into the
   question. Unqualified `football` means `collegiate American football` (Baylor) unless the question names
   soccer, association football, Australian football or another code.
2. **Pull the evidence pack.** Run it from the `ZoteroInjestion` repo (`~/DEV/ZoteroInjestion` on the Mac):

   ```bash
   cd ~/DEV/ZoteroInjestion && uv run zotero-bridge ground "<contextualized question>" --limit 5
   ```

   If a `build_research_evidence_pack` tool (server `zotero-research`) is in your tool list, call it with
   `limit=5, extract=false` instead; the output is the same. On the Mac it is usually absent: the registered
   `mcp__zotero__*` tools are a different server (the Printing Press `pp-zotero-research-library`) and do not
   build evidence packs.
3. **Check topical fit, paper by paper.** The pack's `coverage: sufficient` counts papers that matched any
   query variant, so papers matching only "collegiate soccer" pass while the topic term (the creatine, the
   ACL, the sprint) appears nowhere in them. Read each paper's title, snippet and `evidence_hits` against the
   question's main topic. Papers that miss the topic are not evidence; if none remain, treat coverage as
   `none`. Also read `required_context`, each paper's `applicability_alignment`, matches and conflicts,
   evidence status, citation, DOI and page hits.
4. **Extract what matters.** Prefer `page-located` evidence. For a topically fit paper that is
   `pending-extraction` and whose findings matter, rerun step 2 with `--extract` (or `extract=true`); this
   writes only the local page cache. Then `search_paper_evidence` and `get_paper_pages` give page text.
5. **Fill gaps from outside.** When coverage is `thin` or `none` (after step 3), use the harness's research
   search for primary peer-reviewed literature and label each citation `[External]`. When no external search
   is available, say the local coverage is incomplete and name the gap.
6. **Write the answer** to the contract below.

**Done when** every claim in the answer carries a `[Zotero: ...]` or `[External]` tag, and the answer says
which topic gaps remain.

## Answer contract

- Lead with the practical answer, then the research basis.
- Mark each statement as a direct study finding, a cross-paper synthesis, or practitioner interpretation.
- Give population, setting, design, outcomes and the limitations that affect transfer.
- Cite local evidence as `[Zotero: ITEM_KEY, p. N]` with DOI or full citation. Cite external sources as
  `[External]` with a link to the primary source; an external paper is never presented as being in Zotero.
- Weight systematic reviews and strong designs higher, as weight and not as proof.
- Show genuine disagreement, thin evidence and uncertainty.
- Verify any Graphify-inferred or ambiguous link against the original paper before using it as evidence.

## Memory and SecondBrain

The Zotero index is retrieval memory. Use the normal memory system for user context and past decisions; cite
research only from papers. Reviewed Paper Briefs and multi-paper syntheses belong in SecondBrain. Write durable
memory only through the memory workflow or on request.

## Full-library processing

Run only when Eric asks to ingest or continue the library. Never start it for a single question.

1. Read [references/batch-model-routing.md](references/batch-model-routing.md) and apply its routing.
2. Call `list_library_backlog` (CLI: `uv run zotero-bridge backlog --limit 50 --offset 0`). The queue is the
   priority lane, not the boundary.
3. Work a bounded batch. Skip `ingested`, review `update_available`, extract `pending_extraction`, and write
   claims-free Reference Stubs only for `reference_stub` records.
4. Use `prepare_paper_brief`, bounded evidence searches and pages, and the Paper Brief contract
   (`~/DEV/ZoteroInjestion/docs/PAPER_BRIEF_TEMPLATE.md`) before `save_paper_brief` or `save_reference_stub`.
5. Leave locally edited notes, the Zotero library and SecondBrain commits untouched; the bridge is read-only.

**Done when** the checkpoint reports the batch ID, the items saved, skipped and failed, and the model route used.
# Batch model routing

Apply this policy automatically when the user asks to ingest, continue, or process a Zotero library batch. The
bridge remains model-agnostic; routing belongs to the harness that orchestrates CLI and MCP calls.

## Default roles

| Stage | Codex model | Reasoning | Allowed work |
|---|---|---|---|
| Operations | `gpt-6.1-terra` | `high` | Backlog inspection, batch creation, extraction, metadata audit, Reference Stubs, reconciliation, integrity checks, tests, lint, and documentation |
| Scientific review | `gpt-6.1-sol` | `high` | Full-text methods/results/limitations review, applicability judgment, evidence-locator selection, Paper Brief writing, and final scientific approval |

Use `gpt-5.6-luna` (the only Luna this ChatGPT login accepts; `gpt-6.1-luna` is rejected) only when the harness exposes it as an ephemeral worker and the task is strictly deterministic,
read-only status or hash validation. Otherwise use Terra. Never use Luna for Reference Stub relevance wording,
Paper Brief review, synthesis, or promotion.

## How to route (verified 2026-10-31)

Route with the Codex CLI directly. Do not go through the `codex:rescue` subagent — it runs on
Sonnet and decides for itself whether to forward, so the switch is not guaranteed.

```bash
codex exec --model gpt-6.1-terra "<operations spec>"
codex exec --model gpt-6.1-sol   "<review spec>"
codex exec --model gpt-5.6-luna  "<deterministic check spec>"
```

Add `--skip-git-repo-check` outside a git repo. Reasoning effort comes from
`~/.codex/config.toml` (`model_reasoning_effort`, currently `medium`; the table asks for `high`, so pass `-c model_reasoning_effort="high"` on each call); override per call with
`-c model_reasoning_effort="xhigh"`.

`gpt-6.1-terra`, `gpt-6.1-sol` and `gpt-5.6-luna` answered a one-word `codex exec` call on 2026-10-31 via the
ChatGPT subscription login (`gpt-5.6-terra` and `gpt-5.6-sol` also still answer). Model switching IS available here — rule 10's fallback should almost never fire.

## Automatic orchestration

1. Do not ask the user to choose a model for each stage unless they explicitly override this policy.
2. If the current task runs on Sol, keep Sol as the orchestrator/reviewer and send the operational stage to one
   Terra worker.
3. If the current task runs on Terra, keep Terra for operations and send each substantive full-text review stage
   to a Sol worker.
4. Use ephemeral `codex exec` calls, not separate user-owned threads, solely for model routing.
5. Run model-routed stages sequentially. Never allow two workers to write the same batch ledger, Promotion Record,
   or SecondBrain artifact concurrently.
6. Give each worker explicit ownership, the frozen batch ID and item keys, allowed write surfaces, stopping
   conditions, and required verification output.
7. Terra may save a Reference Stub only after the bridge confirms that Usable Full Text is unavailable. Terra must
   not save a Paper Brief.
8. Sol must inspect page-aware evidence and satisfy the Paper Brief contract before calling `save_paper_brief`.
9. Return control to Terra for reconciliation and deterministic verification after Sol finishes promotion.
10. Report the effective model route in the final checkpoint. Before claiming the harness cannot select worker
    models, actually attempt a `codex exec --model <id>` call and report the error. Only fall back to completing
    the batch on the current model if that call genuinely fails.

## Quality boundary

- Do not lower the evidence, applicability, locator, or limitation standards to save model cost.
- Escalate ambiguous citations, conflicting metadata, unclear methods, unsupported claims, or difficult
  applicability judgments to Sol even if they first appear during an operational stage.
- Use `xhigh` only for a specific difficult review that fails at `high`; do not make it the batch default.
- Preserve the user's explicit model choice when they name one for a particular task.

For non-Codex harnesses, map the same roles to that harness's balanced worker tier and flagship reasoning tier only
when explicit model routing is available. Never invent provider model IDs or claim that a switch occurred when the
harness cannot verify it.
/Users/kristinarash/DEV/ZoteroInjestion/README.md:20:uv run zotero-bridge batch-run next-10 --extract
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/mcp_server.py:55:def search_paper_evidence(item_key: str, query: str, limit: int = 5) -> list[dict]:
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/mcp_server.py:63:def get_paper_pages(item_key: str, pages: list[int]) -> list[dict]:
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/mcp_server.py:85:def build_research_evidence_pack(question: str, limit: int = 5, extract: bool = False) -> dict:
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/mcp_server.py:107:def save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/mcp_server.py:116:        path = bridge.save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/mcp_server.py:127:def save_reference_stub(item_key: str, why_it_may_matter: str) -> dict:
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/mcp_server.py:130:        path = bridge.save_reference_stub(item_key, why=why_it_may_matter)
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_batches.py:47:def test_batch_run_checkpoints_outcomes_and_skips_completed_work(settings) -> None:
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_promotion.py:84:        path = service.save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_promotion.py:104:            service.save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_promotion.py:116:        path = service.save_reference_stub("PAPER1", why="Potential return-to-play relevance.")
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_promotion.py:126:        path = service.save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_promotion.py:135:            service.save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_promotion.py:149:        path = service.save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_promotion.py:169:            service.save_reference_stub("PAPER1", why="Not an eligible research record.")
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_grounding.py:68:        assert all(paper["evidence_status"] == "pending-extraction" for paper in pack["papers"])
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_publication.py:61:    PromotionService(settings, store, evidence).save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/tests/test_publication.py:102:        PromotionService(settings, store, evidence).save_reference_stub(
/Users/kristinarash/DEV/ZoteroInjestion/docs/IMPLEMENTATION_PLAN.md:29:- Implement full and incremental synchronization with library-version checkpoints.
/Users/kristinarash/DEV/ZoteroInjestion/docs/IMPLEMENTATION_PLAN.md:91:- Incremental sync uses Zotero version checkpoints.
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/service.py:273:        """Resume a frozen batch and checkpoint every item outcome atomically."""
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/service.py:496:    def save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/service.py:507:            self.promotions.save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/service.py:516:    def save_reference_stub(self, item_key: str, *, why: str) -> str:
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/service.py:518:        return str(self.promotions.save_reference_stub(item_key, why=why))
/Users/kristinarash/DEV/ZoteroInjestion/docs/DESIGN.md:109:- `save_paper_brief`: validate and atomically write a conforming Paper Brief or Reference Stub without changing Zotero.
/Users/kristinarash/DEV/ZoteroInjestion/docs/DESIGN.md:119:3. `batch-run` resumes the manifest and atomically checkpoints each item as pending, ready, Reference Stub
/Users/kristinarash/DEV/ZoteroInjestion/docs/PILOT.md:33:uv run zotero-bridge pilot-audit --extract
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/grounding.py:329:    def _evidence_hits(
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/grounding.py:364:                hits = self._evidence_hits(result.item_key, readiness.attachment_key, matching_queries or variants)
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/grounding.py:370:                evidence_status = "pending-extraction"
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/grounding.py:398:                    evidence_hits=hits,
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/grounding.py:401:        page_located = sum(bool(paper.evidence_hits) for paper in papers)
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/grounding.py:450:            coverage_reason=reason,
/Users/kristinarash/DEV/ZoteroInjestion/docs/SETUP.md:54:uv run zotero-bridge pilot-audit --extract
/Users/kristinarash/DEV/ZoteroInjestion/docs/SETUP.md:77:- `save_paper_brief`
/Users/kristinarash/DEV/ZoteroInjestion/docs/SETUP.md:78:- `save_reference_stub`
/Users/kristinarash/DEV/ZoteroInjestion/skills/sports-science-research-grounding/SKILL.md:24:3. Read `required_context`, `applicability_alignment`, `coverage`, `coverage_reason`, and every paper's
/Users/kristinarash/DEV/ZoteroInjestion/skills/sports-science-research-grounding/SKILL.md:26:4. Prefer `page-located` evidence. If a high-value local match is `pending-extraction` and its findings matter to
/Users/kristinarash/DEV/ZoteroInjestion/skills/sports-science-research-grounding/SKILL.md:61:   calling `save_paper_brief` or `save_reference_stub`.
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/promotion.py:186:    def save_paper_brief(
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/promotion.py:231:    def save_reference_stub(self, item_key: str, *, why: str) -> Path:
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/models.py:135:    evidence_hits: tuple[EvidenceHit, ...] = ()
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/models.py:147:    coverage_reason: str
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/cli.py:191:        typer.Option("--extract", help="Open PDFs and build page-aware evidence caches"),
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/cli.py:198:    """Resume a frozen batch and checkpoint each extraction outcome."""
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/cli.py:223:def ground(
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/cli.py:228:        typer.Option("--extract", help="Build missing page-aware PDF evidence caches for matched papers"),
/Users/kristinarash/DEV/ZoteroInjestion/src/zotero_bridge/cli.py:240:        typer.Option("--extract", help="Open PDFs and build page-aware evidence caches"),
/Users/kristinarash/DEV/ZoteroInjestion/scripts/verify_mcp.py:23:    "save_paper_brief",
/Users/kristinarash/DEV/ZoteroInjestion/scripts/verify_mcp.py:24:    "save_reference_stub",
/Users/kristinarash/DEV/ZoteroInjestion/skills/sports-science-research-grounding/references/batch-model-routing.md:31:8. Sol must inspect page-aware evidence and satisfy the Paper Brief contract before calling `save_paper_brief`.
/Users/kristinarash/DEV/ZoteroInjestion/skills/sports-science-research-grounding/references/batch-model-routing.md:33:10. Report the effective model route in the final checkpoint. If the harness cannot select worker models, complete
/Users/kristinarash/DEV/ZoteroInjestion/scripts/promote_pilot.py:647:            path = bridge.save_paper_brief(

hook: PostToolUse
hook: PostToolUse Failed
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc "sed -n '315,455p' ~/DEV/ZoteroInjestion/src/zotero_bridge/grounding.py; sed -n '1,260p' ~/DEV/ZoteroInjestion/src/zotero_bridge/cli.py; rg -n 'def (prepare|extract)|write|INSERT|UPDATE' ~/DEV/ZoteroInjestion/src/zotero_bridge/evidence.py; nl -ba SKILL.md | sed -n '18,80p'; nl -ba references/batch-model-routing.md | sed -n '8,42p'" in /Users/kristinarash/.claude/skills/sports-science-research-grounding
 succeeded in 3885ms:
        else:
            author = f"{names[0]} et al."
        year_match = re.search(r"(?<!\d)(?:18|19|20|21)\d{2}(?!\d)", str(item.get("publication_date", "")))
        year = year_match.group(0) if year_match else "n.d."
        data = item.get("data", {})
        container = data.get("publicationTitle") or data.get("bookTitle") or data.get("university") or ""
        doi = item.get("doi", "")
        parts = [f"{author} ({year}).", f"{item['title']}."]
        if container:
            parts.append(f"{container}.")
        if doi:
            parts.append(f"https://doi.org/{doi}")
        return " ".join(parts)

    def _evidence_hits(
        self,
        item_key: str,
        attachment_key: str,
        variants: tuple[str, ...],
    ) -> tuple[EvidenceHit, ...]:
        ranked: dict[tuple[str, int], tuple[float, EvidenceHit]] = {}
        for query in variants[:4]:
            for rank, hit in enumerate(self.store.evidence_search(attachment_key, query, limit=5), start=1):
                key = (hit.attachment_key, hit.page)
                fused_score = ranked.get(key, (0.0, hit))[0] + 1.0 / (20 + rank)
                ranked[key] = (
                    fused_score,
                    EvidenceHit(
                        item_key=item_key,
                        attachment_key=hit.attachment_key,
                        page=hit.page,
                        snippet=hit.snippet,
                        score=round(fused_score, 6),
                    ),
                )
        return tuple(
            value[1]
            for value in sorted(ranked.values(), key=lambda value: (-value[0], value[1].page))[: self.MAX_EVIDENCE_HITS]
        )

    def build(self, question: str, *, limit: int = 5, extract: bool = False) -> EvidencePack:
        variants = self.query_variants(question)
        required_context = self.required_context(question)
        ranked = self._rank_candidates(variants, limit=min(max(limit, 1), 10)) if variants else []
        papers: list[GroundedPaper] = []
        for result, score, matching_queries in ranked:
            readiness = self.evidence.prepare(result.item_key) if extract else self.evidence.inspect(result.item_key)
            hits: tuple[EvidenceHit, ...] = ()
            if readiness.attachment_key and readiness.page_count:
                hits = self._evidence_hits(result.item_key, readiness.attachment_key, matching_queries or variants)
            if readiness.usable and hits:
                evidence_status = "page-located"
            elif readiness.usable:
                evidence_status = "full-text-ready"
            elif readiness.blocking_reason == self.evidence.NOT_EXTRACTED_REASON:
                evidence_status = "pending-extraction"
            elif result.fulltext_available:
                evidence_status = "indexed-full-text"
            else:
                evidence_status = "metadata-only"
            item = self.store.item(result.item_key)
            assert item is not None
            alignment, applicability_matches, applicability_conflicts = self._paper_applicability(
                item,
                required_context,
            )
            papers.append(
                GroundedPaper(
                    item_key=result.item_key,
                    title=result.title,
                    citation=self._citation(item),
                    doi=result.doi,
                    year=result.year,
                    item_type=result.item_type,
                    queued=result.queued,
                    fulltext_available=result.fulltext_available,
                    rank_score=score,
                    matching_queries=matching_queries,
                    metadata_snippet=result.snippet,
                    evidence_status=evidence_status,
                    applicability_alignment=alignment,
                    applicability_matches=applicability_matches,
                    applicability_conflicts=applicability_conflicts,
                    evidence_hits=hits,
                )
            )
        page_located = sum(bool(paper.evidence_hits) for paper in papers)
        fulltext = sum(
            paper.fulltext_available or paper.evidence_status in {"page-located", "full-text-ready"} for paper in papers
        )
        base_sufficient = len(papers) >= 3 and (page_located >= 2 or fulltext >= 2)
        aligned_fulltext = sum(
            paper.applicability_alignment == "aligned"
            and (paper.fulltext_available or paper.evidence_status in {"page-located", "full-text-ready"})
            for paper in papers
        )
        partial_fulltext = sum(
            paper.applicability_alignment == "partial"
            and (paper.fulltext_available or paper.evidence_status in {"page-located", "full-text-ready"})
            for paper in papers
        )
        if not required_context:
            applicability_alignment = "not-assessed"
        elif aligned_fulltext >= 2:
            applicability_alignment = "aligned"
        elif aligned_fulltext or partial_fulltext:
            applicability_alignment = "partial"
        else:
            applicability_alignment = "none"

        if base_sufficient and applicability_alignment in {"not-assessed", "aligned"}:
            coverage = "sufficient"
            reason = f"{len(papers)} local papers matched; {fulltext} have full-text evidence."
        elif papers:
            coverage = "thin"
            if required_context and applicability_alignment != "aligned":
                context_label = ", ".join(f"{key}={value}" for key, value in required_context.items())
                paper_word = "paper aligns" if aligned_fulltext == 1 else "papers align"
                reason = (
                    f"{len(papers)} local papers matched, but only {aligned_fulltext} full-text {paper_word} "
                    f"with the required context ({context_label}); at least 2 are required."
                )
            else:
                reason = f"Only {len(papers)} local papers matched or their full-text evidence is incomplete."
        else:
            coverage = "none"
            reason = "No relevant records were found in the current local Zotero index."
        return EvidencePack(
            question=question,
            local_source="Zotero personal library via the read-only Zotero Research Bridge",
            query_variants=variants,
            required_context=required_context,
            applicability_alignment=applicability_alignment,
            coverage=coverage,
            external_search_recommended=coverage != "sufficient",
            coverage_reason=reason,
            papers=tuple(papers),
            answer_contract=(
                "Use page-located findings before abstracts or metadata.",
                "Separate direct study findings, cross-paper synthesis, and practitioner interpretation.",
                "State population, study design, applicability, and material uncertainty.",
from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Annotated

import typer

from .batches import BatchLedgerError
from .config import DEFAULT_PROMOTION_SCOPE, DEFAULT_QUEUE, DEFAULT_SECOND_BRAIN, Settings, write_config
from .publication import PublicationCandidateError
from .service import BridgeService
from .zotero import ZoteroApiError, ZoteroClient

app = typer.Typer(
    name="zotero-bridge",
    help="Read-only Zotero research access for agents and SecondBrain.",
    no_args_is_help=True,
)


def _emit(value: object) -> None:
    typer.echo(json.dumps(value, indent=2, ensure_ascii=True, default=str))


def _read_windows_clipboard() -> str:
    try:
        result = subprocess.run(
            ["pwsh", "-NoProfile", "-NonInteractive", "-Command", "Get-Clipboard -Raw"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        raise typer.BadParameter(f"Could not read the Windows clipboard: {exc}") from None
    return result.stdout.strip()


def _clear_windows_clipboard() -> None:
    subprocess.run(
        ["pwsh", "-NoProfile", "-NonInteractive", "-Command", "Set-Clipboard -Value $null"],
        check=False,
        capture_output=True,
        text=True,
    )


@app.command()
def configure(
    user_id: Annotated[str | None, typer.Option(help="Numeric Zotero user ID")] = None,
    queue_name: Annotated[str, typer.Option()] = DEFAULT_QUEUE,
    secondbrain_dir: Annotated[Path, typer.Option()] = DEFAULT_SECOND_BRAIN,
    promotion_scope: Annotated[
        str,
        typer.Option(help="Knowledge Promotion eligibility: 'queue' or 'library'"),
    ] = DEFAULT_PROMOTION_SCOPE,
    from_clipboard: Annotated[
        bool,
        typer.Option("--from-clipboard", help="Read the key from the Windows clipboard and then clear it"),
    ] = False,
) -> None:
    """Store a dedicated read-only key in the user-local bridge configuration."""
    resolved_user_id = user_id or typer.prompt("Zotero user ID")
    api_key = (
        _read_windows_clipboard()
        if from_clipboard
        else typer.prompt("Read-only Zotero API key", hide_input=True).strip()
    )
    temporary = Settings(
        user_id=resolved_user_id,
        api_key=api_key,
        queue_name=queue_name,
        data_dir=Path.cwd() / ".configuration-check",
        secondbrain_dir=secondbrain_dir,
        promotion_scope=promotion_scope,
        credential_source="interactive",
    )
    try:
        try:
            with ZoteroClient(temporary) as client:
                access = client.key_access()
        except ZoteroApiError as exc:
            if exc.status_code == 403:
                raise typer.BadParameter(
                    "Zotero rejected this API key. Copy only the active key value from "
                    "https://www.zotero.org/settings/keys — not its name, user ID, URL, or header label."
                ) from None
            raise typer.BadParameter(f"Could not validate the Zotero API key: {exc}") from None
    finally:
        if from_clipboard:
            _clear_windows_clipboard()
    if not access.production_ready:
        raise typer.BadParameter(
            "Key must allow personal-library and file reads and must have write permission disabled."
        )
    path = write_config(
        api_key=api_key,
        user_id=resolved_user_id,
        queue_name=queue_name,
        secondbrain_dir=secondbrain_dir,
        promotion_scope=promotion_scope,
    )
    _emit({"configured": True, "path": str(path), "write_permission": access.write})


@app.command()
def doctor() -> None:
    """Check credentials, permissions, APIs, queue, cache, and SecondBrain."""
    with BridgeService.from_environment() as bridge:
        result = bridge.health()
    _emit(result)
    if not result["production_ready"]:
        raise typer.Exit(1)


@app.command("sync")
def sync_command(
    full: Annotated[bool, typer.Option("--full", help="Rebuild metadata from version zero")] = False,
    fulltext: Annotated[bool, typer.Option("--fulltext", help="Fetch changed indexed full text")] = False,
    max_fulltext: Annotated[int | None, typer.Option(min=1)] = None,
) -> None:
    """Incrementally synchronize the read-only Paper Index."""
    with BridgeService.from_environment() as bridge:
        _emit(
            bridge.sync(
                force_full=full,
                include_fulltext=fulltext,
                max_fulltext=max_fulltext,
            )
        )


@app.command()
def search(
    query: str,
    limit: Annotated[int, typer.Option(min=1, max=50)] = 10,
) -> None:
    """Search cached Zotero metadata and indexed full text."""
    with BridgeService.from_environment() as bridge:
        _emit(bridge.search(query, limit=limit))


@app.command()
def show(item_key: str) -> None:
    """Show one paper with attachments and promotion provenance."""
    with BridgeService.from_environment() as bridge:
        _emit(bridge.get_paper(item_key))


@app.command()
def queue() -> None:
    """List papers currently selected in SecondBrain Queue."""
    with BridgeService.from_environment() as bridge:
        _emit(bridge.queue())


@app.command()
def backlog(
    limit: Annotated[int, typer.Option(min=1, max=200)] = 50,
    offset: Annotated[int, typer.Option(min=0)] = 0,
) -> None:
    """List the resumable all-library research processing backlog."""
    with BridgeService.from_environment() as bridge:
        _emit(bridge.library_backlog(limit=limit, offset=offset))


@app.command("batch-create")
def batch_create(
    batch_id: str,
    limit: Annotated[int, typer.Option(min=1, max=200)] = 10,
    status: Annotated[
        str,
        typer.Option(help="Comma-separated backlog statuses to freeze into the batch"),
    ] = "pending_extraction",
) -> None:
    """Create or reopen an immutable, item-key-based backlog batch."""
    statuses = [value.strip() for value in status.split(",") if value.strip()]
    try:
        with BridgeService.from_environment() as bridge:
            _emit(bridge.create_batch(batch_id, limit=limit, statuses=statuses))
    except BatchLedgerError as exc:
        raise typer.BadParameter(str(exc)) from None


@app.command("batch-run")
def batch_run(
    batch_id: str,
    extract: Annotated[
        bool,
        typer.Option("--extract", help="Open PDFs and build page-aware evidence caches"),
    ] = False,
    retry_failed: Annotated[
        bool,
        typer.Option("--retry-failed", help="Retry items whose previous attempt failed"),
    ] = False,
) -> None:
    """Resume a frozen batch and checkpoint each extraction outcome."""
    try:
        with BridgeService.from_environment() as bridge:
            _emit(
                bridge.run_batch(
                    batch_id,
                    extract=extract,
                    retry_failed=retry_failed,
                )
            )
    except BatchLedgerError as exc:
        raise typer.BadParameter(str(exc)) from None


@app.command("batch-status")
def batch_status(batch_id: str) -> None:
    """Read a batch ledger without extracting or changing any item."""
    try:
        with BridgeService.from_environment() as bridge:
            _emit(bridge.batch_status(batch_id))
    except BatchLedgerError as exc:
        raise typer.BadParameter(str(exc)) from None


@app.command()
def ground(
    question: str,
    limit: Annotated[int, typer.Option(min=1, max=10)] = 5,
    extract: Annotated[
        bool,
        typer.Option("--extract", help="Build missing page-aware PDF evidence caches for matched papers"),
    ] = False,
) -> None:
    """Build a multi-paper Zotero-first evidence pack for a practice question."""
    with BridgeService.from_environment() as bridge:
        _emit(bridge.research_evidence_pack(question, limit=limit, extract=extract))


@app.command("pilot-audit")
def pilot_audit(
    extract: Annotated[
        bool,
        typer.Option("--extract", help="Open PDFs and build page-aware evidence caches"),
    ] = False,
) -> None:
    """Classify queued papers for Paper Brief or Reference Stub readiness."""
    with BridgeService.from_environment() as bridge:
        _emit(bridge.pilot_audit(extract=extract))


@app.command()
def prepare(item_key: str) -> None:
    """Resolve evidence readiness and destination for one queued paper."""
    with BridgeService.from_environment() as bridge:
        bridge.require_production_key()
        _emit(bridge.prepare(item_key))


@app.command("pages")
def pages(
    item_key: str,
    page: Annotated[
        list[int] | None,
96:    def prepare(
    18	
    19	## Answering a question
    20	
    21	1. **Add context.** Write the sport code, sex, age or competition level, and injury region or type into the
    22	   question. Unqualified `football` means `collegiate American football` (Baylor) unless the question names
    23	   soccer, association football, Australian football or another code.
    24	2. **Pull the evidence pack.** Run it from the `ZoteroInjestion` repo (`~/DEV/ZoteroInjestion` on the Mac):
    25	
    26	   ```bash
    27	   cd ~/DEV/ZoteroInjestion && uv run zotero-bridge ground "<contextualized question>" --limit 5
    28	   ```
    29	
    30	   If a `build_research_evidence_pack` tool (server `zotero-research`) is in your tool list, call it with
    31	   `limit=5, extract=false` instead; the output is the same. On the Mac it is usually absent: the registered
    32	   `mcp__zotero__*` tools are a different server (the Printing Press `pp-zotero-research-library`) and do not
    33	   build evidence packs.
    34	3. **Check topical fit, paper by paper.** The pack's `coverage: sufficient` counts papers that matched any
    35	   query variant, so papers matching only "collegiate soccer" pass while the topic term (the creatine, the
    36	   ACL, the sprint) appears nowhere in them. Read each paper's title, snippet and `evidence_hits` against the
    37	   question's main topic. Papers that miss the topic are not evidence; if none remain, treat coverage as
    38	   `none`. Also read `required_context`, each paper's `applicability_alignment`, matches and conflicts,
    39	   evidence status, citation, DOI and page hits.
    40	4. **Extract what matters.** Prefer `page-located` evidence. For a topically fit paper that is
    41	   `pending-extraction` and whose findings matter, rerun step 2 with `--extract` (or `extract=true`); this
    42	   writes only the local page cache. Then `search_paper_evidence` and `get_paper_pages` give page text.
    43	5. **Fill gaps from outside.** When coverage is `thin` or `none` (after step 3), use the harness's research
    44	   search for primary peer-reviewed literature and label each citation `[External]`. When no external search
    45	   is available, say the local coverage is incomplete and name the gap.
    46	6. **Write the answer** to the contract below.
    47	
    48	**Done when** every claim in the answer carries a `[Zotero: ...]` or `[External]` tag, and the answer says
    49	which topic gaps remain.
    50	
    51	## Answer contract
    52	
    53	- Lead with the practical answer, then the research basis.
    54	- Mark each statement as a direct study finding, a cross-paper synthesis, or practitioner interpretation.
    55	- Give population, setting, design, outcomes and the limitations that affect transfer.
    56	- Cite local evidence as `[Zotero: ITEM_KEY, p. N]` with DOI or full citation. Cite external sources as
    57	  `[External]` with a link to the primary source; an external paper is never presented as being in Zotero.
    58	- Weight systematic reviews and strong designs higher, as weight and not as proof.
    59	- Show genuine disagreement, thin evidence and uncertainty.
    60	- Verify any Graphify-inferred or ambiguous link against the original paper before using it as evidence.
    61	
    62	## Memory and SecondBrain
    63	
    64	The Zotero index is retrieval memory. Use the normal memory system for user context and past decisions; cite
    65	research only from papers. Reviewed Paper Briefs and multi-paper syntheses belong in SecondBrain. Write durable
    66	memory only through the memory workflow or on request.
    67	
    68	## Full-library processing
    69	
    70	Run only when Eric asks to ingest or continue the library. Never start it for a single question.
    71	
    72	1. Read [references/batch-model-routing.md](references/batch-model-routing.md) and apply its routing.
    73	2. Call `list_library_backlog` (CLI: `uv run zotero-bridge backlog --limit 50 --offset 0`). The queue is the
    74	   priority lane, not the boundary.
    75	3. Work a bounded batch. Skip `ingested`, review `update_available`, extract `pending_extraction`, and write
    76	   claims-free Reference Stubs only for `reference_stub` records.
    77	4. Use `prepare_paper_brief`, bounded evidence searches and pages, and the Paper Brief contract
    78	   (`~/DEV/ZoteroInjestion/docs/PAPER_BRIEF_TEMPLATE.md`) before `save_paper_brief` or `save_reference_stub`.
    79	5. Leave locally edited notes, the Zotero library and SecondBrain commits untouched; the bridge is read-only.
    80	
     8	| Stage | Codex model | Reasoning | Allowed work |
     9	|---|---|---|---|
    10	| Operations | `gpt-6.1-terra` | `high` | Backlog inspection, batch creation, extraction, metadata audit, Reference Stubs, reconciliation, integrity checks, tests, lint, and documentation |
    11	| Scientific review | `gpt-6.1-sol` | `high` | Full-text methods/results/limitations review, applicability judgment, evidence-locator selection, Paper Brief writing, and final scientific approval |
    12	
    13	Use `gpt-5.6-luna` (the only Luna this ChatGPT login accepts; `gpt-6.1-luna` is rejected) only when the harness exposes it as an ephemeral worker and the task is strictly deterministic,
    14	read-only status or hash validation. Otherwise use Terra. Never use Luna for Reference Stub relevance wording,
    15	Paper Brief review, synthesis, or promotion.
    16	
    17	## How to route (verified 2026-10-31)
    18	
    19	Route with the Codex CLI directly. Do not go through the `codex:rescue` subagent — it runs on
    20	Sonnet and decides for itself whether to forward, so the switch is not guaranteed.
    21	
    22	```bash
    23	codex exec --model gpt-6.1-terra "<operations spec>"
    24	codex exec --model gpt-6.1-sol   "<review spec>"
    25	codex exec --model gpt-5.6-luna  "<deterministic check spec>"
    26	```
    27	
    28	Add `--skip-git-repo-check` outside a git repo. Reasoning effort comes from
    29	`~/.codex/config.toml` (`model_reasoning_effort`, currently `medium`; the table asks for `high`, so pass `-c model_reasoning_effort="high"` on each call); override per call with
    30	`-c model_reasoning_effort="xhigh"`.
    31	
    32	`gpt-6.1-terra`, `gpt-6.1-sol` and `gpt-5.6-luna` answered a one-word `codex exec` call on 2026-10-31 via the
    33	ChatGPT subscription login (`gpt-5.6-terra` and `gpt-5.6-sol` also still answer). Model switching IS available here — rule 10's fallback should almost never fire.
    34	
    35	## Automatic orchestration
    36	
    37	1. Do not ask the user to choose a model for each stage unless they explicitly override this policy.
    38	2. If the current task runs on Sol, keep Sol as the orchestrator/reviewer and send the operational stage to one
    39	   Terra worker.
    40	3. If the current task runs on Terra, keep Terra for operations and send each substantive full-text review stage
    41	   to a Sol worker.
    42	4. Use ephemeral `codex exec` calls, not separate user-owned threads, solely for model routing.

hook: PostToolUse
hook: PostToolUse Failed
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc "sed -n '90,190p' ~/DEV/ZoteroInjestion/src/zotero_bridge/evidence.py; sed -n '250,320p' ~/DEV/ZoteroInjestion/src/zotero_bridge/cli.py; sed -n '180,270p' ~/DEV/ZoteroInjestion/src/zotero_bridge/promotion.py; rg -n 'upsert|save_|write_|cache|INSERT|UPDATE' ~/DEV/ZoteroInjestion/src/zotero_bridge/evidence.py" in /Users/kristinarash/.claude/skills/sports-science-research-grounding
 succeeded in 3111ms:
            character_count=character_count,
            source=source,
            blocking_reason=reason,
            warnings=tuple(warnings),
        )

    def prepare(
        self,
        item_key: str,
        *,
        force: bool = False,
        attachment_key: str | None = None,
    ) -> EvidenceReadiness:
        item = self.store.item(item_key)
        if not item:
            raise EvidenceError(f"Unknown Zotero item key: {item_key}")
        candidates = self.pdf_candidates(self.store.attachments(item_key))
        if attachment_key:
            candidates = [
                attachment
                for attachment in candidates
                if str(attachment.get("key", "")) == attachment_key
            ]
            if not candidates:
                raise EvidenceError(
                    f"PDF attachment {attachment_key} is unavailable for Zotero item {item_key}"
                )
        if not candidates:
            return self._readiness(
                item_key=item_key,
                attachment_key=None,
                page_count=0,
                character_count=0,
                source=None,
                blocking_reason="No PDF attachment is available",
            )

        attachment = candidates[0]
        attachment_key = str(attachment["key"])
        attachment_version = int(attachment["version"])
        if not force:
            pages, characters = self.store.evidence_page_summary(attachment_key, attachment_version)
            if pages:
                sample_pages = self.store.evidence_pages(attachment_key, list(range(1, min(pages, 5) + 1)))
                return self._readiness(
                    item_key=item_key,
                    attachment_key=attachment_key,
                    page_count=pages,
                    character_count=characters,
                    source="page cache",
                    text_sample="\n".join(page.text for page in sample_pages),
                )

        local_path = self.client.local_attachment_path(attachment_key)
        source: str
        try:
            if local_path and local_path.exists():
                document = fitz.open(local_path)
                source = f"local:{local_path}"
            else:
                content = self.client.download_attachment(attachment_key)
                document = fitz.open(stream=content, filetype="pdf")
                source = "zotero-web-file"
        except (ZoteroApiError, fitz.FileDataError, OSError, ValueError) as exc:
            return self._readiness(
                item_key=item_key,
                attachment_key=attachment_key,
                page_count=0,
                character_count=0,
                source=None,
                blocking_reason=f"PDF could not be opened: {exc}",
            )

        try:
            pages = [
                EvidencePage(
                    page=index + 1,
                    text=self._normalize_page_text(document.load_page(index).get_text("text")),
                )
                for index in range(document.page_count)
            ]
        finally:
            document.close()
        self.store.replace_evidence_pages(attachment_key, attachment_version, pages)
        character_count = sum(len(page.text) for page in pages)
        return self._readiness(
            item_key=item_key,
            attachment_key=attachment_key,
            page_count=len(pages),
            character_count=character_count,
            source=source,
            text_sample="\n".join(page.text for page in pages[:5]),
        )

    def inspect(self, item_key: str) -> EvidenceReadiness:
        """Report cached evidence readiness without opening or downloading a PDF."""
        item = self.store.item(item_key)
        if not item:
            raise EvidenceError(f"Unknown Zotero item key: {item_key}")
        candidates = self.pdf_candidates(self.store.attachments(item_key))
        if not candidates:
    """Resolve evidence readiness and destination for one queued paper."""
    with BridgeService.from_environment() as bridge:
        bridge.require_production_key()
        _emit(bridge.prepare(item_key))


@app.command("pages")
def pages(
    item_key: str,
    page: Annotated[
        list[int] | None,
        typer.Option("--page", min=1, help="One or more cached PDF page numbers"),
    ] = None,
    attachment_key: Annotated[
        str | None,
        typer.Option(
            "--attachment-key",
            help="Require this exact PDF attachment instead of selecting the preferred attachment",
        ),
    ] = None,
) -> None:
    """Read page-aware evidence from the local bridge cache."""
    if not page:
        raise typer.BadParameter("At least one --page value is required")
    with BridgeService.from_environment() as bridge:
        _emit(bridge.evidence_pages(item_key, page, attachment_key=attachment_key))


@app.command("publication-candidate")
def publication_candidate(
    item_key: str,
    synthesis: Annotated[
        Path,
        typer.Argument(
            exists=True,
            dir_okay=False,
            readable=True,
            resolve_path=True,
            help="Reviewed synthesis JSON to wrap with Zotero and Paper Brief provenance",
        ),
    ],
    output: Annotated[
        Path | None,
        typer.Option(
            "--output",
            dir_okay=False,
            resolve_path=True,
            help="JSON destination inside the bridge publication-candidates directory",
        ),
    ] = None,
) -> None:
    """Export a review-ready Evidence Library candidate without publishing it."""
    try:
        synthesis_value = json.loads(synthesis.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise typer.BadParameter(f"Could not read synthesis JSON: {exc}") from None
    try:
        with BridgeService.from_environment() as bridge:
            _emit(
                bridge.publication_candidate(
                    item_key,
                    synthesis_value,
                    output=str(output) if output else None,
                )
            )
    except PublicationCandidateError as exc:
        raise typer.BadParameter(str(exc)) from None


@app.command("serve-mcp")
def serve_mcp() -> None:
            raise PromotionError(f"Refusing to overwrite untracked SecondBrain file: {destination}")
        existing = destination.read_text(encoding="utf-8", errors="replace")
        existing_hash = hashlib.sha256(existing.encode("utf-8")).hexdigest()
        if existing_hash != record["content_hash"]:
            raise PromotionError(f"Refusing to overwrite locally edited SecondBrain file: {destination}")

    def save_paper_brief(
        self,
        item_key: str,
        body: str,
        *,
        domains: list[str],
        tags: list[str],
        citekey: str = "",
    ) -> Path:
        preparation = self.prepare(item_key)
        if not preparation.eligible:
            if self.settings.promotion_scope == "queue":
                raise PromotionError(
                    f"{item_key} is not in {self.settings.queue_name}; set promotion_scope='library' "
                    "to process every eligible research record"
                )
            raise PromotionError(f"{item_key} is not an eligible research record")
        if not preparation.evidence.usable:
            raise PromotionError(preparation.evidence.blocking_reason or "Usable Full Text is unavailable")
        errors = self.validate_body(body, page_count=preparation.evidence.page_count)
        if errors:
            raise PromotionError("Paper Brief validation failed:\n- " + "\n- ".join(errors))
        item = self.store.item(item_key)
        assert item is not None
        self._assert_safe_update(item_key, preparation.destination)
        frontmatter = self._frontmatter(
            item,
            preparation,
            domains=domains,
            tags=tags,
            citekey=citekey,
        )
        content = f"{frontmatter}\n\n{body.strip()}\n"
        self._atomic_write(preparation.destination, content)
        timestamp = datetime.now(UTC).isoformat()
        self.store.save_promotion(
            item_key=item_key,
            item_version=int(item["version"]),
            artifact_type="paper-brief",
            output_path=str(preparation.destination),
            content=content,
            timestamp=timestamp,
        )
        return preparation.destination

    def save_reference_stub(self, item_key: str, *, why: str) -> Path:
        preparation = self.prepare(item_key)
        if not preparation.eligible:
            if self.settings.promotion_scope == "queue":
                raise PromotionError(
                    f"{item_key} is not in {self.settings.queue_name}; set promotion_scope='library' "
                    "to process every eligible research record"
                )
            raise PromotionError(f"{item_key} is not an eligible research record")
        if preparation.evidence.usable:
            raise PromotionError("Usable Full Text exists; create a Paper Brief instead")
        item = self.store.item(item_key)
        assert item is not None
        self._assert_safe_update(item_key, preparation.destination)
        today = date.today().isoformat()
        reason = preparation.evidence.blocking_reason or "Full text is unavailable"
        content = (
            "---\n"
            "type: reference\n"
            "status: reference-stub\n"
            f"created: {today}\n"
            "source: zotero\n"
            f"zotero-item-key: {item_key}\n"
            f"zotero-version: {item['version']}\n"
            f"doi: {json.dumps(item.get('doi', ''))}\n"
            f"domain: {json.dumps(item.get('tags', []))}\n"
            "cross-linked: false\n"
            "---\n\n"
            f"# {item['title']}\n\n"
            "## Why it may matter\n\n"
            f"{why.strip()}\n\n"
            "## Full-text status\n\n"
            f"Reference stub only: {reason}. No substantive claims were extracted.\n"
        )
        self._atomic_write(preparation.destination, content)
        timestamp = datetime.now(UTC).isoformat()
        self.store.save_promotion(
            item_key=item_key,
            item_version=int(item["version"]),
            artifact_type="reference-stub",
139:                    source="page cache",
185:        """Report cached evidence readiness without opening or downloading a PDF."""
218:            source="page cache",

hook: PostToolUse
hook: PostToolUse Failed
codex
I found five problems.

1. **The fallback can miss gaps.** [SKILL.md:34](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:34) only changes coverage to `none` when *all* papers miss the topic. If one paper fits and four do not, coverage can still say `sufficient`. The skill may then skip outside research. Recheck coverage after removing papers that do not fit.

2. **The CLI path stops before page review.** [SKILL.md:40](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:40) names two server tools for reading pages. Those tools may be absent when the agent uses the CLI. Add CLI steps for page search and reading. The bridge has a `pages` command.

3. **The read-only claim is wrong.** [SKILL.md:79](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:79) says the bridge is read-only. Its save functions write files to SecondBrain and update local records. Say that the bridge does not change Zotero.

4. **The batch steps do not create a batch.** [SKILL.md:73](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:73) asks for a batch ID and a checkpoint but gives no step to create or run a batch. Add the `batch-create`, `batch-run`, and `batch-status` steps.

5. **The topic check can reject useful papers.** [SKILL.md:36](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:36) checks only the title, snippet, and returned page hits. These may omit a relevant finding elsewhere in the paper. Check the full text before rejecting an otherwise promising paper.

I did not change any files. The next step is to fix these five items.
hook: Stop
hook: Stop
hook: Stop
hook: Stop Completed
hook: Stop Completed
hook: Stop Failed
tokens used
33,694
I found five problems.

1. **The fallback can miss gaps.** [SKILL.md:34](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:34) only changes coverage to `none` when *all* papers miss the topic. If one paper fits and four do not, coverage can still say `sufficient`. The skill may then skip outside research. Recheck coverage after removing papers that do not fit.

2. **The CLI path stops before page review.** [SKILL.md:40](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:40) names two server tools for reading pages. Those tools may be absent when the agent uses the CLI. Add CLI steps for page search and reading. The bridge has a `pages` command.

3. **The read-only claim is wrong.** [SKILL.md:79](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:79) says the bridge is read-only. Its save functions write files to SecondBrain and update local records. Say that the bridge does not change Zotero.

4. **The batch steps do not create a batch.** [SKILL.md:73](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:73) asks for a batch ID and a checkpoint but gives no step to create or run a batch. Add the `batch-create`, `batch-run`, and `batch-status` steps.

5. **The topic check can reject useful papers.** [SKILL.md:36](/Users/kristinarash/.claude/skills/sports-science-research-grounding/SKILL.md:36) checks only the title, snippet, and returned page hits. These may omit a relevant finding elsewhere in the paper. Check the full text before rejecting an otherwise promising paper.

I did not change any files. The next step is to fix these five items.
