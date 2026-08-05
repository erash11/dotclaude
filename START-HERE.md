# START-HERE.md — hand this to Claude Code on the new Mac

**You are Eric.** You have just unboxed a MacBook, plugged in the exFAT drive, and opened
Claude Code. This file is how you get everything back.

There are two parts. **Part 1** is what you type. **Part 2** is the runbook Claude follows —
you do not need to read it, but it is here so nothing depends on Claude improvising.

---

# PART 1 — What you type

Install Claude Code first if it is not there (`npm install -g @anthropic-ai/claude-code`,
which needs Node — `brew install node`). Then open a terminal, run `claude`, and paste this:

> Read the file `/Volumes/ASSISTANT/AssistantBackup/START-HERE.md` and execute Part 2, the
> restore runbook, starting at Phase 0. Work through the phases in order. Stop at every
> CHECKPOINT and show me what you found before continuing. Do not skip Phase 4.2, the
> overlay — it is the one that matters. If the drive is not at that path, run
> `ls /Volumes/` and ask me which one it is rather than guessing.

That is the whole instruction. Everything else is in Part 2.

**If the drive is not named `ASSISTANT`:** run `ls /Volumes/` and substitute the real name.
An unlabelled exFAT volume mounts as `/Volumes/NO NAME` — the space matters, so quote it.

---

# PART 2 — Restore runbook (Claude executes this)

## AS-EXECUTED CORRECTIONS — 2026-08-05 (first real execution)

This runbook was executed 2026-08-05 on the new Mac (user account `kristinarash`).
Phases 0–5 ran via `restore.command`; Phases 6–9 via Claude Code. Everything below
is what reality disagreed with. Read this section FIRST if executing again.

**Phase 0 — add a network precondition.** DNS was down during the scripted run, so
all 18 GitHub clones failed silently-ish (17 logged failures). Nothing later works
without the clones. Add: `curl -sI https://github.com` must succeed before Phase 4,
or clone from `$SSD/repos/` mirrors instead.

**Clone-repair procedure (used to fix Phase 4 after the fact).** When target dirs
already hold overlay data: `git init` in place, `git fetch origin`, point HEAD+index
at origin's default branch (`git update-ref` + `git symbolic-ref` + `git reset --mixed`),
then check out ONLY missing tracked files (`git ls-files -z --deleted | xargs -0 git
checkout --`). This preserves uncommitted overlay edits. Same procedure fixed
SecondBrain (the Phase 3 rsync does not carry `.git` — the drive copy has none).

**DEV lives at `~/DEV`, not `~/Desktop/DEV`.** Eric moved it post-restore. Every
path in scripts, data files, and skills was updated accordingly.

**exFAT mode bits.** Everything restored from the drive arrives mode 755, so git
shows hundreds of phantom "modified" files. Run `git config core.fileMode false`
in every restored repo.

**Phase 2 was wrong about skills.** `~/.claude/skills` on this Mac already held a
different (LifeOS) skill set, and dotclaude gitignores `skills/` — so the
`claude-skills` clone never happened and nothing noticed. The REAL skill set
(claude-stack-doctor, closeout, project-triage, graphify, pp-*, 43 uncommitted
edits) existed ONLY on the drive at `$SSD/claude/skills` (a full git repo).
Phase 3 must also rsync: `claude/skills`, `claude/agents`, `claude/config`,
`claude/hooks`, `claude/scripts`, and `claude/claude-memory-compiler/{daily,knowledge,reports}`
(gitignored compiler data — 65 daily logs existed only on the drive).

**Phase 5 corrections.**
- morning-briefing has NO `requirements.txt` — it is a pyproject project; build with
  `python3 -m venv .venv && uv pip install -r pyproject.toml --python .venv/bin/python`
  (editable install fails: setuptools flat-layout chokes on the restored `logs/` dir).
- System Python is brew 3.14 (PEP 668) — `pip install memsearch` fails. Use
  `uv tool install 'memsearch[onnx]'` and set `memsearch config set embedding.provider onnx`
  (default is openai and needs an API key the pipeline does not have).
- The memsearch "flush patch" contents are documented NOWHERE in any backup. Signal
  of its absence: entries in `global-memory/transcripts/.errors.log`. Re-derive it
  or accept the watch signal.
- Go module paths are NOT in GitHub skills — they are in the drive skills repo's
  `pp-*/SKILL.md`: `github.com/mvanhorn/printing-press-library/library/<cat>/<name>/cmd/<name>-pp-cli@latest`.
  5 of 7 install cleanly. `catapult-openfield-connect` and `zotero-research-library`
  build from a local `~/printing-press` tree that exists in NO backup — reinstall via
  `npx -y @mvanhorn/printing-press` when the registry carries them, or re-clone the source.

**Phase 6 corrections.**
- The drive carried SIX live credential files, not one: the FaceComps exception PLUS
  `.env` for DataBase_GPS_Reporting/gps_report, ForcePlate_DecisionSystem,
  Football/PFF_Data_Project, PlayerProfiles_FB_03-28-2026, and reMarkale_extract —
  captured before the 2026-08-04 deny-list existed. They restored working credentials
  (convenient) but sat on an unencrypted drive (exposure). The ported backup's
  deny-list now excludes them; the drive copies still need deleting once values are
  in the password manager.
- `reauth.bat` → `scripts/reauth.sh`; needs `playwright install chromium` in the venv.

**Phase 7 corrections.**
- True schedules (from the install scripts, not this file's table): Rituals =
  weekdays 17:00 + Friday 15:30; Adjudicate = SUNDAY 02:30.
- launchd plists need an explicit `EnvironmentVariables` PATH including
  `/opt/homebrew/bin` — agents cannot find pwsh/git/uv otherwise.
- All agents use label prefix `com.keystone.*` (including morningbriefing and
  stackdoctor) so `launchctl list | grep keystone` counts all 8.

**Phase 8 corrections — far more than 3 files were Windows-bound.**
Also required: `keystone.ps1`, `ritual-check.ps1`, `weekly-adjudicate.ps1`,
`morning-cadence.ps1`, `run-job.ps1` (pwsh.exe lookup, -WindowStyle, taskkill),
`agy-sync.ps1`, `run-ledger.ps1`, `os-freshness.ps1`, `backfill-meeting-tags.ps1`,
KeystoneOS `data/*.json` (jobs, projects, discovery-roots, memory-sources),
`backup-manifest.json` destinations, settings.json hooks + defaultShell,
`project-triage/render.py`, `html2pdf.ps1`. `run-job.ps1` gained a `bash` exe type
for `run_with_logging.sh`.

**New macOS-only trap: OneDrive Files-On-Demand.** The discovery scan ran
`git status` inside `~/OneDrive - Baylor University/...`, forcing multi-GB
hydration and hanging the morning cadence 40+ minutes. The `baylor_workdrive`
discovery root and memory source are disabled until that folder is pinned
"Always Keep on This Device".

**Phase 9 note.** First real nightly backup run against cloud storage takes ~1h+
(cold DriveFS/OneDrive metadata); later runs are incremental.


## Your operating rules for this task

Read these before running anything.

1. **Verify, do not assume.** After every restore step, check the result with `ls`, `du`,
   or a file count. A command that exits 0 can still have done nothing.
2. **Never delete anything on the backup drive.** It is the only copy present on this
   machine. No `rm`, no `mv` off the drive, no reformatting. Copy *from* it only.
3. **Stop at CHECKPOINTs.** Show the user what you found and wait. Do not batch through.
4. **Two failures = stop and ask.** If a step fails twice, do not try a third approach.
   Report what happened and wait for direction.
5. **Never invent a credential.** If a step needs an API key you do not have, say so and
   move on. A placeholder value is worse than a missing file — it fails confusingly later.
6. **Expect this document to be wrong somewhere.** It was written on 2026-08-04 on the old
   Windows machine and has never been executed. When reality disagrees with it, reality
   wins — record the discrepancy and tell the user at the end (Phase I).

## Phase 0 — Confirm the drive

```bash
ls /Volumes/
export SSD="/Volumes/ASSISTANT/AssistantBackup"     # adjust if the name differs
ls "$SSD"
cat "$SSD/MANIFEST/TRANSFER-CHECK.txt"
```

Expect these directories: `DEV-repo-data`, `DEV-nonrepo`, `DEV-working-tree`, `repos`,
`claude`, `codex`, `gemini`, `SecondBrain`, `MANIFEST`, `_receipts`.

`TRANSFER-CHECK.txt` should end in `RESULT : PASS`.

**CHECKPOINT 0** — report the drive path, the directory list, and the transfer result.
If the transfer result says FAIL, stop. Do not restore from a drive that failed its check.

## Phase 1 — Base toolchain

Versions below are what the old machine ran on 2026-08-04. Match major versions.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"
brew install git gh node go uv powershell/tap/powershell
brew install --cask google-drive
npm install -g @anthropic-ai/claude-code
```

| Tool | Old machine | Note |
|---|---|---|
| Python | 3.14.6 | **python.org installer — NOT brew, NOT the App Store.** The Store build deleted `C:\Python31x` during two prior migrations. Brew's Python moves under your venvs on upgrade. |
| Node | 26.4.0 | brew |
| Go | 1.26.3 | brew |
| uv | 0.11.2 | brew |
| git | 2.54.0 | brew |
| gh | 2.92.0 | brew |
| PowerShell 7 | required | Not optional — the KeystoneOS jobs, stack doctor, and backup are `.ps1` and run natively under `pwsh` on macOS. This is why the port is small. |
| Claude Code | 2.1.220 | npm |

```bash
gh auth login          # GitHub account: erash11
```

**CHECKPOINT 1** — report each tool's installed version.

## Phase 2 — Restore `~/.claude` FIRST

Nothing else works properly until this is done: it carries settings, hooks, agents, and
all skills.

```bash
mkdir -p ~/.claude && cd ~/.claude
git init -b main
git remote add origin https://github.com/erash11/dotclaude.git
git fetch origin
git checkout -f origin/main -b main        # -f overwrites fresh-install defaults

# NOTE (2026-08-05): this clone FAILS SILENTLY if ~/.claude/skills already exists.
# The authoritative skills live on the drive: rsync -a "$SSD/claude/skills/" ~/.claude/skills/
git clone https://github.com/erash11/claude-skills.git          ~/.claude/skills
git clone https://github.com/erash11/claude-global-memory.git   ~/.claude/global-memory
git clone https://github.com/erash11/claude-memory-compiler.git ~/.claude/claude-memory-compiler
```

Verify: `ls ~/.claude/skills | wc -l` should be roughly 60+, and `~/.claude/CLAUDE.md`,
`RESTORE.md`, `CREDENTIALS.md`, `MIGRATION-MACOS.md` should all exist.

**CHECKPOINT 2** — report the skill count and confirm those four files.

## Phase 3 — AI state and conversation history

```bash
rsync -a "$SSD/claude/projects/"        ~/.claude/projects/
rsync -a "$SSD/claude/skills/"          ~/.claude/skills/        # REAL skill set incl. .git
rsync -a "$SSD/claude/agents/"          ~/.claude/agents/
rsync -a "$SSD/claude/hooks/"           ~/.claude/hooks/
rsync -a "$SSD/claude/scripts/"         ~/.claude/scripts/
rsync -a "$SSD/claude/claude-memory-compiler/daily/"     ~/.claude/claude-memory-compiler/daily/
rsync -a "$SSD/claude/claude-memory-compiler/knowledge/" ~/.claude/claude-memory-compiler/knowledge/
rsync -a "$SSD/claude/global-memory/"   ~/.claude/global-memory/
rsync -a "$SSD/codex/"                  ~/.codex/
rsync -a "$SSD/gemini/"                 ~/.gemini/
rsync -a "$SSD/SecondBrain/"            ~/Desktop/SecondBrain/
```

Expected magnitudes from the source machine: `projects` ≈ 1,630 files,
`codex` ≈ 20,727, `gemini` ≈ 1,065, `SecondBrain` ≈ 881.

`global-memory` is also a git repo (Phase 2 cloned it). If rsync creates conflicts there,
prefer the git clone and let rsync only add files git does not have.

**CHECKPOINT 3** — report file counts per directory against those numbers.

## Phase 4 — DEV projects (three passes — do all three)

### 4.1 — Tracked code from GitHub

```bash
mkdir -p ~/Desktop/DEV && cd ~/Desktop/DEV
for r in CFB_Victory_Model DataBase_GPS_Reporting DexaProject ForcePlate_DecisionSystem \
         KeystoneOS Kinexon_Volleyball morning-briefing PlayerProfiles_FB_03-28-2026 \
         Program_Context_Meet project-triage Risk_Stratification_Engine \
         RTP_DataCollection_Talk SportScienceResearchRepo Travel_Map ValdReport \
         Website ZoteroInjestion; do
  gh repo clone "erash11/$r" || echo "FAILED: $r"
done
gh repo clone nateherkai/token-dashboard        # not Eric's — different owner
```

`Website` clones from `erash11/AppliedPerformance-Site`. If `gh repo clone erash11/Website`
fails, use that name.

### 4.2 — THE OVERLAY. Do not skip this.

```bash
rsync -a "$SSD/DEV-repo-data/"    ~/Desktop/DEV/
rsync -a "$SSD/DEV-working-tree/" ~/Desktop/DEV/
```

**Why this exists.** Cloning a repo restores only files git *tracks*. Everything
gitignored — databases, model outputs, large data — is not in GitHub and never was.
`ForcePlate_DecisionSystem` is 7 MB on GitHub against 1,709 MB on disk; the database it
runs on is gitignored. This overlay is 4.13 GB that exists nowhere else in the world.
`DEV-working-tree` restores edits that were uncommitted when the backup ran.

Verify the overlay landed:

```bash
ls -lh ~/Desktop/DEV/ForcePlate_DecisionSystem/data/forceplate.db   # expect ~173 MB
du -sh ~/Desktop/DEV/Risk_Stratification_Engine                     # expect ~1.8 GB
```

If `forceplate.db` is missing, the overlay did not work. Stop and fix it before continuing.

### 4.3 — Non-git project folders

```bash
rsync -a "$SSD/DEV-nonrepo/" ~/Desktop/DEV/
du -sh ~/Desktop/DEV/Football          # expect ~3 GB
```

**CHECKPOINT 4** — report: repos cloned vs failed, the `forceplate.db` size, the
`Risk_Stratification_Engine` size, and the total `du -sh ~/Desktop/DEV`.

## Phase 5 — Python and Go

```bash
cd ~/Desktop/DEV/morning-briefing && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cd ~/Desktop/DEV/ZoteroInjestion  && uv sync
pip install memsearch
```

**After any `pip install` of memsearch, reapply the local flush patch** — notes are in the
`claude-memory-compiler` repo. Missing it is silent except for entries appearing in
`~/.claude/global-memory/transcripts/.errors.log`.

Rebuild other venvs lazily, as you first need each project: `AI_Analyst/ai-analyst`,
`DataBase_GPS_Reporting/gps_report`, `Football/PFF_Data_Project`, `Football/BodWeightWeb`,
`Football/FootballWeightTargetTool`, `ForcePlate_DecisionSystem`,
`PlayerProfiles_FB_03-28-2026`, `PracticeIntensity`, `Risk_Stratification_Engine`,
`LibraryProject/ZoteroInjestion`.

Go CLIs — module paths are in each skill's `SKILL.md` under `~/.claude/skills/pp-*`:

```bash
go install <path>/catapult-openfield-connect-pp-cli@latest
go install <path>/espn-pp-cli@latest
go install <path>/fireflies-pp-cli@latest
go install <path>/zotero-research-library-pp-cli@latest
go install <path>/flight-goat-pp-cli@latest
go install <path>/movie-goat-pp-cli@latest
go install <path>/recipe-goat-pp-cli@latest
go install <path>/printing-press@latest
echo 'export PATH="$HOME/go/bin:$PATH"' >> ~/.zshrc
```

Milvus (for memsearch) is optional on day one — the index rebuilds and nothing is lost.
Apple Silicon support is unconfirmed; Docker is the fallback.

**CHECKPOINT 5** — report which venvs built and which Go CLIs are on PATH.

## Phase 6 — Credentials (interactive — Claude cannot do this alone)

**No backup contains a credential value. That is deliberate and correct.**

Read `~/.claude/CREDENTIALS.md`. It lists, per project, the key *names* and where to
reissue them. Work through its table with the user. For each one: ask, wait, write the
file. Never generate a placeholder.

One exception is already on the drive, recorded in `CREDENTIALS.md`:
`DEV-nonrepo/Football/FaceComps/simulator/.env.local` carries four live values. It was
kept deliberately because the old machine was being decommissioned. Once it is restored
and those values are in the password manager, delete it from the drive.

Known issue carried over: **Outlook auth for `morning-briefing` was expired on 2026-08-04.**
Re-authenticate as part of this phase. `scripts/reauth.bat` is Windows — port it to `.sh`.

`gmail_token.json` is *generated*, never restored. A restored token is usually already
expired and fails in a confusing way.

**CHECKPOINT 6** — list which credentials are in place and which remain outstanding.

## Phase 7 — Scheduled jobs → launchd

Eight port. One is retired deliberately.

| Old task | Schedule | Script |
|---|---|---|
| KeystoneOS Morning | daily 06:00 | `KeystoneOS/scripts/run-job.ps1 -Job morning-cadence` |
| KeystoneOS-DailyBackup | daily 00:30 | `~/.claude/scripts/daily-backup.ps1` |
| KeystoneOS-Reconcile | daily 07:00 + login | `KeystoneOS/scripts/keystone-reconcile.ps1` |
| KeystoneOS-AgySync | ~6-hourly | `KeystoneOS/scripts/keystone.ps1 agy-sync` |
| KeystoneOS-Rituals | weekly 15:30 / 17:00 | `KeystoneOS/scripts/ritual-check.ps1 -Notify` |
| KeystoneOS-StackDoctor | weekly Mon 10:30 | `skills/claude-stack-doctor/scripts/weekly-check.ps1` |
| KeystoneOS-Adjudicate | weekly 02:30 | `claude-memory-compiler/scripts/weekly-adjudicate.ps1` |
| MorningBriefing | daily 07:20 | `morning-briefing/scripts/run_with_logging.cmd` → rewrite as `.sh` |
| ~~KeystoneOS-MsysKeepAlive~~ | — | **RETIRE.** It only existed to dodge a Git-Bash/Active-Directory spinlock on Windows. That failure mode cannot occur on macOS. Porting it would carry a workaround for a problem that does not exist. |

Template — `~/Library/LaunchAgents/com.keystone.dailybackup.plist`. **launchd does not
expand `~` or `$HOME`** — write absolute paths:

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
    <string>/Users/USERNAME/.claude/scripts/daily-backup.ps1</string>
  </array>
  <key>StartCalendarInterval</key><dict>
    <key>Hour</key><integer>0</integer><key>Minute</key><integer>30</integer>
  </dict>
  <key>StandardOutPath</key><string>/Users/USERNAME/.claude/scripts/logs/daily-backup.log</string>
  <key>StandardErrorPath</key><string>/Users/USERNAME/.claude/scripts/logs/daily-backup.err</string>
</dict></plist>
```

```bash
launchctl load -w ~/Library/LaunchAgents/com.keystone.dailybackup.plist
launchctl list | grep keystone
```

**CHECKPOINT 7** — report which agents loaded.

## Phase 8 — Platform fixes

**Port the backup script.** `~/.claude/scripts/daily-backup.ps1` needs: `robocopy` →
`rsync -a` (no `--delete`; the store is deliberately additive), `Register-ScheduledTask` →
the plists above, and Windows paths → macOS paths.

**Do NOT point the nightly backup at the USB stick you restored from.** It is transport
only. Measured write throughput on 2026-08-04 was ~3 MB/s — a nightly run would take over
an hour, and flash wears out under exactly that pattern. Until a proper external SSD is
attached to this Mac, set `destinations.ssd.optional = true` and let the job warn that the
target is absent; the GitHub and Drive paths still run. When a real drive arrives, format
it exFAT, give it a label with no spaces, and set `destinations.ssd.root` to its
`/Volumes/<LABEL>/AssistantBackup` path.

Preserve these behaviours when porting — each was added to fix a real failure:
- **Default-deny.** A DEV directory absent from the manifest must raise an error.
- **Coverage computed, not assumed.** Capture uses `git ls-files --others --ignored` and
  `git diff --name-only` as authority, never a hand-written ignore regex.
- **The credential deny-list.** Files are gitignored for two opposite reasons — too big
  (back up) and secret (never). On 2026-08-04 the capture swept 7,633 files of a live
  authenticated Outlook browser profile onto a portable drive. Do not weaken this.
- **Receipts.** Write a sentinel to each destination and read it back.
- **Additive, never mirrored.** A mirror replicates the deletion you are recovering from.

**Depath the three Windows-bound files:** `~/.claude/CLAUDE.md`,
`scripts/daily-backup.ps1`, `scripts/fix-msys-ad-stall.ps1`. `settings.json` and the hooks
are already portable. **Delete `fix-msys-ad-stall.ps1`** — same reasoning as MsysKeepAlive.

Rewrite the tool-path block in `~/.claude/CLAUDE.md` for macOS, and drop its
"prefer PowerShell over Bash" rule — that existed only because of the Windows Git-Bash
stall. On macOS, zsh/bash is the native surface.

**Skill triage.** Roughly 37 skills reference Windows-specific commands; that is a loose
upper bound and most are incidental. Confirmed work:

| Skill | Problem | Fix |
|---|---|---|
| `everything-search` | Everything CLI is Windows-only | Rewrite on `mdfind` |
| `claude-stack-doctor` | queries Task Scheduler | rewrite against `launchctl` |
| `closeout`, `project-triage`, `forecast-capture` | call `.ps1` with Windows paths | path fixes; `pwsh` runs them |
| `html-to-pdf` | hardcoded Chrome path | `/Applications/Google Chrome.app/...` |

Triage the rest as you hit them. A broken skill is a nuisance, not data loss.

**CHECKPOINT 8** — report what was ported, what was deleted, and the skill triage results.

## Phase 9 — Verify, then correct this document

- [ ] `claude --version` runs and skills load
- [ ] `ls ~/.claude/skills | wc -l` matches the old machine
- [ ] `ls -lh ~/Desktop/DEV/ForcePlate_DecisionSystem/data/forceplate.db` ≈ 173 MB
- [ ] `du -sh ~/Desktop/DEV/Risk_Stratification_Engine` ≈ 1.8 GB
- [ ] `du -sh ~/Desktop/DEV/Football` ≈ 3 GB
- [ ] `git -C ~/.claude status` clean; `git -C ~/Desktop/SecondBrain status` clean
- [ ] `pwsh -NoProfile -File ~/.claude/skills/claude-stack-doctor/scripts/stack-check.ps1` → ALL CLEAR
- [ ] A morning briefing generates end-to-end with real email threads
- [ ] `launchctl list | grep keystone` shows 8 agents
- [ ] Ask Claude "what do you remember about the KeystoneOS durability work" — memory recalls it
- [ ] One nightly backup cycle completes and writes a receipt to the drive

**Then fix this document.** Every step that was wrong, out of order, or missing — correct
it in `~/.claude/START-HERE.md` and `MIGRATION-MACOS.md`, commit to `dotclaude`, and copy
back to the drive. This runbook has never been executed; Phase 9 is where it stops being a
hypothesis and becomes a procedure.

**CHECKPOINT 9** — report the checklist results and every discrepancy found.

## Reference — where everything comes from

| Source | Carries |
|---|---|
| GitHub `erash11` | 19 repos: all tracked code, config, skills, memory, notes |
| This drive | Gitignored data, non-repo folders, uncommitted edits, AI state, mirror clones |
| Google Drive (gmail) | Second copy of `claude-projects`, `codex`, `gemini` |
| Password manager | Every credential. The only source. |

`repos/` on the drive holds mirror clones of all 19 repositories, so a restore is possible
with no network at all — use those if GitHub is unreachable.

## Reference — the three coverage states

Any future change to backup logic must preserve all three. Each was a real failure.

| Git state | Covered by |
|---|---|
| tracked, committed, pushed | GitHub |
| untracked or ignored | drive → `DEV-repo-data` |
| tracked but modified | drive → `DEV-working-tree` |
