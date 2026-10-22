export const meta = {
  name: 'jev-reopen-prep',
  description: 'Jev reopen: run the Digest ch1 protocol check end to end; prep (no Jev calls) the video claim check and the tech athlete-data screen',
  phases: [
    { title: 'Digest', detail: 'build + run Jev consistency check of Digest ch1 vs Baylor protocol, then adversarial review' },
    { title: 'Video prep', detail: 'state builder, 40 authored plants, blind key for 60 real rows, runner + scorer scripts' },
    { title: 'Tech prep', detail: 'vendor descriptions for 188 products, prereg, seeded 30, blind key, runner + scorer' },
  ],
}

const ROOT = '/Users/kristinarash/DEV/TypeSafe_Sandbox'
const COMMON = `
Rules for every agent in this run:
- Work only inside ${ROOT} (and READ other ~/DEV repos where told). Current git branch is jev-reopen-2026-10-22. NEVER run git commit, git checkout, git switch, git stash, git reset or any branch change; the orchestrator commits. Do not edit docs/STATUS.md or .gitignore.
- Python: use ${ROOT}/.venv/bin/python. Stdlib preferred. The Jev HTTP client is ${ROOT}/zotero_classify/jev_client.py (read it; reuse it, do not write a second HTTP path). TYPESAFE_API_KEY is already in the environment.
- Never read Google Drive through the FUSE mount (~/Library/CloudStorage/...): reads hang. If a Drive file is needed, use the gws CLI / Drive API instead.
- Match the repo's existing style: look at drive_triage/ and verifier/ for how scripts, READMEs and pre-registrations are written (plain, dated, numbers stated, limits stated).
- Your final message is a data return to the orchestrator, not prose for a human.`

const DIGEST_SCHEMA = {
  type: 'object',
  properties: {
    files_written: { type: 'array', items: { type: 'string' } },
    claims_checked: { type: 'integer' },
    planted: { type: 'integer' },
    planted_caught: { type: 'integer' },
    jev_calls: { type: 'integer' },
    flags: { type: 'array', items: { type: 'object', properties: {
      claim: { type: 'string' }, source: { type: 'string' }, source_snippet: { type: 'string' },
      kind: { type: 'string', description: 'known_eric_choice | unexplained_contradiction | number_mismatch | other' },
      p_contradict: { type: 'number' } }, required: ['claim', 'source', 'kind'] } },
    sources_used: { type: 'array', items: { type: 'string' } },
    problems: { type: 'array', items: { type: 'string' } },
  },
  required: ['files_written', 'claims_checked', 'flags', 'problems'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    confirmed_flags: { type: 'array', items: { type: 'string' } },
    refuted_flags: { type: 'array', items: { type: 'object', properties: { claim: { type: 'string' }, why: { type: 'string' } }, required: ['claim', 'why'] } },
    missed_contradictions: { type: 'array', items: { type: 'object', properties: { claim: { type: 'string' }, source_says: { type: 'string' } }, required: ['claim', 'source_says'] } },
    code_or_method_bugs: { type: 'array', items: { type: 'string' } },
    report_edits_made: { type: 'array', items: { type: 'string' } },
  },
  required: ['confirmed_flags', 'refuted_flags', 'missed_contradictions', 'code_or_method_bugs'],
}

const FILES_SCHEMA = {
  type: 'object',
  properties: {
    files_written: { type: 'array', items: { type: 'string' } },
    checks: { type: 'array', items: { type: 'string' }, description: 'each integrity check run and its result' },
    counts: { type: 'object', additionalProperties: true },
    problems: { type: 'array', items: { type: 'string' } },
  },
  required: ['files_written', 'checks', 'problems'],
}

const DESC_SCHEMA = {
  type: 'object',
  properties: {
    rows: { type: 'array', items: { type: 'object', properties: {
      canonical: { type: 'string' },
      description: { type: 'string', description: 'vendor own words, copied not paraphrased; empty if none found' },
      source_url: { type: 'string' },
      source_kind: { type: 'string', description: 'vendor_page | other_page | none' },
    }, required: ['canonical', 'description', 'source_kind'] } },
  },
  required: ['rows'],
}

// ---------------- Track 1: Digest ----------------
const digestTrack = (async () => {
  const built = await agent(`${COMMON}

TASK: Build and run a Jev consistency check of Applied Performance Digest chapter 1 against Baylor's own written ForceDecks protocols, and write a report Eric reads before shipping the chapter on 2026-10-23. This is a CHECK, not a pre-registered measurement: no bars.

Inputs:
- Chapter: in repo ~/DEV/Performance_Playbook, run: git show origin/digest-start:docs/digest/ch01_forcedecks_cmj.md (do NOT check out the branch). Also read origin/digest-start:docs/digest/sources.md and origin/digest-start:docs/handoffs/2026-10-06-ch01-answers-placeholders.md.
- Eric's DELIBERATE changes vs the old protocol (from that handoff): 2 reps (V3 said 3), hands on hips, stiff athletic landing (V3 said soft), ForceDecks app 2.1, VALD Hub -> Kitman and department database by API for all sports. Any contradiction on these is kind=known_eric_choice, reported separately from unexplained drift.
- Source A, Operations Guide: ~/DEV/Performance_Playbook/"Baylor Applied Performance Playbook.pdf" (May 2024, ~97.5% identical to the current docx). Extract its ForceDecks-related text (and any general testing text the chapter's claims touch). Use pdftotext if installed, else a pure-python route via uv (e.g. ~/.local/bin/uv run --with pypdf python ...). 
- Source B, "Revised Force Plate Testing V3" protocol (~885 words). sources.md says a text copy is indexed by the Flint project: search ~/DEV/Flint (grep for "Weigh Athlete", "Start Recording", "Force Plate Testing") and the memsearch index if needed. If no text copy exists locally, fetch the docx via the gws Drive API (path in sources.md, under 00_Primary_Storage_Drive/99_UNSORTED/From_Desktop/SPORT_SCIENCE/PROTOCOLS/FORCE PLATES/). If you truly cannot get it, run on Source A only and say so in problems.
- Save extracted source text ONLY under ${ROOT}/digest_check/private/ (gitignored).

Build in ${ROOT}/digest_check/:
1. claims.py: deterministic extraction of checkable claims from the chapter: procedural sentences and list items in the setup/procedure/troubleshooting/review sections. Skip headings, tables of metadata, and any sentence containing [CONFIRM. Each claim gets an id and its section.
2. Numbers in code: for claims containing counts, durations, settings or versions, compare in code against the sources; differences become kind=number_mismatch (or known_eric_choice). Jev never judges numbers.
3. Passage choice in code: source texts are short; send the relevant source section (keyword-matched section, capped ~3000 chars). Not the whole PDF.
4. Jev questions per (claim, source) pair, two Nouls in ONE request per pair, with instructions that forbid outside knowledge: (a) contradiction: does the source passage give a different instruction, count, cue, order or setting for the same step than the claim does? (b) coverage: does the source passage address the same step or topic at all? Flag when (a) >= 0.50 and (b) >= 0.50. Read docs.typesafe.ai/primitives/noul.md and api.md first (append .md) for current request shape, and mirror how verifier/verify.py or drive_triage/run_jev.py call jev_client.
5. Planted contradictions: author 10 altered copies of real chapter claims that clearly contradict the sources on a NON-numeric point (wrong cue, wrong order, wrong button, wrong condition), written to digest_check/plants.csv BEFORE running Jev. Report catch rate.
6. Run it. Save raw answers to digest_check/runs/jev.jsonl (ids and probabilities only, no source text).
7. Write digest_check/REPORT.md: top = what Eric must look at before shipping (unexplained contradictions, each with claim, short source snippet <= 25 words, probability), then known Eric-choice items as a short list, then number mismatches, then plant catch rate, coverage gaps (chapter steps no source covers, listed briefly), cost and call count, and limits. Plain words, short. Also README.md with how to rerun.
Return the structured result.`, { label: 'digest:build+run', phase: 'Digest', schema: DIGEST_SCHEMA })

  if (!built) return null
  const review = await agent(`${COMMON}

TASK: Adversarially review a finished consistency check. Your job is to find where it is WRONG, not to agree.
The check compared Applied Performance Digest chapter 1 (in ~/DEV/Performance_Playbook: git show origin/digest-start:docs/digest/ch01_forcedecks_cmj.md) against Baylor's protocol texts saved in ${ROOT}/digest_check/private/. Code and report: ${ROOT}/digest_check/ (REPORT.md, runs/, claims.py etc.).
Builder's own summary (do not trust it): ${JSON.stringify(built).slice(0, 6000)}

Do all of these:
1. For every flag in REPORT.md: read the claim and the source text yourself. Is it a real contradiction? Is its kind right (Eric's deliberate choices are: 2 reps, hands on hips, stiff landing, app 2.1, API all sports)?
2. Hunt for misses: read the chapter's procedure sections against the source texts yourself and list real contradictions the check did not flag (name the claim and what the source says).
3. Check the code: claim extraction skipping things it should not, [CONFIRM] handling, passage choice sending the wrong section, thresholds applied wrong, plants written after the run (check file mtimes vs runs/jev.jsonl), numbers sent to Jev.
4. Fix REPORT.md in place so it is accurate: remove refuted flags (note them in a short "Removed on review" list), add confirmed misses in a clearly labelled "Found on review, not by Jev" section. Do not re-run Jev unless a code bug invalidates results; if you re-run, say so.
Return the structured result.`, { label: 'digest:adversarial-review', phase: 'Digest', schema: REVIEW_SCHEMA })
  return { built, review }
})()

// ---------------- Track 2: Video prep ----------------
const videoTrack = (async () => {
  const state = await agent(`${COMMON}

TASK: Build the frozen state for the pre-registered video summary claim check. Read docs/VIDEO_SUMMARY_CHECK_PREREG.md, video_check/README.md, video_check/build_sample.py first.

CRITICAL: video_check/sample.csv (100 rows, committed in 1a9f19d) is FROZEN. Do not run build_sample.py over it: on this Mac 42Analytics now has far more summaries than the 10 pilot videos, so the builder draws a different 785-row sample. Never write to sample.csv except as described below.

Do:
1. Write video_check/build_state.py: reads sample.csv (and video_check/authored_plants.csv if present), and for each row regenerates the passage from ~/DEV/42Analytics/videos/<dir whose name contains window_video>/transcript.md using build_sample.py's own parse_transcript() and window() (import them; do not reimplement). Writes video_check/state.jsonl: {item_id, kind, claim, passage}. Note the 42Analytics video folders are named <date>_<videoid>_<slug>.
2. Integrity check: for all 100 frozen rows, len(passage) must equal passage_chars in sample.csv. Report how many match. If any mismatch, report exactly which and why (transcript changed? path?), and do NOT paper over it.
3. Some claims carry a stray control character (e.g. \\x01 at the end of rea000's claim). Strip C0 control chars from claims in state.jsonl only (not in sample.csv) and report how many.
4. Merge path for plants: build_state.py must accept authored_plants.csv rows with columns: item_id, kind (negation|mechanism), source_item_id (a real row whose window/passage it reuses), claim, expected (contradicted|not supported). Plant rows take window_video/window_start/window_end from their source_item_id.
5. Run it now on the 100 frozen rows only. Record the sha256 of state.jsonl.
Return files, checks and counts.`, { label: 'video:state', phase: 'Video prep', schema: FILES_SCHEMA })

  const [plants, key, scripts] = await parallel([
    () => agent(`${COMMON}

TASK: Author the 40 planted defects for the pre-registered video summary claim check (docs/VIDEO_SUMMARY_CHECK_PREREG.md, sample table rows "negation" and "mechanism"). You are blind to any model answers; none exist yet.
State for the 100 frozen rows: video_check/state.jsonl (claim + passage). Build helper: video_check/build_state.py (read its plant column spec).
Write video_check/authored_plants.csv with exactly 40 rows:
- 20 negation (expected=contradicted): take a real claim (kind=real), rewrite it to say the OPPOSITE of what its passage says, keeping wording otherwise close. Use 20 different source_item_ids spread across all 10 videos (2 per video).
- 20 mechanism (expected=not supported): take a real claim and add a plausible reason, cause, name or mechanism the speaker never gave in that passage (the failure Flint's reviews found most often). It must be genuinely absent from the passage: re-read the passage to confirm. Different 20 source_item_ids where possible, 2 per video.
- Only use real rows whose original claim looks supported by its passage (you are writing defects against good claims). No numbers in plant edits (numbers are checked in code, not by Jev).
- item_id: neg000..neg019, mec000..mec019.
Then run build_state.py to rebuild state.jsonl with 140 rows, confirm the first 100 rows are byte-identical in content to before (compare item_id/claim/passage), record the new sha256.
Return files, checks, counts.`, { label: 'video:plants', phase: 'Video prep', schema: FILES_SCHEMA }),

    () => agent(`${COMMON}

TASK: You are the blind answer key for the pre-registered video summary claim check (docs/VIDEO_SUMMARY_CHECK_PREREG.md, section "Answer key"). No model answers exist and you must not look for any.
Read video_check/state.jsonl. For each of the 60 rows with kind=real ONLY, read the claim and the passage and label it from the passage alone, no outside knowledge:
- supported: the passage says or directly implies everything in the claim
- partly: the core is there but some part (a detail, a qualifier, a cause, an attribution) is not in the passage
- not supported: the passage does not say this, or says the opposite
Write video_check/answer_key.csv: item_id,label,note (note: <= 20 words, required for partly / not supported: what is missing). Be strict and literal: a claim that adds a reason the speaker never gave is partly, not supported. Then report the label counts.
Return files, checks, counts.`, { label: 'video:blind-key', phase: 'Video prep', schema: FILES_SCHEMA }),

    () => agent(`${COMMON}

TASK: Write (do NOT run against the API) the runner and scorer for the pre-registered video summary claim check. Read docs/VIDEO_SUMMARY_CHECK_PREREG.md exactly; the scripts must implement it as written, no improvements. Mirror drive_triage/run_jev.py, drive_triage/run_llm.py, drive_triage/score.py structure (resumable, raw answers appended to runs/*.jsonl before any threshold, ids and answers only).
1. video_check/run_jev.py: reads video_check/state.jsonl (140 rows). One request per item with the three Nouls in the prereg (support, contradiction, extra detail), state = {claim, passage}, instructions forbid outside knowledge. Read https://docs.typesafe.ai/primitives/noul.md and https://docs.typesafe.ai/api.md for the current request format, and reuse zotero_classify/jev_client.py. Records tokens/cost if the API returns them.
2. video_check/run_llm.py haiku|codex: same state, forced answer supported / partly / not supported as JSON. Haiku via: claude -p --model claude-haiku-4-5 --tools "" --system-prompt ... --output-format text (stdin = item JSON). Codex via: codex exec --skip-git-repo-check --sandbox read-only - . Both verified working on this Mac today. Workers default 4. Out-of-vocabulary answers recorded as failures, never coerced.
3. video_check/score.py: computes exactly the prereg bars: decisive share (no Noul in 0.35-0.65 on all three), planted catch rate on decisive items (overall and per kind: wrong_locator, cross_video, negation, mechanism), false-alarm rate on real items keyed "supported", Jev vs Haiku catch rate at equal or lower false-alarm rate (state precisely how comparators map to flagged: not supported or partly = flagged; also report the strict variant not-supported-only), cost. Flag rule: Q2 >= 0.50 or Q3 >= 0.50 or Q1 <= 0.50. Prints a results table and writes video_check/results_raw.json. Also implement the answer-key audit pull (confident disagreements Jev vs key on real rows, cap 20, seeded random if more) writing video_check/private/audit_sheet.md shuffled and blind (no side labels shown).
4. Add a --selftest to score.py with synthetic answers that exercises every bar and the audit pull; run the selftest (free) and report it.
5. Smoke-run run_jev.py on --limit 1 is NOT allowed (no API calls before the pre-registration is committed). Instead add a --dry-run that prints the exact request body for item 1 and run that.
Return files, checks.`, { label: 'video:scripts', phase: 'Video prep', schema: FILES_SCHEMA }),
  ])
  return { state, plants, key, scripts }
})()

// ---------------- Track 3: Tech prep ----------------
const techTrack = (async () => {
  // descriptions in chunks
  const chunks = Array.from({ length: 8 }, (_, i) => i)
  const descP = parallel(chunks.map(i => () => agent(`${COMMON}

TASK: Collect vendor product descriptions for chunk ${i} of 8 of the Baylor athletics tech inventory.
Read ~/DEV/Tech_Inventory_Analysis/clean/tech_master.csv (189 lines = header + 188 products). Your rows: data rows whose 0-based index i satisfies i % 8 == ${i}. Use the 'canonical' column (and raw_variants to disambiguate).
For each product, find the vendor's OWN product description: use the Firecrawl tools (load via ToolSearch: mcp__claude_ai_Firecrawl__firecrawl_search and mcp__claude_ai_Firecrawl__firecrawl_scrape) or WebSearch/WebFetch. Copy 1-3 sentences from the vendor's product/about page VERBATIM (no paraphrase, no summarising, max ~60 words). Do NOT add anything about athlete data, privacy or health data unless those exact words are in the vendor text you copied. Do not write your own description.
- source_kind=vendor_page if from the vendor's own site; other_page if only from a third-party page (still verbatim); none if not found (description empty). Generic items (e.g. Microsoft Office, iPad) still get the vendor's text.
Return one row per assigned product, canonical spelled exactly as in the CSV.`, { label: `tech:desc-${i}`, phase: 'Tech prep', schema: DESC_SCHEMA })))

  const preregP = agent(`${COMMON}

TASK: Write the pre-registration and code (no API calls) for the twelfth measurement: Tech Inventory athlete-data screening.
Read first: docs/JEV_CAPABILITY_MAP.md (gate rule, answer-key audit, and the Drive-triage lesson that every prereg names BOTH fail branches in advance), docs/DRIVE_TRIAGE_PREREG.md (format to copy), docs/handoffs/2026-09-21-leverage-sweep-all-projects.md section "5. Tech Inventory athlete-data screening" (its kill test is the core bar), ~/DEV/Tech_Inventory_Analysis/scripts/aliases.py (ATHLETE_DATA_CATEGORIES, the code baseline), ~/DEV/Tech_Inventory_Analysis/clean/tech_master.csv, ~/DEV/Tech_Inventory_Analysis/docs/STATUS.md (consumer: second-pass form on the athlete-data candidates; Kenny's Software & Technology Review, ET summary due 2026-11-30).
Write in ${ROOT}/tech_screen/:
1. docs/TECH_SCREEN_PREREG.md (in ${ROOT}/docs/): question; gate check (fuzzy / consumer / code baseline = category rule, athlete_data_likely column); governance tier A (product names, vendor text, unit names; no athlete data); state = {product name, raw_variants, units, vendor_description} and NOT the category or flag; the Jev question: one Noul "does this product store or process information about individual, identifiable athletes (for example their performance, health, wellness, academics, recruiting, or video of them)?"; plus a second Noul for "only used for general staff productivity or communication, holding no athlete records"; decision rule stated in advance (Noul1 >= 0.50 = athlete data; 0.30-0.70 = uncertain band routed to Eric); the kill test bar from the sweep: on 30 products drawn by seed 20261022 with Python random.Random(20261022).sample over the 188 canonical names in CSV order, Jev must disagree with the category flag on >= 5 AND be right (per the blind key) on those, else the category rule stays; also report Jev accuracy vs key on all 30 and the rule's accuracy on the same 30; answer-key audit step; BOTH fail branches written as "(a) fails and the rule is at least as good: the rule stays, nothing runs" and "(b) [Eric to choose before any call: run Jev's disagreement list as a review queue for Eric, or nothing runs]" (leave the bracket for Eric); what each outcome changes (pass: Jev's disagreement list over all 188 goes to Eric as review candidates for the second-pass form). Status line: "Bars PROPOSED, Eric approves before any call." Leave a placeholder for the state sha256.
2. tech_screen/sample30.py: draws and prints the 30 (deterministic), writes tech_screen/sample30.csv (canonical only). Run it.
3. tech_screen/build_state.py: joins tech_master.csv with tech_screen/descriptions.csv (canonical, description, source_url, source_kind; will exist later) into tech_screen/state.jsonl, excluding category and athlete_data_likely.
4. tech_screen/run_jev.py (resumable, raw to tech_screen/runs/jev.jsonl, reuse zotero_classify/jev_client.py; read https://docs.typesafe.ai/primitives/noul.md and api.md for the request format) with --dry-run printing the request for one product; run the dry-run only if state.jsonl exists, otherwise skip.
5. tech_screen/score.py implementing the kill test exactly, plus the full-188 disagreement list (Jev vs category rule) written to tech_screen/disagreements.csv labelled "verified on 30 only", plus the audit pull (cap 20) to tech_screen/private/audit_sheet.md. Include --selftest with synthetic data and run it.
6. tech_screen/README.md.
Return files, checks.`, { label: 'tech:prereg+code', phase: 'Tech prep', schema: FILES_SCHEMA })

  const [descResults, prereg] = await Promise.all([descP, preregP])
  const rows = descResults.filter(Boolean).flatMap(r => r.rows)
  log(`tech: ${rows.length} product descriptions returned from ${descResults.filter(Boolean).length}/8 chunks`)

  const assemble = await agent(`${COMMON}

TASK: Assemble the tech screen state, then act as the blind answer key.
Part 1. Write ${ROOT}/tech_screen/descriptions.csv (columns canonical, description, source_url, source_kind) from this JSON (collected by 8 agents): ${JSON.stringify(rows)}
Check every canonical in ~/DEV/Tech_Inventory_Analysis/clean/tech_master.csv has exactly one row (report missing/duplicate/misspelled; fix spelling to match the CSV). Run tech_screen/build_state.py, record state.jsonl sha256, run tech_screen/run_jev.py --dry-run (no API call). Report counts by source_kind.
Part 2. BLIND KEY. Read tech_screen/sample30.csv. For each of the 30 products, decide from the vendor description plus your own web research (WebSearch / Firecrawl allowed) whether the product, AS USED by an athletics department, stores or processes information about individual, identifiable athletes. Do NOT open tech_master.csv's category or athlete_data_likely columns, aliases.py, or anything in Tech_Inventory_Analysis/deliverables before you finish the key (they hold the rule you are being compared against). Label yes / no / unclear with a <= 20 word reason. Write tech_screen/answer_key.csv (canonical,label,reason).
Return files, checks, counts (including key label counts).`, { label: 'tech:assemble+key', phase: 'Tech prep', schema: FILES_SCHEMA })
  return { prereg, descCount: rows.length, assemble }
})()

const [digest, video, tech] = await Promise.all([digestTrack, videoTrack, techTrack])
return { digest, video, tech }
