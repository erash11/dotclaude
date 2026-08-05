# MIGRATION-MACOS.md — Windows → MacBook Neo

> **AS-EXECUTED 2026-08-05:** this plan was executed. The full corrections ledger
> (what was wrong, missing, or out of order) lives in `START-HERE.md` under
> "AS-EXECUTED CORRECTIONS". Read that first before reusing any step here.



**For Eric.** This is the executable walkthrough for standing up the MacBook Neo with your
full working system. `RESTORE.md` is the disaster-recovery map; **this** is the ordered
procedure for a planned move to macOS.

**Written:** 2026-08-03, from a live audit of the Windows machine.
**Companion spec:** `KeystoneOS/docs/superpowers/specs/2026-08-03-machine-migration-and-backup-contract-design.md`
**Budget:** ~3 hours to fully functional. Steps 1–4 (~60 min) get you working.

> **Status of this document:** every version number, path, and schedule below was read off
> the live Windows machine on 2026-08-03. It has **not yet been executed end-to-end.**
> Step 11 is where you fix what it gets wrong. Until then treat it as a well-researched
> hypothesis, not proven fact.

---

## Read this first — three things that will bite you

1. **Use the exFAT drive, `E:\AssistantBackup`.** As of 2026-08-04 this is the migration
   drive: a 117 GB SanDisk formatted exFAT, which macOS reads **and writes**. The older
   `D:\AssistantBackup` (WD easystore, NTFS) is retained as a second archive copy but
   macOS mounts NTFS **read-only** — restoring from it works, backing up to it does not.
   Bring E:. Leave D: at home as insurance.
2. **Restore `~/.claude` before anything else.** It carries the settings, hooks, and
   skills that make every later step work.
3. **Credentials are deliberately in no backup** — with one recorded exception, see
   `CREDENTIALS.md`. Step 8 is not optional; without it you get code that cannot run.

---

## What you're carrying, and from where

| Source | Carries | Notes |
|---|---|---|
| **GitHub `erash11`** | 19 repos: all code, config, skills, memory, notes | Authoritative for anything tracked |
| **SSD `AssistantBackup`** | 13.39 GB — gitignored data, 32 non-repo folders, AI state, mirror clones | Authoritative for everything git does **not** track |
| **Google Drive (gmail)** | `claude-projects`, `codex`, `gemini` snapshots | Redundant with SSD; use if the SSD is unavailable |
| **Password manager** | Every credential | The only source. Nothing else has them |
| **Baylor OneDrive** | Institutional originals | Assume unavailable |

The SSD is self-sufficient: if GitHub were unreachable, `AssistantBackup/repos/` holds
mirror clones of all 19 repositories.

---

## Step 0 — Before you leave the old machine

Do these while you still have access. Checked off, they make the rest recoverable.

- [ ] `D:\AssistantBackup` is present and its `MANIFEST/verify.log` ends in `VERDICT: PASS`.
      If it does not, or the log is older than your last working day, re-run it:
      `pwsh -NoProfile -File ~\.claude\scripts\verify-backup.ps1` (~15 min for ~9 GB).
      `MISMATCH` means the SSD copy differs from a source that still exists — investigate
      before trusting the drive. `SOURCE-GONE` is expected and harmless: the SSD is
      additive, so it keeps files you deleted upstream. That is deliberate, not drift.
- [ ] Every credential in Step 8's table exists in your password manager
- [ ] `gh auth status` shows `erash11`; you can log in from another device
- [ ] Google Drive has finished syncing (no pending-upload badge)
- [ ] Physically unplug the SSD and take it with you

---

## Step 1 — Base toolchain

Versions are what the Windows machine runs today. Match major versions; newer patches are fine.

```bash
# Homebrew first
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"

brew install git gh node go uv powershell/tap/powershell
brew install --cask google-drive
```

| Tool | Windows version today | Install on Mac |
|---|---|---|
| Python | 3.14.6 | **python.org installer — not brew, not the App Store** |
| Node | v26.4.0 | `brew install node` |
| Go | 1.26.3 | `brew install go` |
| uv | 0.11.2 | `brew install uv` |
| git | 2.54.0 | `brew install git` |
| gh | 2.92.0 | `brew install gh` |
| PowerShell | 7 | `brew install powershell/tap/powershell` — **required**, many scripts are `.ps1` |
| Claude Code | 2.1.220 | `npm install -g @anthropic-ai/claude-code` |

**Python:** use the python.org installer. The Microsoft Store build silently deleted
`C:\Python31x` during two prior migrations. Homebrew's Python is fine as a dependency but
should not be your primary interpreter — `brew upgrade` moves it out from under your venvs.

**PowerShell is not optional.** Your KeystoneOS jobs, stack doctor, and backup are `.ps1`.
`pwsh` runs them natively on macOS; only Windows-specific *commands* inside them need
porting (Step 9). This is why the port is small.

```bash
gh auth login          # erash11
```

---

## Step 2 — Restore `~/.claude` (do this before anything else)

```bash
cd ~/.claude 2>/dev/null || mkdir -p ~/.claude && cd ~/.claude
git init -b main
git remote add origin https://github.com/erash11/dotclaude.git
git fetch origin
git checkout -f origin/main -b main     # -f overwrites fresh-install defaults

git clone https://github.com/erash11/claude-skills.git           ~/.claude/skills
git clone https://github.com/erash11/claude-global-memory.git    ~/.claude/global-memory
git clone https://github.com/erash11/claude-memory-compiler.git  ~/.claude/claude-memory-compiler
```

Restores settings, hooks, agents, all skills, working memory, and the backup script itself.

---

## Step 3 — Restore AI state from the SSD

Plug in the exFAT drive. Confirm where it landed before relying on the path — the volume
label determines the mount point, and an unlabelled drive mounts as `/Volumes/NO NAME`,
whose space breaks unquoted shell commands:

```bash
ls /Volumes/                     # find the real name first
export SSD="/Volumes/ASSISTANT/AssistantBackup"   # adjust to what you actually see
ls "$SSD"                        # should list DEV-repo-data, DEV-nonrepo, repos, claude, ...
cat "$SSD/MANIFEST/TRANSFER-CHECK.txt"   # should read: RESULT : PASS

rsync -a "$SSD/claude/projects/"        ~/.claude/projects/
rsync -a "$SSD/codex/"                  ~/.codex/
rsync -a "$SSD/gemini/"                 ~/.gemini/
```

This is your entire Claude conversation history and per-project memory. If the SSD is
absent, substitute Google Drive:
`~/Library/CloudStorage/GoogleDrive-<gmail>/My Drive/Backups/Machine/`

---

## Step 4 — Restore DEV

Three passes. **The second pass is the one that did not exist before 2026-08-03** — it
restores the 4.13 GB that git never tracked.

```bash
mkdir -p ~/Desktop/DEV && cd ~/Desktop/DEV

# 4a — tracked code from GitHub
for r in CFB_Victory_Model DataBase_GPS_Reporting DexaProject ForcePlate_DecisionSystem \
         KeystoneOS Kinexon_Volleyball morning-briefing PlayerProfiles_FB_03-28-2026 \
         Program_Context_Meet project-triage Risk_Stratification_Engine \
         RTP_DataCollection_Talk SportScienceResearchRepo token-dashboard Travel_Map \
         ValdReport Website ZoteroInjestion; do
  gh repo clone "erash11/$r" || echo "FAILED: $r"
done
git clone https://github.com/erash11/SecondBrain.git ~/Desktop/SecondBrain

# 4b — CRITICAL: overlay the gitignored data git could never carry
rsync -a "$SSD/DEV-repo-data/" ~/Desktop/DEV/

# 4c — the 32 folders that were never git repos
rsync -a "$SSD/DEV-nonrepo/" ~/Desktop/DEV/
```

**Why 4b matters.** `gh repo clone ForcePlate_DecisionSystem` gives you 7 MB of code and a
database-shaped hole. The real `data/forceplate.db` (173 MB) plus 1.5 GB of dated backups
live only in `DEV-repo-data`. Same for `Risk_Stratification_Engine` (1,813 MB of outputs)
and `morning-briefing` (382 MB). Skip 4b and everything clones cleanly and nothing runs.

**Verify the overlay landed:**

```bash
ls -lh ~/Desktop/DEV/ForcePlate_DecisionSystem/data/forceplate.db   # expect ~173 MB
du -sh ~/Desktop/DEV/Risk_Stratification_Engine                     # expect ~1.8 GB
```

`token-dashboard` is `nateherkai/token-dashboard`, not yours — clone from that remote.

---

## Step 5 — Python environments

```bash
cd ~/Desktop/DEV/morning-briefing && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cd ~/Desktop/DEV/ZoteroInjestion  && uv sync
```

Other projects with dependency manifests — rebuild as you first need each one:
`AI_Analyst/ai-analyst`, `DataBase_GPS_Reporting/gps_report`, `Football/PFF_Data_Project`,
`Football/BodWeightWeb`, `Football/FootballWeightTargetTool`, `ForcePlate_DecisionSystem`,
`PlayerProfiles_FB_03-28-2026`, `PracticeIntensity`, `Risk_Stratification_Engine`,
`LibraryProject/ZoteroInjestion`.

```bash
pip install memsearch
```

**After every `pip install` of memsearch, reapply the local flush patch** (notes in the
compiler repo). Missing it is silent except for entries in
`~/.claude/global-memory/transcripts/.errors.log`. Milvus is optional on day one — the
index rebuilds by reindexing and nothing is lost if absent. Apple Silicon support is
unconfirmed; Docker is the fallback.

---

## Step 6 — Go CLIs

Rebuilt from source, so Apple Silicon is a non-issue.

```bash
go install github.com/.../catapult-openfield-connect-pp-cli@latest
go install github.com/.../espn-pp-cli@latest
go install github.com/.../fireflies-pp-cli@latest
go install github.com/.../zotero-research-library-pp-cli@latest
go install github.com/.../flight-goat-pp-cli@latest
go install github.com/.../movie-goat-pp-cli@latest
go install github.com/.../recipe-goat-pp-cli@latest
go install github.com/.../printing-press@latest
echo 'export PATH="$HOME/go/bin:$PATH"' >> ~/.zshrc
```

Module paths are in each skill's `SKILL.md` under `~/.claude/skills/pp-*`. These back the
`pp-catapult-openfield-connect`, `pp-espn`, `pp-fireflies`, and
`pp-zotero-research-library` skills; those skills stay broken until the binaries are on `PATH`.

---

## Step 7 — MCP servers

Two are configured globally: `remarkable` and `zotero-research`. Both re-register from
`~/.claude.json`, restored in Step 2. Every OAuth-backed connector (Fireflies, Gmail,
Google Drive, Microsoft 365) re-authenticates on first use — expect a browser prompt.

---

## Step 8 — Credentials (nothing works without this)

No backup contains a credential value. Recreate each from your password manager.

| File to recreate | Issuing service |
|---|---|
| `DEV/ForcePlate_DecisionSystem/.env` | VALD / ForceDecks |
| `DEV/DataBase_GPS_Reporting/gps_report/.env` | Catapult OpenField |
| `DEV/Football/PFF_Data_Project/.env` | PFF |
| `DEV/PlayerProfiles_FB_03-28-2026/.env` | internal DB |
| `DEV/reMarkale_extract/.env` | reMarkable |
| `DEV/Football/FaceComps/simulator/.env.local` | Supabase + Vercel |
| `DEV/morning-briefing/secrets/gmail_credentials.json` | Google Cloud OAuth client |
| `DEV/morning-briefing/secrets/gmail_token.json` | regenerated by `scripts/reauth.bat` → port to `.sh` |

Each directory has a matching `.env.example` listing required key names — restored by
Step 4a, so the shape is documented even though the values are not.

> Phase 2 of the migration spec produces `CREDENTIALS.md`, recording key names and reissue
> URLs properly. Until that exists, this table is the inventory.

**Known live issue as of 2026-08-03:** Outlook auth for `morning-briefing` is expired —
today's brief sent with 0 email threads. Reauthenticate during migration rather than
carrying the failure across.

---

## Step 9 — Scheduled jobs → launchd

Eight tasks port. One is retired.

| Windows task | Schedule | Script | On Mac |
|---|---|---|---|
| KeystoneOS Morning | daily 06:00 | `KeystoneOS/scripts/run-job.ps1 -Job morning-cadence` | port |
| KeystoneOS-DailyBackup | daily 00:30 | `~/.claude/scripts/daily-backup.ps1` | port **after** Step 10 |
| KeystoneOS-Reconcile | daily 07:00 + logon | `KeystoneOS/scripts/keystone-reconcile.ps1` | port |
| KeystoneOS-AgySync | ~6-hourly | `KeystoneOS/scripts/keystone.ps1 agy-sync` | port |
| KeystoneOS-Rituals | weekly 15:30 / 17:00 | `KeystoneOS/scripts/ritual-check.ps1 -Notify` | port |
| KeystoneOS-StackDoctor | weekly Mon 10:30 | `skills/claude-stack-doctor/scripts/weekly-check.ps1` | port |
| KeystoneOS-Adjudicate | weekly 02:30 | `claude-memory-compiler/scripts/weekly-adjudicate.ps1` | port |
| MorningBriefing | daily 07:20 | `morning-briefing/scripts/run_with_logging.cmd` | rewrite as `.sh` |
| KeystoneOS-MsysKeepAlive | at logon | `bash -c "exec sleep infinity"` | **RETIRE** |

**Retire MsysKeepAlive deliberately.** It exists only to hold an MSYS2 process open and
dodge the Git-Bash/Active-Directory spinlock stall. macOS has no MSYS2 and no AD lookup in
that path. Porting it would carry a workaround for a problem that cannot occur. Its
`3221225786` exit code on Windows was the benign sleep-kill signature, not a failure.

Template — `~/Library/LaunchAgents/com.keystone.dailybackup.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.keystone.dailybackup</string>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/bin/pwsh</string>
    <string>-NoProfile</string>
    <string>-File</string>
    <string>/Users/YOURNAME/.claude/scripts/daily-backup.ps1</string>
  </array>
  <key>StartCalendarInterval</key><dict>
    <key>Hour</key><integer>0</integer><key>Minute</key><integer>30</integer>
  </dict>
  <key>StandardOutPath</key><string>/Users/YOURNAME/.claude/scripts/logs/daily-backup.log</string>
  <key>StandardErrorPath</key><string>/Users/YOURNAME/.claude/scripts/logs/daily-backup.err</string>
</dict></plist>
```

```bash
launchctl load -w ~/Library/LaunchAgents/com.keystone.dailybackup.plist
launchctl list | grep keystone
```

Replace `YOURNAME` throughout — launchd does not expand `~` or `$HOME`.

---

## Step 10 — Port the backup, and deal with NTFS

`daily-backup.ps1` needs three changes: `robocopy` → `rsync -a --delete`,
`Register-ScheduledTask` → the launchd plists above, and Windows paths → macOS paths.

**The NTFS problem — resolved 2026-08-04.** This step used to require reformatting,
macFUSE, or a new drive, because the backup lived on NTFS and macOS mounts NTFS
read-only. The backup now lives on `E:` (exFAT), which macOS reads and writes natively.
Point the ported backup script at the exFAT drive's mount path and nothing else is needed.

Two things still worth doing:

- **Label the drive.** An unlabelled exFAT volume mounts as `/Volumes/NO NAME`; the space
  breaks unquoted paths in scripts and launchd plists. Name it `ASSISTANT`.
- **Replace the flash drive eventually.** E: is a USB stick — fine for transport, but
  flash wears out under sustained daily backup writes and tends to fail without warning.
  Move the nightly target to a proper external SSD once you have one on the Mac. The WD
  (NTFS, retained as archive) can be reformatted to exFAT then, since by that point a
  verified copy exists in two other places.

Also retarget destinations: Baylor OneDrive is gone, so the manifest's `institutional`
paths need a new home — the SSD and Google Drive.

Only three files hardcode Windows paths: `~/.claude/CLAUDE.md`, `scripts/daily-backup.ps1`,
`scripts/fix-msys-ad-stall.ps1`. `settings.json` and the hooks are already portable.
`fix-msys-ad-stall.ps1` should be **deleted, not ported** — same reasoning as MsysKeepAlive.

Rewrite `~/.claude/CLAUDE.md`'s tool-path block for macOS:

```
Python: /usr/local/bin/python3   (or /Library/Frameworks/Python.framework/...)
uv:     /opt/homebrew/bin/uv
Go:     /opt/homebrew/bin/go
Node:   /opt/homebrew/bin/node
Go CLIs: ~/go/bin/
```

Drop the "prefer PowerShell over Bash" guidance — it exists because of the Windows
Git-Bash/AD stall. On macOS, bash and zsh are the native surface.

---

## Step 11 — Verify, and correct this document

The acceptance test. Anything that fails here is a bug in *this document* — fix it and
commit, per the maintenance rule at the bottom.

- [ ] `claude --version` runs; `/context` shows your skills loaded
- [ ] `ls ~/.claude/skills | wc -l` matches the Windows count
- [ ] `ls -lh ~/Desktop/DEV/ForcePlate_DecisionSystem/data/forceplate.db` ≈ 173 MB
- [ ] `du -sh ~/Desktop/DEV/Risk_Stratification_Engine` ≈ 1.8 GB
- [ ] `du -sh ~/Desktop/DEV/Football` ≈ 3 GB
- [ ] `git -C ~/.claude status` clean; `git -C ~/Desktop/SecondBrain status` clean
- [ ] `pwsh -NoProfile -File ~/.claude/skills/claude-stack-doctor/scripts/stack-check.ps1` → **ALL CLEAR**
- [ ] A morning briefing generates end-to-end with real email threads
- [ ] `launchctl list | grep keystone` shows 8 agents
- [ ] Ask Claude "what do you remember about the KeystoneOS durability work" — memory recall works
- [ ] One nightly backup cycle completes and writes a receipt

---

## Step 12 — Skill triage

37 skills reference Windows-specific commands. That figure is an upper bound from a loose
grep; most are incidental path examples. Confirmed work:

| Skill | Problem | Fix |
|---|---|---|
| `everything-search` | Everything CLI is Windows-only | Rewrite on `mdfind` (Spotlight) |
| `claude-stack-doctor` | Task Scheduler queries | Rewrite against `launchctl` |
| `closeout`, `project-triage`, `forecast-capture` | Call `.ps1` with Windows paths | Path fixes; `pwsh` runs them |
| `html-to-pdf` | Hardcoded Chrome path | Point at `/Applications/Google Chrome.app/...` |

Triage the rest as you hit them. A skill that fails is a nuisance, not a data-loss event.

---

## Corrections to `RESTORE.md`

Found by audit on 2026-08-03; fold these in when you next touch that file:

1. **Wrong:** "Paths inside `~\.claude\settings.json` and hooks reference `C:\Users\eric_rash`."
   They do not. Only 3 files do, none of them `settings.json`.
2. **Incomplete:** the map has no row for gitignored data inside git repos — the 4.13 GB
   gap. "Code & analysis projects → GitHub" implies coverage that `git push` never provided.
3. **Stale:** DEV-NonRepo lists Baylor OneDrive as sole destination. As of 2026-08-03 the
   SSD holds the authoritative copy.
4. **Missing:** no mention of `D:\AssistantBackup` at all.

---

## Keeping this document honest

This file is tracked in `dotclaude` and mirrored to the SSD. It has **not been executed
end-to-end** — Step 11 is where it earns trust. When you run the migration, correct every
step that turns out wrong *in the same session*, and commit. A migration guide that has
never been run is a hypothesis; one that has been run and corrected is a procedure.
