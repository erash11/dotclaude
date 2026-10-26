# closeout skill review — 2026-10-25

Lens: `mattpocock-skills:writing-for-agents` (+ SKILL-MECHANICS). Target:
`~/.claude/skills/closeout/SKILL.md` (14,085 chars, loaded whole on every run). Use: `/closeout`
typed in ~99 Mac sessions in the last 30 days, plus 19 model-invoked runs [M]. Nothing edited yet.

## A. Wrong or broken — fix first

1. **The steps run in a different order than they are numbered.** Three notes reorder them:
   Step 3 "do this after Step 4"; Step 4 "Do Step 4 before the Step 2 commit"; the card fixes
   "before the Step 2 commit". Real order: 1 → 4 → 2 → 3 → 5. Worse, two Step 3 actions change
   files after the push: clearing `.errors.log` (tracked in `global-memory`) and mirroring Tier A
   facts into repo docs. Either leaves a repo dirty right after "clear to sign off".
   Proposed order: **1 Sweep → 2 Memory → 3 STATUS, handoff, cards → 4 Commit and push → 5 Verdict**
   (the dev-docs harvest goes in 3, after STATUS; its output is gitignored, so it needs no push [M]).
2. **Dead pointer:** "For a mid-session, chat-only summary before `/clear`, that's the
   `session-handoff` skill". No such skill (archived) [M].
3. **"Run all five checks"**: there are four checks and a verdict.
4. **The verdict template has no `**Landed:**` line**, though the text below it says to add one.
5. **Scope contradicts itself.** Step 1 commits and pushes *every* dirty DEV repo, including ones
   this session never touched; Step 2, the "Clear to sign off" definition and Rules all say
   "every repo touched this session"; Step 2 adds the three config repos and `global-memory`.
   One rule: *every dirty DEV repo, the three config repos and `global-memory` are pushed, or
   listed as declared local-only.*
6. **`config.<platform>.json` is ambiguous.** The files are `config.macos.json` and
   `config.windows.json`; "mac" is the natural guess and it is wrong (this review guessed it).

## B. Structure

7. **Sprawl, paid daily.** 14 KB loads every run. Material only some runs need:
   the card-gap fix table (only when `card-check` finds gaps), the STATUS archive rule (only past
   20 KB or 15 entries), the Windows commands, the Cowork notes. Move those behind pointers
   (`CARDS.md`, `PLATFORMS.md`); keep the STATUS section spec inline (every run needs it).
8. **No single done line.** "Clear to sign off" is defined in Step 5's prose, partly repeated in
   Rules, and the `global-memory` blocker sits in Step 2. Put one checkable criterion at the top:
   *Clear when every repo in the scope rule is pushed (or declared local-only), `.errors.log` is
   empty or reported, and every touched repo's STATUS has today's entry and a concrete Next item.*
9. **Duplication.** "Push every touched DEV repo" appears in Step 2, Step 5 and Rules. The
   `.errors.log` clearing procedure is spelled out here, in `backup` and in stack-doctor; its one
   home is now stack-doctor `FIXES.md` → Memory pipeline. The `global-memory` rationale (Mac in the
   afternoon, Windows in the evening) and the Tier A mirror paragraph each spend 5–6 lines on a
   rule that fits in one line plus one reason.
10. **Windows sediment.** The 260-character `Get-ChildItem` bullet, the `powershell` forms of
    mods-sync and the harvest. The laptop runs desktop-app sessions only (since 10-21); move these
    to `PLATFORMS.md` with Cowork.
11. **Negation.** "Do not ask permission between steps" → "Run every step without pausing:
    invoking closeout authorizes the whole sequence." "Do not fix drift during closeout" → "List
    drift under Still open; fixing waits for a project session." "Never skip Step 3" → becomes
    redundant once memory is a numbered step inside the done line. The mattpocock-`handoff` aside
    ("don't rely on it") can go: it steers toward the thing it bans.
12. **"Fits on one screen" vs the report.** The verdict also appends full `card-check` and
    `landed.py show` output. Say which wins: verdict block on one screen; Cards and Landed trimmed
    to projects with work today, never dropping a card that still has a gap.

## C. Description (always loaded)

13. Seven phrasings of one branch (end of session) plus `"/closeout"` (typing the name always
    works), and "a system health check before leaving" overlaps claude-stack-doctor. Draft:

    > End-of-session sign-off: sweeps every DEV repo for loose ends, checks memory capture,
    > updates STATUS and the handoff, commits and pushes, then says clear to sign off or what is
    > still open. Use when Eric is wrapping up or signing off, or asks about loose ends. At
    > session start use startup; for an automation health check use claude-stack-doctor.

## Checked and fine [M]

`portfolio.py` crosswalk / seven-day / card-check / set-receiver / add-update / set-status;
`landed.py` scan / show; `where-was-i.py --decisions --days`; `~/DEV/_DRIVE/03_REPORTS/`;
`mods-sync.sh`; `harvest-dev-docs.sh`; `dev-sync` holds the conflict steps; `startup` exists.
