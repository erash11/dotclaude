---
name: graphify-semantic-extraction
description: "graphify's Gemini semantic layer: one oversized data-dump file — not the API quota — is what stalls a run; plus per-model quota buckets, rc=0 on 429, and a merge check that under-reports"
metadata: 
  node_type: memory
  type: project
  originSessionId: b7d080c1-e0f8-4eb5-b181-d06b87224449
  modified: 2026-08-31T14:36:03.171Z
---

**Measured 2026-08-31 finishing the `~/DEV` graph's semantic layer.**

**The blocker was file size, not quota.** Two converted office files were 99% of the
office corpus by bytes: a **185 MB** `25-26 KINEXON_*.md` GPS telemetry export and an
11 MB Baylor medical diagnostics report. graphify slices every file at
`_FILE_CHAR_CAP = 20_000` chars, so that one 185 MB export expanded to **2,319 LLM
chunks**. A free-tier model gets 20 requests/day, so every prior pass spent its whole
budget on one spreadsheet and never reached a real document. The other 81 office docs
were **1.2 MB combined** and finished in minutes.
**Run `os.path.getsize` over the queue before believing a quota diagnosis.**

That medical file was queued to be sent to Google. `~/DEV/CLAUDE.md` "Handling care"
forbids it. `gf_gemini.py` now gates on a `SENSITIVE` deny-list plus `GF_MAXBYTES`
(1.5 MB) **before** dispatch.

**Gemini free tier is 20 req/day AND 5 req/min, PER MODEL** — per model is the lever,
so rotating models multiplies the budget. **Aliases share a bucket:**
`gemini-flash-latest` → `gemini-3.7-flash`, `gemini-3.1-flash-lite-preview` →
`gemini-3.1-flash-lite`. Retrying an alias after its concrete model dies can never
work. `gemini-2.5-flash` and `gemini-2.5-flash-lite` return zero nodes with no 429 —
not usable. That leaves ~6 real buckets ≈ **120 free requests/day**, which moved
214 → 453 files in one day.

**Two failure modes that waste hours:**
- **A Gemini quota failure exits rc=0.** A loop that breaks only on nonzero rc will
  happily burn every batch against a dead model. Grep the output for `429` and
  `attribution: 0/` instead.
- **`GRAPHIFY_MAX_RETRIES` defaults to 6** with exponential backoff. Against a daily
  quota 429 (which never recovers within the day) that is ~20 min of pure waiting per
  dead model. Set it to 3; a dead model then rotates in ~2 min.

**`build_from_json` deterministically re-keys every non-AST node id** from its own
`source_file` (graphify #1504/#1509). So comparing a producer file's raw ids against
`graph.json` ids **under-reports merge completeness** — it read 62% for a layer that
was actually 96% merged. Count a node present if its id survived **or** its
`(source_file, label)` pair is in the graph. Check the measurement before chasing a
completeness scare.

**Verification caught more defects in the FIXES than in the original work.** Three
Codex rounds: round 3 found the real privacy hole (a `SENSITIVE` gate that covered
live dispatch but not the semantic *cache*, so pre-gate health-data nodes stayed
in the sidecar); rounds 4 and 5 then found five defects introduced *while fixing*
it. The transferable rules:

- **A wrong provenance link is worse than a missing one.** Never repair an
  unresolved `source_file` by bare-basename fallback, and never on a match with
  under two directory levels unless the basename is corpus-unique — both produced
  confident mis-attributions.
- **Never mass-deduplicate on `(source_file, label)`.** It looked like a clean
  invariant and deleted 454 legitimate nodes; AST symbols like `__init__` recur
  many times inside one file by design. Collapse only collisions your own change
  created.
- **Scrubbing must never sit behind a credential check or an early exit.** A purge
  placed after `sys.exit(2)` silently does nothing on a keyless run.
- **Match a sensitivity rule against the path the policy names, not node text.** A
  whole-node text scan flagged the user's own aggregate injury write-up, which
  merely cites a report and holds no identifiable data.
- Ask the verifier to hunt for **new** defects and hand it the previous report;
  one that only re-checks the original claims misses what the fix broke.

Durable runbook and the full trap list live in `~/DEV/graphify-out/RESUME.md`;
`scripts/rotate_loop.sh` is the one command that resumes it.

Related: [[graphify-runtime-setup]], [[dev-layout-and-discovery]]
