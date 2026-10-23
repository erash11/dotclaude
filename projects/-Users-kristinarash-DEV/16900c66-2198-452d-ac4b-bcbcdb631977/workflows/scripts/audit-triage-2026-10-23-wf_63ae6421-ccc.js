export const meta = {
  name: 'audit-triage-2026-10-23',
  description: 'Re-check the 145 audit findings against today, sort into agent-can-do-now vs Eric, then a safety critic',
  phases: [
    { title: 'Triage', detail: '6 read-only checkers, ~25 findings each' },
    { title: 'Safety', detail: 'one critic over the agent-can-do list' },
  ],
}

const F = '/Users/kristinarash/.claude/audits/2026-10-22-system-audit-findings.md'
const SLICES = [[44, 218], [219, 371], [372, 524], [525, 677], [678, 827], [828, 946]]

const CONTEXT = `
Context: a read-only audit on 2026-10-22 produced 145 findings in ${F}.
Since then these were DONE (do not re-propose them, mark them fixed after a quick check):
- 4 leaked secrets rotated by Eric (history NOT purged, values are dead). Grok quit. Synced GitHub plugin disabled by Eric.
- chmod 600 on ~/.claude/.credentials.json and ~/.claude/typesafe.env. npm cache + 9 old claude-mem versions deleted.
- ~/.claude/settings.json: bare "Bash" allow rule, Bash(pip install:*) and 5 junk rules removed (129 -> 122).
- where-was-i.py skips symlinked top-level folders (_DRIVE). Codex keystone-unified-snapshot.js is now a symlink to the Claude copy.
- Backup moved to daytime: launchd hourly 12-17 through gate ~/.claude/scripts/daily-backup-login.sh (AC only, max 2 tries, stops after OK).
- cloud-push.py skips local-only folders and browser profiles; failures go to .errors.log. Since 2026-10-23 launchd runs it inside Terminal
  via ~/.claude/scripts/cloud-push-launch.sh (cause was per-file com.apple.macl); scheduled runs OK.
- Drive Cloud_Copy copies of SpecialRequests/TOS_ES and Wilhelm_Brody_RTP/out/edge-profile trashed.
- Zotero now backed up weekly (Snapshot-Zotero in daily-backup.ps1, zotero.tgz).
- Files digest resend done; .errors.log cleared.
Settled decisions by Eric (never propose reversing): settings.local.json stays tracked (untracking would delete it on the Windows laptop);
session history files (projects/*.jsonl, global-memory/transcripts/) are not committed; SpecialRequests/TOS_ES stays off the mirror;
Linda_Projects stays on the mirror; browser profiles stay off; Windows laptop is used for desktop-app sessions only since 10-21.
Eric's rules: system work is done as it comes up, small breakage with a workaround can wait; a new tool/hook/skill must replace an old one;
do not break mid-season football or performance pipelines (GPS, Perch, VALD, PFF); never touch DexaProject or health data.
Known still blocked: uv cache prune (live browser-use MCP processes hold the lock; needs sessions closed).

Hard rules for you: READ-ONLY. Change nothing. Do not read files through the Google Drive mount (~/Library/CloudStorage) - reads hang.
Do not open DexaProject or SpecialRequests/TOS_ES. Do not print secret values. Keep each check cheap (a grep, a stat, a launchctl print).
`

const ITEM = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'finding id slug from the ### heading' },
    severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
    status: { type: 'string', enum: ['fixed', 'still_open', 'wrong_or_stale'] },
    who: { type: 'string', enum: ['agent_now', 'eric_decision', 'eric_only', 'park', 'none'],
      description: 'agent_now = safe, reversible, under ~30 min, no decision needed from Eric. eric_decision = Claude can do it once Eric picks. eric_only = needs his hands (sudo, GUI, other machine, account). park = real but can wait (workaround exists, low value). none = fixed or wrong.' },
    fix: { type: 'string', description: 'one sentence: the exact change, with paths' },
    minutes: { type: 'number' },
    value: { type: 'string', enum: ['high', 'medium', 'low'] },
    risk: { type: 'string', description: 'what could break; "none" if nothing' },
    evidence: { type: 'string', description: 'what you checked today and saw (short)' },
  },
  required: ['id', 'severity', 'status', 'who', 'fix', 'minutes', 'value', 'risk', 'evidence'],
}
const SLICE_SCHEMA = { type: 'object', properties: { items: { type: 'array', items: ITEM } }, required: ['items'] }

phase('Triage')
const slices = await parallel(SLICES.map(([a, b], i) => () => agent(
  `${CONTEXT}
Your slice: lines ${a}-${b} of ${F} (read them with sed -n '${a},${b}p'). Each "### " heading is one finding.
For EVERY finding in your slice, check its current state on this Mac today (2026-10-23) and return one item.
Be strict about agent_now: only if the change is reversible, small, needs no choice from Eric, and cannot hurt a live pipeline.
If a finding is a doc/memory that is now stale, the fix is the exact text change. Return all items, none skipped.`,
  { label: `triage:${a}-${b}`, phase: 'Triage', schema: SLICE_SCHEMA })))

const all = slices.filter(Boolean).flatMap(s => s.items)
log(`${all.length} findings triaged (expected 145)`)
const agentNow = all.filter(x => x.who === 'agent_now' && x.status === 'still_open')

phase('Safety')
const CRITIC = {
  type: 'object',
  properties: {
    plan: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, keep: { type: 'boolean' }, reason: { type: 'string' },
      fix: { type: 'string' }, minutes: { type: 'number' }, order: { type: 'number' },
      group: { type: 'string', description: 'items that touch the same file share a group name' },
    }, required: ['id', 'keep', 'reason', 'fix', 'minutes', 'order', 'group'] } },
    notes: { type: 'string' },
  },
  required: ['plan', 'notes'],
}
const critic = agentNow.length ? await agent(
  `${CONTEXT}
Below are findings that checkers marked "agent can do now". You are the safety critic. For each one, re-check it yourself (read-only)
and try to REFUTE that it is safe and worth doing now. Drop (keep=false) anything that: needs a choice from Eric, could break a live
pipeline or a hook, reverses a settled decision, adds a new tool/hook/skill without removing one, is cosmetic with low value, or
whose finding is already fixed. Merge duplicates (same fix). Give an order (most value first) and group items that edit the same file.
Items:
${JSON.stringify(agentNow, null, 1)}`,
  { label: 'safety-critic', phase: 'Safety', schema: CRITIC }) : { plan: [], notes: 'nothing marked agent_now' }

return { all, critic }
