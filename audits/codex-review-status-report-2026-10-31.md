Reading additional input from stdin...
OpenAI Codex v0.166.0
--------
workdir: /Users/kristinarash/.claude/skills
model: gpt-6.1-terra
provider: openai
approval: never
sandbox: read-only
reasoning effort: medium
reasoning summaries: none
session id: 01a192ce-c609-7e00-b276-ef308437f589
--------
user
Review the git diff of the status-report skill (run: git -C ~/.claude/skills diff 92e46ec~1 HEAD -- status-report/). It is a Claude Code skill (SKILL.md plus SOURCES.md and scripts/onepager_pdf.py with a test). Look for: factual contradictions between SKILL.md and SOURCES.md, steps out of run order, steps missing a Done-when line, bugs in onepager_pdf.py (macOS/Windows Chrome headless, placeholder guard, budget check), and anything that could make an agent send or publish a report. List findings by severity with file and line.
2026-10-31T16:33:09.664575Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.context7.com/.well-known/oauth-protected-resource/mcp\"" })
warning: clamping SessionEnd hook timeout to 3s in /Users/kristinarash/.codex/hooks.json
warning: clamping SessionEnd hook timeout to 3s in /Users/kristinarash/.codex/hooks.json
warning: clamping SessionEnd hook timeout to 3s in /Users/kristinarash/.codex/plugins/cache/openai-codex/codex/1.0.6/hooks/hooks.json
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
I’ll review the changes and check the report safety rules. I’ll use the code-review skill.
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc 'git -C ~/.claude/skills diff 92e46ec~1 HEAD -- status-report/' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat ~/.claude/machine.md' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat ~/.claude/CLAUDE.md' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat ~/.claude/global-memory/transcripts/.errors.log' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat ~/.claude/skills/code-review/SKILL.md' in /Users/kristinarash/.claude/skills
 succeeded in 76ms:
 exited 1 in 76ms:
cat: /Users/kristinarash/.claude/skills/code-review/SKILL.md: No such file or directory

 succeeded in 76ms:
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

 succeeded in 77ms:
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

hook: PostToolUse
hook: PostToolUse
hook: PostToolUse
hook: PostToolUse
 succeeded in 113ms:
diff --git a/status-report/SKILL.md b/status-report/SKILL.md
index 46f2407..cacdfaf 100644
--- a/status-report/SKILL.md
+++ b/status-report/SKILL.md
@@ -11,395 +11,183 @@ description: >-
 
 # Status Report
 
-Produce the recurring Applied Performance status report — an email to **Kenny Boyd and
-Chris Ruf**, both addressed directly ("Kenny, Coach Ruf,"), every two weeks, ~270 words.
+The recurring Applied Performance email to **Kenny Boyd and Chris Ruf**, both addressed directly
+("Kenny, Coach Ruf,"), about 270 words, with a one-page PDF and an internal record. Governed by **KR 4.1**
+in `Applied-Performance-OKRs-2026-27.md`, read as a content checklist: shipped work, work in flight,
+decisions needed, anything at risk, what's next.
 
-Governed by **KR 4.1** in `Applied-Performance-OKRs-2026-27.md` (v3). Read that KR as a
-**content checklist** — shipped work, work in flight, decisions needed, anything at risk,
-what's next — not as a layout. Eric's real reports run as flat prose with no section
-headers. See **Voice** below; match it.
+**Primary job: alignment.** Chris and Kenny finish knowing what moved, what needs them, and what is at
+risk. **Secondary job: credit** for work across sports beyond football and basketball; that is why the
+report exists, so the sport tags and the coverage panel stay in every cycle.
 
-**Primary job: alignment.** Chris and Kenny finish the email knowing what moved, what
-needs them, and what's at risk. **Secondary job: credit** — visible involvement across
-sports beyond football and basketball. That secondary job is why the report was asked
-for; do not let it slip out of the output.
-
-**Design target: under 5 minutes of the user's time.** The machine does the recall. The
-interview spends the user's attention only on what no system can know.
+**Design target: under 5 minutes of Eric's time.** The machine does the recall; the interview spends
+his attention only on what no system can know.
 
 ## Paths
 
-Read `~/.claude/skills/_shared/config.<platform>.json` for all paths — never hardcode. Keys used
-here: `vault_root`, `vault_inbox_meetings`, `vault_output_ledger`,
-`vault_status_reports`, `vault_status_log`, `portfolio_json`, `okr_doc`, `okr_scoreboard`,
-`okr_tracker_dir`, `utilization_brief`, `canonical_projects`, `fireflies_cli`.
+Keys come from `~/.claude/skills/_shared/config.<platform>.json` (`macos` or `windows`, whichever
+machine this is): `vault_root`, `vault_inbox_meetings`, `vault_output_ledger`, `vault_status_reports`,
+`vault_status_log`, `portfolio_json`, `okr_doc`, `okr_tracker_dir`, `utilization_brief`,
+`canonical_projects`, `fireflies_cli`. When `vault_root` does not exist, the config belongs to the other
+machine: stop and fix it first.
 
-Template: `{vault_root}/Templates/status-report.md`
-Output dir: `{vault_status_reports}`
+Record template: `{vault_root}/Templates/status-report.md`, **Layer 2 and Layer 3 only**. Its Layer 1 (headed
+sections, "Chris —" greeting, attached PDF) is the old layout; the email follows **Voice** below.
 
-> Each machine has its own config: `config.windows.json` holds `C:\Users\eric_rash\...`
-> paths (correct on Windows), `config.macos.json` holds `/Users/kristinarash/...` paths.
-> Read the one for the machine you are on. If its values point at the *other* machine's
-> layout, or `vault_root` does not exist, stop and fix the config first — every skill that
-> trusts it is broken until you do. (Until 2026-08-11 a single config held stale Windows
-> paths; the split per-platform configs replaced it.)
+`weekly-review` is never a prerequisite. `html-to-pdf` is not needed: `scripts/onepager_pdf.py` renders.
 
-## Relationship to other skills
+## Step 1 — Establish the period
 
-- **`weekly-review` is not a prerequisite.** Never require it to have run. If review
-  files exist in `Inbox/weekly-review/` for the period, read them as a bonus input; if
-  they don't, proceed without comment. The report builds from primary sources so it
-  cannot inherit another ritual's failure rate.
-- **`meeting-sync`** may be invoked to freshen the meeting corpus, but a sync failure is
-  **not** a hard stop here — fall back to `fireflies-pp-cli digest` live, and note in the
-  internal record that the vault copy was stale.
-- **`html-to-pdf`** renders the one-pager.
+1. **Prior report** = the newest `*-status.md` in `{vault_status_reports}` (the folder also holds drafts,
+   PDFs and HTML). Period start = its `period_end`; period end = today. With no prior record, start = 14
+   days ago. Report number = prior `report_number` + 1.
+2. **Missed fortnights widen the period.** The archive never has a gap.
+3. **Sent or not.** A report counts as sent when its record says `sent: true` or its folder holds
+   `YYYY-MM-DD-email-sent.txt`. When the prior report has neither, add "did report N go out?" to the
+   Step 4 batch; an unconfirmed report stays unsent.
+4. **Send dates** fall every 14 days from 2026-08-24 (the first send, "Starting these updates every two
+   weeks"): 2026-11-02, 11-16, 11-30, 12-14. The last is 12-14; the semester closes 12-18.
+   `python3 -c "import datetime as d;b=d.date(2026,8,24);t=d.date.today();print(next(b+d.timedelta(14*n) for n in range(40) if b+d.timedelta(14*n)>t))"`
+   prints the next date after today. The footer's "Next report" is the grid date after this report's own.
+5. KR 4.1 is eight reports through 2026-12-18. Step 8 states how many are confirmed sent.
 
----
+**Done when** you hold period start and end, the report number, the prior report's sent state, and the next
+send date.
 
-## Step 1 — Establish the period
+## Step 2 — Pull (no Eric involvement)
+
+Read `SOURCES.md` (every source, its fallback, and what lies), then run these in parallel and ask Eric for
+nothing obtainable here:
 
-Read the newest file in `{vault_status_reports}`. Period start = the previous report's
-`period_end`; period end = today. If no prior report exists, period start = 14 days ago.
-
-**Count sends.** KR 4.1's target is "≥3 **sent** by Aug 31," and writing a file is not
-sending it. Count files in `{vault_status_reports}` with `sent: true` in frontmatter —
-that is the real number. Report progress toward ≥3 in Step 8. If files exist with
-`sent: false` older than a week, ask whether they actually went out; an uncounted send
-is as bad for the KR as a missed one.
-
-A missed send widens the period rather than skipping it. Never leave a gap in the
-archive — the archive's continuity is what makes it usable as a time record.
-
-**Cadence is settled: every two weeks.** Eric committed to it in writing in the first
-report — "Starting these updates every two weeks." Report 1 went out **2026-08-24**, so
-sends land on even fortnights from there (2026-09-07, 09-21, 10-05, …). The earlier
-"twice monthly, 1st and 3rd Friday" plan was an assistant assumption and is retired.
-
-## Step 2 — Pull (no user involvement)
-
-### Step 2a — Preflight the meeting source
-
-Run `{fireflies_cli} transcripts list --agent --data-source live 2>&1 | head -5` first.
-
-**Fixed 2026-08-11** — the key is in `~/.zshrc` and the local mirror was rebuilt with
-`fireflies-pp-cli sync`; as of 2026-08-13 the key is visible to the Bash tool directly.
-The DB lives at `~/.local/share/fireflies-pp-cli/data.db`, not `~/.fireflies-pp-cli/`.
-
-If it fails again, `unable to open database file: out of memory (14)` means the mirror is
-**missing, not corrupt** — run `sync` before anything else. Then:
-
-- **Do not hard-stop.** `meeting-sync` hard-stops on auth failure; this skill must not,
-  or it inherits the outage that already lapsed `weekly-review`.
-- **Fall back** to reading `{vault_inbox_meetings}/*.md` filtered to the period by the
-  `YYYY-MM-DD_` filename prefix. These files have **no YAML frontmatter** — parse the
-  prepended header block (`## Key topics`, `## Decisions`, `## Action items`) and the
-  Fireflies export sections (`## Summary`, `### Overview`, `### Action Items`).
-- **Check staleness and say so.** Compare the newest meeting file's date to today. If
-  the gap is >2 days, tell the user plainly in Step 8: *"Meeting data is stale through
-  {DATE}; anything after that came only from the interview."* A silently incomplete
-  report is worse than a flagged one — the user is about to send it to a supervisor.
-- Record the degraded source in the internal record's frontmatter.
-
-### Step 2b — Pull
-
-Run these in parallel. Never ask the user for anything obtainable here.
-
-1. **Meetings** — `{fireflies_cli} digest --since <N>d --processed-only --agent`
-   (flags verified valid; `--since` accepts `7d`/`24h` form). Gives titles, gists,
-   topics, and action items in one call. Cross-check against `{vault_inbox_meetings}`.
-   On failure, use the 2a fallback.
-1b. **Supervisor logs — read these before anything else.** Every file in
-   `{vault_status_log}` whose `YYYY-MM-DD.md` filename falls inside the period. These are
-   written by `closeout` Step 0 (or `interview-me` Part 0) and they are the **highest-value source in
-   this step**: they cover equipment, installs, hallway conversations, and follow-ups
-   awaiting a reply — the operational two thirds that appears in no other source. Merge
-   the three sections (`## Equipment & installs`, `## People & conversations`,
-   `## Waiting on / risks`) across the period and union every `sports:` array for the
-   coverage panel.
-
-   Treat the wording as the user's own and preserve it. **Count the logged days** —
-   `logged / days-in-period` gets reported in Step 8. A thin count is not a reason to
-   pad; it is the number that tells the user the nightly ritual lapsed.
-
-   Zero logs is normal for now and is **never** a hard stop — the ritual started
-   2026-09-07 and the report predates it. Fall back to a full Step 4 interview.
-
-2. **Commitments** — `{fireflies_cli} action-items list --from <N> --agent`
-   (`--from` takes an integer number of days). Flag anything open >14 days; those are
-   risk-section candidates. On failure, parse `## Action items` blocks from the vault
-   meeting files instead.
-
-   **Known broken as of 2026-09-07:** this command exits 0 and returns an array of empty
-   `{}` objects — a serialization bug, not an empty result. Do not read it as "no open
-   commitments." The digest in item 1 carries action items inline; use those and record
-   the degraded source in the internal record.
-3. **Shipped artifacts** — read `{vault_output_ledger}`, newest first, entries within
-   the period. **This is the only source for the "Shipped" section.**
-
-   Format is a markdown table, newest first, data rows starting at line 22:
-   `| Shipped | Artifact | What it is | Harvest |` where *Shipped* is `YYYY-MM-DD`,
-   *Artifact* is the short name, *What it is* is a dense paragraph, and *Harvest* holds
-   `[[wikilinks]]` or is empty. Match rows with `^\| 2\d{3}-\d{2}-\d{2}` and filter by
-   date. Compress *What it is* to one clause for the email — those paragraphs run long
-   and will blow the 300-word ceiling if pasted whole.
-4. **Project movement** — read `{portfolio_json}`, filter `lane == "job"`. Use `stage`,
-   `next_action`, and `updates[]` for the *In Progress* section only.
-5. **KR state** — read `{okr_doc}` (v3, 14 KRs). This is the **only** trustworthy KR
-   source. Two others will lie to you:
-
-   - **Never read the cadence doc's KR table** — superseded v2 set of 9.
-   - **Do not trust `{okr_scoreboard}` for confidence values.** It was generated
-     2026-06-12 against the retired *quarterly, 3-objective* set and scores KRs that no
-     longer exist; v3's fourth objective (Leadership & Visibility) isn't in it at all.
-     Its `Conf` decimals are real numbers attached to dead targets. If it still predates
-     the v3 restructure (2026-07-17), tell the user it needs regenerating — `okrs.yaml`
-     is the source of truth, `okr.py` regenerates `SCOREBOARD.md` and `okrs.json` — and
-     report KR status from `{okr_doc}` alone in the meantime.
-
-6. **Sport roster** — the 17-program list for the coverage panel comes from
-   `{utilization_brief}` §"Recommendations by program" (15 rows; the two XC / Track &
-   Field rows each bundle two programs). Never re-derive this list from memory. Note it
-   is *prescriptive* — what each program could use — not a record of current activity,
-   which is exactly why the coverage panel is worth publishing.
-7. **Canonical spine** — read `Applied-Performance-Active-Projects.md` for the confirmed
-   active list, each project's sport and KR mapping.
-8. **Optional** — `Inbox/weekly-review/*.md` within the period, if any exist.
-
-### Hard rule: "Shipped" comes from the ledger, never from portfolio stage
-
-`portfolio.json` marks projects `stage: shipped` that still have stakeholder sign-off
-outstanding — Sport_Tech_Vetting is currently `shipped` while KR 1.2 shows Chris's
-sign-off pending. Reporting that as shipped tells the user's supervisor that a thing he
-never approved is done. **Only `_ledger.md` entries qualify as Shipped.** Portfolio
-stage feeds *In Progress*.
-
-## Voice — match the real thing, not the spec
-
-**Read `{vault_status_reports}/2026-08-24-email-sent.txt` before drafting.** That is the
-first report Eric actually sent. It is the reference for how he writes; this skill's
-earlier draft was never sent and should not be imitated.
-
-What his email actually does:
-
-- **No section headers.** Flat short paragraphs, one topic each, no Shipped / In Progress
-  / Decisions Needed labels. Do not impose the KR 4.1 headers on his prose — they are the
-  *content checklist*, not the layout. Make sure each of the five things is covered
-  somewhere; do not label them.
-- **One framing line up top**, then straight into it. No preamble.
-- **"We" for department work, "I" for his own actions.** He writes as the unit.
-- **Concrete and operational.** Equipment, buildings, people, dates: Perch cameras at
-  Fudge, FirstBeat monitors replacing Polar, survey cutoff August 28th. Names people
-  freely — Linda, Noah, AJ, Javi, Micah.
-- **Asks come last and land soft:** "One ask I wanted to run past you both is whether…"
-  Do **not** convert these into "need Chris by Aug 31." That register is more forceful
-  than he writes and it will read as someone else's words.
-- **Stalled things get passed along, not escalated:** "still haven't heard back. Passing
-  that along in case a nudge is warranted."
-- **About 270 words. No attachment.** The memo PDF exists for when something needs to be
-  handed across a table; the ordinary cycle is email only.
-
-### The sourcing gap this exposed — important
-
-Almost nothing in his real report appears in `portfolio.json` or `_ledger.md`: survey
-response rates, camera installs at three buildings, heart-rate monitors arriving for
-tennis, staff meeting cadence, a stalled email to Micah. Those sources track his
-**building** work. He reports his **departmental operations**.
-
-So the auto-pull covers maybe a third of what belongs in the report. **Weight the
-interview accordingly** — ask about equipment, deliveries, installs, staffing, meetings
-held, and follow-ups awaiting a reply, not just what moved in the registry. Treat a draft
-built only from automated sources as roughly one-third finished.
+1. Meetings (Fireflies digest, with the vault copy as fallback).
+2. Supervisor logs for the period: read first, they carry the operational two thirds.
+3. Shipped artifacts from the ledger: the only source for Shipped.
+4. Active job projects from the registry: In Progress only.
+5. KR state from the OKR doc, the sport roster, the canonical project spine.
+
+**Done when** each source has produced rows or a named degraded-source note for the record, and you have
+the logged-days count.
 
 ## Step 3 — Draft before asking
 
-Write a complete draft of all five sections from the pull. Cut to **5–6 projects with
-real motion** — never a 14-line roster. Projects that didn't move go to the internal
-record and, if relevant, the sport coverage panel.
-
-Tag every Shipped and In Progress line with a sport: *(Volleyball)*, *(Football)*,
-*(Soccer)*, *(Dept-wide)*, *(Cross-sport)*.
-
-Then identify the gaps — that is what the interview is for.
-
-## Step 4 — Interview the gaps only
-
-Ask in **one batch**, not serially. Keep it to what the pull genuinely couldn't answer.
-Lead with targeted gap questions, then the four standing ones.
-
-**Targeted** (generated from the pull, examples):
-- "Three meetings Tuesday–Thursday have no notes. Anything from them that Chris needs?"
-- "Ledger shows nothing shipped this period — is that right, or did something go out
-  that never got logged?"
-- "Kinexon_Volleyball hasn't moved in the registry since July. Stalled, or just not
-  logged?"
-
-**Skip every standing question the supervisor logs already answered.** If
-`{vault_status_log}` covered the period, questions 1–4 below are largely pre-filled —
-read the merged log back to the user as a list and ask only *"anything missing?"* plus
-questions 5–8. Re-asking what the user already typed at 9pm is how the nightly ritual
-gets abandoned; the payoff for logging has to be a visibly shorter interview.
-
-**Standing** (every time). The first three carry most of the report — they cover the
-operational half no automated source sees:
-
-1. **Equipment, installs, deliveries.** What arrived, what got installed where, what's
-   being phased out, who's onboarding onto it. Eric's real reports lead with this
-   (Perch cameras at Fudge, FirstBeat monitors replacing Polar for tennis).
-2. **Meetings held and staffing.** Who he met with, what came out of it, changes to
-   cadence or who attends. Names matter — Linda, Noah, AJ, Javi.
-3. **Conversations no transcript caught** — hallway, text, sideline, phone. Invisible to
-   every automated source, and among the highest-value things this interview captures.
-4. **Anything waiting on someone else.** Unanswered emails, pending approvals, stalled
-   follow-ups. These become the soft "passing that along" lines at the end.
-5. **Anything about to go sideways** that Chris and Kenny should hear from him first.
-   *(Push here. An always-empty risk line means it isn't being used honestly.)*
-6. **Any ask** — time at a meeting, a decision, a nudge. Phrased softly, at the end.
-7. **Ideas generated** — worth parking, pitching, or building?
-8. **What's next** for the coming two weeks.
-
-Also ask, if the pull shows thin coverage: *"Any sport you touched this period that
-isn't showing up in my sources?"* Non-revenue involvement is the whole point and it is
-the most likely thing to be undercounted.
+Write a complete draft covering all five KR 4.1 items from the pull, as flat prose in the Voice below.
+Cut to 5–6 projects with real motion; unmoved ones go to the record and the coverage panel. Tag every
+Shipped and In Progress line with a sport: *(Volleyball)*, *(Football)*, *(Soccer)*, *(Dept-wide)*,
+*(Cross-sport)*. Then list the gaps for Step 4.
+
+**Done when** the draft exists and every gap is a question.
+
+## Step 4 — Interview the gaps, in one batch
+
+Ask once. Targeted questions come from the pull ("Three meetings Tuesday–Thursday have no notes. Anything
+Chris needs from them?" / "Ledger shows nothing shipped this period; is that right?"), then the standing
+ones. Read the merged supervisor log back as a list and ask "anything missing?" for the questions it
+already answered (1–4); asking again is how the nightly ritual dies.
+
+1. Equipment, installs, deliveries: what arrived, went in where, got phased out, who onboards.
+2. Meetings held and staffing: who, what came out, cadence changes.
+3. Conversations no transcript caught: hallway, text, sideline, phone.
+4. Anything waiting on someone else: unanswered emails, pending approvals (they become the soft
+   "passing that along" lines).
+5. Anything about to go sideways that Chris and Kenny should hear from Eric first. Push here; an
+   always-empty risk line means it is not used honestly.
+6. Any ask: time at a meeting, a decision, a nudge.
+7. Ideas worth parking, pitching or building.
+8. What's next in the coming two weeks.
+
+With thin coverage, add: "Any sport you touched that isn't showing up in my sources?"
+
+**Done when** every gap has an answer or an explicit "nothing", and Eric has confirmed each Shipped line
+(a confirmed ship is the ledger's evidence).
 
 ## Step 5 — Assemble and check
 
-Fill the template at `{vault_root}/Templates/status-report.md`.
-
-Run every check before showing the user anything:
-
-- [ ] **Email body is under 300 words.** Count it. State the count. Over the ceiling,
-      cut — do not negotiate with yourself.
-- [ ] **Every Shipped line traces to a `_ledger.md` entry.** No exceptions.
-- [ ] **No endorsement claimed that doesn't exist.** If sign-off is pending, "our
-      standard intake process," never "the approved process."
-- [ ] **Every Shipped and In Progress line carries a sport tag.**
-- [ ] **Every Decisions Needed item names a person and a date.** No owner or no date
-      means it isn't a decision request — rewrite or cut it.
-- [ ] **Jargon table enforced.** No CMJ, ACWR, asymmetry index, unexplained B.A.I.R.
-- [ ] **Department names.** Athletic Performance (not strength and conditioning / S&C),
-      Athletic Medicine (not sports medicine), Applied Performance (not sport science).
-- [ ] **Never "one unified dashboard."** The line is "standardized underneath, bespoke
-      on top."
-- [ ] **Research presented as research** — no readiness or deployment claims.
-- [ ] **Risks section is non-empty** unless the user explicitly confirmed there's
-      nothing. Ask once more before letting it go empty.
-- [ ] **Repeat check:** any Decisions Needed item carried over from the previous report
-      gets flagged to the user — two unanswered asks means the email has failed at it
-      and it needs raising in person.
-- [ ] **Email and PDF agree.** The two are filled separately, so verify it: every
-      Shipped, In Progress, Decisions Needed, and Risks item in the email appears in the
-      PDF. The PDF may carry *more* detail — it must never carry different facts, a
-      different sport tag, or a different date. Sending a supervisor two versions of the
-      same report is the failure this check exists to prevent.
-- [ ] **Sport coverage panel is not padded.** Untouched sports stay marked untouched. A
-      thin panel is real information; a padded one destroys the evidentiary value of
-      every honest panel before and after it.
-
-**Loop until clean.** Any failed box: fix the draft, then run the whole list again from
-the top — a cut for word count can drop a sport tag or the only risk line. Show the user
-the draft only after one full pass with every box ticked.
+Fill the Layer 2 and Layer 3 shapes from the template. Run every box; fix a failure, then rerun the whole
+list from the top (a cut for word count can drop a sport tag or the only risk line).
+
+- [ ] Email body is under 300 words (target 270). Count with `wc -w` on the body; state the count.
+- [ ] Every Shipped line traces to a ledger row dated in the period.
+- [ ] No endorsement claimed that does not exist: "our standard intake process", never "the approved process".
+- [ ] Every Shipped and In Progress line carries a sport tag (the PDF carries the tags; the email's prose
+      names the sport).
+- [ ] Every ask names a person and a date. The email says them in Eric's soft register ("could use
+      your read, Kenny, before the 13th"); the PDF states them plainly. An ask with no owner or date is
+      cut or rewritten.
+- [ ] No CMJ, ACWR or asymmetry-index jargon; B.A.I.R. spelled out once.
+- [ ] Department names: Athletic Performance, Athletic Medicine, Applied Performance.
+- [ ] The line is "standardized underneath, bespoke on top".
+- [ ] Research reads as research, with no readiness or deployment claims.
+- [ ] Risks are non-empty unless Eric confirmed nothing; ask once more before leaving them empty.
+- [ ] An ask carried over from the prior report is flagged to Eric: two unanswered asks mean the email has
+      failed at it and it needs raising in person.
+- [ ] Email and PDF agree: every Shipped, In Progress, ask and risk in the email appears in the PDF with
+      the same facts, sport tag and date. The PDF may carry more.
+- [ ] The coverage panel is unpadded: untouched sports stay marked untouched.
+- [ ] Meeting action items appear as work in flight, never as done.
+
+**Done when** one full pass leaves every box ticked. Show Eric the draft only then.
 
 ## Step 6 — Emit
 
-Produce three things:
-
-1. **`{vault_status_reports}/YYYY-MM-DD-status.md`** — the internal record, full Layer 3
-   structure from the template: email as sent, meetings held, conversations, ideas, full
-   roster, KR ledger, and the "Not for the report" candid section.
-2. **`{vault_status_reports}/YYYY-MM-DD-onepager.pdf`** — render
-   `assets/one-pager.html` with the period's content. One page, always.
-
-   **It is a printed memorandum, not a dashboard.** Single column, one serif family,
-   letterspaced small-cap section heads, one green hairline. Never reintroduce status
-   dots, badge or pill rows, bolded stat lines, progress bars, or a two-column grid —
-   that vocabulary is what made the first version read as generated.
-
-   **Measure before shipping**, don't eyeball it. Budget is **950px of content at 666px
-   width**:
-
-   Same script on both machines (`python3` on the Mac, `python` on Windows); it finds
-   Chrome and the temp folder itself:
-
-   ```python
-   import pathlib, platform, re, subprocess, sys, tempfile
-   html = pathlib.Path(sys.argv[1])            # the one-pager .html
-   chrome = {"Darwin": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
-             "Windows": r"C:\Program Files\Google\Chrome\Application\chrome.exe"}[platform.system()]
-   probe = pathlib.Path(tempfile.gettempdir()) / "probe.html"
-   probe.write_text(html.read_text(encoding="utf-8").replace("</body>",
-       '<script>window.addEventListener("load",()=>{document.title='
-       '"H:"+Math.round(document.body.getBoundingClientRect().height)})</script></body>'),
-       encoding="utf-8")
-   dom = subprocess.run([chrome, "--headless", "--disable-gpu", "--virtual-time-budget=3000",
-                         "--window-size=666,1200", "--dump-dom", probe.as_uri()],
-                        capture_output=True, text=True, encoding="utf-8",
-                        errors="replace").stdout   # Windows Python defaults to cp1252
-   print(re.search(r"<title>H:(\d+)", dom).group(1), "px (budget 950)")
-   ```
-
-   Then render with the same `chrome`: `--headless --disable-gpu --no-pdf-header-footer
-   --print-to-pdf=<out> <html file URI>` (or the `html-to-pdf` skill on Windows).
-   Over 950px, **cut prose** — never drop below 9.6pt. This gets printed and read by
-   people who will not squint for you.
-3. **`{vault_status_reports}/YYYY-MM-DD-email.txt`** — the email body as **plain text**,
-   the file the user actually touches each cycle. Strip all markdown: no `**bold**`, no
-   `-` bullets rendered as syntax. Use `•` or plain indentation, and spell section
-   headers in caps (`SHIPPED`, `IN PROGRESS`). Outlook's compose window pastes markdown
-   asterisks literally, and a supervisor email full of `**` reads as carelessness.
-   Select-all-copy from this file should produce something sendable with zero cleanup.
-4. **Also print the email text in the response** so the user can read it without opening
-   a file — but the `.txt` is the artifact of record for sending.
-
-### Do not send
-
-The connected Gmail account is the user's **personal** address
-(`eric.rash11@gmail.com`), not Baylor. Do not create Gmail drafts — they would land in
-the wrong mailbox. The user sends from Outlook on the work account.
-
-Never send a report to a supervisor without the user reading it first, under any
-circumstance.
+Three files in `{vault_status_reports}`:
 
-## Step 7 — Log
+1. **`YYYY-MM-DD-email.txt`** — plain text, only what gets pasted: from "Kenny, Coach Ruf," to "Eric".
+   No markdown, no header block, no cut list; a select-all copy goes into Outlook with zero cleanup.
+2. **`YYYY-MM-DD-onepager.pdf`** — copy `assets/one-pager.html` to `YYYY-MM-DD-onepager.html`, fill every
+   `{{placeholder}}`, then run
+   `python3 ~/.claude/skills/status-report/scripts/onepager_pdf.py render <html> <pdf>`
+   (`python` on Windows). It measures first (budget 950px at 666px width) and refuses a file with
+   placeholders left. Over budget, cut prose and keep the type at 9.6pt or larger. The page is a printed
+   memorandum: single column, one serif family, letterspaced small-cap heads, one green hairline. Status
+   dots, badges, bolded stat lines, progress bars and two-column grids stay out.
+3. **`YYYY-MM-DD-status.md`** — the internal record in the template's Layer 3 shape, with frontmatter
+   `report_number`, `period_start`, `period_end`, `next_send`, `sent: false`, `word_count`,
+   `sources_degraded:`. Cuts and softened lines (what came out of the email, and why) go in a "Cut and
+   softened" section; "Not for the report" stays candid.
 
-- Append shipped artifacts to `{vault_output_ledger}` if the interview surfaced any that
-  weren't logged.
-- Update `Applied-Performance-Active-Projects.md` with confirmed status, sport, and KR
-  mapping — this keeps the canonical spine current as a byproduct rather than a chore.
-- Add an `updates[]` entry to `{portfolio_json}` for each project reported as moved, via
-  the `project` skill, so the registry stops being empty.
-- Set `sent: false` in the internal record. The user flips it after sending.
+Also print the email text in the reply.
 
-## Step 8 — Report to the user
+**Never send.** The connected Gmail is Eric's personal address; create no Gmail draft. Eric sends from
+Outlook on the work account, after he has read the report.
 
-State: word count, report number, next send date, which sports appeared, anything the
-checks flagged, and where the three files landed.
+**Done when** all three files exist, the measure printed a height at or under 950, and the PDF is one page.
 
-Also state **`N of D` days logged** in `{vault_status_log}` for the period. Say it
-plainly and without nagging — the number is the nudge. When the count is low, say what it
-cost: *"6 of 14 days logged, so the interview had to cover the other 8 from memory."*
+## Step 7 — Log
 
-**Propose a rule when one was missing.** If this run hit a problem no Step 5 box covers —
-caught by you, or by Eric editing the draft before sending — end with one proposed new
-checklist line and the reason. Add it to Step 5 only on Eric's yes; the next report is
-then checked against it.
+- Append unlogged shipped artifacts Eric confirmed in Step 4 to `{vault_output_ledger}`.
+- Update `{canonical_projects}` with confirmed status, sport and KR.
+- For each project reported as moved, run `/project update "<name>" "<note>"` (the `project` skill), and
+  leave `portfolio.json` uncommitted.
 
----
+**Done when** each moved project has an `updates[]` entry and the ledger holds every confirmed ship.
 
-## Failure modes to design against
+## Step 8 — Report to Eric
 
-**Padding.** A thin period is a legitimate output. "Nothing shipped this period" is an
-honest line that protects the word "shipped" everywhere else. Inflating a quiet period
-is the fastest way to make the report worthless — and to make the time documentation
-inadmissible when it matters.
+State: word count, report number, next send date, sports that appeared, anything the checks flagged, the
+three file paths, and `N of D days logged` from the supervisor log, stated plainly ("6 of 14 days
+logged, so the interview covered the other 8 from memory"). Add any stale-meeting or degraded-source note
+from Step 2, and how many reports are confirmed sent toward KR 4.1's eight.
 
-**Roster creep.** The email is not a project list. 14 status lines reads as 14 things
-half-done. Five moving projects reads as focus.
+When this run hit a problem no Step 5 box covers, whether you caught it or Eric did while editing, end with
+one proposed new checklist line and its reason. Add it to Step 5 on his yes.
 
-**The credit goal quietly disappearing.** The report exists so non-football,
-non-basketball involvement becomes visible. If a period's coverage panel is thin, that
-is real information and it should be shown, not hidden — a padded panel destroys the
-evidentiary value of every honest one.
+**Done when** Eric has those items in one message.
+
+---
 
-**Depending on another ritual.** `weekly-review` lapsed for seven weeks earlier this
-year. This report must never require it.
+## Voice
+
+Read `{vault_status_reports}/2026-08-24-email-sent.txt` before drafting: the one report Eric sent, and the
+reference for how he writes.
+
+- Flat short paragraphs, one topic each, no section labels. KR 4.1 is the content checklist.
+- One framing line up top, then straight in.
+- "We" for department work, "I" for his own actions.
+- Concrete and operational: equipment, buildings, people, dates; names people freely.
+- Contractions throughout; plain-English edits that strip them make the email sound like someone else.
+- Asks come last and land soft ("One ask I wanted to run past you both is whether…").
+- Stalled things get passed along: "still haven't heard back. Passing that along in case a nudge is
+  warranted."
+- No attachment in the ordinary cycle; the PDF is for handing across a table.
+- A quiet period is a legitimate report: "Nothing shipped this period" protects the word everywhere
+  else. The email is five or six moving projects, never a 14-line roster.
diff --git a/status-report/SOURCES.md b/status-report/SOURCES.md
new file mode 100644
index 0000000..e11365e
--- /dev/null
+++ b/status-report/SOURCES.md
@@ -0,0 +1,85 @@
+# Status report: sources, fallbacks and traps
+
+Step 2 of `SKILL.md` points here. Paths are config keys (`~/.claude/skills/_shared/config.<platform>.json`).
+Read this whole file before the pull.
+
+## Meetings (`fireflies_cli`)
+
+Preflight first: `{fireflies_cli} transcripts list --agent --data-source live 2>&1 | head -5`.
+The key is in `~/.zshrc`; the local mirror is `~/.local/share/fireflies-pp-cli/data.db`.
+`unable to open database file: out of memory (14)` means the mirror is missing, so run
+`{fireflies_cli} sync` and retry.
+
+Pull: `{fireflies_cli} digest --since <N>d --processed-only --agent` (N = days in the period; `--since`
+takes `7d` or `24h`). It returns `meetings[]` with `title`, `date`, `gist`, `action_items`, `participants`.
+Cross-check against `{vault_inbox_meetings}/YYYY-MM-DD_*.md`.
+
+If the live pull fails, the report still builds (`meeting-sync` stops on an auth failure; this skill
+carries on):
+
+- Read `{vault_inbox_meetings}/*.md` for the period by the `YYYY-MM-DD_` prefix. The files have no YAML
+  frontmatter; the header block (`## Key topics`, `## Decisions`, `## Action items`) is often empty, so
+  read the Fireflies sections (`## Summary`, `### Overview`, `### Action Items`).
+- Compare the newest meeting date to today. A gap over 2 days goes to Eric in Step 8: "Meeting data is
+  stale through {DATE}; anything after that came only from the interview."
+- Name the degraded source in the record's `sources_degraded:` frontmatter list.
+
+`{fireflies_cli} action-items list --from <N> --agent` is **broken** (checked 2026-10-31): exit 0 and an
+array of empty `{}` objects, which reads as "no open commitments". Take action items from the digest.
+Flag any item open more than 14 days as a risk candidate.
+
+Meeting action items are assignments, not outcomes. An action item never becomes a Shipped line.
+
+## Supervisor logs (`vault_status_log`)
+
+Every `YYYY-MM-DD.md` inside the period. `closeout` Step 0 writes them (the `interview-me` Part 0
+wording is the format). They are the best source in the pull: equipment, installs, hallway
+conversations and follow-ups awaiting a reply appear nowhere else.
+
+- Merge `## Equipment & installs`, `## People & conversations`, `## Waiting on / risks` across the
+  period; union every `sports:` array for the coverage panel.
+- The wording is Eric's own; keep it.
+- Count the files: `logged` of `days-in-period` goes to Step 8. A thin count is the number that says the
+  nightly ritual lapsed. Never pad it. (2026-10-31: three logs exist, 09-07 to 09-14.)
+- Zero logs never stops the run; Step 4 then covers everything.
+
+## Shipped (`vault_output_ledger`)
+
+The only source for Shipped. A markdown table, newest first:
+`| Shipped | Artifact | What it is | Harvest |`, *Shipped* as `YYYY-MM-DD`. Match rows with
+`^\| 2\d{3}-\d{2}-\d{2}` and filter by date. *What it is* runs to a paragraph: compress to one clause for
+the email.
+
+`portfolio.json` `stage: shipped` is not evidence: it marks projects shipped while stakeholder sign-off is
+outstanding (Sport_Tech_Vetting was `shipped` while KR 1.2 showed Chris's sign-off pending). Stage feeds
+In Progress only.
+
+## In progress (`portfolio_json`)
+
+The file is `{"meta", "projects", "ideas", "inbox"}`; rows live under `projects`. Keep `lane == "job"` and
+`status == "active"` (7 rows on 2026-10-31; the other job rows are paused, merged, archived or done).
+Use `next_action` and `updates[]` (`date`, `note`). `stage` is empty on most rows and `charter` exists on
+a few, so lean on `updates[]`. Also read `{canonical_projects}` for each project's sport and KR.
+
+The registry holds Eric's building work. A draft from the automated sources alone is about one third of
+the report; the interview supplies the rest.
+
+## KR state (`okr_doc`)
+
+`Applied-Performance-OKRs-2026-27.md` is the only KR source. Its current cycle is Fall 2026 (7 KRs, written
+2026-09-14). Report KR status from that file alone.
+
+- `{okr_scoreboard}` and `okrs.yaml` score the retired Q1 summer set. Skip them.
+- The cadence doc's KR table is a superseded set. Skip it.
+- KR 4.1 is this report: 8 reports through 2026-12-18.
+
+## Sport roster
+
+The 17 varsity programs come from `{utilization_brief}` section "Recommendations by program" (15 rows; the
+two XC / Track & Field rows each bundle two programs), and `{canonical_projects}` section "Sport
+coverage" holds the evidence baseline. Read both; never list programs from memory. The brief says what each
+program could use, so it is a roster and the coverage panel is the activity record.
+
+## Optional
+
+`{vault_root}/Inbox/weekly-review/*.md` inside the period, when present. The report never waits on it.
diff --git a/status-report/scripts/onepager_pdf.py b/status-report/scripts/onepager_pdf.py
new file mode 100644
index 0000000..0b0fb36
--- /dev/null
+++ b/status-report/scripts/onepager_pdf.py
@@ -0,0 +1,84 @@
+#!/usr/bin/env python3
+"""Measure and render the status-report one-pager with headless Chrome.
+
+  onepager_pdf.py measure <filled.html>          prints content height, exit 1 over budget
+  onepager_pdf.py render  <filled.html> <out.pdf> measures first, then writes the PDF
+
+Both refuse a file that still holds a {{placeholder}}. Works on macOS and Windows.
+"""
+import pathlib, platform, re, subprocess, sys, tempfile
+
+BUDGET_PX = 950  # content height at 666px width (letter minus margins)
+CHROME = {
+    "Darwin": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
+    "Windows": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
+}
+
+
+def unfilled(text):
+    """Placeholders left in the page, e.g. ['{{DATE_LONG}}']."""
+    return sorted(set(re.findall(r"\{\{[^}]*\}\}", text)))
+
+
+def with_probe(text):
+    """Page text that writes its own body height into document.title."""
+    probe = ('<script>window.addEventListener("load",()=>{document.title='
+             '"H:"+Math.round(document.body.getBoundingClientRect().height)})</script>')
+    return text.replace("</body>", probe + "</body>")
+
+
+def run_chrome(args, profile):
+    """Headless Chrome on a throwaway profile: on the Mac the default profile hangs it
+    (a running Chrome owns it), and crash reporting adds ~20 s to every launch."""
+    return subprocess.run(
+        [chrome(), "--headless", "--disable-gpu", "--no-first-run", "--disable-crash-reporter",
+         "--disable-breakpad", "--disable-extensions", "--user-data-dir=" + str(profile), *args],
+        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=150)
+
+
+def chrome():
+    exe = CHROME.get(platform.system())
+    if not exe or not pathlib.Path(exe).exists():
+        sys.exit("Chrome not found at " + str(exe))
+    return exe
+
+
+def measure(html):
+    text = html.read_text(encoding="utf-8")
+    left = unfilled(text)
+    if left:
+        sys.exit("unfilled placeholders: " + ", ".join(left))
+    with tempfile.TemporaryDirectory() as d:
+        probe = pathlib.Path(d) / "probe.html"
+        probe.write_text(with_probe(text), encoding="utf-8")
+        dom = run_chrome(["--virtual-time-budget=3000", "--window-size=666,1200",
+                          "--dump-dom", probe.as_uri()], pathlib.Path(d) / "profile").stdout
+    m = re.search(r"<title>H:(\d+)", dom)
+    if not m:
+        sys.exit("could not read the page height from Chrome")
+    return int(m.group(1))
+
+
+def render(html, pdf):
+    with tempfile.TemporaryDirectory() as d:
+        run_chrome(["--no-pdf-header-footer", "--print-to-pdf=" + str(pdf), html.resolve().as_uri()],
+                   pathlib.Path(d))
+    if not pathlib.Path(pdf).exists():
+        sys.exit("Chrome wrote no PDF")
+
+
+def main(argv):
+    if len(argv) < 3 or argv[1] not in ("measure", "render") or (argv[1] == "render" and len(argv) < 4):
+        sys.exit(__doc__)
+    html = pathlib.Path(argv[2])
+    px = measure(html)
+    print(f"{px} px (budget {BUDGET_PX})")
+    if px > BUDGET_PX:
+        sys.exit("over budget: cut prose, keep the type at 9.6pt or larger")
+    if argv[1] == "render":
+        render(html, pathlib.Path(argv[3]))
+        print("wrote", argv[3])
+
+
+if __name__ == "__main__":
+    main(sys.argv)
diff --git a/status-report/scripts/test_onepager_pdf.py b/status-report/scripts/test_onepager_pdf.py
new file mode 100644
index 0000000..7b1abff
--- /dev/null
+++ b/status-report/scripts/test_onepager_pdf.py
@@ -0,0 +1,35 @@
+#!/usr/bin/env python3
+"""python3 test_onepager_pdf.py  (stdlib only; the Chrome case skips when Chrome is absent)"""
+import pathlib, sys, tempfile, unittest
+sys.path.insert(0, str(pathlib.Path(__file__).parent))
+import onepager_pdf as op
+
+
+class T(unittest.TestCase):
+    def test_unfilled_names_each_placeholder_once(self):
+        self.assertEqual(op.unfilled("a {{N}} b {{N}} {{DATE}}"), ["{{DATE}}", "{{N}}"])
+        self.assertEqual(op.unfilled("all filled"), [])
+
+    def test_probe_lands_before_body_close(self):
+        self.assertIn("H:", op.with_probe("<body>x</body>"))
+        self.assertTrue(op.with_probe("<body>x</body>").endswith("</body>"))
+
+    def test_measure_refuses_template_with_placeholders(self):
+        tpl = pathlib.Path(__file__).parent.parent / "assets" / "one-pager.html"
+        with self.assertRaises(SystemExit) as e:
+            op.measure(tpl)
+        self.assertIn("unfilled", str(e.exception))
+
+    def test_measure_reads_height(self):
+        try:
+            op.chrome()
+        except SystemExit:
+            self.skipTest("no Chrome")
+        with tempfile.TemporaryDirectory() as d:
+            p = pathlib.Path(d) / "a.html"
+            p.write_text("<!doctype html><html><body style='margin:0'><div style='height:300px'></div></body></html>")
+            self.assertEqual(op.measure(p), 300)
+
+
+if __name__ == "__main__":
+    unittest.main()

hook: PostToolUse
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Completed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Failed
hook: PreToolUse Failed
exec
/bin/zsh -lc 'git status --short && git diff --stat 92e46ec~1 HEAD -- status-report/' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'nl -ba status-report/assets/one-pager.html' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat /Users/kristinarash/.agents/skills/code-review/SKILL.md' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'nl -ba status-report/SOURCES.md' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'nl -ba status-report/SKILL.md' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'nl -ba status-report/scripts/onepager_pdf.py' in /Users/kristinarash/.claude/skills
 succeeded in 192ms:
     1	# Status report: sources, fallbacks and traps
     2	
     3	Step 2 of `SKILL.md` points here. Paths are config keys (`~/.claude/skills/_shared/config.<platform>.json`).
     4	Read this whole file before the pull.
     5	
     6	## Meetings (`fireflies_cli`)
     7	
     8	Preflight first: `{fireflies_cli} transcripts list --agent --data-source live 2>&1 | head -5`.
     9	The key is in `~/.zshrc`; the local mirror is `~/.local/share/fireflies-pp-cli/data.db`.
    10	`unable to open database file: out of memory (14)` means the mirror is missing, so run
    11	`{fireflies_cli} sync` and retry.
    12	
    13	Pull: `{fireflies_cli} digest --since <N>d --processed-only --agent` (N = days in the period; `--since`
    14	takes `7d` or `24h`). It returns `meetings[]` with `title`, `date`, `gist`, `action_items`, `participants`.
    15	Cross-check against `{vault_inbox_meetings}/YYYY-MM-DD_*.md`.
    16	
    17	If the live pull fails, the report still builds (`meeting-sync` stops on an auth failure; this skill
    18	carries on):
    19	
    20	- Read `{vault_inbox_meetings}/*.md` for the period by the `YYYY-MM-DD_` prefix. The files have no YAML
    21	  frontmatter; the header block (`## Key topics`, `## Decisions`, `## Action items`) is often empty, so
    22	  read the Fireflies sections (`## Summary`, `### Overview`, `### Action Items`).
    23	- Compare the newest meeting date to today. A gap over 2 days goes to Eric in Step 8: "Meeting data is
    24	  stale through {DATE}; anything after that came only from the interview."
    25	- Name the degraded source in the record's `sources_degraded:` frontmatter list.
    26	
    27	`{fireflies_cli} action-items list --from <N> --agent` is **broken** (checked 2026-10-31): exit 0 and an
    28	array of empty `{}` objects, which reads as "no open commitments". Take action items from the digest.
    29	Flag any item open more than 14 days as a risk candidate.
    30	
    31	Meeting action items are assignments, not outcomes. An action item never becomes a Shipped line.
    32	
    33	## Supervisor logs (`vault_status_log`)
    34	
    35	Every `YYYY-MM-DD.md` inside the period. `closeout` Step 0 writes them (the `interview-me` Part 0
    36	wording is the format). They are the best source in the pull: equipment, installs, hallway
    37	conversations and follow-ups awaiting a reply appear nowhere else.
    38	
    39	- Merge `## Equipment & installs`, `## People & conversations`, `## Waiting on / risks` across the
    40	  period; union every `sports:` array for the coverage panel.
    41	- The wording is Eric's own; keep it.
    42	- Count the files: `logged` of `days-in-period` goes to Step 8. A thin count is the number that says the
    43	  nightly ritual lapsed. Never pad it. (2026-10-31: three logs exist, 09-07 to 09-14.)
    44	- Zero logs never stops the run; Step 4 then covers everything.
    45	
    46	## Shipped (`vault_output_ledger`)
    47	
    48	The only source for Shipped. A markdown table, newest first:
    49	`| Shipped | Artifact | What it is | Harvest |`, *Shipped* as `YYYY-MM-DD`. Match rows with
    50	`^\| 2\d{3}-\d{2}-\d{2}` and filter by date. *What it is* runs to a paragraph: compress to one clause for
    51	the email.
    52	
    53	`portfolio.json` `stage: shipped` is not evidence: it marks projects shipped while stakeholder sign-off is
    54	outstanding (Sport_Tech_Vetting was `shipped` while KR 1.2 showed Chris's sign-off pending). Stage feeds
    55	In Progress only.
    56	
    57	## In progress (`portfolio_json`)
    58	
    59	The file is `{"meta", "projects", "ideas", "inbox"}`; rows live under `projects`. Keep `lane == "job"` and
    60	`status == "active"` (7 rows on 2026-10-31; the other job rows are paused, merged, archived or done).
    61	Use `next_action` and `updates[]` (`date`, `note`). `stage` is empty on most rows and `charter` exists on
    62	a few, so lean on `updates[]`. Also read `{canonical_projects}` for each project's sport and KR.
    63	
    64	The registry holds Eric's building work. A draft from the automated sources alone is about one third of
    65	the report; the interview supplies the rest.
    66	
    67	## KR state (`okr_doc`)
    68	
    69	`Applied-Performance-OKRs-2026-27.md` is the only KR source. Its current cycle is Fall 2026 (7 KRs, written
    70	2026-09-14). Report KR status from that file alone.
    71	
    72	- `{okr_scoreboard}` and `okrs.yaml` score the retired Q1 summer set. Skip them.
    73	- The cadence doc's KR table is a superseded set. Skip it.
    74	- KR 4.1 is this report: 8 reports through 2026-12-18.
    75	
    76	## Sport roster
    77	
    78	The 17 varsity programs come from `{utilization_brief}` section "Recommendations by program" (15 rows; the
    79	two XC / Track & Field rows each bundle two programs), and `{canonical_projects}` section "Sport
    80	coverage" holds the evidence baseline. Read both; never list programs from memory. The brief says what each
    81	program could use, so it is a roster and the coverage panel is the activity record.
    82	
    83	## Optional
    84	
    85	`{vault_root}/Inbox/weekly-review/*.md` inside the period, when present. The report never waits on it.

 succeeded in 192ms:
     1	<!doctype html>
     2	<html lang="en">
     3	<head>
     4	<meta charset="utf-8">
     5	<title>Applied Performance — Status Memorandum</title>
     6	<style>
     7	  /* ------------------------------------------------------------------
     8	     One-page status memorandum. Letter.
     9	
    10	     This is a PRINTED DEPARTMENT MEMO, not a dashboard. The visual world
    11	     is deliberate and the previous dashboard treatment is the anti-reference.
    12	     Do NOT reintroduce: filled/hollow status dots, pill or badge rows,
    13	     bolded stat lines, icon-plus-label cards, progress bars, or a
    14	     two-column grid. Those read as generated output on a printed page.
    15	
    16	     Hierarchy is carried by type alone: one serif family, three sizes,
    17	     letterspaced small caps for section heads, a single green hairline.
    18	
    19	     FIT: budget is 950px of content at 666px width (letter minus margins).
    20	     Measure before shipping — see SKILL.md Step 6. If it overflows, CUT
    21	     PROSE. Do not reduce font-size below 9.6pt; this gets printed and read
    22	     by people who will not squint for you.
    23	     ------------------------------------------------------------------ */
    24	
    25	  @page { size: letter; margin: 0.6in 0.78in 0.5in; }
    26	
    27	  :root {
    28	    --ink:   #1a1714;
    29	    --soft:  #4a443e;
    30	    --rule:  #c9c2b8;
    31	    --green: #154734;   /* Baylor green — used once, for meaning, never as decoration */
    32	  }
    33	
    34	  * { box-sizing: border-box; }
    35	  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    36	
    37	  body {
    38	    margin: 0;
    39	    font-family: "Charter", "Iowan Old Style", Georgia, serif;
    40	    font-size: 9.6pt;
    41	    line-height: 1.30;
    42	    color: var(--ink);
    43	    font-feature-settings: "kern" 1, "liga" 1;
    44	    text-rendering: optimizeLegibility;
    45	  }
    46	
    47	  /* ---------- letterhead ---------- */
    48	
    49	  .letterhead {
    50	    display: flex; justify-content: space-between; align-items: flex-end;
    51	    padding-bottom: 4pt; border-bottom: 1.6pt solid var(--green);
    52	  }
    53	  .dept { font-size: 12.5pt; font-weight: 700; letter-spacing: 0.005em; line-height: 1; }
    54	  .div-name {
    55	    display: block; font-size: 7.4pt; font-weight: 400; letter-spacing: 0.17em;
    56	    text-transform: uppercase; color: var(--soft); margin-bottom: 3.5pt;
    57	  }
    58	  .docmark {
    59	    font-size: 7.6pt; letter-spacing: 0.3em; text-transform: uppercase;
    60	    color: var(--soft); padding-bottom: 1pt;
    61	  }
    62	
    63	  /* ---------- addressing block ---------- */
    64	
    65	  .heads {
    66	    display: grid; grid-template-columns: max-content 1fr;
    67	    column-gap: 12pt; row-gap: 0.6pt;
    68	    margin: 7pt 0 0; padding-bottom: 6pt; border-bottom: 0.5pt solid var(--rule);
    69	  }
    70	  .heads dt {
    71	    font-size: 7.4pt; letter-spacing: 0.13em; text-transform: uppercase;
    72	    color: var(--soft); padding-top: 1.6pt;
    73	  }
    74	  .heads dd { margin: 0; }
    75	  .heads dd.subject { font-weight: 700; }
    76	
    77	  /* ---------- sections ---------- */
    78	
    79	  section { margin-top: 7.5pt; break-inside: avoid; }
    80	  section:first-of-type { margin-top: 7pt; }
    81	
    82	  h2 {
    83	    font-size: 7.9pt; font-weight: 700; letter-spacing: 0.155em;
    84	    text-transform: uppercase; color: var(--green); margin: 0 0 4pt;
    85	  }
    86	
    87	  .entry { margin-bottom: 3.9pt; padding-left: 10pt; text-indent: -10pt; }
    88	  .entry:last-child { margin-bottom: 0; }
    89	  .entry .lead  { font-weight: 700; }
    90	  .entry .where { font-style: italic; color: var(--soft); }
    91	  .ask { font-weight: 700; }
    92	  .due { font-weight: 700; color: var(--green); }
    93	
    94	  p { margin: 0 0 5pt; } p:last-child { margin-bottom: 0; }
    95	  .runon { padding-left: 10pt; }
    96	  .runon .tag {
    97	    font-size: 7.4pt; letter-spacing: 0.13em; text-transform: uppercase; color: var(--soft);
    98	  }
    99	
   100	  /* ---------- close ---------- */
   101	
   102	  .sign {
   103	    margin-top: 9pt; padding-top: 5pt; border-top: 0.5pt solid var(--rule);
   104	    display: flex; justify-content: space-between; font-size: 7.8pt; color: var(--soft);
   105	  }
   106	</style>
   107	</head>
   108	<body>
   109	
   110	<div class="letterhead">
   111	  <div class="dept">
   112	    <span class="div-name">Baylor Athletics</span>
   113	    Applied Performance
   114	  </div>
   115	  <div class="docmark">Memorandum</div>
   116	</div>
   117	
   118	<dl class="heads">
   119	  <dt>To</dt>      <dd>Chris Ruf</dd>
   120	  <dt>cc</dt>      <dd>Kenny Boyd</dd>
   121	  <dt>From</dt>    <dd>Eric Rash</dd>
   122	  <dt>Date</dt>    <dd>{{DATE_LONG}}</dd>
   123	  <dt>Subject</dt> <dd class="subject">Status report no. {{N}} — {{PERIOD_START}} to {{PERIOD_END}}</dd>
   124	</dl>
   125	
   126	<section>
   127	  <h2>Shipped</h2>
   128	  <!-- Ledger entries ONLY. If none: <div class="entry">Nothing shipped this period.</div> -->
   129	  <div class="entry"><span class="lead">{{ARTIFACT}}.</span>
   130	    <span class="where">{{SPORT}}.</span> {{One sentence. What it is and who received it.}}</div>
   131	</section>
   132	
   133	<section>
   134	  <h2>In progress</h2>
   135	  <div class="entry"><span class="lead">{{PROJECT}}.</span>
   136	    <span class="where">{{SPORT}}.</span> {{What moved. Next milestone and date.}}</div>
   137	</section>
   138	
   139	<section>
   140	  <h2>Decisions needed</h2>
   141	  <!-- Every item names a person and a date, or it is not a decision request. -->
   142	  <div class="entry"><span class="lead">{{DECISION}}.</span>
   143	    <span class="ask">{{NAME}}</span>, by <span class="due">{{DATE}}</span>. {{What is blocked without it.}}</div>
   144	</section>
   145	
   146	<section>
   147	  <h2>Risks and no surprises</h2>
   148	  <!-- Non-empty unless the user explicitly confirmed there is nothing. -->
   149	  <div class="entry"><span class="lead">{{What slipped or is about to.}}</span> {{What is being done about it.}}</div>
   150	</section>
   151	
   152	<section>
   153	  <h2>Sport coverage</h2>
   154	  <!--
   155	    SOURCE for the program list: {utilization_brief} §"Recommendations by program"
   156	    — 15 rows covering all 17 varsity programs. Never re-derive it from memory.
   157	    Two lines, prose. Name the not-engaged programs in full; the blanks are the
   158	    honest record that makes a full panel mean something later. Do not pad.
   159	  -->
   160	  <p class="runon"><span class="tag">Engaged</span> &nbsp;{{programs touched this period}}.</p>
   161	  <p class="runon"><span class="tag">Not engaged</span> &nbsp;{{every remaining program, named}}.</p>
   162	</section>
   163	
   164	<section>
   165	  <h2>Next two weeks</h2>
   166	  <div class="entry">{{Priority 1}}</div>
   167	  <div class="entry">{{Priority 2}}</div>
   168	  <div class="entry">{{Priority 3}}</div>
   169	</section>
   170	
   171	<div class="sign">
   172	  <div>Eric Rash · Applied Performance · Baylor Athletics</div>
   173	  <div>Next report {{NEXT_DATE}}</div>
   174	</div>
   175	
   176	</body>
   177	</html>

 succeeded in 192ms:
---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/PRD asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / PRD / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

The issue tracker should have been provided to you — run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` is missing.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here — not inside two parallel sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.) — fetch via the workflow in `docs/agents/issue-tracker.md`.
2. A path the user passed as an argument.
3. A PRD/spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Send a single message with two `Agent` tool calls. Use the `general-purpose` subagent for both.

**Standards sub-agent prompt** — include:

- The full diff command and commit list.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full — the sub-agent has no other access to it.
- The brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls — documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** — include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings — the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.

hook: PostToolUse
hook: PostToolUse
hook: PostToolUse
hook: PostToolUse
 succeeded in 220ms:
     1	---
     2	name: status-report
     3	description: >-
     4	  Build the every-two-weeks Applied Performance status report for Kenny Boyd and Chris
     5	  Ruf — paste-ready email, one-page PDF, internal record. Use when the user says
     6	  "/status-report", "build my status report", "time for the Chris report", "biweekly
     7	  update", "status update for Chris and Kenny", "what do I send Chris this week", or
     8	  when a scheduled report date arrives. Do not use for a single meeting brief (use
     9	  meeting-prep) or the end-of-day supervisor log interview (use interview-me).
    10	---
    11	
    12	# Status Report
    13	
    14	The recurring Applied Performance email to **Kenny Boyd and Chris Ruf**, both addressed directly
    15	("Kenny, Coach Ruf,"), about 270 words, with a one-page PDF and an internal record. Governed by **KR 4.1**
    16	in `Applied-Performance-OKRs-2026-27.md`, read as a content checklist: shipped work, work in flight,
    17	decisions needed, anything at risk, what's next.
    18	
    19	**Primary job: alignment.** Chris and Kenny finish knowing what moved, what needs them, and what is at
    20	risk. **Secondary job: credit** for work across sports beyond football and basketball; that is why the
    21	report exists, so the sport tags and the coverage panel stay in every cycle.
    22	
    23	**Design target: under 5 minutes of Eric's time.** The machine does the recall; the interview spends
    24	his attention only on what no system can know.
    25	
    26	## Paths
    27	
    28	Keys come from `~/.claude/skills/_shared/config.<platform>.json` (`macos` or `windows`, whichever
    29	machine this is): `vault_root`, `vault_inbox_meetings`, `vault_output_ledger`, `vault_status_reports`,
    30	`vault_status_log`, `portfolio_json`, `okr_doc`, `okr_tracker_dir`, `utilization_brief`,
    31	`canonical_projects`, `fireflies_cli`. When `vault_root` does not exist, the config belongs to the other
    32	machine: stop and fix it first.
    33	
    34	Record template: `{vault_root}/Templates/status-report.md`, **Layer 2 and Layer 3 only**. Its Layer 1 (headed
    35	sections, "Chris —" greeting, attached PDF) is the old layout; the email follows **Voice** below.
    36	
    37	`weekly-review` is never a prerequisite. `html-to-pdf` is not needed: `scripts/onepager_pdf.py` renders.
    38	
    39	## Step 1 — Establish the period
    40	
    41	1. **Prior report** = the newest `*-status.md` in `{vault_status_reports}` (the folder also holds drafts,
    42	   PDFs and HTML). Period start = its `period_end`; period end = today. With no prior record, start = 14
    43	   days ago. Report number = prior `report_number` + 1.
    44	2. **Missed fortnights widen the period.** The archive never has a gap.
    45	3. **Sent or not.** A report counts as sent when its record says `sent: true` or its folder holds
    46	   `YYYY-MM-DD-email-sent.txt`. When the prior report has neither, add "did report N go out?" to the
    47	   Step 4 batch; an unconfirmed report stays unsent.
    48	4. **Send dates** fall every 14 days from 2026-08-24 (the first send, "Starting these updates every two
    49	   weeks"): 2026-11-02, 11-16, 11-30, 12-14. The last is 12-14; the semester closes 12-18.
    50	   `python3 -c "import datetime as d;b=d.date(2026,8,24);t=d.date.today();print(next(b+d.timedelta(14*n) for n in range(40) if b+d.timedelta(14*n)>t))"`
    51	   prints the next date after today. The footer's "Next report" is the grid date after this report's own.
    52	5. KR 4.1 is eight reports through 2026-12-18. Step 8 states how many are confirmed sent.
    53	
    54	**Done when** you hold period start and end, the report number, the prior report's sent state, and the next
    55	send date.
    56	
    57	## Step 2 — Pull (no Eric involvement)
    58	
    59	Read `SOURCES.md` (every source, its fallback, and what lies), then run these in parallel and ask Eric for
    60	nothing obtainable here:
    61	
    62	1. Meetings (Fireflies digest, with the vault copy as fallback).
    63	2. Supervisor logs for the period: read first, they carry the operational two thirds.
    64	3. Shipped artifacts from the ledger: the only source for Shipped.
    65	4. Active job projects from the registry: In Progress only.
    66	5. KR state from the OKR doc, the sport roster, the canonical project spine.
    67	
    68	**Done when** each source has produced rows or a named degraded-source note for the record, and you have
    69	the logged-days count.
    70	
    71	## Step 3 — Draft before asking
    72	
    73	Write a complete draft covering all five KR 4.1 items from the pull, as flat prose in the Voice below.
    74	Cut to 5–6 projects with real motion; unmoved ones go to the record and the coverage panel. Tag every
    75	Shipped and In Progress line with a sport: *(Volleyball)*, *(Football)*, *(Soccer)*, *(Dept-wide)*,
    76	*(Cross-sport)*. Then list the gaps for Step 4.
    77	
    78	**Done when** the draft exists and every gap is a question.
    79	
    80	## Step 4 — Interview the gaps, in one batch
    81	
    82	Ask once. Targeted questions come from the pull ("Three meetings Tuesday–Thursday have no notes. Anything
    83	Chris needs from them?" / "Ledger shows nothing shipped this period; is that right?"), then the standing
    84	ones. Read the merged supervisor log back as a list and ask "anything missing?" for the questions it
    85	already answered (1–4); asking again is how the nightly ritual dies.
    86	
    87	1. Equipment, installs, deliveries: what arrived, went in where, got phased out, who onboards.
    88	2. Meetings held and staffing: who, what came out, cadence changes.
    89	3. Conversations no transcript caught: hallway, text, sideline, phone.
    90	4. Anything waiting on someone else: unanswered emails, pending approvals (they become the soft
    91	   "passing that along" lines).
    92	5. Anything about to go sideways that Chris and Kenny should hear from Eric first. Push here; an
    93	   always-empty risk line means it is not used honestly.
    94	6. Any ask: time at a meeting, a decision, a nudge.
    95	7. Ideas worth parking, pitching or building.
    96	8. What's next in the coming two weeks.
    97	
    98	With thin coverage, add: "Any sport you touched that isn't showing up in my sources?"
    99	
   100	**Done when** every gap has an answer or an explicit "nothing", and Eric has confirmed each Shipped line
   101	(a confirmed ship is the ledger's evidence).
   102	
   103	## Step 5 — Assemble and check
   104	
   105	Fill the Layer 2 and Layer 3 shapes from the template. Run every box; fix a failure, then rerun the whole
   106	list from the top (a cut for word count can drop a sport tag or the only risk line).
   107	
   108	- [ ] Email body is under 300 words (target 270). Count with `wc -w` on the body; state the count.
   109	- [ ] Every Shipped line traces to a ledger row dated in the period.
   110	- [ ] No endorsement claimed that does not exist: "our standard intake process", never "the approved process".
   111	- [ ] Every Shipped and In Progress line carries a sport tag (the PDF carries the tags; the email's prose
   112	      names the sport).
   113	- [ ] Every ask names a person and a date. The email says them in Eric's soft register ("could use
   114	      your read, Kenny, before the 13th"); the PDF states them plainly. An ask with no owner or date is
   115	      cut or rewritten.
   116	- [ ] No CMJ, ACWR or asymmetry-index jargon; B.A.I.R. spelled out once.
   117	- [ ] Department names: Athletic Performance, Athletic Medicine, Applied Performance.
   118	- [ ] The line is "standardized underneath, bespoke on top".
   119	- [ ] Research reads as research, with no readiness or deployment claims.
   120	- [ ] Risks are non-empty unless Eric confirmed nothing; ask once more before leaving them empty.
   121	- [ ] An ask carried over from the prior report is flagged to Eric: two unanswered asks mean the email has
   122	      failed at it and it needs raising in person.
   123	- [ ] Email and PDF agree: every Shipped, In Progress, ask and risk in the email appears in the PDF with
   124	      the same facts, sport tag and date. The PDF may carry more.
   125	- [ ] The coverage panel is unpadded: untouched sports stay marked untouched.
   126	- [ ] Meeting action items appear as work in flight, never as done.
   127	
   128	**Done when** one full pass leaves every box ticked. Show Eric the draft only then.
   129	
   130	## Step 6 — Emit
   131	
   132	Three files in `{vault_status_reports}`:
   133	
   134	1. **`YYYY-MM-DD-email.txt`** — plain text, only what gets pasted: from "Kenny, Coach Ruf," to "Eric".
   135	   No markdown, no header block, no cut list; a select-all copy goes into Outlook with zero cleanup.
   136	2. **`YYYY-MM-DD-onepager.pdf`** — copy `assets/one-pager.html` to `YYYY-MM-DD-onepager.html`, fill every
   137	   `{{placeholder}}`, then run
   138	   `python3 ~/.claude/skills/status-report/scripts/onepager_pdf.py render <html> <pdf>`
   139	   (`python` on Windows). It measures first (budget 950px at 666px width) and refuses a file with
   140	   placeholders left. Over budget, cut prose and keep the type at 9.6pt or larger. The page is a printed
   141	   memorandum: single column, one serif family, letterspaced small-cap heads, one green hairline. Status
   142	   dots, badges, bolded stat lines, progress bars and two-column grids stay out.
   143	3. **`YYYY-MM-DD-status.md`** — the internal record in the template's Layer 3 shape, with frontmatter
   144	   `report_number`, `period_start`, `period_end`, `next_send`, `sent: false`, `word_count`,
   145	   `sources_degraded:`. Cuts and softened lines (what came out of the email, and why) go in a "Cut and
   146	   softened" section; "Not for the report" stays candid.
   147	
   148	Also print the email text in the reply.
   149	
   150	**Never send.** The connected Gmail is Eric's personal address; create no Gmail draft. Eric sends from
   151	Outlook on the work account, after he has read the report.
   152	
   153	**Done when** all three files exist, the measure printed a height at or under 950, and the PDF is one page.
   154	
   155	## Step 7 — Log
   156	
   157	- Append unlogged shipped artifacts Eric confirmed in Step 4 to `{vault_output_ledger}`.
   158	- Update `{canonical_projects}` with confirmed status, sport and KR.
   159	- For each project reported as moved, run `/project update "<name>" "<note>"` (the `project` skill), and
   160	  leave `portfolio.json` uncommitted.
   161	
   162	**Done when** each moved project has an `updates[]` entry and the ledger holds every confirmed ship.
   163	
   164	## Step 8 — Report to Eric
   165	
   166	State: word count, report number, next send date, sports that appeared, anything the checks flagged, the
   167	three file paths, and `N of D days logged` from the supervisor log, stated plainly ("6 of 14 days
   168	logged, so the interview covered the other 8 from memory"). Add any stale-meeting or degraded-source note
   169	from Step 2, and how many reports are confirmed sent toward KR 4.1's eight.
   170	
   171	When this run hit a problem no Step 5 box covers, whether you caught it or Eric did while editing, end with
   172	one proposed new checklist line and its reason. Add it to Step 5 on his yes.
   173	
   174	**Done when** Eric has those items in one message.
   175	
   176	---
   177	
   178	## Voice
   179	
   180	Read `{vault_status_reports}/2026-08-24-email-sent.txt` before drafting: the one report Eric sent, and the
   181	reference for how he writes.
   182	
   183	- Flat short paragraphs, one topic each, no section labels. KR 4.1 is the content checklist.
   184	- One framing line up top, then straight in.
   185	- "We" for department work, "I" for his own actions.
   186	- Concrete and operational: equipment, buildings, people, dates; names people freely.
   187	- Contractions throughout; plain-English edits that strip them make the email sound like someone else.
   188	- Asks come last and land soft ("One ask I wanted to run past you both is whether…").
   189	- Stalled things get passed along: "still haven't heard back. Passing that along in case a nudge is
   190	  warranted."
   191	- No attachment in the ordinary cycle; the PDF is for handing across a table.
   192	- A quiet period is a legitimate report: "Nothing shipped this period" protects the word everywhere
   193	  else. The email is five or six moving projects, never a 14-line roster.

 succeeded in 235ms:
     1	#!/usr/bin/env python3
     2	"""Measure and render the status-report one-pager with headless Chrome.
     3	
     4	  onepager_pdf.py measure <filled.html>          prints content height, exit 1 over budget
     5	  onepager_pdf.py render  <filled.html> <out.pdf> measures first, then writes the PDF
     6	
     7	Both refuse a file that still holds a {{placeholder}}. Works on macOS and Windows.
     8	"""
     9	import pathlib, platform, re, subprocess, sys, tempfile
    10	
    11	BUDGET_PX = 950  # content height at 666px width (letter minus margins)
    12	CHROME = {
    13	    "Darwin": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    14	    "Windows": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    15	}
    16	
    17	
    18	def unfilled(text):
    19	    """Placeholders left in the page, e.g. ['{{DATE_LONG}}']."""
    20	    return sorted(set(re.findall(r"\{\{[^}]*\}\}", text)))
    21	
    22	
    23	def with_probe(text):
    24	    """Page text that writes its own body height into document.title."""
    25	    probe = ('<script>window.addEventListener("load",()=>{document.title='
    26	             '"H:"+Math.round(document.body.getBoundingClientRect().height)})</script>')
    27	    return text.replace("</body>", probe + "</body>")
    28	
    29	
    30	def run_chrome(args, profile):
    31	    """Headless Chrome on a throwaway profile: on the Mac the default profile hangs it
    32	    (a running Chrome owns it), and crash reporting adds ~20 s to every launch."""
    33	    return subprocess.run(
    34	        [chrome(), "--headless", "--disable-gpu", "--no-first-run", "--disable-crash-reporter",
    35	         "--disable-breakpad", "--disable-extensions", "--user-data-dir=" + str(profile), *args],
    36	        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=150)
    37	
    38	
    39	def chrome():
    40	    exe = CHROME.get(platform.system())
    41	    if not exe or not pathlib.Path(exe).exists():
    42	        sys.exit("Chrome not found at " + str(exe))
    43	    return exe
    44	
    45	
    46	def measure(html):
    47	    text = html.read_text(encoding="utf-8")
    48	    left = unfilled(text)
    49	    if left:
    50	        sys.exit("unfilled placeholders: " + ", ".join(left))
    51	    with tempfile.TemporaryDirectory() as d:
    52	        probe = pathlib.Path(d) / "probe.html"
    53	        probe.write_text(with_probe(text), encoding="utf-8")
    54	        dom = run_chrome(["--virtual-time-budget=3000", "--window-size=666,1200",
    55	                          "--dump-dom", probe.as_uri()], pathlib.Path(d) / "profile").stdout
    56	    m = re.search(r"<title>H:(\d+)", dom)
    57	    if not m:
    58	        sys.exit("could not read the page height from Chrome")
    59	    return int(m.group(1))
    60	
    61	
    62	def render(html, pdf):
    63	    with tempfile.TemporaryDirectory() as d:
    64	        run_chrome(["--no-pdf-header-footer", "--print-to-pdf=" + str(pdf), html.resolve().as_uri()],
    65	                   pathlib.Path(d))
    66	    if not pathlib.Path(pdf).exists():
    67	        sys.exit("Chrome wrote no PDF")
    68	
    69	
    70	def main(argv):
    71	    if len(argv) < 3 or argv[1] not in ("measure", "render") or (argv[1] == "render" and len(argv) < 4):
    72	        sys.exit(__doc__)
    73	    html = pathlib.Path(argv[2])
    74	    px = measure(html)
    75	    print(f"{px} px (budget {BUDGET_PX})")
    76	    if px > BUDGET_PX:
    77	        sys.exit("over budget: cut prose, keep the type at 9.6pt or larger")
    78	    if argv[1] == "render":
    79	        render(html, pathlib.Path(argv[3]))
    80	        print("wrote", argv[3])
    81	
    82	
    83	if __name__ == "__main__":
    84	    main(sys.argv)

hook: PostToolUse
 succeeded in 328ms:
 status-report/SKILL.md                     | 506 +++++++++--------------------
 status-report/SOURCES.md                   |  85 +++++
 status-report/scripts/onepager_pdf.py      |  84 +++++
 status-report/scripts/test_onepager_pdf.py |  35 ++
 4 files changed, 351 insertions(+), 359 deletions(-)

hook: PostToolUse
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
codex
I found issues in the step order and the PDF check. I’ll check the project command and the send rules next.
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Completed
hook: PreToolUse Completed
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Failed
hook: PreToolUse Failed
hook: PreToolUse Failed
exec
/bin/zsh -lc "rg -n 'status-report|send|publish' AGENTS.md status-report" in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc "git show 92e46ec~1:status-report/SKILL.md | rg -n 'send|publish|ledger|period|review' " in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'nl -ba status-report/scripts/test_onepager_pdf.py' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc "rg -n 'update|push|commit|publish|send' project/SKILL.md" in /Users/kristinarash/.claude/skills
 succeeded in 358ms:
     1	#!/usr/bin/env python3
     2	"""python3 test_onepager_pdf.py  (stdlib only; the Chrome case skips when Chrome is absent)"""
     3	import pathlib, sys, tempfile, unittest
     4	sys.path.insert(0, str(pathlib.Path(__file__).parent))
     5	import onepager_pdf as op
     6	
     7	
     8	class T(unittest.TestCase):
     9	    def test_unfilled_names_each_placeholder_once(self):
    10	        self.assertEqual(op.unfilled("a {{N}} b {{N}} {{DATE}}"), ["{{DATE}}", "{{N}}"])
    11	        self.assertEqual(op.unfilled("all filled"), [])
    12	
    13	    def test_probe_lands_before_body_close(self):
    14	        self.assertIn("H:", op.with_probe("<body>x</body>"))
    15	        self.assertTrue(op.with_probe("<body>x</body>").endswith("</body>"))
    16	
    17	    def test_measure_refuses_template_with_placeholders(self):
    18	        tpl = pathlib.Path(__file__).parent.parent / "assets" / "one-pager.html"
    19	        with self.assertRaises(SystemExit) as e:
    20	            op.measure(tpl)
    21	        self.assertIn("unfilled", str(e.exception))
    22	
    23	    def test_measure_reads_height(self):
    24	        try:
    25	            op.chrome()
    26	        except SystemExit:
    27	            self.skipTest("no Chrome")
    28	        with tempfile.TemporaryDirectory() as d:
    29	            p = pathlib.Path(d) / "a.html"
    30	            p.write_text("<!doctype html><html><body style='margin:0'><div style='height:300px'></div></body></html>")
    31	            self.assertEqual(op.measure(p), 300)
    32	
    33	
    34	if __name__ == "__main__":
    35	    unittest.main()

hook: PostToolUse
 succeeded in 446ms:
31:python3 "$PT/portfolio.py" add-update "<name>" "<note>" [--next-action "<step>"]
41:| `add-update` | `updated <name>` |
75:### `update <name> <note>`
76:`add-update "<name>" "<note>"`, plus `--next-action "<step>"` when Eric gave one.
98:render. Tell Eric in one line what changed. Closeout commits the registry as
99:`data: board edits <date>`, so leave `portfolio.json` uncommitted unless Eric asks.

 succeeded in 449ms:
7:  update", "status update for Chris and Kenny", "what do I send Chris this week", or
33:here: `vault_root`, `vault_inbox_meetings`, `vault_output_ledger`,
49:- **`weekly-review` is not a prerequisite.** Never require it to have run. If review
50:  files exist in `Inbox/weekly-review/` for the period, read them as a bonus input; if
60:## Step 1 — Establish the period
63:`period_end`; period end = today. If no prior report exists, period start = 14 days ago.
65:**Count sends.** KR 4.1's target is "≥3 **sent** by Aug 31," and writing a file is not
66:sending it. Count files in `{vault_status_reports}` with `sent: true` in frontmatter —
68:`sent: false` older than a week, ask whether they actually went out; an uncounted send
71:A missed send widens the period rather than skipping it. Never leave a gap in the
76:sends land on even fortnights from there (2026-09-07, 09-21, 10-05, …). The earlier
93:  or it inherits the outage that already lapsed `weekly-review`.
94:- **Fall back** to reading `{vault_inbox_meetings}/*.md` filtered to the period by the
101:  report is worse than a flagged one — the user is about to send it to a supervisor.
113:   `{vault_status_log}` whose `YYYY-MM-DD.md` filename falls inside the period. These are
118:   `## Waiting on / risks`) across the period and union every `sports:` array for the
122:   `logged / days-in-period` gets reported in Step 8. A thin count is not a reason to
137:3. **Shipped artifacts** — read `{vault_output_ledger}`, newest first, entries within
138:   the period. **This is the only source for the "Shipped" section.**
164:   which is exactly why the coverage panel is worth publishing.
167:8. **Optional** — `Inbox/weekly-review/*.md` within the period, if any exist.
169:### Hard rule: "Shipped" comes from the ledger, never from portfolio stage
174:never approved is done. **Only `_ledger.md` entries qualify as Shipped.** Portfolio
204:Almost nothing in his real report appears in `portfolio.json` or `_ledger.md`: survey
232:- "Ledger shows nothing shipped this period — is that right, or did something go out
238:`{vault_status_log}` covered the period, questions 1–4 below are largely pre-filled —
261:Also ask, if the pull shows thin coverage: *"Any sport you touched this period that
273:- [ ] **Every Shipped line traces to a `_ledger.md` entry.** No exceptions.
309:   roster, KR ledger, and the "Not for the report" candid section.
311:   `assets/one-pager.html` with the period's content. One page, always.
350:   Select-all-copy from this file should produce something sendable with zero cleanup.
352:   a file — but the `.txt` is the artifact of record for sending.
354:### Do not send
358:the wrong mailbox. The user sends from Outlook on the work account.
360:Never send a report to a supervisor without the user reading it first, under any
365:- Append shipped artifacts to `{vault_output_ledger}` if the interview surfaced any that
371:- Set `sent: false` in the internal record. The user flips it after sending.
375:State: word count, report number, next send date, which sports appeared, anything the
378:Also state **`N of D` days logged** in `{vault_status_log}` for the period. Say it
383:caught by you, or by Eric editing the draft before sending — end with one proposed new
391:**Padding.** A thin period is a legitimate output. "Nothing shipped this period" is an
392:honest line that protects the word "shipped" everywhere else. Inflating a quiet period
400:non-basketball involvement becomes visible. If a period's coverage panel is thin, that
404:**Depending on another ritual.** `weekly-review` lapsed for seven weeks earlier this

hook: PostToolUse
 exited 2 in 453ms:
rg: AGENTS.md: No such file or directory (os error 2)
status-report/scripts/onepager_pdf.py:2:"""Measure and render the status-report one-pager with headless Chrome.
status-report/SKILL.md:2:name: status-report
status-report/SKILL.md:6:  "/status-report", "build my status report", "time for the Chris report", "biweekly
status-report/SKILL.md:7:  update", "status update for Chris and Kenny", "what do I send Chris this week", or
status-report/SKILL.md:34:Record template: `{vault_root}/Templates/status-report.md`, **Layer 2 and Layer 3 only**. Its Layer 1 (headed
status-report/SKILL.md:48:4. **Send dates** fall every 14 days from 2026-08-24 (the first send, "Starting these updates every two
status-report/SKILL.md:55:send date.
status-report/SKILL.md:138:   `python3 ~/.claude/skills/status-report/scripts/onepager_pdf.py render <html> <pdf>`
status-report/SKILL.md:144:   `report_number`, `period_start`, `period_end`, `next_send`, `sent: false`, `word_count`,
status-report/SKILL.md:150:**Never send.** The connected Gmail is Eric's personal address; create no Gmail draft. Eric sends from
status-report/SKILL.md:166:State: word count, report number, next send date, sports that appeared, anything the checks flagged, the

hook: PostToolUse
hook: PostToolUse
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc "nl -ba project/SKILL.md | sed -n '20,105p'" in /Users/kristinarash/.claude/skills
 succeeded in 370ms:
    20	  On the Mac that is `~/DEV/project-triage`: start each Bash call with
    21	  `PT=~/DEV/project-triage` (the shell does not keep it between calls).
    22	- Interpreter: `python3` on the Mac (there is no `python`). On Windows, use `python` and the
    23	  `portfolio_json` folder from `config.windows.json` wherever this skill says `python3` and `$PT`.
    24	- `portfolio.py` makes every change and always writes the live `$PT/portfolio.json` (only
    25	  `slate-check` and the read commands take `--registry`). `board.py` serves the board.
    26	
    27	## CLI
    28	
    29	```
    30	python3 "$PT/portfolio.py" add-idea "<pitch>" --source "<source>"
    31	python3 "$PT/portfolio.py" add-update "<name>" "<note>" [--next-action "<step>"]
    32	python3 "$PT/portfolio.py" set-stage "<name>" "<stage>"
    33	python3 "$PT/portfolio.py" set-status "<name>" active|paused|done [--note "<note>"]
    34	python3 "$PT/portfolio.py" set-receiver "<name>" "<who, or me: why>"
    35	python3 "$PT/board.py" --background
    36	```
    37	
    38	| Command | Prints on success |
    39	|---|---|
    40	| `add-idea` | `idea captured (<N> in inbox)` |
    41	| `add-update` | `updated <name>` |
    42	| `set-stage` | `stage set: <name> → <stage>` |
    43	| `set-status` | `status set: <name> → <status>` |
    44	| `set-receiver` | `<Name>: receiver <who>` |
    45	| `board.py --background` | `board started at <url>` or `board already running at <url>` |
    46	
    47	- Pass each name exactly as `projects[].name` spells it: `set-status` matches case-sensitively.
    48	  Stages, in ladder order: `idea grilled spec planned building shipped`.
    49	- `set-status active` on a row that was not active stamps `started` and renumbers the lane.
    50	- A refused change prints `[error] <msg>` to stderr, exits 2 and leaves `portfolio.json`
    51	  unchanged; a bad argument prints argparse usage and also exits 2. `board.py` prints
    52	  `board did not start; see <log>` (exit 1), or a traceback when the registry fails to load.
    53	  On any non-zero exit: stop and show the output verbatim.
    54	
    55	## Ideas land in the board's Inbox
    56	
    57	`add-idea` writes a card to the registry's `inbox` list, the board's Inbox column (since
    58	2026-10-31; the older `ideas` list is history only). The card's name is `--name`, or the
    59	pitch's first four words, made `[A-Za-z0-9_]` and suffixed `_2`, `_3` to stay unique. It
    60	prints `idea captured as <Name> (<N> in the board inbox)`: tell Eric the card name and that
    61	dragging it onto a lane, or `/project promote <Name>`, starts it.
    62	
    63	## Verbs
    64	
    65	**Name matching** (every verb that takes `<name>`): read `portfolio.json` and match the name
    66	against `projects[].name`. One clear match: use that exact name. Several or none: ask Eric
    67	which project before running anything.
    68	
    69	### `idea <pitch>`
    70	`add-idea "<pitch>" --source "<where it came from, ≤8 words>" --name <Short_Name>`, e.g.
    71	`--source "chat about GPS vendor gaps"` (a place, not just "chat"). Pick `--name` as the
    72	2–4 word project name the idea would get (`GPS_Vendor_Gaps`); it becomes the DEV folder name
    73	on promotion.
    74	
    75	### `update <name> <note>`
    76	`add-update "<name>" "<note>"`, plus `--next-action "<step>"` when Eric gave one.
    77	
    78	### `start` / `park` / `done <name>`
    79	`set-status "<name>" active|paused|done`, with `--note` when Eric gave a reason. Starting a
    80	`job`, `side` or `tool` row with no `receiver`: ask Eric who it is for, then run
    81	`set-receiver` with his words (`me: <why>` when it is for himself).
    82	
    83	### `stage <name> <stage>`
    84	`set-stage "<name>" "<stage>"`. When the stage is `shipped`, offer once: "Want me to run
    85	/harvest on <name> to distill it into your SecondBrain and log the shipped artifact?" On
    86	yes, invoke the `harvest` skill for that project.
    87	
    88	### `promote <idea>` and `rank`
    89	Both change the registry where no CLI command reaches: follow
    90	[`REGISTRY-EDITS.md`](REGISTRY-EDITS.md). Dragging cards on the board re-ranks faster.
    91	
    92	### bare `/project`
    93	Run `board.py --background` and give the URL. Waiting ideas are the board's Inbox column.
    94	
    95	## After a change
    96	
    97	The board picks up registry changes on its next poll (a few seconds); there is nothing to
    98	render. Tell Eric in one line what changed. Closeout commits the registry as
    99	`data: board edits <date>`, so leave `portfolio.json` uncommitted unless Eric asks.
   100	
   101	Delete a project or idea only after Eric confirms that exact row.
   102	
   103	**Done when:** the command printed its success line (or the hand edit saved and the
   104	`.bak` beside `portfolio.json` was refreshed), and Eric has the one-line summary.

hook: PostToolUse
hook: PostToolUse Failed
codex
I found five issues that can affect the report.

**High**

- [SKILL.md:109](/Users/kristinarash/.claude/skills/status-report/SKILL.md:109) — A new item that Eric confirms cannot pass the Shipped check. The check requires a ledger entry in Step 5. Step 7 adds the entry. Move that ledger update before Step 5.

- [onepager_pdf.py:62](/Users/kristinarash/.claude/skills/status-report/scripts/onepager_pdf.py:62) — The PDF check can accept an old file. The code ignores Chrome’s exit status and checks only whether the output file exists. If Chrome fails and an old PDF is there, the script reports success.

**Medium**

- [onepager_pdf.py:52](/Users/kristinarash/.claude/skills/status-report/scripts/onepager_pdf.py:52) — The height check copies the HTML to a temporary folder. Relative image and style links can then fail. The PDF uses the original folder, so it can have a different height from the check. The script also does not check the PDF page count.

- [SKILL.md:41](/Users/kristinarash/.claude/skills/status-report/SKILL.md:41) — The newest record sets the next period, even when that record was not sent. This can leave earlier work out of the next email, contrary to the rule that a missed send widens the period.

- [SKILL.md:150](/Users/kristinarash/.claude/skills/status-report/SKILL.md:150) — The skill says never to send. It does not say never to publish or share. Add that rule if the report must stay private.

All eight steps have a “Done when” line. I did not find a factual conflict between `SKILL.md` and `SOURCES.md`. The placeholder check covers the template’s `{{...}}` markers.

I did not run the tests. The workspace allows file reads only. I did not test Chrome on Mac or Windows.

No action is needed from you for this review.
hook: Stop
hook: Stop
hook: Stop
hook: Stop Completed
hook: Stop Completed
hook: Stop Failed
tokens used
45,192
I found five issues that can affect the report.

**High**

- [SKILL.md:109](/Users/kristinarash/.claude/skills/status-report/SKILL.md:109) — A new item that Eric confirms cannot pass the Shipped check. The check requires a ledger entry in Step 5. Step 7 adds the entry. Move that ledger update before Step 5.

- [onepager_pdf.py:62](/Users/kristinarash/.claude/skills/status-report/scripts/onepager_pdf.py:62) — The PDF check can accept an old file. The code ignores Chrome’s exit status and checks only whether the output file exists. If Chrome fails and an old PDF is there, the script reports success.

**Medium**

- [onepager_pdf.py:52](/Users/kristinarash/.claude/skills/status-report/scripts/onepager_pdf.py:52) — The height check copies the HTML to a temporary folder. Relative image and style links can then fail. The PDF uses the original folder, so it can have a different height from the check. The script also does not check the PDF page count.

- [SKILL.md:41](/Users/kristinarash/.claude/skills/status-report/SKILL.md:41) — The newest record sets the next period, even when that record was not sent. This can leave earlier work out of the next email, contrary to the rule that a missed send widens the period.

- [SKILL.md:150](/Users/kristinarash/.claude/skills/status-report/SKILL.md:150) — The skill says never to send. It does not say never to publish or share. Add that rule if the report must stay private.

All eight steps have a “Done when” line. I did not find a factual conflict between `SKILL.md` and `SOURCES.md`. The placeholder check covers the template’s `{{...}}` markers.

I did not run the tests. The workspace allows file reads only. I did not test Chrome on Mac or Windows.

No action is needed from you for this review.
