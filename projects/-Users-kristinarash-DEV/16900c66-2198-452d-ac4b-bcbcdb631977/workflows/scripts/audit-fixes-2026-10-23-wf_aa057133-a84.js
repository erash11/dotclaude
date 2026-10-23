export const meta = {
  name: 'audit-fixes-2026-10-23',
  description: 'Apply the 28 safety-checked audit fixes in 6 file-disjoint groups, then review each group',
  phases: [
    { title: 'Fix', detail: '6 implementers, each owns its own files, no git commits' },
    { title: 'Review', detail: 'one skeptic per group checks the changes' },
  ],
}

const G = '/Users/kristinarash/.claude/jobs/802ea68a/tmp/groups.json'
const COMMON = `
You are fixing items from a 2026-10-22 system audit on Eric's Mac, approved by Eric on 2026-10-23 ("go").
Your item list: run  jq '.["GROUP"]' ${G}  - each item has id, fix (the plan), critic_reason, original_finding, evidence.
Re-check each item before changing it (the plan may be slightly stale); if it is already done, skip it and say so.
Rules:
- Edit ONLY the files your items name. Other helpers are editing other files at the same time.
- Do NOT git commit, push, or stage. The coordinator commits at the end.
- Back up any file outside a git repo before editing it (cp file file.bak-20261023), and say where.
- Never read through the Google Drive mount (~/Library/CloudStorage); it hangs. Never open DexaProject or SpecialRequests/TOS_ES.
- Never print secret values. Do not restart or reload launchd jobs. Do not touch live pipelines (GPS, Perch, VALD, PFF) beyond what an item says.
- Before editing any SKILL.md, read ~/.claude/projects/-Users-kristinarash-DEV/memory/project_skill-bloat-and-promotion.md.
- Tier A memory edits follow the memory-write rules (frontmatter stays valid, MEMORY.md index pointers resolve, [[links]] use bare kebab names).
- Match the surrounding style. Small, exact edits. If an item turns out risky or needs Eric, skip it and explain.
Return: for each item: id, done/skipped, files changed, one-line what, how you verified.`

const EXTRA = {
  'memory': `
Extra item (Eric decided 2026-10-23, option b): session history files (~/.claude/projects/*/*.jsonl and ~/.claude/global-memory/transcripts/)
MAY be committed. The daily backup (git add -A in daily-backup.ps1) and dev-sync keep committing them; the old "no history" rule is retired.
Add this as one new Tier A feedback memory (file feedback_session-history-tracked.md, name session-history-tracked) with Why/How to apply,
note that tracked transcripts can hold secrets (17 Google API-key-shaped strings found 10-22), and add its MEMORY.md index line.`,
  'dev-docs': `
Extra item (Eric decided 2026-10-23, option b): session history files MAY be committed (the backup and dev-sync commit them with git add -A).
In ~/DEV/docs/STATUS.md resolve the open questions about it (around the lines mentioning "History files ... remain local", the dev-sync
git add -A question, and "Should harness history files remain local"): mark them resolved "2026-10-23: Eric chose to keep committing history".
Do this together with your STATUS trim. Do not add today's session entry; the coordinator does that. Run git -C ~/DEV pull first.`,
  'backup-script': `
Extra item (new finding from the safety check): KeystoneOS/data/jobs.json gives daily-backup makeupWindow 12:00-20:00 with reconcile:true, and
com.keystone.reconcile has RunAtLoad. Trace whether keystone-reconcile.ps1 (in ~/DEV/KeystoneOS) can start daily-backup.ps1 directly, skipping
the gate ~/.claude/scripts/daily-backup-login.sh (AC power, already running, OK today, 2 tries). If it can, change the smallest thing so the
reconcile path runs the gate script instead (or skips daily-backup because launchd's hourly 12-17 gate already covers make-up). Explain the choice.
After editing daily-backup.ps1, run a parse check with a pwsh -File script you write to the job tmp dir
(/Users/kristinarash/.claude/jobs/802ea68a/tmp) using [System.Management.Automation.Language.Parser]::ParseFile. Today's backup already ended OK at 10:32.`,
  'hooks-checks': `
For ~/.zshrc: back it up first; verify with the clean-env login shell command in the item. For superpowers-quiet.mjs: test it with node --check
and by running it once against the synced copy, keeping a .orig backup of the patched hooks.json.`,
  'cleanup': `
Deleting: prefer moving to ~/.Trash/ over rm. Branch deletion only for branches merged into origin/main (git branch -d, never -D), skip any
repo with uncommitted work or a live session in it (Football/PFF_Position_Reports had another live session yesterday - skip it), never delete main/master.
chmod: only remove group/other write bits as listed; do not change owner or execute bits.`,
  'claude-docs': ``,
}

const REVIEW = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    problems: { type: 'array', items: { type: 'object', properties: {
      file: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' } }, required: ['file', 'problem', 'fix'] } },
    files_changed: { type: 'array', items: { type: 'string' } },
  },
  required: ['ok', 'problems', 'files_changed'],
}

const groups = Object.keys(EXTRA)
const results = await pipeline(groups,
  g => agent(COMMON.replace('GROUP', g) + (EXTRA[g] || ''), { label: `fix:${g}`, phase: 'Fix' }),
  (report, g) => agent(`You review changes another agent just made on Eric's Mac (group "${g}"). Its report:
${report}

Item plans: jq '.["${g}"]' ${G}
Check each changed file: git diff in its repo (~/.claude, ~/DEV, ~/DEV/KeystoneOS, ~/.claude/claude-memory-compiler etc.), or diff against its .bak-20261023 copy.
Look for: broken syntax, a script that would now fail, wrong paths, facts that are false, edits outside the item's scope, deleted content
that should have stayed, broken frontmatter or [[links]], secrets printed. Run cheap checks (bash -n, node --check, python -m py_compile,
jq, pwsh parse via a file in /Users/kristinarash/.claude/jobs/802ea68a/tmp). READ-ONLY: do not fix anything, report it.
Never read through ~/Library/CloudStorage.`, { label: `review:${g}`, phase: 'Review', schema: REVIEW })
    .then(rv => ({ group: g, report, review: rv })))
return results
