---
name: fireflies-cli-broken-on-mac
description: "fireflies-pp-cli's misleading \"out of memory (14)\" error means the local DB was never synced — not a real failure"
metadata: 
  node_type: memory
  type: project
  originSessionId: 412a89e3-b64f-44e6-9c87-4766d44e6c7a
  modified: 2026-10-23T16:07:50.420Z
---

**Resolved 2026-08-11.** Recording the trap because the error message points the wrong way.

`fireflies-pp-cli` failed on **every** command and every `--data-source` (including
`live`) with:

```
Error: querying: unable to open database file: out of memory (14)
```

"Out of memory" is wrong — SQLite 14 is `SQLITE_CANTOPEN`. The real cause: the local
mirror had **never been created on this Mac**. Two things were missing after the
Windows → Mac migration:

1. No `FIREFLIES_API_KEY` anywhere — not env, not disk, not Keychain.
2. No database. `sync` had never been run here.

**`--data-source live` does not bypass the database.** Read commands open it regardless,
so "live" fails identically until a sync exists. That is what makes the error so
misleading — it looks like a corrupt/locked DB rather than a missing one.

**Fix:** the key is in the login Keychain as of 2026-08-13, not plaintext in
`~/.zshrc`. `~/.zshrc` exports it by *reading* the Keychain:
`export FIREFLIES_API_KEY="$(security find-generic-password -s FIREFLIES_API_KEY -a "$USER" -w)"`.
Then `fireflies-pp-cli sync`. See [[path-shadowing-and-cleanup]].
Synced 189 transcripts / 200 records on first run.

**The DB lives at `~/.local/share/fireflies-pp-cli/data.db`** (XDG data dir), *not*
`~/.fireflies-pp-cli/` — that directory exists but stays empty and is a red herring.

**Shell gotcha:** `~/.zshrc` exports are invisible to Claude Code's Bash tool (it runs
non-interactive bash and does not source zshrc). Load them explicitly per command:
`eval "$(grep -m1 '^[[:space:]]*export[[:space:]]\+VARNAME' ~/.zshrc)"`

**Knock-on effect worth remembering:** `meeting-sync` hard-stops on auth failure and
`weekly-review` calls it first, so this single missing credential silently disabled both
rituals. The vault meeting corpus froze at 2026-08-03 and `Inbox/weekly-review/` went
empty after 2026-07-31. A lapse that reads as a discipline problem was a missing env var.
Design rule: recurring skills must **degrade and report staleness**, never hard-stop.

---

## Transcript text requires `--live` (added 2026-08-13)

`transcripts get <id>` returns metadata, speakers, and the AI summary but **no
`sentences` array** — and neither does the local DB (`json_extract(data,'$.sentences')`
is null) nor `transcripts export`, which emits only the summary (~2.6 KB).

To get the actual dialogue, add `--live`:

```
fireflies-pp-cli transcripts get <id> --live --json
```

That returned 476 sentences / 284 KB for a 39-minute meeting, vs 6 KB without it. So
`sync` does **not** mirror transcript bodies — only metadata and summaries. Plan any
transcript-reading work around one `--live` call, then condense locally (group
consecutive sentences by `speaker_name` into turns; 476 sentences collapsed to 74 turns
/ 37 KB, which is readable in one pass).

Also: **speaker names in the AI summary can be wrong.** In the 8/13 meeting the summary
named "Aaron" and "Carrie"; the actual `speakers` array had **Erin Boyette**, and Carrie
never spoke. Trust `speakers` / `sentences`, not `summary.action_items`.

**Correction to the shell gotcha above:** as of 2026-08-13 `FIREFLIES_API_KEY` *is*
visible to the Bash tool — `doctor` reported `auth_source: env:FIREFLIES_API_KEY` with
no manual sourcing. Verify before working around it.

Related: [[status-report-sourcing]], [[gws-forms-api]]


---

## Renaming meetings: both the CLI and the MCP tool are broken (added 2026-08-29)

Two independent failures, and the second one lies about succeeding.

**1. `fireflies-pp-cli transcripts update` always fails.** It sends the id as a bare
mutation argument; the API wants it wrapped in an input object:

```
CLI sends: updateMeetingTitle(id: ..., title: ...)
API wants: updateMeetingTitle(input: {id: ..., title: ...})
```

Result is `HTTP 400 ... Unknown argument "id" on field "Mutation.updateMeetingTitle"`.
Note the field really is `id`, **not** `meetingId` — a direct call with `meetingId`
returns `Field "UpdateMeetingTitleInput.id" of required type "String!" was not provided`.
Don't "fix" the CLI by renaming the field; the shape is what's wrong.

**2. The Fireflies MCP tool `fireflies_update_meeting_title` is unreliable and its
`success:true` means nothing.** Writes are *erratically delayed*, not simply dropped:
on 2026-08-29 only 2 of 7 renames persisted promptly, 5 returned success and had not
landed after 8 minutes of polling, and one diagnostic write ("… v2") surfaced roughly
20–30 minutes later. So a "failed" MCP rename can still land an hour on and clobber a
good title. **This looked exactly like a rate limit and is not one** —
`name-meetings/REFERENCE.md` documents a "hard daily rate limit", which sent the
diagnosis down a 45-minute dead end. Never use MCP for renames; never send a throwaway
"test" title through it, because late arrival makes the probe destructive.

**Working path — call GraphQL directly with the keychain API key:**

```python
q = "mutation($input: UpdateMeetingTitleInput!){ updateMeetingTitle(input:$input){ title } }"
# POST https://api.fireflies.ai/graphql, Authorization: Bearer <FIREFLIES_API_KEY>
# variables: {"input": {"id": <meetingId>, "title": <newTitle>}}
```

All 7 renames applied first try this way, verified by read-back. Reusable script:
`~/.claude/jobs/*/tmp/rename_direct.py` (regenerate it; job dirs are cleaned up).

**Verification traps:**
- `transcripts get <id> --data-source live --no-cache` is trustworthy and is the
  read-back to use. `--no-cache` matters.
- The **list** endpoint (what `sync` + `transcripts find` read) lags the single-transcript
  endpoint by minutes. A fresh rename can be correct live and stale in `find` after a
  `sync --full`. Wait ~4 min and re-sync before exporting, or the vault filename bakes in
  the old title.
- Never verify a rename by exit code or by the mutation's own response.

**Backgrounded polling scripts appear to produce no output** until they exit — the file
stays 0 bytes mid-run. Don't conclude the script died; read it again after it completes.

Related: [[fireflies-cli-broken-on-mac]]

---

## `transcripts find --json` returns a bare LIST (added 2026-09-02)

`fireflies-pp-cli transcripts find --json --agent` emits a **top-level JSON array**, not an
envelope object. A parser written as `d.get("data") or d.get("items") or d` dies with
`AttributeError: 'list' object has no attribute 'get'`. Guard with
`items = d if isinstance(d, list) else d.get("data", [])`.

**The rename → export loop works end to end** (verified 2026-09-02, 3 meetings):
`scripts/rename.py <id> "<title>"` → `sleep 270` → `sync --full --resources transcripts`
→ `find` shows new titles → `meeting-sync/scripts/sync.py --no-sync` exports with the
good slug. The 4-minute wait is mandatory; skipping it bakes the stale title into the
vault filename. Run the sleep as a **background** Bash job — the foreground tool caps at 120s.

**Vault header placement:** `assets/meeting-header.md` goes after the metadata block's
`---` rule (line 9 of the export), *before* `## Summary` — not at line 1. Exported files
have no YAML frontmatter, so "after frontmatter" reads as line 1 and would be wrong;
match the 237 existing files instead.

**Morning cadence meeting-sync was dead under launchd until 2026-10-23.** Every scheduled run
(2026-08-06, the first Mac run, to 10-23) printed `not authenticated - set FIREFLIES_API_KEY` while the cadence still logged
`cadence OK`: launchd runs `pwsh -NoProfile`, which never sees the `~/.zshrc` Keychain export. Fixed in
`~/DEV/KeystoneOS/scripts/keystone.ps1` `Invoke-MeetingSync` (KeystoneOS `b13a617`): it reads the Keychain
item directly (launchd CAN read the login Keychain, tested 10-23). A bad key still exits 0 and shows only
as `"event":"sync_error"` lines, so those and non-zero exits now go to `.errors.log`.

**Fireflies API key rotated 2026-10-22 (Eric)**; key in Keychain item `FIREFLIES_API_KEY`
(a GraphQL `user` query with it returned 200 on 2026-10-23). Secrets on this machine live in
the macOS Keychain, never in `~/.zshrc`.
