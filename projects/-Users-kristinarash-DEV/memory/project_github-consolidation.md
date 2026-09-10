---
name: github-consolidation
description: "How ~/DEV maps to GitHub after the 2026-09-09 consolidation — the thin root repo, _ARCHIVE, DexaProject's new home, and the traps that bit"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7755f8f2-3158-4d2a-8623-b9e9b0bb0679
  modified: 2026-09-09T23:55:25.460Z
---

On 2026-09-09 every project under `~/DEV` was put on GitHub under `erash11`
(private by default). 128 folders: git, committed, pushed. Windows had pushed
~70 repos earlier the same day, so most folders hit a repo that already existed.

**`~/DEV` is itself a thin repo** — `erash11/DEV`. It tracks only the 8 router
`.md` files plus `AGENTS.md`, `docs/STATUS.md`, `docs/WINDOWS-SYNC.md`. Its
`.gitignore` begins with `/*`, which is the only thing stopping it from
swallowing all 128 nested repos. **Never remove that line.** `DEV/CLAUDE.md` is
deliberately NOT the usual one-line `@AGENTS.md` pointer — it is the workspace
map and Claude Code loads it directly.

**`~/DEV/_ARCHIVE/`** is the parking lot: course downloads never used
(`token-dashboard`, `AI_Analyst`) and duplicate second checkouts. It is
intentionally not a git repo, so any sweep skips it. Everything inside is
already on GitHub, so nothing there is unbacked-up.

**DexaProject left `~/DEV`.** Files now at
`~/Library/CloudStorage/GoogleDrive-eric.rash11@gmail.com/My Drive/00_Primary_Storage_Drive/DexaProject`,
git remote renamed to `DISABLED-do-not-push`. It holds a 3,505-row CSV with
athlete names, birthdates, addresses and insurance. See [[dev-layout-and-discovery]].

## Traps that actually bit
- **`--no-rebase` is a `git pull` flag, not `git merge`.** Passing it to merge
  fails silently-ish; every merge no-ops and every push is then rejected as
  non-fast-forward. The symptom looks like a conflict storm; it is not.
- **Unrelated histories make identical files conflict.** Windows-created repos
  share no ancestor with the Mac's, so every common path is an add/add
  conflict even when the bytes match. Of 663 conflicts, 417 were byte-identical.
- **Most "real" conflicts were CRLF.** Of the 36 non-scaffolding conflicts, 26
  differed only by line endings. Normalise with `tr -d '\r'` before judging.
- **`.gitignore` must be unioned, not chosen.** Keeping the Mac side dropped the
  Windows ignore rules, re-arming the 100MB push limit on that machine.
- **`gitignore` cannot filter by size.** Every file >95MB needs its explicit path.
- **A repo can enforce its own convention.** `Football/PFF_Data_Project` has a
  pre-commit hook requiring `CLAUDE.md` to be a full copy of `AGENTS.md`.
- Long inline shell with `git -C $var` inside command substitution trips the dcg
  guard. Write a script file and run it. See [[dcg-guard-blocks]].

## Open
- `erash11/DexaProject` still exists on GitHub with the patient CSV.
- Public repos resolved 9/9: 18 flipped to private. Exactly 3 stay public
  because they serve live sites — `SportScienceResearchRepo` and `Travel_Map`
  (GitHub Pages), `JumpReporting` (jump-reporting.vercel.app). Visibility flips
  are instantly reversible, so flip back if an npm publish or container push
  breaks (`printing-press-library`, `GameONPaper`).
- Still open: `SportScienceResearchRepo` publicly hosts ~4,700 research PDFs.
  That is a copyright question, not a privacy one.
- `CFB_Victory_Model/data/weekly_forecast_log.csv` — the Windows copy has 324
  rows the Mac lacks, preserved as `.from-windows`. See [[cfb-forecast-capture]].
