# Tool paths (macOS)

The lookup table. Read this when you need a path; the **traps** that must be known
without looking stay in `~/.claude/CLAUDE.md` and `~/.claude/AGENTS.md`.

**Verified 2026-09-05** with `which -a python3 uv go node npm claude codex pwsh`.

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

`uv` and `claude` each resolve twice under `which -a` — they sit in PATH twice, not in
two locations. Same binary, so it is harmless; do not "fix" it by deleting one.

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
