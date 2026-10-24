export const meta = {
  name: 'windows-holdover-audit',
  description: 'Read-only audit of Windows-era scripts, jobs and paths still on the Mac; skeptic re-checks every port/delete call',
  phases: [
    { title: 'Inventory', detail: '6 read-only auditors, one area each' },
    { title: 'Verify', detail: 'skeptic tries to refute every port and delete recommendation' },
  ],
}

const A = args
const ITEM = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    location: { type: 'string', description: 'exact path(s) or plist label' },
    windows_origin: { type: 'string', description: 'why this is Windows-era: evidence' },
    what_it_does: { type: 'string' },
    mac_status: { type: 'string', enum: ['ported', 'ported-on-pwsh', 'dead-on-mac', 'never-ported', 'retired-by-eric', 'windows-only-by-nature', 'partly-broken'] },
    referenced_by: { type: 'string', description: 'live things that call or read it (plist, hook, SKILL.md, jobs.json, script). "none found" if none, with the search you ran' },
    evidence: { type: 'string', description: 'commands run and what they showed (log lines with dates, grep hits). No secret values.' },
    recommendation: { type: 'string', enum: ['port', 'delete', 'keep', 'already-done'] },
    effort: { type: 'string', enum: ['minutes', 'hour', 'half-day', 'day-plus', 'n/a'] },
    value: { type: 'string', description: 'what Eric gains if ported, or loses if deleted' },
    finding_id_if_known: { type: 'string', description: 'id from the 2026-10-22 audit if it already covers this, else ""' },
    mid_season_risk: { type: 'boolean', description: 'true if it touches a live in-season pipeline (GPS/Perch/VALD/Football/PFF)' },
  },
  required: ['name', 'location', 'mac_status', 'referenced_by', 'evidence', 'recommendation', 'effort', 'value', 'finding_id_if_known', 'mid_season_risk'],
}
const REPORT = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: '3-5 plain sentences' },
    items: { type: 'array', items: ITEM },
    not_checked: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'items', 'not_checked'],
}

const RULES = `
HARD RULES (all auditors):
- READ-ONLY. Do not edit, move, delete, commit, push, chmod, launchctl load/unload/kickstart, or run any job or script under audit. Reading files, grep, git log/show/diff, plutil -p, gh api GET are fine.
- Never read files through the Google Drive mount (~/Library/CloudStorage/...): those reads hang. Do not walk it. If something only lives on Drive, say so in not_checked.
- Never run "memsearch index". Never print secret values (tokens, keys, passwords); env var NAMES only.
- Skip DexaProject, SpecialRequests/TOS_ES, and any folder whose CLAUDE.md says "local only".
- macOS has no "timeout" binary. For anything that could hang use: perl -e 'alarm 60; exec @ARGV' <cmd>.
- Mid-season: GPS/Perch/VALD pulls, Football, PFF, DataBase_GPS_Reporting are live. Read only, set mid_season_risk=true.
- KNOWN FINDINGS: ${A.findings} is yesterday's 145-finding Mac audit. Grep it for your item before calling something new. If it already covers the item, set finding_id_if_known to the finding id (the "### <id> —" heading) and keep evidence short. Do not rediscover it at length.
- Background facts: the Windows laptop is retired as a work box since 2026-10-14; it now runs only Claude desktop-app sessions, no automation, no terminal. The Mac is the only machine that runs scheduled jobs. Eric deliberately retired: MorningBriefing, the Rituals nudge (com.keystone.rituals disabled, kept off by choice), Cloudroom, okr-tracker, commandcentre. Treat those as retired-by-eric, not as gaps.
- Recommendation meaning: port = a Mac version is missing or broken AND something still needs its output; delete = Windows-only, nothing live calls it, and no unique logic/data is lost (name the twin that replaces it); keep = works on the Mac now, or replace-later; already-done = ported and working.
- Be concrete. Every claim needs a command result in evidence. Report at most ~30 items: group trivially similar files (e.g. one-shot migration helpers) into one item with all paths listed.`

const AREAS = [
  {
    key: 'job-parity',
    prompt: `Area: scheduled-job parity, Windows Task Scheduler vs Mac launchd.
Inputs:
- ${A.tasks}: one line per exported Windows task (18): command | arguments | start time.
- ${A.handoff}: the 2026-10-08 laptop handoff (see "Mac to-dos" and "Next steps" 6). ${A.macprompt} is the prompt the Mac session was meant to run.
- Mac plists: ~/Library/LaunchAgents/com.keystone.*.plist (and ~/.claude/scripts/*.plist, ~/_PARKED_COPIES/handoff-staging/launchd/ for staged-not-installed ones).
- Tier A memory: ~/.claude/projects/-Users-kristinarash-DEV/memory/project_automation-cadence.md (says which ran nowhere as of 10-08: memsearch-drain-weekly recall eval, DailyGmailDigest via DEV/agy/daily_digest.py, Backup AI Sessions, CFB-ForecastCaptureReminder; nightly-digest built but not installed). Also project_cfb-forecast-capture.md, reference_recall-bench.md, project_morning-briefing-retired.md.
- ~/DEV/KeystoneOS/data/jobs.json, ~/.claude/scripts/logs/.
Task: one item per Windows task (18). Classify mac_status. For every task that is NOT running on the Mac and not retired-by-eric or windows-only-by-nature, decide if it is still wanted by checking whether its OUTPUT is still read by anything: grep ~/.claude/skills, ~/.claude/scripts, ~/DEV/*/docs/STATUS.md, ~/DEV/WORKFLOW.md, hooks, for the output file/report name. Also check whether a Mac job already covers the same need under another name (e.g. recall-bench check.py inside the daily backup vs the weekly recall eval; daily backup snapshotting .codex/sessions vs Backup AI Sessions). Env var facts already checked on the Mac (names only): GMAIL_APP_PASSWORD UNSET, GITHUB_PERSONAL_ACCESS_TOKEN UNSET, PFF_DB set, FIREFLIES_API_KEY set, TYPESAFE_API_KEY set. Note if a not-ported job needs one of the unset ones.`,
  },
  {
    key: 'pwsh-jobs',
    prompt: `Area: Mac launchd jobs that still run PowerShell (.ps1 via pwsh). Known set: com.keystone.agysync, adjudicate, morning, rituals (disabled by Eric), stackdoctor, reconcile; plus the daily backup (~/.claude/scripts/daily-backup.ps1, started by daily-backup-login.sh / com.keystone.dailybackup*). Confirm the set: grep -l -E 'pwsh|\\.ps1' ~/Library/LaunchAgents/com.keystone.*.plist.
For each job: (1) plutil -p the plist: program, args, schedule, log paths. (2) Read the .ps1 it runs end to end. List Windows-only constructs that would silently no-op or fail on the Mac: hardcoded C:\\ or backslash paths, $env:USERPROFILE/APPDATA/LOCALAPPDATA, schtasks, Get-ScheduledTask, BurntToast/Windows toast, Start-Process *.exe, Invoke-Item, registry, robocopy, cmd /c, $IsWindows-gated branches that leave the Mac branch empty. Note which are behind an $IsWindows/$IsMacOS guard. (3) Health: read the newest lines of its log(s) (the plist StandardOut/ErrorPath, ~/.claude/scripts/logs/, KeystoneOS logs, ~/.claude/global-memory/transcripts/.errors.log) and report the last OK and last ERROR with dates for the past 14 days. Known: adjudicate silently judged 0 pairs on 10-18 (finding sched-adjudicate-silent-fail-1018); pwsh comes from a deprecated Homebrew tap disabled 2027-06-18 (finding mac-pwsh-deprecated-tap). Recommendation: port only if it fails now or a Windows-only branch drops real work on the Mac; otherwise keep (replace before the tap dies), and say what the port target would be (python3/zsh) and its size.`,
  },
  {
    key: 'dotclaude-scripts',
    prompt: `Area: Windows scripts inside ~/.claude and ~/.codex. List them: find ~/.claude ~/.codex -type f \\( -name '*.ps1' -o -name '*.bat' -o -name '*.cmd' -o -name '*.vbs' -o -name '*.psm1' \\) -not -path '*/node_modules/*' -not -path '*/plugins/cache/*' -not -path '*/skills-archive/*' -not -path '*/projects/*' -not -path '*/.git/*'. Expect ~70: scripts (21), claude-memory-compiler (12), skills (10), plugins (6, non-cache), jobs (5), vendor (4), audits (3), .codex/.tmp (3), .codex/visualizations (2), mods, chrome, _to_delete.
For each: does a .sh/.py/.js twin do the same job on the Mac? Is the .ps1 itself called by anything live: launchd plists in ~/Library/LaunchAgents, hook commands in ~/.claude/settings.json + settings.local.json + ~/.codex/hooks.json/config.toml, any SKILL.md (grep the basename across ~/.claude/skills/*/SKILL.md and ~/.agents/skills), KeystoneOS/data/jobs.json, other scripts that shell out to it. Note that the ritual and morning jobs DO run .ps1 under pwsh on the Mac, so a .ps1 called from those is live, not dead.
Second task: skills whose SKILL.md instructs the agent to run a Windows-only command or path (powershell.exe, .ps1 without pwsh, C:\\ paths, %USERPROFILE%, Windows Task Scheduler, robocopy). Those break when the skill fires on the Mac. grep ~/.claude/skills/*/SKILL.md and their references/ for it.
Known: finding disksec-retired-windows-scripts says ~17 Windows-only .ps1 in ~/.claude/scripts are uncalled; spm-pp-skills-missing-on-mac; mac-pwsh-deprecated-tap. Confirm or correct the 17 with the exact list. Mind the hook-two-copies trap: ~/.claude/hooks and ~/.codex/hooks mirror each other.`,
  },
  {
    key: 'keystone-inbox',
    prompt: `Area: Windows scripts in the KeystoneOS repo and the _INBOX repo.
1) ~/DEV/KeystoneOS: git -C ~/DEV/KeystoneOS ls-files | grep -Ei '\\.(ps1|bat|cmd|vbs|psm1)$' (~50). Read KeystoneOS/AGENTS.md or CLAUDE.md and docs/STATUS.md first. Map which .ps1 are entry points that Mac launchd runs (grep the plists), which are dot-sourced libraries those entry points load, which are keystone.ps1 subcommands, and which nothing calls. For dispatcher scripts (keystone.ps1, run-job.ps1, ritual-check.ps1) list subcommands/jobs that only work on Windows (Task Scheduler, toast, Windows paths) vs work on Mac pwsh. KeystoneOS/data/jobs.json is Windows-era (finding gaps-keystoneos-registry-stale): say what in it is wrong for the Mac, briefly.
2) ~/DEV/_INBOX: git -C ~/DEV/_INBOX ls-files | grep -Ei '\\.(ps1|bat|cmd|vbs|psm1)$' (~165). Most are migration-tools/* one-shot helpers from the Windows->Mac move: treat as ONE grouped item; confirm none is referenced by a live job and that the migration they served is finished (HANDOFF and DEV/docs/STATUS.md). refresh_all_data.bat ran the Windows task Refresh_All_Data (2026-04 start): read it, say what data it refreshed, and whether the Mac refreshes that data some other way (gpspull/perchpull/valdpull plists, project scripts). Group other _INBOX .ps1 by folder.`,
  },
  {
    key: 'dev-repos-paths',
    prompt: `Area: other DEV project repos, plus hardcoded Windows paths in live DEV code.
1) Windows scripts in these repos (git ls-files | grep -Ei '\\.(ps1|bat|cmd|vbs|psm1)$'): SportScienceResearchRepo (26), VALD_Performance (16), cmj-traffic-light (3), printing-press-library (2), Weekly_Research_Review (2), Volleyball_GRID (2), Flint (2), CFB_Victory_Model (2), sleep-scheduler, ZoteroInjestion, PP_Recruiting, Education_Alignment_Initiative, CLI_Dev/printing-press (2). Repo paths: find ~/DEV -maxdepth 3 -name .git -not -path '*/_ARCHIVE/*'. For each script: is there a Mac twin, and is it referenced by a live thing (launchd plist, a SKILL.md, a README "how to run" that is the only documented run path, another script). VALD_Performance first: compare its .ps1 to what com.keystone.valdpull actually runs (plutil -p). CFB_Victory_Model: cfb_reminder_popup.ps1 was the Windows CFB-ForecastCaptureReminder task.
2) Hardcoded Windows paths in live code across ~/DEV git repos (skip _ARCHIVE, node_modules, .venv, renv, graphify-out, *.ipynb outputs, *.jsonl, docs/handoffs, data folders, lock files). For each repo: git -C <repo> grep -nIE 'C:\\\\\\\\Users|C:/Users|C:\\\\Users|eric_rash|G:\\\\|G:/My Drive|Desktop\\\\DEV|schtasks|powershell(\\.exe)?' -- '*.py' '*.R' '*.r' '*.Rmd' '*.qmd' '*.json' '*.yaml' '*.yml' '*.toml' '*.sh' '*.js' '*.ts' '*.cfg' '*.ini' '*.env.example' '.Rprofile'. Report repos where a path is used as a live default (not a comment, not a doc example, not inside an os/platform branch that has a Mac path too). These break silently the next time the script runs. Group per repo; list file:line for the live ones. Flag in-season repos (GPS/VALD/Perch/Football/PFF/DataBase_GPS_Reporting) mid_season_risk=true.`,
  },
  {
    key: 'restore-github',
    prompt: `Area: things that lived on the Windows laptop and never came over, plus GitHub.
1) Restore-copy diff. The laptop's ~/.claude was restored to ~/_PARKED_COPIES/Restore/work-laptop-2026-10-08/claude/.claude. Compare these subtrees to the live ~/.claude: hooks, scripts, skills (top-level dirs only), jobs, commands, agents, claude-memory-compiler/scripts, mods, dev-mods. Use: diff -rq --exclude=.git --exclude=node_modules --exclude=__pycache__ --exclude=.venv --exclude=logs <laptop>/<sub> ~/.claude/<sub> | grep 'Only in .*_PARKED' . For each file only in the laptop copy: was it live on Windows (wired in the laptop copy's settings.json / settings.local.json hooks, named in the Windows task list ${A.tasks}, or called by a laptop skill)? Does the Mac have an equivalent under another name? Also diff the HOOK WIRING: hook commands in the laptop settings.json vs ~/.claude/settings.json (event + script basename), list hooks wired on Windows but not on the Mac. Ignore known removals: LIFEOS, okr-tracker, morning-briefing, commandcentre, the 99 skills archived 2026-09-12 (see ~/.claude/skills-archive/), and anything in _to_delete. Also list top-level dirs of ~/_PARKED_COPIES/Restore/work-laptop-2026-10-08/ and say if any other restored folder (e.g. codex, agents) holds scripts/automation not present live.
2) GitHub. Already established: all 160 erash11 repos are cloned on the Mac and there is no Windows CI. Remaining question: does any unmerged branch carry Windows-era automation (scripts, hooks, scheduled-task code) that never reached the default branch? Repos with extra branches: KeystoneOS (pre-rebase-checkpoint-20260803 and worktree-* branches), dotclaude, claude-skills, ZoteroInjestion (mac-snapshot-2026-09-09), Wilhelm_Brody_RTP (mac-snapshot-2026-09-09, mac-specialrequests-master), project-triage, sleep-scheduler, PP_Recruiting/Flint/TypeSafe_Sandbox (rescue-temp-handoffs). Use gh api 'repos/erash11/<repo>/compare/<default>...<branch>' --jq '{ahead:.ahead_by, files:[.files[].filename]}' (read-only). Report only branches that are ahead AND touch *.ps1, *.sh, hooks/, scripts/, *.plist, jobs.json, or settings*.json. One grouped item for the rest.`,
  },
]

phase('Inventory')
const reports = await parallel(AREAS.map(a => () =>
  agent(`You are a read-only auditor. Eric moved from a Windows laptop to a Mac over the last few months. Find Windows-era scripts, hooks and scheduled processes that are still around, and decide for each one: port to the Mac, delete, keep, or already done.\n${RULES}\n\n${a.prompt}\n\nReturn the structured report.`,
    { label: `audit:${a.key}`, phase: 'Inventory', schema: REPORT })
    .then(r => r ? { area: a.key, ...r } : null)))

const ok = reports.filter(Boolean)
const failed = AREAS.map(a => a.key).filter(k => !ok.find(r => r.area === k))
if (failed.length) log(`Auditors that returned nothing: ${failed.join(', ')}`)

// skeptic only over port + delete: those cost Eric time or lose data
const contested = ok.flatMap(r => r.items.map((it, i) => ({ id: `${r.area}#${i}`, area: r.area, ...it })))
  .filter(it => it.recommendation === 'port' || it.recommendation === 'delete')
log(`${ok.reduce((n, r) => n + r.items.length, 0)} items found; ${contested.length} port/delete calls go to the skeptic`)

phase('Verify')
const VERDICTS = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          verdict: { type: 'string', enum: ['upheld', 'refuted', 'changed'] },
          corrected_recommendation: { type: 'string', enum: ['port', 'delete', 'keep', 'already-done'] },
          reason: { type: 'string', description: 'the command result that decided it' },
        },
        required: ['id', 'verdict', 'corrected_recommendation', 'reason'],
      },
    },
  },
  required: ['verdicts'],
}
let verdicts = { verdicts: [] }
if (contested.length) {
  verdicts = await agent(`You are a skeptic. Other auditors recommended porting or deleting the items below. Try to REFUTE each one with commands.\n${RULES}\n\nFor a DELETE: look hard for anything live that calls or reads it (launchd plists, hooks in ~/.claude/settings*.json and ~/.codex, SKILL.md files in ~/.claude/skills and ~/.agents/skills, KeystoneOS jobs.json, dot-sourcing from another .ps1, README run steps) and for unique logic or data with no Mac twin. If you cannot confirm it is safe, the verdict is refuted -> keep. Deleting by mistake loses work.\nFor a PORT: look for an existing Mac job or script that already covers the need under another name, a memory or STATUS note where Eric retired it, or the absence of any consumer of its output. If nothing still reads its output, it is refuted -> keep (or delete). A port costs Eric time.\nUse "changed" when the item is real but the recommendation or effort is wrong.\n\nITEMS (JSON):\n${JSON.stringify(contested, null, 1)}`,
    { label: 'skeptic:port-delete', phase: 'Verify', schema: VERDICTS, effort: 'high' }) || { verdicts: [] }
}
const vmap = Object.fromEntries((verdicts.verdicts || []).map(v => [v.id, v]))
const unverified = contested.filter(c => !vmap[c.id]).map(c => c.id)
if (unverified.length) log(`Skeptic gave no verdict for: ${unverified.join(', ')}`)

return {
  reports: ok.map(r => ({
    area: r.area, summary: r.summary, not_checked: r.not_checked,
    items: r.items.map((it, i) => ({ ...it, skeptic: vmap[`${r.area}#${i}`] || null })),
  })),
  failed_areas: failed,
  unverified,
}
