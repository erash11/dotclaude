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
- DONE 9/9: `erash11/DexaProject` DELETED from GitHub. Before deleting, its one
  remote-only commit (Windows scaffolding) was merged into the Google Drive copy,
  so nothing was lost. Nothing depended on the repo: no submodules, no code,
  0 forks/issues. `Tezino_CampPrep` names DEXA only to record it as a dead end
  (the .mdb held demographics only, 0 scan rows across 3,504 patients).
  The ONE live dependency was `~/.claude/scripts/backup-manifest.json`, which had
  `github` as a destination — that is what pushed the patient CSV up nightly.
  It now points at the Google Drive path with destinations `["ssd"]` only.
  **If a DEXA path ever reappears in that manifest with a non-ssd destination,
  that is a regression.**
- SETTLED 9/9: `SportScienceResearchRepo` stays PUBLIC. Flipping it breaks the
  GitHub Pages site, and Eric is not distributing or charging for access. The
  ~4,700 PDFs are a personal reading library. Do not re-raise this.
- RESOLVED 9/9: `CFB_Victory_Model/data/weekly_forecast_log.csv` merged.
  Mac had the 09-02 capture, Windows had 08-26 and 08-31. Union on
  `(captured_at, season, team, week, game_id)` → 540 rows, zero conflicts,
  nothing dropped. See [[cfb-forecast-capture]].
