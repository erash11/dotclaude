# slate-status

Shows the job-lane slate from `~/DEV/project-triage` in Claude Code.

- **Status line:** `slate: DUE · 1/5 active · 2 to do`, refreshed at session start and every 30 minutes.
- **Toast** when the slate is not OK and the line has changed (no repeat nags).
- **`/slate`** lists each problem (`portfolio.py slate-check --json`).

It finds `portfolio.py` through `portfolio_json` in `~/.claude/skills/_shared/config.<platform>.json`
(the config whose path exists on this machine) and runs it with `python` (Windows) or `python3`
(Mac). A check that cannot run shows DUE with the reason, never OK.

## Loading (one entry in `CLAUDE_CODE_PLUGIN_DIRS`, per machine; restart Claude Code after)

- Windows (added 2026-10-03, user env var): `...;C:\Users\eric_rash\.claude\mods\slate-status`
- Mac, `~/.zshrc`: append `:$HOME/.claude/mods/slate-status` to the `CLAUDE_CODE_PLUGIN_DIRS` export.

## Checking

    claude plugin validate ~/.claude/mods/slate-status
    claude plugin test ~/.claude/mods/slate-status

Built 2026-10-03 (Windows), first in the session's dev-mods folder, then moved here.
