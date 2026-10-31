Reading additional input from stdin...
2026-10-31T16:25:22.384383Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.context7.com/.well-known/oauth-protected-resource/mcp\"" })
2026-10-31T16:25:22.855028Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.context7.com/.well-known/oauth-protected-resource/mcp\"" })
OpenAI Codex v0.166.0
--------
workdir: /Users/kristinarash/.claude/skills
model: gpt-6.1-terra
provider: openai
approval: never
sandbox: read-only
reasoning effort: medium
reasoning summaries: none
session id: 01a192c7-94fc-7c32-9562-251051d1cf52
--------
user
Review the diff of commit HEAD in /Users/kristinarash/.claude/skills (git show HEAD -- interview-me/). It edits the interview-me skill: replaced retired slate-check/mark-done project-block step with a registry-based active-project list plus portfolio.py add-update; honest-zero now writes .asked marker (closeout convention); moved pull-ins to SOURCES.md. Verify against ~/DEV/project-triage/portfolio.py --help, ~/.claude/skills/closeout/SKILL.md Step 0, ~/.claude/skills/status-report/SKILL.md (how it reads status-log). Report real bugs (wrong flags, broken cross-references, readers confused by .asked marker files in the status-log dir) and wording faults. Be concise.
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
I’ll check the changes against the tools and skills you named.
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
exec
/bin/zsh -lc 'cat ~/.claude/skills/closeout/SKILL.md; cat ~/.claude/skills/status-report/SKILL.md' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat ~/.claude/machine.md; cat ~/.claude/CLAUDE.md' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'git show HEAD -- interview-me/' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc 'cat ~/.claude/global-memory/transcripts/.errors.log' in /Users/kristinarash/.claude/skills
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc 'python3 ~/DEV/project-triage/portfolio.py --help' in /Users/kristinarash/.claude/skills
 succeeded in 338ms:
commit 5e2bde140c48d176806449a8036a3fdd0611786e
Author: Eric Rash <eric.rash11@gmail.com>
Date:   Sat Oct 31 11:24:58 2026 -0500

    interview-me: audit — Part 0b lists active projects from the registry (slate retired), drops mark-done and [block]; honest zero writes .asked marker; log written before Part 0b; pull-ins and memory bridge to SOURCES.md
    
    Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

diff --git a/interview-me/SKILL.md b/interview-me/SKILL.md
index 0b93427..b22646b 100644
--- a/interview-me/SKILL.md
+++ b/interview-me/SKILL.md
@@ -1,6 +1,6 @@
 ---
 name: interview-me
-description: "End-of-workday interview in two parts: a 90-second supervisor log of operational facts (equipment, people, blockers) for the biweekly status report, then four reflection questions distilled into atomic SecondBrain notes. Use when the user types `/interview-me`, says \"interview me\", \"let's debrief\", \"end of day interview\", \"process my day\", \"wrap up today\", \"log my day\", or asks to capture their workday. Do not use for building the biweekly report itself (use status-report)."
+description: "End-of-workday interview in three parts: a 90-second supervisor log of operational facts (equipment, people, blockers) for the biweekly status report, a project update that logs what moved on each active project, then four reflection questions distilled into atomic SecondBrain notes. Use when the user types `/interview-me`, says \"interview me\", \"let's debrief\", \"end of day interview\", \"process my day\", \"wrap up today\", \"log my day\", or asks to capture their workday. Do not use for building the biweekly report itself (use status-report)."
 ---
 
 # Interview Me
@@ -18,7 +18,7 @@ Use `vault_root` from the selected platform config.
 - `Drafts/` — essays in progress
 - `Archive/` — published
 - `Templates/interview-note.md`, `Templates/permanent-note.md`
-- `Inbox/status-log/` — daily supervisor fact logs (Part 0). Path key: `vault_status_log`.
+- `{vault_status_log}` (`Inbox/status-log/`) — daily supervisor fact logs (Part 0).
 
 ---
 
@@ -39,16 +39,16 @@ two weeks from memory. With one, it mostly writes itself.
 `{vault_status_log}/YYYY-MM-DD.md` or `{vault_status_log}/.asked-YYYY-MM-DD` exists for today,
 today's log is taken: go straight to Part 0b.
 
-Ask all three at once. Accept short answers. Do not probe.
+Ask all three at once. Accept short answers; take each as given.
 
 > Quick log first, 90 seconds. Then the usual four.
 > 1. Anything arrive, get installed, or change hands today? Who's onboarding onto it?
 > 2. Who did you talk to that Kenny or Chris would want to know about? Names and sport.
 > 3. Waiting on anyone, or anything about to go sideways?
 
-**Honest zero rule.** If all three are genuinely "nothing", write **no file**. A day with
-no operational facts is a real day. Padding this log is worse than skipping it, because
-`status-report` trusts these entries verbatim.
+**Honest zero rule.** If all three are genuinely "nothing", write the empty marker
+`{vault_status_log}/.asked-YYYY-MM-DD` instead of a log, so `closeout` skips its ask today. A day
+with no operational facts is a real day, and `status-report` trusts these entries verbatim.
 
 ### Output — `{vault_status_log}/YYYY-MM-DD.md`
 
@@ -74,38 +74,35 @@ does the judgement pass later, and it needs raw facts to judge.
 **Append, never overwrite.** If today's file exists (a second debrief, or a correction),
 add to the existing sections rather than replacing the file.
 
+Write the log **now**, before Part 0b, so a session cut short still leaves the report its facts.
+
+**Done when** the log file or the `.asked` marker exists for today.
+
 **This log never becomes a permanent note.** It is a fact record for one downstream
 consumer. Insight goes in `Notes/` via Part 1, which is why the skill's "NOT a journaling
 app" rule still holds.
 
 ---
 
-## Part 0b — Project block (30 seconds, right after Part 0)
-
-The user works a 2-hour calendar block per slate project each week (rules:
-`SecondBrain/Projects/Applied-Performance-Operating-Cadence.md`). This question is the only
-thing that records whether a block happened; the Friday weekly report counts it, so skipping
-it makes a worked week look empty.
-
-`<portfolio.py>` below is the `portfolio.py` beside `portfolio_json` in
-`~/.claude/skills/_shared/config.<platform>.json` (Mac `~/DEV/project-triage`, Windows
-`~/Desktop/DEV/project-triage`); `<py>` is `python3` on the Mac and `python` on Windows.
-Never hardcode either path.
+## Part 0b — Project update (30 seconds, right after Part 0)
 
-Run `<py> <portfolio.py> slate-check` first to get the active project
-names. Then ask once:
+`<portfolio.py>` is the `portfolio.py` beside `portfolio_json` in
+`~/.claude/skills/_shared/config.<platform>.json`; `<py>` is `python3` on the Mac and `python`
+on Windows. Take both from the config.
 
-> Project block: which slate project did you work on today, what moved, and did you finish a step?
+1. List the active projects (the registry is the source; the project slate is retired):
+   `<py> -c "import json,sys,os;d=json.load(open(os.path.join(os.path.dirname(sys.argv[1]),'portfolio.json')));print(*[p['name'] for p in d['projects'] if p['status']=='active'],sep='\n')" <portfolio.py>`
+2. Ask once:
+   > Which project did you work on today, and what moved?
+3. Each project named: `<py> <portfolio.py> add-update <Name> "<what moved, in the user's words>"`.
+   Match names case-insensitively against the list; ask when two match. The command prints
+   `updated <Name>`; on `[error]`, show it verbatim and carry on.
+4. A stage change or a finished project goes through the `project` skill (`/project stage`,
+   `/project done`). A new idea goes through `/project idea`: it lands as a named card in the
+   board's Inbox.
+5. "None" is a real answer: write nothing.
 
-- Each project named → `<py> <portfolio.py> add-update <Project> "[block] <what moved, in the user's words>"`.
-  The exact `[block]` prefix is what the weekly report counts.
-- A step finished → confirm the step name back, then `<py> <portfolio.py> mark-done <Project> --step N`
-  (charter order: 1 plan agreed, 2 first draft, 3 final delivered, 4 in use).
-- "None" is a real answer — write nothing.
-- Work on something **not** on the slate is not a block. If it was a new idea, offer
-  `/project idea` and say it waits for a free slot.
-- Match names case-insensitively; ask if two projects match. On `[error]`, show it verbatim
-  and carry on with Part 1.
+**Done when** each named project has its `updated <Name>` line, or the answer was "none".
 
 ---
 
@@ -136,31 +133,18 @@ This is the gold question. Genuine surprise, frustration, or updated belief = th
 
 This question converts experience into transferable insight. If the user gives a great one-liner — capture it verbatim as the seed for a permanent note.
 
-## Optional source pull-ins
+## Source pull-ins and memory bridge
 
-Offer when the user references them. Don't pull unprompted.
-
-- **Meeting referenced** ("today's call with X", "this morning's standup"):
-  → **First, check `Inbox/meetings/` for a local summary** — Glob for files matching the date or participant. If found, read and quote from the local file (free, fast, no API call).
-  → If not found locally, ask: *"Want me to pull from Fireflies?"* → invoke the `meeting-sync` skill to sync the latest meetings, then read the local file.
-  → Fall back to direct `pp-fireflies` only if `meeting-sync` reports nothing matching.
-- **Paper / article referenced:**
-  → "Want me to pull the source from Zotero?" → use `pp-zotero-research-library` skill.
-- **GPS / Catapult data referenced:**
-  → "Want me to pull the underlying metric?" → use `pp-catapult-openfield-connect` skill.
-
-Quote sources in the note's frontmatter `source:` field or the **Evidence / origin** section.
+When the user references a meeting, paper, or GPS data, or the interview surfaces a durable fact
+for memory, follow [`SOURCES.md`](SOURCES.md). Offer pull-ins only when the user mentions them.
 
 ## Output protocol
 
-### Write the supervisor log (unless all three answers were nothing)
+The supervisor log is already written (Part 0). Then, in order:
 
-`Inbox/status-log/YYYY-MM-DD.md` — see Part 0 for the shape. Write this **first**, before
-the transcript, so a session that gets cut short still leaves the report its facts.
+### Write the transcript
 
-### Always write the transcript
-
-`Inbox/YYYY-MM-DD-interview.md` — full Q&A, lightly cleaned. Use the `Templates/interview-note.md` skeleton. Fill in `themes`, `notes_produced`, `pulled_sources` in frontmatter.
+`Inbox/YYYY-MM-DD-interview.md` — full Q&A, lightly cleaned, from the `Templates/interview-note.md` skeleton. Fill in `themes`, `notes_produced`, `pulled_sources` in frontmatter.
 
 ### Write 0–3 permanent notes
 
@@ -179,22 +163,17 @@ Each note goes to `Notes/<concept-title-kebab-case>.md` with the `Templates/perm
 - `tags`: free-form, but reuse existing tags from other Notes when possible
 - Body: claim in 1–2 sentences, why it matters, evidence/origin, connections (use `[[wikilink]]` to related Notes), open questions
 
-### Memory bridge (when warranted)
-
-If the interview surfaces a **durable** fact about the user, their projects, or working style that should persist across Claude sessions:
-- Also write a Tier A memory file via the `memory-write` skill (it derives the correct project slug from the current working directory) or update USER.md / project_*.md as appropriate.
-- Tell the user explicitly: "Also saved this to memory as <name>."
-- Do NOT bridge ephemeral notes. Most permanent notes stay in the vault only.
+**Done when** the transcript exists and each note that cleared the bar is written (zero is a valid count).
 
 ## What NOT to do
 
-- **Don't pad notes with model commentary.** The user's own words and insights are the value. You are a scribe with editorial judgment, not a co-author.
-- **Don't ask follow-up questions beyond the four** unless an answer was genuinely ambiguous and one clarification unlocks a much better note.
-- **Don't produce a note "just to have one."** Zero notes is an honest output.
-- **Don't break the 10–15 min budget.** Offer a follow-up session if needed.
-- **Don't write to `Drafts/` from a daily interview.** Drafts come out of weekly synthesis, not daily capture.
-- **Don't pad the supervisor log to make the day look productive.** `status-report` copies these entries into an email to the user's supervisors with light editing. An invented install or an inflated conversation becomes a false claim in front of Chris Ruf and Kenny Boyd. No file is the correct output for a quiet day.
-- **Don't turn a Part 0 answer into a permanent note** unless it independently clears the Part 1 bar. Operational facts are not insight.
+- **Notes carry the user's own words.** You are a scribe with editorial judgment, not a co-author.
+- **Ask the four and stop**, unless an answer was genuinely ambiguous and one clarification unlocks a much better note.
+- **Zero notes is an honest output.** Write a note only when it clears the bar.
+- **Hold the 10–15 min budget.** Offer a follow-up session if needed.
+- **`Drafts/` comes from weekly synthesis**, not daily capture.
+- **The supervisor log holds only what the user said.** `status-report` copies these entries into an email to Chris Ruf and Kenny Boyd with light editing, so an invented install becomes a false claim in front of them. A quiet day gets the `.asked` marker.
+- **A Part 0 answer becomes a permanent note only when it independently clears the Part 1 bar.** Operational facts are not insight.
 
 ## Gotchas
 
@@ -211,10 +190,11 @@ Weekly synthesis is NOT this skill's job. If the user says "weekly synthesis", "
 ## End-of-session sign-off
 
 Always end with a brief summary:
-- Supervisor log: saved to `Inbox/status-log/YYYY-MM-DD.md`, or "nothing to log today"
+- Supervisor log: saved to `{vault_status_log}/YYYY-MM-DD.md`, taken earlier by `closeout`, or "nothing to log today"
+- Project updates: names logged, or "none"
 - Transcript saved: `Inbox/YYYY-MM-DD-interview.md`
 - Notes created: list with paths and one-line summaries
 - Memory bridge: yes/no, what
 - Any open thread to revisit tomorrow
 
-Keep it tight — three to five lines.
+Keep it tight — three to six lines. **Done when** the sign-off is given.
diff --git a/interview-me/SOURCES.md b/interview-me/SOURCES.md
new file mode 100644
index 0000000..760fc77
--- /dev/null
+++ b/interview-me/SOURCES.md
@@ -0,0 +1,23 @@
+# Interview sources and memory bridge
+
+## Source pull-ins
+
+Offer when the user references them. Don't pull unprompted.
+
+- **Meeting referenced** ("today's call with X", "this morning's standup"):
+  → **First, check `Inbox/meetings/` for a local summary** — Glob for files matching the date or participant. If found, read and quote from the local file (free, fast, no API call).
+  → If not found locally, ask: *"Want me to pull from Fireflies?"* → invoke the `meeting-sync` skill to sync the latest meetings, then read the local file.
+  → Fall back to direct `pp-fireflies` only if `meeting-sync` reports nothing matching.
+- **Paper / article referenced:**
+  → "Want me to pull the source from Zotero?" → use `pp-zotero-research-library` skill.
+- **GPS / Catapult data referenced:**
+  → "Want me to pull the underlying metric?" → use `pp-catapult-openfield-connect` skill.
+
+Quote sources in the note's frontmatter `source:` field or the **Evidence / origin** section.
+
+## Memory bridge (when warranted)
+
+If the interview surfaces a **durable** fact about the user, their projects, or working style that should persist across Claude sessions:
+- Also write a Tier A memory file via the `memory-write` skill (it derives the correct project slug from the current working directory) or update USER.md / project_*.md as appropriate.
+- Tell the user explicitly: "Also saved this to memory as <name>."
+- Do NOT bridge ephemeral notes. Most permanent notes stay in the vault only.

hook: PostToolUse
 succeeded in 490ms:
hook: PostToolUse
 succeeded in 865ms:
---
name: closeout
description: >-
  End-of-session sign-off: asks the day's supervisor-log and shipped questions (once a day, logs
  them, runs harvest), sweeps every DEV repo for loose ends, checks memory capture, updates
  STATUS and the handoff, commits and pushes, then says clear to sign off or what is still open.
  Use when Eric is wrapping up or signing off, or asks about loose ends. Do not use at session
  start (use startup) or for an automation health check (use claude-stack-doctor).
---

# Closeout

One command for the end-of-day sequence: day log → loose ends → memory → STATUS and handoff → commit and push → one verdict.

Step 0 asks Eric one question at most. After his answer (or when Step 0 is skipped), run every
other step without pausing: invoking closeout authorizes the whole sequence. Commit and push is
standing-authorized for every DEV repo (each repo's `AGENTS.md` Session routine ends with it, and
unpushed work on one machine is the top cause of conflicts on the other). On Windows or in Cowork,
read [`PLATFORMS.md`](PLATFORMS.md) for the commands that differ.

**Scope.** Every DEV repo with uncommitted or unpushed work (touched this session or not), plus
`~/.claude` (dotclaude), `~/.claude/skills` (claude-skills) and `~/.claude/global-memory`.
A repo whose `CLAUDE.md` says its data stays local (DexaProject is the precedent) is committed,
not pushed, and listed.

**Clear to sign off when** the closing `where-was-i.py --sweep` (step 4) shows no `ACTION` line
except repos listed under "Still open" with their reason, no background job is still writing,
`.errors.log` is empty or its entries are reported, and every repo touched today has a STATUS entry
dated today with a concrete first `## Next` item, and every `card-check` gap is fixed. Questions
only Eric can answer (a receiver nobody named, a decision recorded under `## Open questions`) do
not block: `/startup` shows them tomorrow; list them under "Still open" and say "Clear to sign off".
Anything short of that: "Not clear", naming the one thing blocking.

If a check fails and the fix is quick and safe (restage a file, clear a stale lock), fix it and
note it. A risky fix goes under "Still open".

## Step 0 — Day log (once a day)

Closeout is the one end-of-day step Eric keeps, so it carries the two inputs the biweekly
`status-report` trusts: the supervisor log and the shipped ledger. Before 2026-10-31 they lived
only in `interview-me` and `harvest`, and both lapsed (last log 09-14, last ledger row 10-06).

`{vault_status_log}` is `vault_status_log` in `~/.claude/skills/_shared/config.<platform>.json`.
Skip this step when `{vault_status_log}/<today>.md` or `{vault_status_log}/.asked-<today>` exists:
today's log is already taken.

1. **Ship candidates.** Read today's dated `## Current state` lines in every repo touched today
   (the sweep in Step 1 lists them; `landed.py show --days 1` also works). A candidate is work
   handed to a person or put in use: sent, delivered, shared, presented, merged for a user, live.
   Drop any project that already has a row dated today in the ledger (`{vault_output_ledger}`).
2. **Ask once**, all at once, short answers accepted: the three Part 0 questions from
   `interview-me/SKILL.md` (that file holds their wording), plus:
   > 4. Did anything ship or go to someone today? I found: <candidates, or "nothing">.
3. **Write the log** exactly as `interview-me` Part 0 says (output format, honest-zero rule,
   append to an existing file). On an honest zero, write the empty marker
   `{vault_status_log}/.asked-<today>` instead, so the next closeout today skips the ask.
4. **Each confirmed ship:** run the `harvest` skill for it. Eric's yes is the ship evidence harvest
   Step 1 needs; the ledger row is the required part, lesson articles only when harvest finds them.

**Done when** the log file or the marker exists for today and every confirmed ship has a ledger
row dated today.

## Step 1 — Sweep

- **Repo sweep:** `python3 ~/.claude/scripts/where-was-i.py --sweep` (~4 s). It checks every git
  repo under `DEV/` (two levels) and the three config repos, and prints one line per repo needing
  attention; exit 1 means at least one `ACTION`. Another session, harness or machine may have left
  that work; name each such repo in the report. Flags:
  - `DIRTY`, `UNPUSHED`, `NO-UPSTREAM`, `BRANCH-AHEAD:<b>`, `BRANCH-UNPUSHED:<b>` (a local branch
    holding commits on no remote), `WORKTREE-DIRTY:<path>`: work not on GitHub. Step 4 pushes it.
  - `NOT-A-REPO`: a `.git` folder git cannot use, so the folder's work is tracked nowhere. List it;
    repair is project work, not closeout. It blocks only if this session wrote files there.
  - Info, never blocking: `STASH:<n>` (list it; leave the stash alone), `NO-REMOTE`, `DETACHED`
    (a pinned checkout), `LIVE` (session files the hooks rewrite every turn; the daily backup
    pushes them).
- **Background jobs** still running (shells, agents, workflows): wait for each to finish, or name
  it as the blocker. A job that writes after the push leaves work unpushed.
- **Registry drift:** `python3 <dir of portfolio_json>/portfolio.py crosswalk` (`portfolio_json` is
  in `~/.claude/skills/_shared/config.macos.json`). It only reports. List every item under "Still
  open", any folder created this session first (a project started without a row). Fixing waits
  for a project session. `drive_unreachable` means the Drive checks never ran: say so.
- **7-day rule:** `python3 <dir of portfolio_json>/portfolio.py seven-day --apply`. Name every
  project it paused, and any on its last two days, under "Still open" with what it needs (a
  receiver, a first step).
- Unfinished tasks from this session (TaskList), and anything promised to Eric this session and
  not delivered.

## Step 2 — Memory

Memory capture failing silently is Eric's top recurring worry; this step runs every time.

- **`~/.claude/global-memory/transcripts/.errors.log`:** surface every entry, fix the hook issue if
  obvious, then archive and clear it as in claude-stack-doctor's `FIXES.md` → Memory pipeline
  (append to `.errors-ledger.log`, then `cp /dev/null`). The file is tracked in `global-memory`,
  so this happens before step 4's push.
- **Today's transcript** `~/.claude/global-memory/transcripts/<today>.md` exists and changed within
  the last few hours.
- **New durable decision or active thread:** update `~/.claude/global-memory/MEMORY.md`
  (2,500-char cap; consolidate first) or write a Tier A memory with the `memory-write` skill.
- **Tier A stays on this machine** (its slug is built from the absolute path, which differs per
  machine). Every durable, project-scoped Tier A fact written today also goes into the repo:
  `docs/STATUS.md` for current state, `docs/DECISIONS.md` for a decision and its reason, the dated
  handoff for detail.

## Step 3 — STATUS, handoff, cards

**Handoff**, when real work happened (not just Q&A): `<repo>/docs/handoffs/<YYYY-MM-DD>-<slug>.md`;
workspace or system work with no single repo goes to `~/DEV/docs/handoffs/`
(`~/.claude/global-memory/handoffs/` is read-only history). Plain markdown that Codex,
Antigravity or a fresh Claude session can resume from:
- what was worked on and why
- decisions made, with the reasoning that would be lost
- exact paths of every file created or modified
- next actions, most important first
- anything mid-flight (open questions, awaited inputs)
- suggested skills: which ones the next session should invoke, by name

Link, don't copy: if a spec, plan, ADR, issue or commit already holds the detail, give its
path, URL or sha. Redact keys, passwords and personal data; the note is pushed to GitHub.

**`docs/STATUS.md`, in every repo touched, every time.** The next session reads it first, on
either machine, in any harness. Rewrite these sections in place, short:
- `## Current state`: two to five lines on where things stand today.
- `## Next`: most important first. Item 1 is one concrete action (a command to run or a file to
  open); `~/.claude/scripts/where-was-i.py` shows it to Eric the next morning.
- `## Open questions`: each decision waiting on Eric as its own top-level bullet, the question and
  enough context to answer it without opening another file. `/startup` lists this section across
  repos, so write the question itself, never a pointer. Mark answered items `ANSWERED <date>: …`
  or strike them (`~~…~~`). Leave the section empty when nothing waits.
- `## Gotchas`: anything that will bite the next session.

Over 20 KB, or more than 15 dated entries under `## Current state`: first move entries older than
14 days and finished `## Next` items, verbatim, to the end of
`docs/handoffs/STATUS-archive-<YYYY>-Q<n>.md`. The archive is a search root; entries move, they
are never deleted.

Then:
1. `python3 ~/.claude/scripts/where-was-i.py --decisions --days 1` prints what tomorrow's
   `/startup` shows as "Decisions waiting on you". Every decision left open today appears there as
   a readable question; fix the repo's `## Open questions` until it does.
2. `python3 <dir of portfolio_json>/landed.py scan --days 1` (~1 min), then
   `python3 <dir of portfolio_json>/portfolio.py card-check`. Fix every gap with
   [`CARDS.md`](CARDS.md), then re-run `card-check`.
3. `bash ~/.claude/scripts/harvest-dev-docs.sh`: copies every repo's `docs/*.md` into
   `~/.claude/global-memory/dev-docs/` (gitignored, indexed by memsearch). One line of output.
4. **Deliverables:** a finished file made for someone else today (PDF, deck, report, sheet) gets a
   copy in Drive `03_REPORTS`, uploaded through the API (writes through the `_DRIVE` mount hang):
   `cd <file's folder> && gws drive +upload ./<file> --parent 18lZZ4ep4pmK6upQfEcTUuLNlDdSAk5Au --name YYYY-MM-DD_<Sport>_<Topic>_<Type>_<Audience>.<ext>`.
   The repo keeps the source. Health data stays local.

## Step 4 — Commit and push

- **Registry edits first, alone.** In project-triage, if `git status --porcelain portfolio.json`
  shows a change, commit that file alone as `data: board edits <YYYY-MM-DD>`. The board's "N
  unpushed registry edits" counts these; folded into another commit, they become a JSON merge
  conflict when the other machine edits too.
- **Before staging,** read the files about to be added (`git status --porcelain`). Anything the
  `BLOCKED` list in `~/.claude/hooks/session-autopush.js` names (`.env`, keys, credentials,
  secrets, token files, databases, DEXA) or over 50 MB stays out: add it to `.gitignore`, or leave
  it unstaged and list it. Health data never reaches GitHub.
- Every repo in scope: stage, commit with a descriptive message, `git pull --no-rebase`, push. On
  a merge conflict follow `dev-sync/SKILL.md` Step 3.3 (the one home for conflict steps), push, and
  list the file under "Still open". A side branch the sweep flagged: `git push -u origin <branch>`.
- `~/.claude/mods` changed this session: `bash ~/.claude/mods/mods-sync.sh`; list any invalid mod.
- **`global-memory` is pushed every time,** even on a light session: it is the only repo that
  carries memory to the other machine, and the nightly backup is too late for a same-day switch.
- Nothing to commit: one line, move on.
- **Prove it:** re-run `python3 ~/.claude/scripts/where-was-i.py --sweep`. Every `ACTION` line left
  is either fixed now or goes under "Still open" with its reason. A push that hangs is usually a
  credential prompt: look for `git credential-osxkeychain get` in `ps`; fix and retry once, as
  `~/.claude/projects/-Users-kristinarash-DEV/memory/project_brew-git-keychain-hang.md` says.
  Still hanging: "Not clear", that repo is the blocker.

## Step 5 — Verdict

`python3 <dir of portfolio_json>/landed.py show --days 1` lists every file that landed today (git in
every DEV repo, file times on Drive and in the vault), so the report names every created or
modified file with its full path. The ledger lives in `~/.claude/global-memory/landed/` and was
pushed in step 4.

```
## Closeout — <date>

**Day log:** written / honest zero / already taken today; **Shipped:** <ledger rows added, or "none">
**Committed & pushed:** <repos + one-line summary, or "nothing to commit">
**STATUS.md:** updated in <repos>
**Memory:** captured ✓ / issue found: <what> / skipped: <what> (Cowork)
**Handoff:** <path, or "not needed — no substantive work">
**Registry drift:** <N items, or "none">
**Still open:** <numbered list, or "none">

Clear to sign off. / Not clear: <the one thing blocking>.

**Landed:** <landed.py show output, grouped by project>
**Cards:** <card-check output after the step 3 fixes>
```

The block above the verdict line fits on one screen: Eric is leaving. Landed and Cards come last
because the next session picks up from them; trim both to projects with work today, keeping every
card that still has a gap.
---
name: status-report
description: >-
  Build the every-two-weeks Applied Performance status report for Kenny Boyd and Chris
  Ruf — paste-ready email, one-page PDF, internal record. Use when the user says
  "/status-report", "build my status report", "time for the Chris report", "biweekly
  update", "status update for Chris and Kenny", "what do I send Chris this week", or
  when a scheduled report date arrives. Do not use for a single meeting brief (use
  meeting-prep) or the end-of-day supervisor log interview (use interview-me).
---

# Status Report

Produce the recurring Applied Performance status report — an email to **Kenny Boyd and
Chris Ruf**, both addressed directly ("Kenny, Coach Ruf,"), every two weeks, ~270 words.

Governed by **KR 4.1** in `Applied-Performance-OKRs-2026-27.md` (v3). Read that KR as a
**content checklist** — shipped work, work in flight, decisions needed, anything at risk,
what's next — not as a layout. Eric's real reports run as flat prose with no section
headers. See **Voice** below; match it.

**Primary job: alignment.** Chris and Kenny finish the email knowing what moved, what
needs them, and what's at risk. **Secondary job: credit** — visible involvement across
sports beyond football and basketball. That secondary job is why the report was asked
for; do not let it slip out of the output.

**Design target: under 5 minutes of the user's time.** The machine does the recall. The
interview spends the user's attention only on what no system can know.

## Paths

Read `~/.claude/skills/_shared/config.<platform>.json` for all paths — never hardcode. Keys used
here: `vault_root`, `vault_inbox_meetings`, `vault_output_ledger`,
`vault_status_reports`, `vault_status_log`, `portfolio_json`, `okr_doc`, `okr_scoreboard`,
`okr_tracker_dir`, `utilization_brief`, `canonical_projects`, `fireflies_cli`.

Template: `{vault_root}/Templates/status-report.md`
Output dir: `{vault_status_reports}`

> Each machine has its own config: `config.windows.json` holds `C:\Users\eric_rash\...`
> paths (correct on Windows), `config.macos.json` holds `/Users/kristinarash/...` paths.
> Read the one for the machine you are on. If its values point at the *other* machine's
> layout, or `vault_root` does not exist, stop and fix the config first — every skill that
> trusts it is broken until you do. (Until 2026-08-11 a single config held stale Windows
> paths; the split per-platform configs replaced it.)

## Relationship to other skills

- **`weekly-review` is not a prerequisite.** Never require it to have run. If review
  files exist in `Inbox/weekly-review/` for the period, read them as a bonus input; if
  they don't, proceed without comment. The report builds from primary sources so it
  cannot inherit another ritual's failure rate.
- **`meeting-sync`** may be invoked to freshen the meeting corpus, but a sync failure is
  **not** a hard stop here — fall back to `fireflies-pp-cli digest` live, and note in the
  internal record that the vault copy was stale.
- **`html-to-pdf`** renders the one-pager.

---

## Step 1 — Establish the period

Read the newest file in `{vault_status_reports}`. Period start = the previous report's
`period_end`; period end = today. If no prior report exists, period start = 14 days ago.

**Count sends.** KR 4.1's target is "≥3 **sent** by Aug 31," and writing a file is not
sending it. Count files in `{vault_status_reports}` with `sent: true` in frontmatter —
that is the real number. Report progress toward ≥3 in Step 8. If files exist with
`sent: false` older than a week, ask whether they actually went out; an uncounted send
is as bad for the KR as a missed one.

A missed send widens the period rather than skipping it. Never leave a gap in the
archive — the archive's continuity is what makes it usable as a time record.

**Cadence is settled: every two weeks.** Eric committed to it in writing in the first
report — "Starting these updates every two weeks." Report 1 went out **2026-08-24**, so
sends land on even fortnights from there (2026-09-07, 09-21, 10-05, …). The earlier
"twice monthly, 1st and 3rd Friday" plan was an assistant assumption and is retired.

## Step 2 — Pull (no user involvement)

### Step 2a — Preflight the meeting source

Run `{fireflies_cli} transcripts list --agent --data-source live 2>&1 | head -5` first.

**Fixed 2026-08-11** — the key is in `~/.zshrc` and the local mirror was rebuilt with
`fireflies-pp-cli sync`; as of 2026-08-13 the key is visible to the Bash tool directly.
The DB lives at `~/.local/share/fireflies-pp-cli/data.db`, not `~/.fireflies-pp-cli/`.

If it fails again, `unable to open database file: out of memory (14)` means the mirror is
**missing, not corrupt** — run `sync` before anything else. Then:

- **Do not hard-stop.** `meeting-sync` hard-stops on auth failure; this skill must not,
  or it inherits the outage that already lapsed `weekly-review`.
- **Fall back** to reading `{vault_inbox_meetings}/*.md` filtered to the period by the
  `YYYY-MM-DD_` filename prefix. These files have **no YAML frontmatter** — parse the
  prepended header block (`## Key topics`, `## Decisions`, `## Action items`) and the
  Fireflies export sections (`## Summary`, `### Overview`, `### Action Items`).
- **Check staleness and say so.** Compare the newest meeting file's date to today. If
  the gap is >2 days, tell the user plainly in Step 8: *"Meeting data is stale through
  {DATE}; anything after that came only from the interview."* A silently incomplete
  report is worse than a flagged one — the user is about to send it to a supervisor.
- Record the degraded source in the internal record's frontmatter.

### Step 2b — Pull

Run these in parallel. Never ask the user for anything obtainable here.

1. **Meetings** — `{fireflies_cli} digest --since <N>d --processed-only --agent`
   (flags verified valid; `--since` accepts `7d`/`24h` form). Gives titles, gists,
   topics, and action items in one call. Cross-check against `{vault_inbox_meetings}`.
   On failure, use the 2a fallback.
1b. **Supervisor logs — read these before anything else.** Every file in
   `{vault_status_log}` whose `YYYY-MM-DD.md` filename falls inside the period. These are
   written by `closeout` Step 0 (or `interview-me` Part 0) and they are the **highest-value source in
   this step**: they cover equipment, installs, hallway conversations, and follow-ups
   awaiting a reply — the operational two thirds that appears in no other source. Merge
   the three sections (`## Equipment & installs`, `## People & conversations`,
   `## Waiting on / risks`) across the period and union every `sports:` array for the
   coverage panel.

   Treat the wording as the user's own and preserve it. **Count the logged days** —
   `logged / days-in-period` gets reported in Step 8. A thin count is not a reason to
   pad; it is the number that tells the user the nightly ritual lapsed.

   Zero logs is normal for now and is **never** a hard stop — the ritual started
   2026-09-07 and the report predates it. Fall back to a full Step 4 interview.

2. **Commitments** — `{fireflies_cli} action-items list --from <N> --agent`
   (`--from` takes an integer number of days). Flag anything open >14 days; those are
   risk-section candidates. On failure, parse `## Action items` blocks from the vault
   meeting files instead.

   **Known broken as of 2026-09-07:** this command exits 0 and returns an array of empty
   `{}` objects — a serialization bug, not an empty result. Do not read it as "no open
   commitments." The digest in item 1 carries action items inline; use those and record
   the degraded source in the internal record.
3. **Shipped artifacts** — read `{vault_output_ledger}`, newest first, entries within
   the period. **This is the only source for the "Shipped" section.**

   Format is a markdown table, newest first, data rows starting at line 22:
   `| Shipped | Artifact | What it is | Harvest |` where *Shipped* is `YYYY-MM-DD`,
   *Artifact* is the short name, *What it is* is a dense paragraph, and *Harvest* holds
   `[[wikilinks]]` or is empty. Match rows with `^\| 2\d{3}-\d{2}-\d{2}` and filter by
   date. Compress *What it is* to one clause for the email — those paragraphs run long
   and will blow the 300-word ceiling if pasted whole.
4. **Project movement** — read `{portfolio_json}`, filter `lane == "job"`. Use `stage`,
   `next_action`, and `updates[]` for the *In Progress* section only.
5. **KR state** — read `{okr_doc}` (v3, 14 KRs). This is the **only** trustworthy KR
   source. Two others will lie to you:

   - **Never read the cadence doc's KR table** — superseded v2 set of 9.
   - **Do not trust `{okr_scoreboard}` for confidence values.** It was generated
     2026-06-12 against the retired *quarterly, 3-objective* set and scores KRs that no
     longer exist; v3's fourth objective (Leadership & Visibility) isn't in it at all.
     Its `Conf` decimals are real numbers attached to dead targets. If it still predates
     the v3 restructure (2026-07-17), tell the user it needs regenerating — `okrs.yaml`
     is the source of truth, `okr.py` regenerates `SCOREBOARD.md` and `okrs.json` — and
     report KR status from `{okr_doc}` alone in the meantime.

6. **Sport roster** — the 17-program list for the coverage panel comes from
   `{utilization_brief}` §"Recommendations by program" (15 rows; the two XC / Track &
   Field rows each bundle two programs). Never re-derive this list from memory. Note it
   is *prescriptive* — what each program could use — not a record of current activity,
   which is exactly why the coverage panel is worth publishing.
7. **Canonical spine** — read `Applied-Performance-Active-Projects.md` for the confirmed
   active list, each project's sport and KR mapping.
8. **Optional** — `Inbox/weekly-review/*.md` within the period, if any exist.

### Hard rule: "Shipped" comes from the ledger, never from portfolio stage

`portfolio.json` marks projects `stage: shipped` that still have stakeholder sign-off
outstanding — Sport_Tech_Vetting is currently `shipped` while KR 1.2 shows Chris's
sign-off pending. Reporting that as shipped tells the user's supervisor that a thing he
never approved is done. **Only `_ledger.md` entries qualify as Shipped.** Portfolio
stage feeds *In Progress*.

## Voice — match the real thing, not the spec

**Read `{vault_status_reports}/2026-08-24-email-sent.txt` before drafting.** That is the
first report Eric actually sent. It is the reference for how he writes; this skill's
earlier draft was never sent and should not be imitated.

What his email actually does:

- **No section headers.** Flat short paragraphs, one topic each, no Shipped / In Progress
  / Decisions Needed labels. Do not impose the KR 4.1 headers on his prose — they are the
  *content checklist*, not the layout. Make sure each of the five things is covered
  somewhere; do not label them.
- **One framing line up top**, then straight into it. No preamble.
- **"We" for department work, "I" for his own actions.** He writes as the unit.
- **Concrete and operational.** Equipment, buildings, people, dates: Perch cameras at
  Fudge, FirstBeat monitors replacing Polar, survey cutoff August 28th. Names people
  freely — Linda, Noah, AJ, Javi, Micah.
- **Asks come last and land soft:** "One ask I wanted to run past you both is whether…"
  Do **not** convert these into "need Chris by Aug 31." That register is more forceful
  than he writes and it will read as someone else's words.
- **Stalled things get passed along, not escalated:** "still haven't heard back. Passing
  that along in case a nudge is warranted."
- **About 270 words. No attachment.** The memo PDF exists for when something needs to be
  handed across a table; the ordinary cycle is email only.

### The sourcing gap this exposed — important

Almost nothing in his real report appears in `portfolio.json` or `_ledger.md`: survey
response rates, camera installs at three buildings, heart-rate monitors arriving for
tennis, staff meeting cadence, a stalled email to Micah. Those sources track his
**building** work. He reports his **departmental operations**.

So the auto-pull covers maybe a third of what belongs in the report. **Weight the
interview accordingly** — ask about equipment, deliveries, installs, staffing, meetings
held, and follow-ups awaiting a reply, not just what moved in the registry. Treat a draft
built only from automated sources as roughly one-third finished.

## Step 3 — Draft before asking

Write a complete draft of all five sections from the pull. Cut to **5–6 projects with
real motion** — never a 14-line roster. Projects that didn't move go to the internal
record and, if relevant, the sport coverage panel.

Tag every Shipped and In Progress line with a sport: *(Volleyball)*, *(Football)*,
*(Soccer)*, *(Dept-wide)*, *(Cross-sport)*.

Then identify the gaps — that is what the interview is for.

## Step 4 — Interview the gaps only

Ask in **one batch**, not serially. Keep it to what the pull genuinely couldn't answer.
Lead with targeted gap questions, then the four standing ones.

**Targeted** (generated from the pull, examples):
- "Three meetings Tuesday–Thursday have no notes. Anything from them that Chris needs?"
- "Ledger shows nothing shipped this period — is that right, or did something go out
  that never got logged?"
- "Kinexon_Volleyball hasn't moved in the registry since July. Stalled, or just not
  logged?"

**Skip every standing question the supervisor logs already answered.** If
`{vault_status_log}` covered the period, questions 1–4 below are largely pre-filled —
read the merged log back to the user as a list and ask only *"anything missing?"* plus
questions 5–8. Re-asking what the user already typed at 9pm is how the nightly ritual
gets abandoned; the payoff for logging has to be a visibly shorter interview.

**Standing** (every time). The first three carry most of the report — they cover the
operational half no automated source sees:

1. **Equipment, installs, deliveries.** What arrived, what got installed where, what's
   being phased out, who's onboarding onto it. Eric's real reports lead with this
   (Perch cameras at Fudge, FirstBeat monitors replacing Polar for tennis).
2. **Meetings held and staffing.** Who he met with, what came out of it, changes to
   cadence or who attends. Names matter — Linda, Noah, AJ, Javi.
3. **Conversations no transcript caught** — hallway, text, sideline, phone. Invisible to
   every automated source, and among the highest-value things this interview captures.
4. **Anything waiting on someone else.** Unanswered emails, pending approvals, stalled
   follow-ups. These become the soft "passing that along" lines at the end.
5. **Anything about to go sideways** that Chris and Kenny should hear from him first.
   *(Push here. An always-empty risk line means it isn't being used honestly.)*
6. **Any ask** — time at a meeting, a decision, a nudge. Phrased softly, at the end.
7. **Ideas generated** — worth parking, pitching, or building?
8. **What's next** for the coming two weeks.

Also ask, if the pull shows thin coverage: *"Any sport you touched this period that
isn't showing up in my sources?"* Non-revenue involvement is the whole point and it is
the most likely thing to be undercounted.

## Step 5 — Assemble and check

Fill the template at `{vault_root}/Templates/status-report.md`.

Run every check before showing the user anything:

- [ ] **Email body is under 300 words.** Count it. State the count. Over the ceiling,
      cut — do not negotiate with yourself.
- [ ] **Every Shipped line traces to a `_ledger.md` entry.** No exceptions.
- [ ] **No endorsement claimed that doesn't exist.** If sign-off is pending, "our
      standard intake process," never "the approved process."
- [ ] **Every Shipped and In Progress line carries a sport tag.**
- [ ] **Every Decisions Needed item names a person and a date.** No owner or no date
      means it isn't a decision request — rewrite or cut it.
- [ ] **Jargon table enforced.** No CMJ, ACWR, asymmetry index, unexplained B.A.I.R.
- [ ] **Department names.** Athletic Performance (not strength and conditioning / S&C),
      Athletic Medicine (not sports medicine), Applied Performance (not sport science).
- [ ] **Never "one unified dashboard."** The line is "standardized underneath, bespoke
      on top."
- [ ] **Research presented as research** — no readiness or deployment claims.
- [ ] **Risks section is non-empty** unless the user explicitly confirmed there's
      nothing. Ask once more before letting it go empty.
- [ ] **Repeat check:** any Decisions Needed item carried over from the previous report
      gets flagged to the user — two unanswered asks means the email has failed at it
      and it needs raising in person.
- [ ] **Email and PDF agree.** The two are filled separately, so verify it: every
      Shipped, In Progress, Decisions Needed, and Risks item in the email appears in the
      PDF. The PDF may carry *more* detail — it must never carry different facts, a
      different sport tag, or a different date. Sending a supervisor two versions of the
      same report is the failure this check exists to prevent.
- [ ] **Sport coverage panel is not padded.** Untouched sports stay marked untouched. A
      thin panel is real information; a padded one destroys the evidentiary value of
      every honest panel before and after it.

**Loop until clean.** Any failed box: fix the draft, then run the whole list again from
the top — a cut for word count can drop a sport tag or the only risk line. Show the user
the draft only after one full pass with every box ticked.

## Step 6 — Emit

Produce three things:

1. **`{vault_status_reports}/YYYY-MM-DD-status.md`** — the internal record, full Layer 3
   structure from the template: email as sent, meetings held, conversations, ideas, full
   roster, KR ledger, and the "Not for the report" candid section.
2. **`{vault_status_reports}/YYYY-MM-DD-onepager.pdf`** — render
   `assets/one-pager.html` with the period's content. One page, always.

   **It is a printed memorandum, not a dashboard.** Single column, one serif family,
   letterspaced small-cap section heads, one green hairline. Never reintroduce status
   dots, badge or pill rows, bolded stat lines, progress bars, or a two-column grid —
   that vocabulary is what made the first version read as generated.

   **Measure before shipping**, don't eyeball it. Budget is **950px of content at 666px
   width**:

   Same script on both machines (`python3` on the Mac, `python` on Windows); it finds
   Chrome and the temp folder itself:

   ```python
   import pathlib, platform, re, subprocess, sys, tempfile
   html = pathlib.Path(sys.argv[1])            # the one-pager .html
   chrome = {"Darwin": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
             "Windows": r"C:\Program Files\Google\Chrome\Application\chrome.exe"}[platform.system()]
   probe = pathlib.Path(tempfile.gettempdir()) / "probe.html"
   probe.write_text(html.read_text(encoding="utf-8").replace("</body>",
       '<script>window.addEventListener("load",()=>{document.title='
       '"H:"+Math.round(document.body.getBoundingClientRect().height)})</script></body>'),
       encoding="utf-8")
   dom = subprocess.run([chrome, "--headless", "--disable-gpu", "--virtual-time-budget=3000",
                         "--window-size=666,1200", "--dump-dom", probe.as_uri()],
                        capture_output=True, text=True, encoding="utf-8",
                        errors="replace").stdout   # Windows Python defaults to cp1252
   print(re.search(r"<title>H:(\d+)", dom).group(1), "px (budget 950)")
   ```

   Then render with the same `chrome`: `--headless --disable-gpu --no-pdf-header-footer
   --print-to-pdf=<out> <html file URI>` (or the `html-to-pdf` skill on Windows).
   Over 950px, **cut prose** — never drop below 9.6pt. This gets printed and read by
   people who will not squint for you.
3. **`{vault_status_reports}/YYYY-MM-DD-email.txt`** — the email body as **plain text**,
   the file the user actually touches each cycle. Strip all markdown: no `**bold**`, no
   `-` bullets rendered as syntax. Use `•` or plain indentation, and spell section
   headers in caps (`SHIPPED`, `IN PROGRESS`). Outlook's compose window pastes markdown
   asterisks literally, and a supervisor email full of `**` reads as carelessness.
   Select-all-copy from this file should produce something sendable with zero cleanup.
4. **Also print the email text in the response** so the user can read it without opening
   a file — but the `.txt` is the artifact of record for sending.

### Do not send

The connected Gmail account is the user's **personal** address
(`eric.rash11@gmail.com`), not Baylor. Do not create Gmail drafts — they would land in
the wrong mailbox. The user sends from Outlook on the work account.

Never send a report to a supervisor without the user reading it first, under any
circumstance.

## Step 7 — Log

- Append shipped artifacts to `{vault_output_ledger}` if the interview surfaced any that
  weren't logged.
- Update `Applied-Performance-Active-Projects.md` with confirmed status, sport, and KR
  mapping — this keeps the canonical spine current as a byproduct rather than a chore.
- Add an `updates[]` entry to `{portfolio_json}` for each project reported as moved, via
  the `project` skill, so the registry stops being empty.
- Set `sent: false` in the internal record. The user flips it after sending.

## Step 8 — Report to the user

State: word count, report number, next send date, which sports appeared, anything the
checks flagged, and where the three files landed.

Also state **`N of D` days logged** in `{vault_status_log}` for the period. Say it
plainly and without nagging — the number is the nudge. When the count is low, say what it
cost: *"6 of 14 days logged, so the interview had to cover the other 8 from memory."*

**Propose a rule when one was missing.** If this run hit a problem no Step 5 box covers —
caught by you, or by Eric editing the draft before sending — end with one proposed new
checklist line and the reason. Add it to Step 5 only on Eric's yes; the next report is
then checked against it.

---

## Failure modes to design against

**Padding.** A thin period is a legitimate output. "Nothing shipped this period" is an
honest line that protects the word "shipped" everywhere else. Inflating a quiet period
is the fastest way to make the report worthless — and to make the time documentation
inadmissible when it matters.

**Roster creep.** The email is not a project list. 14 status lines reads as 14 things
half-done. Five moving projects reads as focus.

**The credit goal quietly disappearing.** The report exists so non-football,
non-basketball involvement becomes visible. If a period's coverage panel is thin, that
is real information and it should be shown, not hidden — a padded panel destroys the
evidentiary value of every honest one.

**Depending on another ritual.** `weekly-review` lapsed for seven weeks earlier this
year. This report must never require it.

hook: PostToolUse
 succeeded in 1053ms:
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

hook: PostToolUse
 succeeded in 1085ms:
usage: portfolio.py [-h]
                    {add-idea,add-update,set-stage,slate-check,week-report,crosswalk,seven-day,card-check,sweep,sweep-decide,set-status,set-receiver,mark-done} ...

positional arguments:
  {add-idea,add-update,set-stage,slate-check,week-report,crosswalk,seven-day,card-check,sweep,sweep-decide,set-status,set-receiver,mark-done}
    crosswalk           report drift between registry, DEV and Drive
    seven-day           7-day rule: report, or --apply to pause expired starts
    card-check          closeout: resume card + gaps for every project touched
                        since a date
    sweep               Friday sweep: paused rows untouched 30+ days, oldest
                        first
    sweep-decide        revive / keep (parked 90 days) / archive a swept row
    set-status          start / park / finish a project (slate cap + 7-day
                        clock, same as the board)
    set-receiver        name who a project is for

options:
  -h, --help            show this help message and exit

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
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc 'python3 ~/DEV/project-triage/portfolio.py --help; python3 ~/DEV/project-triage/portfolio.py add-update --help' in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc "rg -n 'portfolio_json|python|\"projects\"|\"status\"' ~/.claude/skills/_shared/config.macos.json ~/DEV/project-triage/portfolio.py ~/DEV/project-triage/portfolio.json | head -45" in /Users/kristinarash/.claude/skills
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc "nl -ba interview-me/SKILL.md | sed -n '1,115p'; nl -ba interview-me/SOURCES.md" in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc "rg -n -C 4 'asked|status-log|Step 0' ~/.claude/skills/closeout/SKILL.md ~/.claude/skills/status-report/SKILL.md" in /Users/kristinarash/.claude/skills
 succeeded in 488ms:
     1	---
     2	name: interview-me
     3	description: "End-of-workday interview in three parts: a 90-second supervisor log of operational facts (equipment, people, blockers) for the biweekly status report, a project update that logs what moved on each active project, then four reflection questions distilled into atomic SecondBrain notes. Use when the user types `/interview-me`, says \"interview me\", \"let's debrief\", \"end of day interview\", \"process my day\", \"wrap up today\", \"log my day\", or asks to capture their workday. Do not use for building the biweekly report itself (use status-report)."
     4	---
     5	
     6	# Interview Me
     7	
     8	End-of-workday synthesis ritual. The user is a sport-science / performance analyst who writes essays connecting sport science, product strategy, and decision-making. The interview's job is to extract publishable insights, not to record what happened.
     9	
    10	## Vault location
    11	
    12	Use `vault_root` from the selected platform config.
    13	
    14	**Paths:** canonical vault locations live in `~/.claude/skills/_shared/config.<platform>.json` — load it if unsure; if a literal path here ever disagrees, the config wins.
    15	
    16	- `Inbox/` — full transcripts (one per day)
    17	- `Notes/` — atomic permanent notes (one idea per file)
    18	- `Drafts/` — essays in progress
    19	- `Archive/` — published
    20	- `Templates/interview-note.md`, `Templates/permanent-note.md`
    21	- `{vault_status_log}` (`Inbox/status-log/`) — daily supervisor fact logs (Part 0).
    22	
    23	---
    24	
    25	## Part 0 — Supervisor log (90 seconds, ask first)
    26	
    27	**Three questions, asked before the reflection questions.** Facts are easier to recall
    28	than insight when the user is tired, and a hard 90-second opener is what makes the ritual
    29	survivable nightly. Reflection quality does not suffer from coming second; it suffers
    30	from the user never starting.
    31	
    32	This part exists because `status-report` — the biweekly email to the user's supervisors —
    33	has a sourcing gap: roughly two thirds of what belongs in that email (equipment arriving,
    34	installs, who onboarded onto what, hallway conversations, follow-ups awaiting a reply)
    35	appears in **no** automated source. Without a nightly log, the report has to reconstruct
    36	two weeks from memory. With one, it mostly writes itself.
    37	
    38	`closeout` Step 0 asks these same three questions once a day. When
    39	`{vault_status_log}/YYYY-MM-DD.md` or `{vault_status_log}/.asked-YYYY-MM-DD` exists for today,
    40	today's log is taken: go straight to Part 0b.
    41	
    42	Ask all three at once. Accept short answers; take each as given.
    43	
    44	> Quick log first, 90 seconds. Then the usual four.
    45	> 1. Anything arrive, get installed, or change hands today? Who's onboarding onto it?
    46	> 2. Who did you talk to that Kenny or Chris would want to know about? Names and sport.
    47	> 3. Waiting on anyone, or anything about to go sideways?
    48	
    49	**Honest zero rule.** If all three are genuinely "nothing", write the empty marker
    50	`{vault_status_log}/.asked-YYYY-MM-DD` instead of a log, so `closeout` skips its ask today. A day
    51	with no operational facts is a real day, and `status-report` trusts these entries verbatim.
    52	
    53	### Output — `{vault_status_log}/YYYY-MM-DD.md`
    54	
    55	```markdown
    56	---
    57	date: YYYY-MM-DD
    58	sports: [Football, Tennis]      # programs named in the answers; [] if none
    59	---
    60	
    61	## Equipment & installs
    62	- Perch cameras installed at Foster. Football onboarding this week.
    63	
    64	## People & conversations
    65	- Javi (Tennis) — FirstBeat onboarding, wants a one-pager for his staff.
    66	
    67	## Waiting on / risks
    68	- Micah, no reply since 8/17.
    69	```
    70	
    71	Use the user's own words. Do not editorialize, rank, or add commentary — `status-report`
    72	does the judgement pass later, and it needs raw facts to judge.
    73	
    74	**Append, never overwrite.** If today's file exists (a second debrief, or a correction),
    75	add to the existing sections rather than replacing the file.
    76	
    77	Write the log **now**, before Part 0b, so a session cut short still leaves the report its facts.
    78	
    79	**Done when** the log file or the `.asked` marker exists for today.
    80	
    81	**This log never becomes a permanent note.** It is a fact record for one downstream
    82	consumer. Insight goes in `Notes/` via Part 1, which is why the skill's "NOT a journaling
    83	app" rule still holds.
    84	
    85	---
    86	
    87	## Part 0b — Project update (30 seconds, right after Part 0)
    88	
    89	`<portfolio.py>` is the `portfolio.py` beside `portfolio_json` in
    90	`~/.claude/skills/_shared/config.<platform>.json`; `<py>` is `python3` on the Mac and `python`
    91	on Windows. Take both from the config.
    92	
    93	1. List the active projects (the registry is the source; the project slate is retired):
    94	   `<py> -c "import json,sys,os;d=json.load(open(os.path.join(os.path.dirname(sys.argv[1]),'portfolio.json')));print(*[p['name'] for p in d['projects'] if p['status']=='active'],sep='\n')" <portfolio.py>`
    95	2. Ask once:
    96	   > Which project did you work on today, and what moved?
    97	3. Each project named: `<py> <portfolio.py> add-update <Name> "<what moved, in the user's words>"`.
    98	   Match names case-insensitively against the list; ask when two match. The command prints
    99	   `updated <Name>`; on `[error]`, show it verbatim and carry on.
   100	4. A stage change or a finished project goes through the `project` skill (`/project stage`,
   101	   `/project done`). A new idea goes through `/project idea`: it lands as a named card in the
   102	   board's Inbox.
   103	5. "None" is a real answer: write nothing.
   104	
   105	**Done when** each named project has its `updated <Name>` line, or the answer was "none".
   106	
   107	---
   108	
   109	## Part 1 — The interview
   110	
   111	**Time budget:** 10–15 minutes total including Part 0. If the user wants to keep talking, schedule a follow-up session — don't blow the budget.
   112	
   113	**Opening line (verbatim is fine):**
   114	> Now the four. Then I write up anything that earned its place.
   115	
     1	# Interview sources and memory bridge
     2	
     3	## Source pull-ins
     4	
     5	Offer when the user references them. Don't pull unprompted.
     6	
     7	- **Meeting referenced** ("today's call with X", "this morning's standup"):
     8	  → **First, check `Inbox/meetings/` for a local summary** — Glob for files matching the date or participant. If found, read and quote from the local file (free, fast, no API call).
     9	  → If not found locally, ask: *"Want me to pull from Fireflies?"* → invoke the `meeting-sync` skill to sync the latest meetings, then read the local file.
    10	  → Fall back to direct `pp-fireflies` only if `meeting-sync` reports nothing matching.
    11	- **Paper / article referenced:**
    12	  → "Want me to pull the source from Zotero?" → use `pp-zotero-research-library` skill.
    13	- **GPS / Catapult data referenced:**
    14	  → "Want me to pull the underlying metric?" → use `pp-catapult-openfield-connect` skill.
    15	
    16	Quote sources in the note's frontmatter `source:` field or the **Evidence / origin** section.
    17	
    18	## Memory bridge (when warranted)
    19	
    20	If the interview surfaces a **durable** fact about the user, their projects, or working style that should persist across Claude sessions:
    21	- Also write a Tier A memory file via the `memory-write` skill (it derives the correct project slug from the current working directory) or update USER.md / project_*.md as appropriate.
    22	- Tell the user explicitly: "Also saved this to memory as <name>."
    23	- Do NOT bridge ephemeral notes. Most permanent notes stay in the vault only.

 succeeded in 496ms:
/Users/kristinarash/.claude/skills/closeout/SKILL.md-11-# Closeout
/Users/kristinarash/.claude/skills/closeout/SKILL.md-12-
/Users/kristinarash/.claude/skills/closeout/SKILL.md-13-One command for the end-of-day sequence: day log → loose ends → memory → STATUS and handoff → commit and push → one verdict.
/Users/kristinarash/.claude/skills/closeout/SKILL.md-14-
/Users/kristinarash/.claude/skills/closeout/SKILL.md:15:Step 0 asks Eric one question at most. After his answer (or when Step 0 is skipped), run every
/Users/kristinarash/.claude/skills/closeout/SKILL.md-16-other step without pausing: invoking closeout authorizes the whole sequence. Commit and push is
/Users/kristinarash/.claude/skills/closeout/SKILL.md-17-standing-authorized for every DEV repo (each repo's `AGENTS.md` Session routine ends with it, and
/Users/kristinarash/.claude/skills/closeout/SKILL.md-18-unpushed work on one machine is the top cause of conflicts on the other). On Windows or in Cowork,
/Users/kristinarash/.claude/skills/closeout/SKILL.md-19-read [`PLATFORMS.md`](PLATFORMS.md) for the commands that differ.
--
/Users/kristinarash/.claude/skills/closeout/SKILL.md-33-
/Users/kristinarash/.claude/skills/closeout/SKILL.md-34-If a check fails and the fix is quick and safe (restage a file, clear a stale lock), fix it and
/Users/kristinarash/.claude/skills/closeout/SKILL.md-35-note it. A risky fix goes under "Still open".
/Users/kristinarash/.claude/skills/closeout/SKILL.md-36-
/Users/kristinarash/.claude/skills/closeout/SKILL.md:37:## Step 0 — Day log (once a day)
/Users/kristinarash/.claude/skills/closeout/SKILL.md-38-
/Users/kristinarash/.claude/skills/closeout/SKILL.md-39-Closeout is the one end-of-day step Eric keeps, so it carries the two inputs the biweekly
/Users/kristinarash/.claude/skills/closeout/SKILL.md-40-`status-report` trusts: the supervisor log and the shipped ledger. Before 2026-10-31 they lived
/Users/kristinarash/.claude/skills/closeout/SKILL.md-41-only in `interview-me` and `harvest`, and both lapsed (last log 09-14, last ledger row 10-06).
/Users/kristinarash/.claude/skills/closeout/SKILL.md-42-
/Users/kristinarash/.claude/skills/closeout/SKILL.md-43-`{vault_status_log}` is `vault_status_log` in `~/.claude/skills/_shared/config.<platform>.json`.
/Users/kristinarash/.claude/skills/closeout/SKILL.md:44:Skip this step when `{vault_status_log}/<today>.md` or `{vault_status_log}/.asked-<today>` exists:
/Users/kristinarash/.claude/skills/closeout/SKILL.md-45-today's log is already taken.
/Users/kristinarash/.claude/skills/closeout/SKILL.md-46-
/Users/kristinarash/.claude/skills/closeout/SKILL.md-47-1. **Ship candidates.** Read today's dated `## Current state` lines in every repo touched today
/Users/kristinarash/.claude/skills/closeout/SKILL.md-48-   (the sweep in Step 1 lists them; `landed.py show --days 1` also works). A candidate is work
--
/Users/kristinarash/.claude/skills/closeout/SKILL.md-52-   `interview-me/SKILL.md` (that file holds their wording), plus:
/Users/kristinarash/.claude/skills/closeout/SKILL.md-53-   > 4. Did anything ship or go to someone today? I found: <candidates, or "nothing">.
/Users/kristinarash/.claude/skills/closeout/SKILL.md-54-3. **Write the log** exactly as `interview-me` Part 0 says (output format, honest-zero rule,
/Users/kristinarash/.claude/skills/closeout/SKILL.md-55-   append to an existing file). On an honest zero, write the empty marker
/Users/kristinarash/.claude/skills/closeout/SKILL.md:56:   `{vault_status_log}/.asked-<today>` instead, so the next closeout today skips the ask.
/Users/kristinarash/.claude/skills/closeout/SKILL.md-57-4. **Each confirmed ship:** run the `harvest` skill for it. Eric's yes is the ship evidence harvest
/Users/kristinarash/.claude/skills/closeout/SKILL.md-58-   Step 1 needs; the ledger row is the required part, lesson articles only when harvest finds them.
/Users/kristinarash/.claude/skills/closeout/SKILL.md-59-
/Users/kristinarash/.claude/skills/closeout/SKILL.md-60-**Done when** the log file or the marker exists for today and every confirmed ship has a ledger
--
/Users/kristinarash/.claude/skills/status-report/SKILL.md-20-headers. See **Voice** below; match it.
/Users/kristinarash/.claude/skills/status-report/SKILL.md-21-
/Users/kristinarash/.claude/skills/status-report/SKILL.md-22-**Primary job: alignment.** Chris and Kenny finish the email knowing what moved, what
/Users/kristinarash/.claude/skills/status-report/SKILL.md-23-needs them, and what's at risk. **Secondary job: credit** — visible involvement across
/Users/kristinarash/.claude/skills/status-report/SKILL.md:24:sports beyond football and basketball. That secondary job is why the report was asked
/Users/kristinarash/.claude/skills/status-report/SKILL.md-25-for; do not let it slip out of the output.
/Users/kristinarash/.claude/skills/status-report/SKILL.md-26-
/Users/kristinarash/.claude/skills/status-report/SKILL.md-27-**Design target: under 5 minutes of the user's time.** The machine does the recall. The
/Users/kristinarash/.claude/skills/status-report/SKILL.md-28-interview spends the user's attention only on what no system can know.
--
/Users/kristinarash/.claude/skills/status-report/SKILL.md-110-   topics, and action items in one call. Cross-check against `{vault_inbox_meetings}`.
/Users/kristinarash/.claude/skills/status-report/SKILL.md-111-   On failure, use the 2a fallback.
/Users/kristinarash/.claude/skills/status-report/SKILL.md-112-1b. **Supervisor logs — read these before anything else.** Every file in
/Users/kristinarash/.claude/skills/status-report/SKILL.md-113-   `{vault_status_log}` whose `YYYY-MM-DD.md` filename falls inside the period. These are
/Users/kristinarash/.claude/skills/status-report/SKILL.md:114:   written by `closeout` Step 0 (or `interview-me` Part 0) and they are the **highest-value source in
/Users/kristinarash/.claude/skills/status-report/SKILL.md-115-   this step**: they cover equipment, installs, hallway conversations, and follow-ups
/Users/kristinarash/.claude/skills/status-report/SKILL.md-116-   awaiting a reply — the operational two thirds that appears in no other source. Merge
/Users/kristinarash/.claude/skills/status-report/SKILL.md-117-   the three sections (`## Equipment & installs`, `## People & conversations`,
/Users/kristinarash/.claude/skills/status-report/SKILL.md-118-   `## Waiting on / risks`) across the period and union every `sports:` array for the

 succeeded in 795ms:
/Users/kristinarash/.claude/skills/_shared/config.macos.json:15:  "portfolio_json": "/Users/kristinarash/DEV/project-triage/portfolio.json",
/Users/kristinarash/DEV/project-triage/portfolio.py:29:    return (p.get("lane") in RECEIVER_LANES and p.get("status") == "active"
/Users/kristinarash/DEV/project-triage/portfolio.py:51:    for key in ("meta", "projects", "ideas"):
/Users/kristinarash/DEV/project-triage/portfolio.py:55:    names = {p.get("name") for p in data.get("projects", [])}
/Users/kristinarash/DEV/project-triage/portfolio.py:56:    for p in data.get("projects", []):
/Users/kristinarash/DEV/project-triage/portfolio.py:64:        if p.get("status") not in PROJECT_STATUSES:
/Users/kristinarash/DEV/project-triage/portfolio.py:86:        if p.get("status") == "merged" and not parent:
/Users/kristinarash/DEV/project-triage/portfolio.py:100:        if p.get("status") == "active" and p.get("lane") in LANES and isinstance(p.get("rank"), int):
/Users/kristinarash/DEV/project-triage/portfolio.py:108:        if i.get("status") not in IDEA_STATUSES:
/Users/kristinarash/DEV/project-triage/portfolio.py:166:    taken = {r.get("name") for r in data.get("inbox", [])} | {p.get("name") for p in data.get("projects", [])}
/Users/kristinarash/DEV/project-triage/portfolio.py:186:        "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.py:195:    for p in data.get("projects", []):
/Users/kristinarash/DEV/project-triage/portfolio.py:210:    for p in data.get("projects", []):
/Users/kristinarash/DEV/project-triage/portfolio.py:236:        for p in data.get("projects", []):
/Users/kristinarash/DEV/project-triage/portfolio.py:330:    status_parser.add_argument("status", choices=sorted(PROJECT_STATUSES))
/Users/kristinarash/DEV/project-triage/portfolio.py:399:            for p in data["projects"]:
/Users/kristinarash/DEV/project-triage/portfolio.py:419:            rows = {p["name"]: p for p in data["projects"]}
/Users/kristinarash/DEV/project-triage/portfolio.json:81:  "projects": [
/Users/kristinarash/DEV/project-triage/portfolio.json:86:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:106:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:208:      "status": "merged",
/Users/kristinarash/DEV/project-triage/portfolio.json:247:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:270:      "status": "active",
/Users/kristinarash/DEV/project-triage/portfolio.json:344:      "status": "merged",
/Users/kristinarash/DEV/project-triage/portfolio.json:371:      "status": "archived",
/Users/kristinarash/DEV/project-triage/portfolio.json:397:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:421:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:446:      "status": "done",
/Users/kristinarash/DEV/project-triage/portfolio.json:473:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:500:      "status": "merged",
/Users/kristinarash/DEV/project-triage/portfolio.json:527:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:550:      "status": "merged",
/Users/kristinarash/DEV/project-triage/portfolio.json:573:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:593:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:608:      "status": "archived",
/Users/kristinarash/DEV/project-triage/portfolio.json:631:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:654:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:668:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:690:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:708:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:749:      "status": "archived",
/Users/kristinarash/DEV/project-triage/portfolio.json:777:      "status": "active",
/Users/kristinarash/DEV/project-triage/portfolio.json:810:      "status": "paused",
/Users/kristinarash/DEV/project-triage/portfolio.json:822:          "note": "Built three throwaway Excel prototypes from one shared mock roster (15 athletes, P/C/IF/OF) so only the layout differs: A = one printable page per athlete (15 tabs + clickable index), B = single sheet with a data-validation dropdown driving INDEX/MATCH (no macros), C = team board with autofilter, data bars and colour scales. Scoring placeholder: T-score vs team (50 = mean, 10 = 1 SD), four domains (Jump / Strength / Speed / Rotation) from CMJ jump height, CMJ mRSI, CMJ peak power per BM, IMTP peak force per BM, 10-yard sprint (inverted) and rotational med-ball; body weight display-only. Every sheet is stamped MOCK DATA. Generator is one command: uv run --with xlsxwriter python gen_prototypes.py. No real data wired — the open question is shape, not pipeline."
/Users/kristinarash/DEV/project-triage/portfolio.json:836:      "status": "archived",

hook: PostToolUse
hook: PostToolUse
hook: PostToolUse
 succeeded in 4258ms:
usage: portfolio.py [-h]
                    {add-idea,add-update,set-stage,slate-check,week-report,crosswalk,seven-day,card-check,sweep,sweep-decide,set-status,set-receiver,mark-done} ...

positional arguments:
  {add-idea,add-update,set-stage,slate-check,week-report,crosswalk,seven-day,card-check,sweep,sweep-decide,set-status,set-receiver,mark-done}
    crosswalk           report drift between registry, DEV and Drive
    seven-day           7-day rule: report, or --apply to pause expired starts
    card-check          closeout: resume card + gaps for every project touched
                        since a date
    sweep               Friday sweep: paused rows untouched 30+ days, oldest
                        first
    sweep-decide        revive / keep (parked 90 days) / archive a swept row
    set-status          start / park / finish a project (slate cap + 7-day
                        clock, same as the board)
    set-receiver        name who a project is for

options:
  -h, --help            show this help message and exit
usage: portfolio.py add-update [-h] [--next-action NEXT_ACTION] name note

positional arguments:
  name
  note

options:
  -h, --help            show this help message and exit
  --next-action NEXT_ACTION

hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse Failed
hook: PostToolUse
hook: PostToolUse Failed
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse
hook: PreToolUse Completed
hook: PreToolUse Failed
hook: PreToolUse Completed
hook: PreToolUse Failed
exec
/bin/zsh -lc "rg -n -C 4 'add-update|updated |\\[error\\]' ~/DEV/project-triage/portfolio.py; rg -n 'python|portfolio_json' ~/.claude/skills/_shared/config.macos.json" in /Users/kristinarash/.claude/skills
exec
/bin/zsh -lc "rg -n -C 3 '/project (stage|done|idea)|stage|done|idea' ~/.claude/skills/project/SKILL.md | head -90" in /Users/kristinarash/.claude/skills
 succeeded in 522ms:
1----
2-name: project
3-description: >-
4:  Manage the portfolio project registry (ideas, progress notes, ranking, promotion, dev stages,
5:  start/park/done, receivers) and open the live project board. Use when the user says
6:  "/project", "new idea:", "log progress on", "show my projects", "re-rank my projects",
7:  "promote <idea>", "mark <project> as spec'd/planned/shipped", "start/park <project>". Do not use for the DEV drift dashboard
8-  (use project-triage) or to scaffold a new repo (use new-project).
9----
10-
--
27-## CLI
28-
29-```
30:python3 "$PT/portfolio.py" add-idea "<pitch>" --source "<source>"
31-python3 "$PT/portfolio.py" add-update "<name>" "<note>" [--next-action "<step>"]
32:python3 "$PT/portfolio.py" set-stage "<name>" "<stage>"
33:python3 "$PT/portfolio.py" set-status "<name>" active|paused|done [--note "<note>"]
34-python3 "$PT/portfolio.py" set-receiver "<name>" "<who, or me: why>"
35-python3 "$PT/board.py" --background
36-```
37-
38-| Command | Prints on success |
39-|---|---|
40:| `add-idea` | `idea captured (<N> in inbox)` |
41-| `add-update` | `updated <name>` |
42:| `set-stage` | `stage set: <name> → <stage>` |
43-| `set-status` | `status set: <name> → <status>` |
44-| `set-receiver` | `<Name>: receiver <who>` |
45-| `board.py --background` | `board started at <url>` or `board already running at <url>` |
46-
47-- Pass each name exactly as `projects[].name` spells it: `set-status` matches case-sensitively.
48:  Stages, in ladder order: `idea grilled spec planned building shipped`.
49-- `set-status active` on a row that was not active stamps `started` and renumbers the lane.
50-- A refused change prints `[error] <msg>` to stderr, exits 2 and leaves `portfolio.json`
51-  unchanged; a bad argument prints argparse usage and also exits 2. `board.py` prints
--
54-
55-## Ideas land in the board's Inbox
56-
57:`add-idea` writes a card to the registry's `inbox` list, the board's Inbox column (since
58:2026-10-31; the older `ideas` list is history only). The card's name is `--name`, or the
59-pitch's first four words, made `[A-Za-z0-9_]` and suffixed `_2`, `_3` to stay unique. It
60:prints `idea captured as <Name> (<N> in the board inbox)`: tell Eric the card name and that
61-dragging it onto a lane, or `/project promote <Name>`, starts it.
62-
63-## Verbs
--
66-against `projects[].name`. One clear match: use that exact name. Several or none: ask Eric
67-which project before running anything.
68-
69:### `idea <pitch>`
70:`add-idea "<pitch>" --source "<where it came from, ≤8 words>" --name <Short_Name>`, e.g.
71-`--source "chat about GPS vendor gaps"` (a place, not just "chat"). Pick `--name` as the
72:2–4 word project name the idea would get (`GPS_Vendor_Gaps`); it becomes the DEV folder name
73-on promotion.
74-
75-### `update <name> <note>`
76-`add-update "<name>" "<note>"`, plus `--next-action "<step>"` when Eric gave one.
77-
78:### `start` / `park` / `done <name>`
79:`set-status "<name>" active|paused|done`, with `--note` when Eric gave a reason. Starting a
80-`job`, `side` or `tool` row with no `receiver`: ask Eric who it is for, then run
81-`set-receiver` with his words (`me: <why>` when it is for himself).
82-
83:### `stage <name> <stage>`
84:`set-stage "<name>" "<stage>"`. When the stage is `shipped`, offer once: "Want me to run
85-/harvest on <name> to distill it into your SecondBrain and log the shipped artifact?" On
86-yes, invoke the `harvest` skill for that project.
87-
88:### `promote <idea>` and `rank`
89-Both change the registry where no CLI command reaches: follow
90-[`REGISTRY-EDITS.md`](REGISTRY-EDITS.md). Dragging cards on the board re-ranks faster.
91-
92-### bare `/project`
93:Run `board.py --background` and give the URL. Waiting ideas are the board's Inbox column.
94-
95-## After a change
96-
--
98-render. Tell Eric in one line what changed. Closeout commits the registry as
99-`data: board edits <date>`, so leave `portfolio.json` uncommitted unless Eric asks.
100-
101:Delete a project or idea only after Eric confirms that exact row.
102-
103-**Done when:** the command printed its success line (or the hand edit saved and the
104-`.bak` beside `portfolio.json` was refreshed), and Eric has the one-line summary.

 succeeded in 525ms:
276-    idea_parser.add_argument("--source", default="")
277-    idea_parser.add_argument("--name", default=None,
278-                             help="card name; default is the pitch's first four words")
279-
280:    update_parser = subparsers.add_parser("add-update")
281-    update_parser.add_argument("name")
282-    update_parser.add_argument("note")
283-    update_parser.add_argument("--next-action", default=None)
284-
--
476-        if args.command == "add-idea":
477-            record = add_idea(data, args.pitch, source=args.source, name=args.name)
478-            save_registry(registry_path, data)
479-            print(f"idea captured as {record['name']} ({len(data['inbox'])} in the board inbox)")
480:        elif args.command == "add-update":
481-            add_update(data, args.name, args.note, next_action=args.next_action)
482-            save_registry(registry_path, data)
483:            print(f"updated {args.name}")
484-        elif args.command == "set-stage":
485-            set_stage(data, args.name, args.stage)
486-            save_registry(registry_path, data)
487-            print(f"stage set: {args.name} → {args.stage}")
488-    except RegistryError as e:
489:        print(f"[error] {e}", file=sys.stderr)
490-        return 2
491-    return 0
492-
493-
15:  "portfolio_json": "/Users/kristinarash/DEV/project-triage/portfolio.json",

hook: PostToolUse
hook: PostToolUse
hook: PostToolUse Failed
hook: PostToolUse Failed
codex
I found two bugs:

- **Closeout can miss shipped work.** [SKILL.md:49](/Users/kristinarash/.claude/skills/interview-me/SKILL.md:49) writes a marker after three empty answers. Closeout then skips its whole day-log step, including its separate question about shipped work. A normal log file causes the same problem.
- **Project names need quotes.** [SKILL.md:97](/Users/kristinarash/.claude/skills/interview-me/SKILL.md:97) leaves `<Name>` unquoted. A name with spaces becomes several command arguments, so the update fails.

Two wording faults:

- [SKILL.md:91](/Users/kristinarash/.claude/skills/interview-me/SKILL.md:91) says to take the Python command from the config. The Mac config has no Python command.
- [SKILL.md:105](/Users/kristinarash/.claude/skills/interview-me/SKILL.md:105) says the step is done only after a success line or “none.” That conflicts with the instruction to continue after an error.

The `add-update` arguments and success message are correct. The `SOURCES.md` link works. The status-report skill selects dated `.md` files, so it will not read the `.asked` markers as logs. It will also not count quiet days as logged days.
hook: Stop
hook: Stop
hook: Stop
hook: Stop Completed
hook: Stop Completed
hook: Stop Failed
tokens used
36,117
I found two bugs:

- **Closeout can miss shipped work.** [SKILL.md:49](/Users/kristinarash/.claude/skills/interview-me/SKILL.md:49) writes a marker after three empty answers. Closeout then skips its whole day-log step, including its separate question about shipped work. A normal log file causes the same problem.
- **Project names need quotes.** [SKILL.md:97](/Users/kristinarash/.claude/skills/interview-me/SKILL.md:97) leaves `<Name>` unquoted. A name with spaces becomes several command arguments, so the update fails.

Two wording faults:

- [SKILL.md:91](/Users/kristinarash/.claude/skills/interview-me/SKILL.md:91) says to take the Python command from the config. The Mac config has no Python command.
- [SKILL.md:105](/Users/kristinarash/.claude/skills/interview-me/SKILL.md:105) says the step is done only after a success line or “none.” That conflicts with the instruction to continue after an error.

The `add-update` arguments and success message are correct. The `SOURCES.md` link works. The status-report skill selects dated `.md` files, so it will not read the `.asked` markers as logs. It will also not count quiet days as logged days.
