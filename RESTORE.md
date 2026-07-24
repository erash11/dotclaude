# RESTORE.md — machine-crash recovery runbook

Written 2026-07-23 (system audit Phase 2). This file lives in the `dotclaude` repo
deliberately: **it is the first repo you clone on a new machine**, and it brings the
settings, hooks, agents, and backup scripts with it.

Backup topology (what exists, where):

| Store | Backup | Cadence |
|---|---|---|
| SecondBrain, KeystoneOS, DEV git repos | GitHub (erash11, private) | on push + daily auto-commit |
| ~\.claude config (settings/hooks/agents/scripts) | GitHub `dotclaude` | daily auto-commit |
| ~\.claude\skills | GitHub `claude-skills` | daily auto-commit |
| ~\.claude\global-memory | GitHub `claude-global-memory` | daily auto-commit |
| memory compiler + local patches | GitHub `claude-memory-compiler` (fork; upstream=coleam00) | manual |
| ~\.claude\projects (transcripts + Tier A memories) | personal OneDrive `Backups\Machine\claude-projects` | daily snapshot |
| ~\.codex memories/sessions/agents/sqlite | personal OneDrive `Backups\Machine\codex` | daily snapshot |
| ~\.gemini | personal OneDrive `Backups\Machine\gemini` | daily snapshot |
| non-repo DEV folders (Football, SpecialRequests, …) | Baylor OneDrive `Backups\DEV-NonRepo` | daily snapshot |

Deliberately NOT backed up: `~\.codex\work` (19+ GB of working clones), Milvus index
(rebuildable), caches, `.credentials.json` / `token-dashboard.db` (excluded from dotclaude).

## Recovery steps (new machine)

### 1. Prerequisites
Install: Git, GitHub CLI (`gh`), PowerShell 7 (`C:\Program Files\PowerShell\7\pwsh.exe`),
Python (via python.org installer — NOT the Windows Store / Install Manager, which has
deleted `C:\Python31x` during migrations twice), Node.js, Claude Code, Codex CLI.
Sign in to both OneDrive accounts (personal + Baylor) and let them sync.

### 2. Restore ~\.claude (do this FIRST)
```powershell
gh auth login
cd $env:USERPROFILE\.claude          # exists already from the fresh Claude install
git init -b main
git remote add origin https://github.com/erash11/dotclaude.git
git fetch origin
git checkout -f origin/main -b main  # -f overwrites the fresh-install defaults
git clone https://github.com/erash11/claude-skills.git        $env:USERPROFILE\.claude\skills
git clone https://github.com/erash11/claude-global-memory.git $env:USERPROFILE\.claude\global-memory
git clone https://github.com/erash11/claude-memory-compiler.git $env:USERPROFILE\.claude\claude-memory-compiler
```
Then restore snapshots from personal OneDrive:
```powershell
robocopy "$env:USERPROFILE\OneDrive\Backups\Machine\claude-projects" "$env:USERPROFILE\.claude\projects" /E
robocopy "$env:USERPROFILE\OneDrive\Backups\Machine\codex"           "$env:USERPROFILE\.codex" /E
robocopy "$env:USERPROFILE\OneDrive\Backups\Machine\gemini"          "$env:USERPROFILE\.gemini" /E
```
Re-auth: `claude` login, `gh auth status`, MCP connectors (Fireflies, Google Drive/Gmail,
Supabase, Vercel — these rot even without a crash; re-auth on first use).

### 3. Restore work
```powershell
mkdir $env:USERPROFILE\Desktop\DEV
cd $env:USERPROFILE\Desktop\DEV
gh repo list erash11 --limit 100     # clone what you need; KeystoneOS + SecondBrain first
git clone https://github.com/erash11/KeystoneOS.git
git clone https://github.com/erash11/SecondBrain.git $env:USERPROFILE\Desktop\SecondBrain
git clone https://github.com/erash11/morning-briefing.git
```
Non-repo DEV folders: copy back from `OneDrive - Baylor University\Backups\DEV-NonRepo\`.

### 4. Rebuild Python environments
```powershell
cd $env:USERPROFILE\Desktop\DEV\morning-briefing
python -m venv .venv; .venv\Scripts\pip install -r requirements.txt
cd $env:USERPROFILE\.claude\claude-memory-compiler
# uses uv — see its README; uv sync
pip install memsearch
# CRITICAL: re-apply the local memsearch flush patch — a pip install strips it.
# See ~\.claude\claude-memory-compiler notes. Symptom when missing: entries in
# global-memory\transcripts\.errors.log every session.
```
Milvus: start per `~\.memsearch\config.toml` (localhost:19530), then reindex sources.

### 5. Re-register scheduled tasks
```powershell
$pwsh = 'C:\Program Files\PowerShell\7\pwsh.exe'
$U = $env:USERPROFILE
Register-ScheduledTask -TaskName 'KeystoneOS Morning'      -Action (New-ScheduledTaskAction -Execute $pwsh -Argument "-NoProfile -WindowStyle Hidden -File `"$U\Desktop\DEV\KeystoneOS\scripts\morning-cadence.ps1`"") -Trigger (New-ScheduledTaskTrigger -Daily -At 06:00) -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable)
Register-ScheduledTask -TaskName 'KeystoneOS-DailyBackup'  -Action (New-ScheduledTaskAction -Execute $pwsh -Argument "-NoProfile -WindowStyle Hidden -File `"$U\.claude\scripts\daily-backup.ps1`"") -Trigger (New-ScheduledTaskTrigger -Daily -At 06:15) -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable)
Register-ScheduledTask -TaskName 'KeystoneOS-StackDoctor'  -Action (New-ScheduledTaskAction -Execute $pwsh -Argument "-NoProfile -File `"$U\.claude\skills\claude-stack-doctor\scripts\weekly-check.ps1`"") -Trigger (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 06:40) -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable)
Register-ScheduledTask -TaskName 'MorningBriefing'         -Action (New-ScheduledTaskAction -Execute "$U\Desktop\DEV\morning-briefing\scripts\run_with_logging.cmd") -Trigger (New-ScheduledTaskTrigger -Daily -At 07:20) -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable)
# KeystoneOS-AgySync: see KeystoneOS\scripts\keystone.ps1 agy-sync (Windows PowerShell 5 action)
```

### 6. Verify
Run the stack doctor — it now checks backup freshness too:
```powershell
pwsh -NoProfile -File "$env:USERPROFILE\.claude\skills\claude-stack-doctor\scripts\stack-check.ps1"
```
ALL CLEAR = you're back.
