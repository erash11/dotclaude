# Skills Structural Audit — 2026-07-13

**Scope:** all 124 skills in `~/.claude/skills/`, audited against five structural criteria:
(1) deterministic prose that should be a bundled script, (2) templated output that should live in `assets/`,
(3) re-entered config values that should live in `config.json`, (4) free-text multiple-choice that should be
AskUserQuestion, (5) missing `arguments`/`argument-hint` frontmatter for invocation-time inputs — plus general
weaknesses (stale paths, broken references, trigger collisions).

Audited by six parallel agents (firecrawl pack / hyperframes+animation / ops+CLI+meetings / knowledge+research /
dev-process / presentation). No files were edited.

---

## Executive summary

- **7 skills are broken or degraded right now** — they reference bundled files, binaries, or paths that don't exist on this machine (see Tier 1).
- **`argument-hint`/`arguments` adoption is near zero** across all 124 skills (only storm-research, teach, handoff, roast, watch set it), despite ~25 skills taking an obvious invocation-time input.
- **AskUserQuestion is almost never used** (only the starter-* trio, watch, and project-triage), despite dozens of explicit multiple-choice branch points written as free-text prompts.
- **Imported-skill provenance drift is the dominant failure mode**: skills copied from claude.ai containers, ECC, other users' machines, or upstream repos still carry `/home/claude`, `/mnt/user-data`, `C:\Users\Nate`, phantom bundled files, and foreign cross-references.
- **Config duplication**: the SecondBrain vault path is hardcoded in 7+ skills; CDN version pins are duplicated (with one real conflict); the pp-* binary names have one split-brain case with 18 broken commands.
- **The reference implementations to copy**: `impeccable` (scripts + externalized config + progressive disclosure), `remotion-to-hyperframes` (lint/diff scripts + tiered eval corpus), `watch`, `web-scraping`, `ingest-book`, `pp-zotero-research-library` (honest scoping).

---

## Tier 1 — Broken now (fix first)

| Skill | Problem | Fix |
|---|---|---|
| **skill-evaluator** | Instructs running `scripts/evaluate_skill.py` + 4 more scripts, loading `references/*`, using `assets/report_template.md` — **none exist**; folder has only SKILL.md. Fails at Step 2 every run. | Restore bundled resources from upstream, or rewrite as rubric-driven manual evaluation (rubrics in SKILL.md are usable). |
| **everything-search** | Every example calls `python scripts/search.py` — script doesn't exist; `es` also not on PATH. Every documented invocation fails. | Rewrite around direct `es.exe` with verified install path in a config.json, or restore the script. |
| **pbir-report-builder** | "References (Self-Contained)" lists ~25 files (json-templates, schemas, ibcs-visuals/) — **none exist**. IBCS support is vaporware. | Create the reference files or delete the References section; bundle `scripts/write-pbir.mjs` for the deterministic folder/JSON writing. |
| **decision-toolkit** | References 3 templates + 2 references that don't exist; also names skills not installed (brand-agency, elevenlabs-tts). | Create the assets (moving the inline frameworks there cuts SKILL.md ~in half) or delete the Files section. |
| **process-interviewer** | Phase 5 requires `references/skill-output-template.md` + `plan-output-template.md` — neither exists; terminal step broken. Also ~70% overlap with `grilling`. | Point Phase 5 at write-a-skill/skill-creator, or ship the templates. Narrow its very broad triggers. |
| **session-handoff** | Hardcodes `C:\Users\Nate\.claude\...` — copied from another user's machine; state sources silently skipped. | Replace with `$env:USERPROFILE`; move template to `assets/`. |
| **pp-catapult-openfield-connect** | 18 occurrences of `catapult-pp-cli` vs 25 of `catapult-openfield-connect-pp-cli`; only the long binary exists. Every recipe + auth-setup command is command-not-found. | Global rename to the long name (single highest-impact one-line fix), or ship a shim. Add token-expiry troubleshooting (claude-stack-doctor points here for it). |

### Near-broken / misleading
- **five-slides-generator** — written for the claude.ai container: `/home/claude`, `/mnt/skills/public/pptx/...`, `/mnt/user-data/outputs/`, Unix commands, `web_search`. Every run improvises. Rewrite Steps 5–7 for Windows; bundle a `build-deck` script; move Baylor brand tokens to config.json.
- **pp-recipe-goat** — description promises recipe search across 37 sites; command reference only has USDA nutrition lookups. Will fire on requests it can't serve. Shrink description or adopt pp-zotero's honest "v0.1 — not implemented" pattern.
- **interview-me** — hardcodes a stale project slug (`...DEV-CLI-Dev\memory\`) for its memory bridge; its "weekly synthesis mode" collides with `/weekly-review` (same trigger, different output). Delegate memory writes to memory-write; remove the weekly mode.
- **fact-checker** — never instructs any actual tool use (no WebSearch/firecrawl); "verifies" from parametric knowledge, contradicting its own purpose. Add an explicit research step.
- **fireflies-intake vs name-meetings** — direct contract contradiction: intake says "apply names without approval loop," name-meetings hard-rules "never auto-apply." Add an explicit unattended-mode contract to name-meetings.

---

## Tier 2 — Cross-cutting structural fixes (one change, many skills)

### A. Shared config.json for the SecondBrain vault (7+ skills)
`C:\Users\eric_rash\Desktop\SecondBrain\...` is hardcoded in meeting-sync, name-meetings, fireflies-intake, harvest, ingest-book, ingest-resource, library-review, advisor, interview-me, weekly-review, improve-system. One `~/.claude/skills/_shared/config.json` (vault_dir, state_file, lookback_days, ledger paths) read by all of them ends the copy-drift risk permanently.

### B. `argument-hint` adoption sweep (~25 skills, trivial per-skill edit)
Clearest wins: graphify (`[path] [subcommand]`), advisor (`[domain] [question]`), library-review (`[domain]`), ingest-resource (`[URL/file]`), ingest-book (`[source] [domain]`), fact-checker (`[claim]`), research-assistant (`[topic]`), meeting-sync (`[days-back]`), name-meetings (`[days-back]`), fireflies-intake (`[since-date]`), meeting-prep (`[project]`), harvest (`[project]`), html-to-pdf (`<html> [pdf]`), project-triage (`[YYYY-MM-DD]`), code-review (`[fixed-point] [spec]`), to-issues/to-tickets (`[spec/issue]`), triage (`[#issue]`), implement (`[spec/ticket]`), research (`[question]`), five-slides-generator (`[topic]`), diagram-generator, visual-explainer, game-film-timestamps (`[folder]`), starter-design-tokens (`[URL]`), website-to-hyperframes (`[URL] [duration]`), remotion-to-hyperframes (`[src dir]`), hyperframes-registry (`[item]`), contribute-catalog (`[name] [type]`). Firecrawl workflow family: `arguments` would turn each skill's "Rerun Inputs" re-paste ritual into one-line reruns (best: competitive-intel, deep-research, seo-audit, website-design-clone).

### C. AskUserQuestion sweep (~15 clean branch points)
five-slides-generator (palette), frontend-slides (mood + preview pick), pbir-report-builder (canvas/IBCS), graphify (subfolder pick), improve-system (mode pick), find-skills (option pick), write-a-skill (requirements), meeting-sync (propose-names y/n), name-meetings (approve-all/edit/subset/cancel), triage (category×state), loop-designer (tier 0–4), setup-matt-pocock-skills (host/workflow choices — strongest candidate in the dev suite), code-review (fixed-point candidates), website-to-hyperframes (TTS provider, captions, music), hyperframes (design-path choice), firecrawl workflow family (one adapter line in firecrawl-workflows — "in Claude Code, use AskUserQuestion for the onboarding interview" — fixes all 20 without forking each file).

### D. Consolidate the handoff triplication
`handoff` (OS temp dir), `session-handoff` (chat-only, per its description; but writes Nate-paths), and `closeout` Step 4 (`docs/handoffs/`) produce three formats in three destinations — and a temp-dir handoff can be GC'd before the next session reads it. Pick one canonical writer + template in `assets/`; have closeout invoke it.

### E. Dedupe near-identical skills
- **to-prd ≈ to-spec** (~95% byte-identical) → alias one to the other (grill-me pattern).
- **to-issues ⊂ to-tickets** (older subset) → remove or alias to-issues.
- **write-a-skill** is the shallowest of 4 installed skill-authoring resources → remove; keep writing-great-skills (reference) + skill-creator (builder).
- **memory-write** duplicates the CLAUDE.md Memory System section verbatim → keep rules in one place, point the other at it.
- **firecrawl-deep-research vs deep-research plugin**; **firecrawl-research-index vs firecrawl-research-papers** ("always use for literature" collision) → add boundary sentences.
- **process-interviewer vs grilling vs superpowers:brainstorming** → decide a single owner for "stress-test before building."

---

## Tier 3 — Per-skill highlights (by batch)

### Ops / CLI / meetings
- **meeting-sync (HIGH)** — Steps 1–5 are a fully deterministic pipeline in prose → bundle `scripts/sync.py`; line 80 still has the fragile newest-mtime export detection that KeystoneOS already fixed via directory diff (commit c5b1208) — port the fix back; move the 5-section augment header to `assets/`; shared config (A).
- **name-meetings (MED)** — regex generic-title classification + pending-file bookkeeping → small script; align auth story with meeting-sync (they currently give contradictory auth instructions and check different doctor strings).
- **pp-fireflies (MED)** — third-party residue: examples write to `~/vaults/VBT/...` (someone else's vault); the known `transcripts update` GraphQL bug is documented in name-meetings but not here where the command is listed.
- **closeout (MED)** — nightly deterministic sweeps → `closeout-sweep.ps1` or invoke claude-stack-doctor's script; repo allowlist → config.
- **claude-stack-doctor (LOW)** — venv/task list hardcoded in the script → sibling config.json; the two highest-frequency failures on record (MCP auth rot ×9, Catapult token expiry) are still manual checks — extend the script.
- **project-triage, watch, html-to-pdf, pp-espn/flight/movie (LOW/OK)** — minor: triage.py `--auto` mode, html2pdf.ps1 `-PageCss`/`-ExtraArgs` params (SKILL.md advises flags the script can't accept).

### Knowledge / research
- **graphify (HIGH)** — ~30KB of its 48KB is inline `python -c` heredocs (the BFS/DFS traversal alone is ~85 lines the model must retype verbatim) → move to `scripts/` or upstream as `python -m graphify` subcommands; extraction prompt + report block → `assets/`; magic numbers → config.json; split references. Expected: 48KB → ~10KB SKILL.md and copy-proof determinism.
- **humanizer (MED)** — mechanically detectable patterns (em dashes, curly quotes, word lists) → `scripts/detect_patterns.py`; push the ~20KB of examples to references/.
- **web-scraping** — hygiene: committed `__pycache__/*.pyc`; note its `.env` holds live API keys inside the skill folder (travels with any backup/sync).
- **find-skills** — hardcoded install counts/leaderboard names will rot.
- **storm-research, ingest-book, weekly-review (LOW)** — minor extractions; otherwise strong.

### Dev-process
- **code-review (MED)** — deterministic git preflight → `scripts/preflight.sh`; 12-smell Fowler baseline → reference file.
- **improve-codebase-architecture (MED)** — cross-OS temp+open prose → 15-line script; HTML scaffold → `assets/report-template.html`.
- **loop-designer (MED)** — KeystoneOS paths hardcoded in prose → config.json.
- **impeccable (OK)** — 2.1MB is legitimate: 1.69MB vendored browser bundles in scripts/, 358KB progressive-disclosure references. Reference implementation. Optional: move the ~8KB always-loaded design-rules block to a reference.
- **Stubs** (grill-me, grill-with-docs, zoom-out, handoff, implement, research) — intentional minimal pointers, fine; add argument-hints to implement/research; `research` lacks `disable-model-invocation` unlike its sibling stubs (may auto-trigger).
- **roast** — says "issue five `Task` calls"; tool is now `Agent`.

### Firecrawl pack (31)
- Structurally sound overall; three dead reference targets: `firecrawl-build` hub (referenced by 5 skills, never installed), `firecrawl-cli` (installed folder is `firecrawl`), `references/workflow-authoring.md` (doesn't exist).
- All 15 outcome-workflow skills embed their Final Deliverable template inline → `assets/deliverable-template.md` (+ `output-schema.json` where a JSON shape is given).
- Workflow family has near-zero failure handling (rate limits, credit exhaustion, partial failures) — one shared "Failure Handling" paragraph or pointer to `firecrawl/rules/` covers all 20; dashboard-reporting's expired-auth paragraph is the model.
- **firecrawl-website-design-clone (HIGH)** — fixed two-command extraction → `scripts/extract-design.sh`; largest inline template in the pack → assets.
- **firecrawl-competitive-intel** — explicitly recurring but stores nothing between runs → `.firecrawl/competitive-intel.json` (competitors, cadence, last-run sources); never mentions `firecrawl monitor`, which is purpose-built for it.
- company-directories / lead-gen: wire the prose "Extraction Fields" to `firecrawl agent --schema-file` via bundled schema JSONs.

### HyperFrames + animation adapters (15)
- **Version-pin conflict needing a decision**: contribute-catalog pins `three@0.147.0`; the three skill uses `three@0.181.2`. All CDN pins (gsap, animejs, three, bodymovin, tailwind) should live in one shared versions reference/config.
- **website-to-hyperframes (HIGH)** — broken link to `../hyperframes/references/html-in-canvas-patterns.md` (doesn't exist); oversized single-read references (capabilities.md 57KB, step-3 48KB) → split behind an index; TTS/captions/music choices → AskUserQuestion; Gemini key setup + cost figures → config.
- **contribute-catalog (HIGH)** — Step 6 "Ship" is an 8-step deterministic shell sequence incl. a manual JSON edit → `scripts/ship.mjs`; registry-item skeletons duplicated inline AND in templates.md → real template files; AWS profile + paths → config.
- **hyperframes-cli (MED)** — missing `snapshot`, `publish`, `capture` commands that sibling skills depend on; incomplete as the declared CLI reference.
- **hyperframes (MED)** — design-adherence audit is deterministic prose → third script alongside contrast-report.mjs/animation-map.mjs; script paths assume a working directory.
- Factual drift: "11 visual techniques" (hyperframes) vs "13" (website-to-hyperframes) for the same file.
- Adapter docs (gsap, animejs, css-animations, lottie, waapi, three, typegpu, tailwind): OK as-is apart from the shared pin issue.

### Presentation / content
- **game-film-timestamps (MED)** — already well-factored; stale `apify-slash-rag-web-browser` reference, Unix-isms (`python3`, `/tmp/...`); `default_team: BAY` → config.
- **diagram-generator (MED)** — hand-computed x/y layout math is the error source → `scripts/build_excalidraw.py` from a declarative spec; element templates + zone color table → assets/config; doesn't mention the available Excalidraw MCP.
- **frontend-slides (MED)** — identical controller-class boilerplate regenerated per deck → `assets/controller.js`; stale ECC cross-references (frontend-patterns, liquid-glass-design, `.ecc-design/` paths).
- **visual-explainer (MED)** — full design system re-implemented as CSS per run (main drift source) → `assets/base-template.html` with CSS custom properties; no defined output location or delivery step.
- **design-academy-skill** — ~120-word trigger-stuffed description bloats every skill-list injection → halve it.
- **starter-* trio (LOW/OK)** — already AskUserQuestion-driven; starter-voice-profile references Gmail `authenticate` tools that don't exist in this environment's connector.
- **caveman, articulation-skill** — OK as-is (caveman called exemplary).

---

## Suggested fix order

1. **One-line/rename fixes with immediate breakage impact**: pp-catapult binary rename; session-handoff Nate-paths; interview-me stale slug; roast `Task`→`Agent`; firecrawl `firecrawl-cli`→`firecrawl` links.
2. **Delete-or-deliver decisions on phantom files**: skill-evaluator, pbir-report-builder, decision-toolkit, process-interviewer, everything-search (5 skills promising files that don't exist).
3. **Shared `_shared/config.json`** (vault paths, then CDN pins, then pp-* boilerplate) — kills the largest drift class.
4. **argument-hint sweep** — ~25 skills, minutes each.
5. **Script extraction for the big three**: graphify (biggest win), meeting-sync (port the c5b1208 fix back), five-slides-generator (Windows rewrite + build script).
6. **AskUserQuestion sweep** + firecrawl one-line adapter note.
7. **Dedupe/consolidate**: handoff triplication, to-prd/to-spec, to-issues/to-tickets, write-a-skill, memory-write, weekly-mode collision.
