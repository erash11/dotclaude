export const meta = {
  name: 'review-windows-holdover-fixes',
  description: 'Adversarial review of tonight\'s 5 Windows-holdover fix commits before push',
  phases: [
    { title: 'Review', detail: '3 lenses: breaks a live job, unsafe delete, wrong claim' },
  ],
}

const COMMITS = args.commits
const CTX = `Tonight five commits fixed Windows-era leftovers on Eric's Mac. They are committed locally, NOT pushed. Review them read-only.
Commits (repo path : sha):
${COMMITS.map(c => `- ${c.repo} : ${c.sha}`).join('\n')}
Use: git -C <repo> show <sha> (and --stat). The audit that drove them: /Users/kristinarash/.claude/audits/2026-10-23-windows-holdover-audit.md (sections by item id).
HARD RULES: read-only. No edits, commits, pushes, launchctl changes, kickstarts, or running scheduled jobs. Do not read through ~/Library/CloudStorage. Never print secret values. macOS has no "timeout"; wrap anything slow in perl -e 'alarm 60; exec @ARGV' <cmd>. dcg blocks pwsh -Command with inline expansion: write a .ps1 into /private/tmp/claude-501/-Users-kristinarash-DEV/9289b0c8-ebfe-4a3d-819c-3fbb5bbe786d/scratchpad/ and run pwsh -NoProfile -File.
Report only real defects with evidence (file:line, command output). If a commit is fine, say so. Do not report style nits.`

const FINDINGS = {
  type: 'object',
  properties: {
    verdict: { type: 'string', description: 'one paragraph' },
    defects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          repo: { type: 'string' }, file: { type: 'string' }, line: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'should-fix', 'minor'] },
          defect: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' },
        },
        required: ['repo', 'file', 'severity', 'defect', 'evidence', 'fix'],
      },
    },
  },
  required: ['verdict', 'defects'],
}

const LENSES = [
  { key: 'live-jobs', prompt: `LENS: does any change break a live scheduled job tomorrow? Live jobs: com.keystone.morning (06:00, pwsh run-job.ps1 -Job morning-cadence -> morning-cadence.ps1 -> keystone.ps1 meeting-sync etc.), com.keystone.dailybackup (hourly 12-17 via daily-backup-login.sh -> daily-backup.ps1), com.keystone.reconcile (07:00 + login, reads KeystoneOS/data/jobs.json successProbe), com.keystone.nightlydigest (21:00, newly installed, python3 nightly-digest.py), the job-watch mod (~/.claude/mods/job-watch, status line). For each changed script: trace the edited code path as it runs under launchd (env = only PATH from the plist, plus HOME/USER; pwsh -NoProfile). Check: keystone.ps1 Invoke-MeetingSync — does $LASTEXITCODE still mean what the code assumes after the rewrite (capturing into $syncOut, the security call, the scriptblock)? Could the Keychain read hang or prompt? Does any output change break callers that parse it? daily-backup.ps1 step 2b-harvest — $LASTEXITCODE after a piped Out-String; anything that could make the whole backup end ERROR every day? Variables $U, $IsMacOS, $DryRun in scope there? jobs.json — is the restored pattern valid JSON-escaped regex, and does reconcile's Test-Probe now match today's cadence.log line? Could restoring it trigger an unwanted make-up run (read keystone-reconcile.ps1 logic)? register.ts — reading a ~770 KB log every 10 min: any risk? nightly-digest — run behaviour if git fetch hangs on a repo; does the crash handler itself fail if fd failed to import?` },
  { key: 'deletes', prompt: `LENS: were any deletions unsafe? Try hard to find a live caller or unique content for every deleted file. Deleted: KeystoneOS scripts/{install-agy-sync-task,install-morning-cadence-task,install-reconcile-task,install-ritual-task,harden-scheduled-tasks}.ps1; ~/.claude audits/recall-eval/{weekly-chain,run-eval,after-run}.ps1 and LATEST.md; ~/.claude scripts/{memsearch-drain,backup-ai-sessions,fix-msys-ad-stall,backup-progress,backup-status2,find-backup-tasks,install-backup-triggers,review-prep,survey-activity,survey-gaps,survey-pathdeps,survey-recovery,survey-staleness,survey-tasks2,verify-crossmachine,verify-nothing-moved}.ps1, daily-backup.ps1.win-orig, backup-manifest.windows.json, scripts/retired/*; ~/DEV/_INBOX migration-tools/ (184 files), refresh_all_data.bat, backup_dev.ps1, backup_ai_sessions.ps1, FIX-WINDOWS-BACKUP.md. Search: ~/Library/LaunchAgents, ~/.claude/settings*.json, ~/.codex (hooks.json, config.toml, hooks/), ~/.claude/hooks, ~/.claude/mods, every SKILL.md under ~/.claude/skills and ~/.agents/skills, ~/.claude/claude-memory-compiler/scripts, KeystoneOS scripts/tests/data, ~/DEV/*.md (COMMANDS.md, WORKFLOW.md), ~/.claude/*.md (RESTORE.md, START-HERE.md), dot-sourcing (". ./x.ps1", "& $PSScriptRoot/x"), python/js that shells out. Also: does any KeystoneOS or ~/.claude TEST now fail because a deleted file is missing (run the portable KeystoneOS tests that mention them, read-only)? Note: the Windows laptop still pulls dotclaude for desktop-app sessions but runs no automation or terminal; a Windows-only file needed by a Windows desktop-app session would matter.` },
  { key: 'claims', prompt: `LENS: are the new comments, docs and commit messages true? Check every factual claim added tonight against the code and logs: KeystoneOS AGENTS.md (ops/ plists list, reconcile "at login and daily at 07:00", rituals "Mon-Fri 17:00 and Fri 15:30", "disabled since 2026-09-24", the bootstrap/bootout instructions — do they work as written?), CLAUDE.md paths, memory-index-paths.json _notes, morning-cadence.ps1 header, keystone.ps1 comments (e.g. "failed silently every morning until 2026-10-23" — check outputs/morning/cadence.log for when Meeting Sync last succeeded on a scheduled run), daily-backup.ps1 comments, verify-backup.ps1 comments, nightly-digest.py shortcut comment, stack-doctor SKILL.md new sentence, the five commit messages. Also check: do the six ops/*.plist copies match ~/Library/LaunchAgents byte for byte (cmp)? Does the stack-doctor skill or stack-check.ps1 still tell agents to look at LATEST.md or the deleted scripts anywhere else? Does COMMANDS.md still document verify-backup.ps1 correctly for the new behaviour (FAIL + exit 1 when CRASHBOX is absent)?` },
]

phase('Review')
const results = await parallel(LENSES.map(l => () =>
  agent(`${CTX}\n\n${l.prompt}`, { label: `review:${l.key}`, phase: 'Review', schema: FINDINGS })
    .then(r => r ? { lens: l.key, ...r } : null)))
return results.filter(Boolean)
