# closeout eval

Plan-on-paper test for the closeout skill: a fixed end-of-day scenario with known traps, a
tool-less Sonnet plan per skill version, and a blind Sonnet judge scoring 12 checks (`rubric.txt`).

Run: put the skill text (SKILL.md plus its linked files) in `<name>.md` here, then
`./run.sh <name> <n>` for n = 1..3. Parse `judge-<name>-<n>.json`: `result` holds a JSON object
R1..R12; use `json.JSONDecoder().raw_decode`, since replies can carry extra text.
~$0.23 per plan + judge. Safe flags: `--tools "" --strict-mcp-config --no-session-persistence
--max-budget-usd 1`.

Known flaws (2026-10-25):
- R10 (Landed with full paths) cannot pass on paper: no tools, so no `landed.py` output. Ignore it.
- The judge marked R7 wrong twice while its own note said the order was fine. Check ordering
  items by line position in the plan (`harvest` line after the `STATUS.md` line), not by the judge alone.
- Side effect: each run's Stop hook (`transcript-capture.js`) logs "transcript_path does not
  exist" to `global-memory/transcripts/.errors.log`. Archive those lines to `.errors-ledger.log`
  and clear the file after a run.

## Result 2026-10-25 (old = skills HEAD before the closeout rework, new = the rework)

| | old | new |
|---|---:|---:|
| Judge total (of 36) | 30 | 30 |
| After correcting R7 by line position | 30 | **32** |
| R11 verdict consistent with open items | 0/3 | 2/3 |
| R1/R2 (errors.log and Tier A mirror before the push) | 3/3 | 3/3 |
| Text loaded per run | 14,085 B | 8.3 KB (SKILL.md) |
| Old working rules present (56 checked) | — | 56/56 |

Sonnet already reordered the old skill's misnumbered steps correctly here, so the order fix shows
no gain on this scenario: it removes the trap rather than fixing an observed failure.
Cost of the run: $2.81.

## Round 2, 2026-10-26: gaps fixed (skills `bf2c7e7`)

`scenario2.txt` / `rubric2.txt` (S1–S9): a background agent still writing, a 120 MB `.duckdb` and
`.env.local` untracked, an unpushed local branch, a stash, the broken Wilhelm repo, a hanging push.
Runner for any scenario: `./run2.sh <skill-stem> <scenario-stem> <rubric-stem> <n>`.

| Scenario | original | 740138a | bf2c7e7 |
|---|---:|---:|---:|
| 1 (of 36) | 30 | 32 | **34** (R10 is the known paper-only miss) |
| 2 (of 27) | 24 | 20 | **27** |

- 740138a regressed S1 (waits for the background job): 3/3 → 0/3. Merging "background jobs" into
  a list bullet dropped the rule; bf2c7e7 restores it as its own rule (3/3).
- S8 (re-check after the push) passes only with bf2c7e7's second sweep: 0/3 → 3/3.
- R11 moved 2/3 → 1/3 → 3/3 once the done line said which open items block (card gaps) and which
  do not (questions only Eric can answer).
- Round cost $9.45 (21 plans + judges). Both rounds left Stop-hook noise in `.errors.log`;
  archived to `.errors-ledger.log` with a note each time.
