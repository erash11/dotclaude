export const meta = {
  name: 'jev-reopen-runs',
  description: 'Run and score the pre-registered video claim check (Jev, Haiku, Codex) and tech athlete-data screen (Jev); adversarially verify each write-up',
  phases: [
    { title: 'Run', detail: 'Jev, Haiku, Codex calls on frozen state' },
    { title: 'Score', detail: 'score.py exactly as registered; results.md' },
    { title: 'Verify', detail: 'adversarial check of scoring vs prereg and raw runs' },
  ],
}

const ROOT = '/Users/kristinarash/DEV/TypeSafe_Sandbox'
const COMMON = `
Rules: work in ${ROOT} on branch jev-reopen-2026-10-22 (commit 7db97b3 holds the approved pre-registrations). NEVER git commit/checkout/reset/stash; never edit docs/STATUS.md, the prereg files, answer_key.csv, state.jsonl, authored_plants.csv, sample.csv or descriptions.csv (they are registered and frozen). Python: ${ROOT}/.venv/bin/python. TYPESAFE_API_KEY is in the environment. Long jobs: the Bash tool times out at 10 minutes, so run long scripts in the background (nohup ... > log 2>&1 &) and poll with short checks; the runners are resumable, so rerun to fill gaps. Final message is a data return.`

const RUN_SCHEMA = { type: 'object', properties: {
  rows_answered: { type: 'integer' }, failures: { type: 'integer' }, wall_seconds: { type: 'number' },
  notes: { type: 'array', items: { type: 'string' } } }, required: ['rows_answered', 'failures', 'notes'] }
const SCORE_SCHEMA = { type: 'object', properties: {
  verdict: { type: 'string' }, bars: { type: 'array', items: { type: 'object', properties: { measure: { type: 'string' }, bar: { type: 'string' }, result: { type: 'string' }, pass: { type: 'boolean' } }, required: ['measure', 'result'] } },
  headline_numbers: { type: 'object', additionalProperties: true },
  files_written: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } },
  required: ['verdict', 'bars', 'files_written', 'notes'] }
const VERIFY_SCHEMA = { type: 'object', properties: {
  verdict_correct: { type: 'boolean' }, errors_found: { type: 'array', items: { type: 'string' } },
  fixes_made: { type: 'array', items: { type: 'string' } }, independent_recompute: { type: 'object', additionalProperties: true } },
  required: ['verdict_correct', 'errors_found', 'fixes_made'] }

const runVideo = (who) => agent(`${COMMON}
TASK: run the ${who} arm of the pre-registered video claim check over all 140 rows of video_check/state.jsonl.
Command: ${who === 'jev' ? 'python video_check/run_jev.py' : 'python video_check/run_llm.py ' + who}. Read the script's docstring for flags first. Run it to completion (resume until every row has an answer or a recorded failure after the script's own retries). Do not change the scripts' questions or prompts. If a script bug blocks the run, fix only the bug, describe the fix exactly, and keep the registered questions and prompts byte-identical. Report rows answered, failures, wall time, and any cost/usage the run recorded.`, { label: `video:run-${who}`, phase: 'Run', schema: RUN_SCHEMA })

const videoTrack = (async () => {
  const runs = await parallel(['jev', 'haiku', 'codex'].map(w => () => runVideo(w)))
  const score = await agent(`${COMMON}
TASK: score the video claim check exactly as registered in docs/VIDEO_SUMMARY_CHECK_PREREG.md, using video_check/score.py (do not change thresholds, mappings or bars; if a scoring bug exists, fix it, rerun --selftest, and describe the fix). Run outputs: video_check/runs/. Run notes: ${JSON.stringify(runs)}.
Then: generate the blind audit sheet (video_check/private/audit_sheet.md) via score.py; write video_check/results.md in the style of drive_triage/results.md: verdict line first (PASS / FAIL (a) / FAIL (b) per the prereg's outcome section), the bars table with numbers, per-kind catch rates, false alarms (and which real items), Jev vs Haiku vs Codex (both comparator mappings), the 12 'partly' real items and how each arm treated them, cost and latency, what this changes per the prereg outcome, and the audit step (sheet waiting on Eric). Plain short sentences, no em dashes.`, { label: 'video:score', phase: 'Score', schema: SCORE_SCHEMA })
  const verify = await agent(`${COMMON}
TASK: adversarially verify a scored pre-registered test. Assume the write-up is wrong until you prove otherwise.
Prereg: docs/VIDEO_SUMMARY_CHECK_PREREG.md. Raw: video_check/runs/*.jsonl, video_check/answer_key.csv, video_check/state.jsonl (kinds), video_check/results.md, video_check/results_raw.json. Scorer's summary: ${JSON.stringify(score).slice(0, 4000)}
1. Recompute every bar INDEPENDENTLY in your own fresh script (do not import score.py): decisive share (band 0.35 to 0.65 inclusive on all three Nouls), flag rule (Q2>=0.50 or Q3>=0.50 or Q1<=0.50), catch rate overall and per kind on decisive planted items, false-alarm rate on real items keyed supported, Jev vs Haiku catch at equal or lower false-alarm rate. Compare to results.md number by number.
2. Check the verdict branch against the prereg wording, including FAIL (b) needing Jev to beat EVERY comparator.
3. Check the runs: every one of the 140 ids present per arm or failures reported; no row answered twice with different values used; registered questions unchanged vs commit 7db97b3 (git diff 7db97b3 -- video_check/run_jev.py video_check/run_llm.py).
4. Fix results.md in place for any error; list each fix.`, { label: 'video:verify', phase: 'Verify', schema: VERIFY_SCHEMA })
  return { runs, score, verify }
})()

const techTrack = (async () => {
  const run = await agent(`${COMMON}
TASK: run the pre-registered tech athlete-data screen: python tech_screen/run_jev.py over all 188 rows of tech_screen/state.jsonl (read its docstring for flags). Run to completion. Do not change the questions. Report rows answered, failures, cost/usage.`, { label: 'tech:run-jev', phase: 'Run', schema: RUN_SCHEMA })
  const score = await agent(`${COMMON}
TASK: score the tech screen exactly as registered in docs/TECH_SCREEN_PREREG.md with tech_screen/score.py (no threshold or bar changes; fix only real bugs, rerun --selftest, describe fixes). Run notes: ${JSON.stringify(run)}.
Produce tech_screen/disagreements.csv (all 188, rows marked 'verified on 30 only') and the blind audit sheet tech_screen/private/audit_sheet.md. Write tech_screen/results.md like drive_triage/results.md: verdict first (PASS / FAIL (a) / FAIL (b) per the prereg), kill-test table (disagreements with the rule on the 30, how many Jev got right per the key, Jev vs rule accuracy on the 30, unclear handled as registered), band items, the disagreement list over all 188 as a short table (product, rule flag, Jev p, direction), what this changes per the prereg (Eric's chosen branch (b) = review queue), limits (30 is small; the key deviation recorded in the prereg). Plain short sentences, no em dashes.`, { label: 'tech:score', phase: 'Score', schema: SCORE_SCHEMA })
  const verify = await agent(`${COMMON}
TASK: adversarially verify the scored tech athlete-data screen. Assume it is wrong until proven right.
Prereg docs/TECH_SCREEN_PREREG.md; raw tech_screen/runs/jev.jsonl, tech_screen/answer_key.csv, tech_screen/sample30.csv, the rule = athlete_data_likely in ~/DEV/Tech_Inventory_Analysis/clean/tech_master.csv; write-up tech_screen/results.md and disagreements.csv. Scorer summary: ${JSON.stringify(score).slice(0, 4000)}
1. Independently recompute the kill test in your own script (not importing score.py): Jev decision rule as registered, disagreements with the rule on the 30, how many of those Jev got right per the key, unclear exclusions, Jev and rule accuracy on the 30. Compare number by number.
2. Check the verdict branch wording against the prereg.
3. Spot-check 10 disagreements outside the 30 against the vendor description in tech_screen/descriptions.csv: are they plausible review candidates? Note but do not relabel.
4. Confirm the registered questions are unchanged vs 7db97b3 (git diff 7db97b3 -- tech_screen/run_jev.py). Fix results.md in place for any error and list fixes.`, { label: 'tech:verify', phase: 'Verify', schema: VERIFY_SCHEMA })
  return { run, score, verify }
})()

const [video, tech] = await Promise.all([videoTrack, techTrack])
return { video, tech }
