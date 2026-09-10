# Shell / Environment (Windows)

- This is the Baylor-managed Windows laptop. Native shell is PowerShell 7 (`pwsh`) / Windows PowerShell; Claude Code hooks run under Git Bash, where `$HOME` is `/c/Users/eric_rash`.
- Prefer Desktop Commander over Windows-MCP when both could do the job.
- Tool paths: `~/.claude/TOOLPATHS.md` is Mac-centric; on this machine verify with `Get-Command <tool>` / `where.exe <tool>`.
- Traps:
  - `uv` lives at `~/.local/bin/uv.exe`. Hooks call `$HOME/.local/bin/uv`; do not relocate it.
  - No admin rights by default. Anything needing elevation (Hyper-V, diskpart, services) has to be run by Eric in an elevated PowerShell.
  - Docker Desktop (WSL2) hosts Milvus for memsearch. It must be running for memsearch hooks to work.
  - `dcg` is not installed here; the PreToolUse hook is guarded and passes through.
  - Paths with spaces are common (`G:\My Drive\...`, `OneDrive - Baylor University`). Quote them.
- DEV projects live at `C:\Users\eric_rash\Desktop\DEV` (one root, one repo per project; Football/ sub-projects are their own repos).
- Primary storage drive (documents, data, deliverables): `G:\My Drive\00_Primary_Storage_Drive` (Google Drive; moved off Baylor OneDrive 2026-09-10).
- Legacy tool scripts for the migration live in `C:\DEV\_tools`.
