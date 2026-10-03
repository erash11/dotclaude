# Claude Code mods

Function-hook plugins ("Claude Mods"), built 2026-10-02 from the session audit
(`/watch` of Chase AI's "Claude Mods" video + a read of the last 30 transcripts).
Synced to both machines through the `~/.claude` repo.

| Mod | Event | Shows | Usage |
|---|---|---|---|
| `repo-band` | `turn.complete`, timer | Band: `repos: 3 dirty · 1 unpushed`, **Closeout** / **Closeout + exit** buttons; `/repos` lists them | none (local git) |
| `next-steps` | `session.start`, `turn.complete` | Band: 3 buttons. At start, newest `docs/handoffs/*.md`; after a turn, Haiku's suggestions. A press fills the prompt box to edit; Enter sends. `/next-steps off\|on` | one Haiku call per answered turn |
| `job-watch` | `session.start`, 10-min timer, task notifications | Status line: scheduled jobs, `errors.log`, recall eval; toasts when a job runs or a background task finishes; `/jobs` | none |
| `merge-cleanup` | after a `gh pr merge` Bash/PowerShell call | Toast naming the branches/worktrees removed (verified merged only; see `feedback_post-merge-cleanup`) | none |
| `where` | after Write/Edit/NotebookEdit | `/where [filter]` pane of recent files with copy-path buttons | none |
| `twin-copy-guard` | around Write/Edit/NotebookEdit, `turn.complete` | At turn end, names a hook/skill twin left unpatched (`~/.claude/hooks` ↔ `~/.codex/hooks`, `~/.claude/skills` ↔ `~/.agents/skills`) and offers **Copy across** when the pair matched before the edit; `/twins` lists every differing pair | none |
| `config-encoding-guard` | `session.start`, after Write/Edit/Bash/PowerShell, `turn.complete` | Catches a UTF-8 BOM or CP1252 garbling (`â€”`, `â–“`) in `~/.claude`/`~/.codex` config (see `project_settings-json-bom-trap`); offers a repair that keeps `.encoding-bak` and never writes JSON that will not parse; `/encoding` | none |
| `slate-status` | `session.start`, 30-min timer | Status line: `slate: DUE · 1/5 active · 2 to do` from `project-triage/portfolio.py slate-check`; toasts when it changes and is not OK; `/slate` lists problems | none |
| `landed` | `session.start` (background scan) | `/landed [today\|week\|N] [refresh] [project]`: files created or changed, grouped by project, both machines, from `project-triage/landed.py` | none |

Added 2026-10-03 (from the Nate Herk mods video + a 45-day transcript audit):
`repo-band` now fetches every repo once at session start, shows `↓N` behind, and
before Claude's first edit in a repo each session fetches it and asks **Pull first /
Edit anyway / Cancel** when it is behind origin. `job-watch` now shows `milvus ✓/✗`
(Docker-hosted Milvus for memsearch) and toasts when it goes down; machines with no
milvus container show nothing.

Windows note: on this machine `~/.codex/hooks` is not a mirror (1 file), and 6 of the
skills in `~/.claude/skills` are junctions into `~/.agents/skills` (same file, never
flagged). The other ~42 are real copies, so twin drift there is real (`harvest`
differed on 2026-10-03).

## Loading

**The folder is the list.** Every folder here with `.claude-plugin/plugin.json` loads on both
machines, unless it has a `.disabled` file or fails `claude plugin validate`. Nothing is
hand-listed (set 2026-10-03; before that the list lived in three places and drifted).

- `mods-sync.ps1` (Windows) sets the user env var `CLAUDE_CODE_PLUGIN_DIRS`.
- `mods-sync.sh` (Mac) writes `~/.claude/mods/.loadlist` (gitignored); `~/.zshrc` reads it:
  ```sh
  [ -f ~/.claude/mods/.loadlist ] && export CLAUDE_CODE_PLUGIN_DIRS="$(cat ~/.claude/mods/.loadlist)"
  ```
- `dev-sync` and `closeout` run the sync and report one line:
  `mods: 8 loaded, 1 disabled, 0 invalid`. A broken mod is named and left out, never loaded.
- Turn one off on both machines: `touch ~/.claude/mods/<name>/.disabled`, commit, sync.
  Turn it back on: delete the file.
- A changed list takes effect after a restart of Claude Code (and a new shell on the Mac).

Headless `claude -p` runs report "hooks modules are turned off ... rollout switch
served off" (seen 2026-10-02); the mods are for interactive sessions.

## Checking

```sh
claude plugin validate ~/.claude/mods/<mod>
claude plugin test ~/.claude/mods/<mod>     # needs the rollout switch on
```
