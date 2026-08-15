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
| Non-repo DEV work folders (Football, SpecialRequests, …) | `Desktop\DEV` | **SSD** `D:\AssistantBackup\DEV-nonrepo` + Baylor OneDrive | YES — SSD copy since 2026-08-03 |
| **Gitignored data inside git repos** (`forceplate.db`, `.rds`, outputs) | `Desktop\DEV\<repo>` | **SSD** `D:\AssistantBackup\DEV-repo-data` | YES — **was backed up NOWHERE before 2026-08-03** |
| **Uncommitted edits to tracked files** | `Desktop\DEV\<repo>` | **SSD** `D:\AssistantBackup\DEV-working-tree` | YES — added 2026-08-03 |
| Baylor work drive | Baylor OneDrive `00_Primary_Storage_Drive` | Baylor's problem | NO |

**Read the two bold rows above.** Pushing a repo backs up only its *tracked* files.
`ForcePlate_DecisionSystem` publishes 7 MB to GitHub against 1,709 MB on disk — the
database it runs on is gitignored. "All repos pushed clean" is true and says nothing about
whether your data survives. Coverage is declared in `~\.claude\scripts\backup-manifest.json`,
not inferred from whether a folder happens to be a git repo.

The personal/institutional split is recorded per path in that manifest as a `class` tag. As
of 2026-08-03 both classes are mirrored to the SSD by explicit decision; the tag exists so
institutional data stays identifiable and purgeable rather than blended in.

**Daily automation:** scheduled task `KeystoneOS-DailyBackup` (00:30) auto-commits and
pushes the memory repos, captures what git cannot carry to the SSD, snapshots the non-git
stores to the clouds above, and refreshes this document's Google Drive mirror. Each
destination gets a run-specific receipt read back after writing, so a run that copied
nothing cannot report success. The weekly stack doctor (Mondays) alarms if backups go
stale. Failures surface at the start of every Claude session.

**If the SSD is detached** the run warns (`backup-target-offline:SSD`) and continues —
your cloud backups still happen, but nothing gitignored is captured that night. Reattach
and the next run catches up.

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
git clone https://github.com/erash11/morning-briefing.git   # RETIRED 2026-08-14 - restore only if reviving
```
> `morning-briefing` was retired 2026-08-14 (job disabled, project removed from disk, dropped from
> the backup manifest). Skip it on a restore unless you are deliberately reviving it. Its output —
> 56 briefings — lives in `SecondBrain/morning-briefings/` and is restored with the vault.
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

**For a planned move to a Mac, follow `MIGRATION-MACOS.md` instead of this section.** It
is the ordered, executable procedure with pinned versions, the `DEV-repo-data` overlay
step, credential inventory, and launchd conversions. This section remains only as the
emergency summary.

Steps: same order as Scenario A — tools, `~/.claude` from the dotclaude repo, snapshots
from Google Drive or the SSD, repos from GitHub, venvs, then scheduling. The one real port
is `daily-backup.ps1` (robocopy + Register-ScheduledTask are Windows-only).

**Correction (2026-08-03):** an earlier version of this document claimed
`~\.claude\settings.json` and the hooks hardcode `C:\Users\eric_rash`. They do not. An
audit found exactly three files that do: `CLAUDE.md`, `scripts\daily-backup.ps1`, and
`scripts\fix-msys-ad-stall.ps1`. The port is smaller than this document used to imply.

**Also note:** the SSD is NTFS and macOS mounts it read-only. You can restore *from* it but
cannot back up *to* it until you reformat to exFAT. See `MIGRATION-MACOS.md` Step 10 — this
will silently break your nightly backup on the new machine if missed.

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
