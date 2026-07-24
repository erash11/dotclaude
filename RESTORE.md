# RESTORE.md — Machine Recovery & Migration Guide

**For Eric.** If your machine crashed, was wiped, was returned to Baylor, or you're
setting up a new computer (Windows or Mac), this document walks you through getting
everything back. Written 2026-07-23 (system audit), maintained automatically.

## Where to find this document

You can read this from any device, no machine required:

1. **Canonical (always current):** https://github.com/erash11/dotclaude/blob/main/RESTORE.md
   — sign in to GitHub as **erash11**. Every edit is version-controlled; it cannot be
   silently corrupted, and the daily backup job pushes updates.
2. **Mirror:** Google Drive → `Backups/RESTORE.md` (drive.google.com, your gmail).
   Refreshed automatically every morning by the backup job.

Bookmark #1 on your phone. If you can reach either copy, you can recover everything.

## The map — where everything lives

| What | Primary home | Backup | Survives leaving Baylor? |
|---|---|---|---|
| Code & analysis projects (DEV) | this machine | GitHub `erash11/*` (private) | YES |
| SecondBrain vault (notes, meetings, insights) | `Desktop\SecondBrain` | GitHub `erash11/SecondBrain` | YES |
| Claude config, hooks, skills, agents, this file | `~\.claude` | GitHub `dotclaude`, `claude-skills` | YES |
| Claude working memory | `~\.claude\global-memory` | GitHub `claude-global-memory` | YES |
| Claude conversation history + project memories | `~\.claude\projects` | Google Drive `Backups/Machine/claude-projects` | YES |
| Codex memory, sessions, agents | `~\.codex` | Google Drive `Backups/Machine/codex` | YES |
| Gemini/Antigravity state | `~\.gemini` | Google Drive `Backups/Machine/gemini` | YES |
| Memory compiler + local patches | `~\.claude\claude-memory-compiler` | GitHub fork `erash11/claude-memory-compiler` | YES |
| Non-repo DEV work folders (Football, SpecialRequests, …) | `Desktop\DEV` | **Baylor** OneDrive `Backups/DEV-NonRepo` | **NO — institutional data stays with Baylor** |
| Baylor work drive | Baylor OneDrive `00_Primary_Storage_Drive` | Baylor's problem | NO |

The split is deliberate: everything personal or career-durable lives under your personal
GitHub and personal Google account. Institutional/athlete data stays on Baylor storage.

**Daily automation:** scheduled task `KeystoneOS-DailyBackup` (6:15 AM) auto-commits and
pushes the memory repos, snapshots the non-git stores to the clouds above, and refreshes
this document's Google Drive mirror. The weekly stack doctor (Mondays) alarms if backups
go stale. Failures surface at the start of every Claude session.

## Accounts you need (before you start)

- **GitHub — erash11** (all code + config + notes). The keys to everything.
- **Google — your gmail** (Drive backups of transcripts/AI state).
- **Baylor Microsoft 365** (Baylor OneDrive — only if still employed).
- **Anthropic/Claude**, **OpenAI/Codex** (sign in on first launch).
- Re-auth on first use, they always rot: Fireflies, Google Drive/Gmail/Calendar MCP
  connectors, Supabase, Vercel, Catapult OpenField (token), VALD, Zotero.
- Passwords/2FA live in your password manager — **credentials are deliberately never
  in any backup** (`.credentials.json` and tokens are excluded everywhere).

## Scenario A — New Windows machine

Do these in order. Steps 1–3 get you functional; the rest completes the restore.

**1. Install the base tools**
Git (git-scm.com), GitHub CLI (`winget install GitHub.cli`), PowerShell 7
(`winget install Microsoft.PowerShell`), Node.js LTS, Claude Code, Codex CLI.
Python: use the **python.org installer** — NOT the Microsoft Store / Windows Install
Manager, which has silently deleted `C:\Python31x` during migrations twice and broken
everything downstream.
Sign in: OneDrive (Baylor account, if applicable) and **Google Drive for Desktop (gmail)**
— wait for Drive to mount as `G:`.

**2. Restore `~\.claude` — FIRST, before anything else**
```powershell
gh auth login          # erash11
cd $env:USERPROFILE\.claude
git init -b main
git remote add origin https://github.com/erash11/dotclaude.git
git fetch origin
git checkout -f origin/main -b main    # -f overwrites fresh-install defaults
git clone https://github.com/erash11/claude-skills.git        $env:USERPROFILE\.claude\skills
git clone https://github.com/erash11/claude-global-memory.git $env:USERPROFILE\.claude\global-memory
git clone https://github.com/erash11/claude-memory-compiler.git $env:USERPROFILE\.claude\claude-memory-compiler
```
This brings back your settings, hooks, agents, all skills, working memory, and the
backup script itself.

**3. Restore conversation history and AI state from Google Drive**
```powershell
robocopy "G:\My Drive\Backups\Machine\claude-projects" "$env:USERPROFILE\.claude\projects" /E
robocopy "G:\My Drive\Backups\Machine\codex"           "$env:USERPROFILE\.codex" /E
robocopy "G:\My Drive\Backups\Machine\gemini"          "$env:USERPROFILE\.gemini" /E
```

**4. Restore work**
```powershell
mkdir $env:USERPROFILE\Desktop\DEV; cd $env:USERPROFILE\Desktop\DEV
gh repo list erash11 --limit 100      # your full inventory — clone what you need
git clone https://github.com/erash11/KeystoneOS.git
git clone https://github.com/erash11/SecondBrain.git $env:USERPROFILE\Desktop\SecondBrain
git clone https://github.com/erash11/morning-briefing.git
```
Non-repo folders (if still at Baylor): copy back from Baylor OneDrive `Backups\DEV-NonRepo`.

**5. Rebuild Python environments**
```powershell
cd $env:USERPROFILE\Desktop\DEV\morning-briefing
python -m venv .venv; .venv\Scripts\pip install -r requirements.txt
cd $env:USERPROFILE\.claude\claude-memory-compiler   # uses uv — see its README
pip install memsearch
```
**CRITICAL:** after any `pip install` of memsearch, re-apply the local flush patch
(notes in the compiler repo). Symptom when missing: errors in
`global-memory\transcripts\.errors.log` every session.
Milvus (memsearch's vector DB): start per `~\.memsearch\config.toml` (localhost:19530),
then reindex. The index is rebuildable — nothing is lost if it's gone.

**6. Re-register the scheduled tasks**
```powershell
$pwsh = 'C:\Program Files\PowerShell\7\pwsh.exe'; $U = $env:USERPROFILE
Register-ScheduledTask -TaskName 'KeystoneOS Morning'     -Action (New-ScheduledTaskAction -Execute $pwsh -Argument "-NoProfile -WindowStyle Hidden -File `"$U\Desktop\DEV\KeystoneOS\scripts\morning-cadence.ps1`"") -Trigger (New-ScheduledTaskTrigger -Daily -At 06:00) -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable)
Register-ScheduledTask -TaskName 'KeystoneOS-DailyBackup' -Action (New-ScheduledTaskAction -Execute $pwsh -Argument "-NoProfile -WindowStyle Hidden -File `"$U\.claude\scripts\daily-backup.ps1`"") -Trigger (New-ScheduledTaskTrigger -Daily -At 06:15) -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable)
Register-ScheduledTask -TaskName 'KeystoneOS-StackDoctor' -Action (New-ScheduledTaskAction -Execute $pwsh -Argument "-NoProfile -File `"$U\.claude\skills\claude-stack-doctor\scripts\weekly-check.ps1`"") -Trigger (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 06:40) -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable)
Register-ScheduledTask -TaskName 'MorningBriefing'        -Action (New-ScheduledTaskAction -Execute "$U\Desktop\DEV\morning-briefing\scripts\run_with_logging.cmd") -Trigger (New-ScheduledTaskTrigger -Daily -At 07:20) -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable)
# KeystoneOS-AgySync: see KeystoneOS\scripts\keystone.ps1 (agy-sync, Windows PowerShell 5)
```

**7. Verify**
```powershell
pwsh -NoProfile -File "$env:USERPROFILE\.claude\skills\claude-stack-doctor\scripts\stack-check.ps1"
```
`ALL CLEAR` = you're fully back. Or just open Claude Code and say "run stack doctor".

## Scenario B — Moving to a Mac

Everything cloud-side is platform-neutral (GitHub + Google Drive). The translation:

| Windows | Mac |
|---|---|
| `C:\Users\eric_rash\` | `/Users/eric_rash/` (`~`) |
| winget installs | Homebrew: `brew install git gh node powershell` + python.org installer |
| PowerShell 7 | Works on Mac (`pwsh`) — but the backup script uses robocopy; see below |
| robocopy | `rsync -a --delete` |
| Task Scheduler | `launchd` or `cron` (`crontab -e`: `15 6 * * * /path/to/backup.sh`) |
| `G:\My Drive` | `~/Library/CloudStorage/GoogleDrive-<gmail>/My Drive` |
| Baylor OneDrive | `~/Library/CloudStorage/OneDrive-BaylorUniversity` |

Steps: same order as Scenario A — tools, `~/.claude` from the dotclaude repo, snapshots
from Google Drive, repos from GitHub, venvs, then scheduling. The one real port is
`daily-backup.ps1` (robocopy + Register-ScheduledTask are Windows-only): ask Claude to
"port daily-backup.ps1 to Mac per RESTORE.md" — it's a mechanical rsync + cron rewrite.
Paths inside `~\.claude\settings.json` and hooks reference `C:\Users\eric_rash` and will
need the same find/replace; Claude can sweep them in one pass.

## Deliberately NOT backed up

- `~\.codex\work` (19+ GB of disposable working clones)
- Milvus / memsearch index (rebuilt by reindexing)
- Caches, tool binaries, `.venv` folders (rebuilt by installers)
- **All credentials** — `.credentials.json`, OAuth tokens, API keys. By design.
  They live in your password manager and re-auth flows.
- `D:\ CRASHBOX` legacy backup drive — historical, not part of this system.

## Keeping this document honest

The daily backup job pushes this file to GitHub and mirrors it to Google Drive on every
run. When the system changes (new scheduled task, new repo, new store), whoever makes the
change — usually Claude — must update this file in the same session. If you read this and
it contradicts reality, run the stack doctor and ask Claude to reconcile RESTORE.md.
