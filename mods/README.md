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

## Loading

Mods load from `CLAUDE_CODE_PLUGIN_DIRS`, one entry per mod folder. It is set per
machine (the path separator differs, so it is not in the shared `settings.json`).
Restart Claude Code after changing it.

- **Windows** (set 2026-10-02, user env var):
  `C:\Users\eric_rash\.claude\mods\repo-band;...\next-steps;...\job-watch;...\merge-cleanup;...\where`
- **Mac**: add to `~/.zshrc`:
  ```sh
  export CLAUDE_CODE_PLUGIN_DIRS="$HOME/.claude/mods/repo-band:$HOME/.claude/mods/next-steps:$HOME/.claude/mods/job-watch:$HOME/.claude/mods/merge-cleanup:$HOME/.claude/mods/where"
  ```

To drop one mod, remove its entry. To turn all off, unset the variable.

Headless `claude -p` runs report "hooks modules are turned off ... rollout switch
served off" (seen 2026-10-02); the mods are for interactive sessions.

## Checking

```sh
claude plugin validate ~/.claude/mods/<mod>
claude plugin test ~/.claude/mods/<mod>     # needs the rollout switch on
```
