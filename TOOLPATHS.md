# Tool paths (macOS)

The lookup table. Read this when you need a path; the **traps** that must be known
without looking stay in `~/.claude/CLAUDE.md` and `~/.claude/AGENTS.md`.

**Verified 2026-10-23** in the clean-env shell from `machine.md` with `which -a python3 uv uvx go node npm npx claude codex pwsh gh git gws rg jq memsearch dcg room-cli herdr bun graphify`.

| Tool | Path | Note |
|---|---|---|
| python3 | `/opt/homebrew/bin/python3` | 3.14, PEP 668-managed. `/usr/bin/python3` is the system copy — Homebrew's wins on PATH. |
| uv / uvx | `/Users/kristinarash/.local/bin/uv` | Standalone install, `uv self update`. **Not** Homebrew. |
| go | `/opt/homebrew/bin/go` | |
| node | `/opt/homebrew/bin/node` | |
| npm / npx | `/opt/homebrew/bin/` | |
| claude | `/Users/kristinarash/.local/bin/claude` | |
| codex | `/opt/homebrew/bin/codex` | |
| pwsh | `/opt/homebrew/bin/pwsh` | PowerShell 7. Present only to run the KeystoneOS `.ps1` jobs natively. |
| Go-installed CLIs | `/Users/kristinarash/go/bin/` | `fireflies-pp-cli`, `espn-pp-cli`, and the other `*-pp-cli` tools. |
| gh | `/opt/homebrew/bin/gh` | |
| git | `/opt/homebrew/bin/git` | Shadows the Apple `/usr/bin/git`. |
| gws | `/opt/homebrew/bin/gws` | |
| rg | `/opt/homebrew/bin/rg` | |
| jq | `/usr/bin/jq` | Apple copy only; no Homebrew jq. |
| memsearch, dcg, room-cli | `/Users/kristinarash/.local/bin/` | |
| herdr | `/Users/kristinarash/.local/bin/herdr` | Runs as `herdr server`. Owns the Codex `~/.codex/hooks.json` SessionStart hook (`herdr-agent-state.sh`) and the `herdr` block in `~/.gemini/config/hooks.json`; the hook scripts (`herdr-agent-state.sh`) carry an `# installed by herdr` marker and the hooks.json entries call them, so treat them as herdr-owned and edit around them. Log `~/.config/herdr/herdr-server.log` has no rotation (522 KB on 2026-10-23). |
| bun | `/Users/kristinarash/.bun/bin/bun` | 1.3.14. `~/.bun/bin` is on PATH. |
| graphify | `/Users/kristinarash/.claude/skills/graphify/.venv/bin/graphify` | Not on PATH; call it by full path. |

`/opt/homebrew/bin` sits in PATH twice: `brew shellenv` in `~/.zprofile` puts it ahead of the system paths and
`/etc/paths.d/homebrew` adds it again at the end. So Homebrew tools (go, node, npm, codex,
pwsh, gh, gws, rg) resolve twice under `which -a`, and python3 and git also show the Apple
`/usr/bin` copy between the two. Same binary, so it is harmless; do not "fix" it by deleting one.

## Secrets

Secrets live in the macOS Keychain, never in `~/.zshrc`. Read one with:

```bash
security find-generic-password -s FIREFLIES_API_KEY -a "$USER" -w
```

## History that explains the layout

- `/usr/local/bin` is **empty and stays that way.** Homebrew owns `/opt/homebrew/bin`.
- Docker Desktop, and the `kubectl` it shipped, was removed 2026-09-03. Nothing here used it.

## Why this file exists

This table used to sit in `~/.claude/CLAUDE.md`, which loads into every session in every
project — paying for the whole list on every turn to answer a question asked on a few of
them. `AGENTS.md` had already refused to carry a second copy for the same reason. Now both
files carry the traps and point here for the lookup.

**Re-verify before trusting a row.** Tools have existed in two places before, with the older
one winning. `which -a <tool>` is authoritative, and this file is a snapshot with a date on it.
