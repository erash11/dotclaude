export const meta = {
  name: 'audit-leftovers-sweep',
  description: 'Verify every open 10-22 audit finding in 8 domains (read-only), then apply the safe fixes serially',
  phases: [
    { title: 'Verify', detail: '8 read-only checkers, one per domain' },
    { title: 'Fix', detail: 'one fixer applies safe fixes serially, tests, commits, pushes' },
  ],
}

const AUDIT = '~/.claude/audits/2026-10-22-system-audit-findings.md'
const DOMAINS = args.domains
const RULES = `
House rules (must follow):
- Never print secret values, tokens, keys, or athlete/health data. Count or name files only.
- Never open contents of DexaProject, SpecialRequests/TOS_ES, Linda_Projects, or any folder whose CLAUDE.md says "local only".
- Never read or walk files through the Google Drive FUSE mount (~/Library/CloudStorage/... or ~/DEV/_DRIVE); use the gws CLI for Drive facts, or skip.
- Never run \`memsearch index\` by hand. Never upgrade or reinstall pwsh/PowerShell.
- Shared hooks: ~/.codex/hooks links into ~/.claude/hooks; edit only ~/.claude/hooks.
- Never delete with rm. Proven clutter goes to ~/.Trash/<name>-2026-10-25 via mv.
- Football season is on: do not change live football/CFB data pipelines or their schedules.
- Security settings, accounts, key rotation, git history purges, permission-mode changes, and anything that spends money are Eric's call, not a safe fix.
- Earlier fixes landed 10-23 and 10-24 (see ~/DEV/docs/STATUS.md and ~/DEV/docs/handoffs/2026-10-2[34]-*.md). Many findings are already fixed; check the live state, do not trust the audit text.`

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'finding id, e.g. backups-tar-exit-ignored' },
          severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
          verdict: { type: 'string', enum: ['fixed-already', 'safe-fix', 'eric', 'leave'] },
          evidence: { type: 'string', description: 'one or two sentences: what you checked now and what you saw (no secret values)' },
          fix_plan: { type: 'string', description: 'for safe-fix: exact change (file, line, edit, test command). Else empty.' },
          files: { type: 'array', items: { type: 'string' } },
          eric_question: { type: 'string', description: 'for eric: the decision, max 2 options, with your pick. Else empty.' },
        },
        required: ['id', 'severity', 'verdict', 'evidence', 'fix_plan', 'files', 'eric_question'],
      },
    },
  },
  required: ['findings'],
}

phase('Verify')
const verified = await parallel(DOMAINS.map(d => () => agent(
`You are checking leftover findings from a system audit of Eric's Mac agent stack. READ-ONLY: do not edit, move, commit, or restart anything.

Audit file: ${AUDIT}. Your domain: every finding whose heading starts with \`### ${d.prefix}-\` (all severities). Skip any heading that already has a "Status 2026-10-25" line under it.
${d.notes ? 'Notes from an earlier check this session (re-confirm quickly, do not redo from scratch):\n' + d.notes : ''}

For each finding: read its Evidence and Fix, then check the LIVE state now (files, logs, git, launchctl print, plutil -p). Give one verdict:
- fixed-already: the problem is gone now (say what you saw).
- safe-fix: still present, and the fix is small, local, reversible, testable, and inside the house rules. Write an exact fix_plan another agent can apply without re-investigating (file paths, the edit, and the test/check command).
- eric: needs Eric's decision or action (security setting, account, rotation, money, purge, a policy choice). Write eric_question with max 2 options and your pick.
- leave: still present but not worth fixing now, or blocked (say why in evidence).
${RULES}
Be efficient: batch shell checks. Return every finding in your domain.`,
  { label: `verify:${d.prefix}`, phase: 'Verify', schema: VERIFY_SCHEMA })
  .then(r => r && r.findings.map(f => ({ ...f, domain: d.prefix })))))

const all = verified.filter(Boolean).flat()
const missing = DOMAINS.filter((d, i) => !verified[i]).map(d => d.prefix)
if (missing.length) log(`No result from: ${missing.join(', ')}`)
const safe = all.filter(f => f.verdict === 'safe-fix')
log(`${all.length} findings checked: ${all.filter(f => f.verdict === 'fixed-already').length} already fixed, ${safe.length} safe to fix, ${all.filter(f => f.verdict === 'eric').length} for Eric, ${all.filter(f => f.verdict === 'leave').length} leave`)

const FIX_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          outcome: { type: 'string', enum: ['fixed', 'skipped', 'failed'] },
          commit: { type: 'string', description: 'repo + short sha, e.g. dotclaude 1a2b3c4; empty if none' },
          note: { type: 'string', description: 'one sentence: what changed and the test result, or why skipped/failed' },
        },
        required: ['id', 'outcome', 'commit', 'note'],
      },
    },
  },
  required: ['results'],
}

let fixes = { results: [] }
if (safe.length) {
  phase('Fix')
  fixes = await agent(
`Apply these verified safe fixes to Eric's Mac agent stack, one at a time, in order. Each item has an exact fix_plan from a checker.

${JSON.stringify(safe.map(({ id, domain, fix_plan, files, evidence }) => ({ id, domain, fix_plan, files, evidence })), null, 1)}

For each item:
1. Re-check the problem is still there (another item may have fixed it). If gone, outcome=skipped with a note.
2. Read the file before editing. Make the smallest change. Match surrounding code style.
3. Run the test or check named in the plan (and the repo's tests if the file has them, e.g. \`python3 -I ~/.claude/scripts/test_*.py\`, pytest via \`~/.local/bin/uv run --with pytest pytest -q\`). If a test fails and you cannot fix it in a minute, revert your edit and mark failed.
4. If you change a launchd plist: \`launchctl bootout gui/$(id -u)/<label>\` before and \`launchctl bootstrap gui/$(id -u) <plist>\` after, then confirm with \`launchctl print\`.
Commit per repo with a clear message (do NOT commit ${AUDIT}; the caller records status there). End every commit message with these two lines exactly:
Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013cwnYrAYa2PQ3pgLjQbq1g
Push after committing. Only stage files you changed (other sessions may have uncommitted work; never \`git add -A\` in ~/.claude). If something looks risky once you are in it, skip it and say why.
${RULES}
Return one result per item.`,
    { label: 'fix:serial', phase: 'Fix', schema: FIX_SCHEMA })
}

return { findings: all, fixes: fixes ? fixes.results : [], missing }
