import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { RepoState, Snapshot } from '../types'

// Repo-state band: one row above the prompt that says which repos under
// DEV (and ~/.claude) have uncommitted or unpushed work, plus Closeout and
// Closeout + exit buttons. Local git only: no fetch, no model calls.

const snapshot = atom({ plugin: 'repo-band', key: 'snapshot' } as const, null)
const isScanning = atom({ plugin: 'repo-band', key: 'isScanning' } as const, false)
const pendingExit = atom({ plugin: 'repo-band', key: 'pendingExit' } as const, false)
const isHidden = atom({ plugin: 'repo-band', key: 'isHidden' } as const, false)

const MIN_GAP_MS = 20_000
const PERIOD_MS = 5 * 60_000
const CONCURRENCY = 8
const SKIP = new Set(['_ARCHIVE', 'node_modules', '_DRIVE'])

const norm = (p: string) => p.replace(/\\/g, '/').replace(/\/$/, '')

async function exists($: EngineInterface, path: string): Promise<boolean> {
  return $.fs.stat(path).then(() => true, () => false)
}

async function listDirs($: EngineInterface, path: string): Promise<string[]> {
  const entries = await $.fs.list(path).catch(() => [])
  return entries
    .filter(e => e.kind === 'dir' && !e.name.startsWith('.') && !SKIP.has(e.name))
    .map(e => e.name)
}

// DEV root plus its repos at depth 1 and 2 (Football/<x> are their own repos).
async function findRepos($: EngineInterface): Promise<{ name: string; path: string }[]> {
  const home = norm((await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? '')
  if (!home) return []
  const repos: { name: string; path: string }[] = []
  for (const dev of [`${home}/Desktop/DEV`, `${home}/DEV`]) {
    if (!(await exists($, dev))) continue
    if (await exists($, `${dev}/.git`)) repos.push({ name: 'DEV', path: dev })
    for (const one of await listDirs($, dev)) {
      const p1 = `${dev}/${one}`
      if (await exists($, `${p1}/.git`)) {
        repos.push({ name: one, path: p1 })
        continue
      }
      for (const two of await listDirs($, p1)) {
        const p2 = `${p1}/${two}`
        if (await exists($, `${p2}/.git`)) repos.push({ name: `${one}/${two}`, path: p2 })
      }
    }
    break
  }
  if (await exists($, `${home}/.claude/.git`)) repos.push({ name: '.claude', path: `${home}/.claude` })
  return repos
}

export function parseStatus(name: string, path: string, out: string): RepoState {
  const lines = out.split('\n').filter(l => l.length > 0)
  const head = lines[0]?.startsWith('## ') ? lines.shift()!.slice(3) : ''
  const branch = (head.split('...')[0] ?? '').replace(/^No commits yet on /, '').trim()
  const ahead = Number(/ahead (\d+)/.exec(head)?.[1] ?? 0)
  return { name, path, branch, dirty: lines.length, ahead, hasUpstream: head.includes('...') }
}

async function scan($: EngineInterface): Promise<void> {
  if (await read($, isScanning)) return
  await update($, isScanning, () => true)
  try {
    const found = await findRepos($)
    const results: RepoState[] = []
    for (let i = 0; i < found.length; i += CONCURRENCY) {
      const batch = found.slice(i, i + CONCURRENCY)
      const done = await Promise.all(
        batch.map(r =>
          $.process
            .run(['git', '--no-optional-locks', '-C', r.path, 'status', '--porcelain=v1', '-b'], { timeoutMs: 15_000 })
            .then(res => (res.exitCode === 0 ? parseStatus(r.name, r.path, res.stdout) : null))
            .catch(() => null),
        ),
      )
      for (const d of done) if (d) results.push(d)
    }
    const snap: Snapshot = { scannedAt: await $.clock.now(), total: results.length, repos: results }
    await update($, snapshot, () => snap)
  } finally {
    await update($, isScanning, () => false)
  }
}

async function refreshSoon($: EngineInterface, force = false): Promise<void> {
  const snap = await read($, snapshot)
  const now = await $.clock.now()
  if (!force && snap && now - snap.scannedAt < MIN_GAP_MS) return
  $.clock.after(500, () => void scan($))
}

const needsAttention = (r: RepoState) => r.dirty > 0 || r.ahead > 0

export const register: Register = on => {
  let timer: { cancel: () => void } | undefined
  let stayTimer: { cancel: () => void } | undefined

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'repos',
      description: 'List repos with uncommitted or unpushed work (repo-band)',
    })
    timer?.cancel()
    timer = $.clock.every(PERIOD_MS, () => void scan($))
    void refreshSoon($, true)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId) return result
    void refreshSoon($)

    if (await read($, pendingExit)) {
      await update($, pendingExit, () => false)
      const answer = e.answer.trim()
      if (e.reason !== 'answer' || answer.endsWith('?')) {
        $.ui.toast('Closeout needs you: not exiting.')
      } else {
        $.ui.toast('Closeout done: exiting in 5s. Type anything to stay.')
        stayTimer = $.clock.after(5_000, () => void $.command.run({ command: 'exit' }).catch(() => {}))
      }
    }
    return result
  })

  on('prompt.submit', ($, e, next) => {
    stayTimer?.cancel()
    stayTimer = undefined
    return next(e)
  })

  on('command.run', { command: 'repos' }, async $ => {
    await update($, isHidden, () => false)
    await scan($)
    const snap = await read($, snapshot)
    if (!snap) return { text: 'repo-band: no scan yet.' }
    const flagged = snap.repos.filter(needsAttention)
    if (flagged.length === 0) return { text: `All ${snap.total} repos clean and pushed.` }
    const rows = flagged.map(
      r =>
        `- ${r.name} (${r.branch || '?'}): ${r.dirty ? `${r.dirty} changed` : ''}${r.dirty && r.ahead ? ', ' : ''}${r.ahead ? `${r.ahead} unpushed` : ''} — ${r.path}`,
    )
    return { text: `${flagged.length} of ${snap.total} repos need attention:\n${rows.join('\n')}` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const below = await next(e)
    if (e.props.hasSurvey || (await read($, isHidden))) return below
    const snap = await read($, snapshot)
    const scanning = await read($, isScanning)
    const exiting = await read($, pendingExit)
    const { Box, Text, Button } = $.ui.resolve(e)

    const flagged = snap ? snap.repos.filter(needsAttention) : []
    const dirty = flagged.filter(r => r.dirty > 0).length
    const unpushed = flagged.filter(r => r.ahead > 0).length
    const summary = !snap
      ? 'repos: scanning…'
      : flagged.length === 0
        ? `repos ✓ ${snap.total} clean`
        : `repos: ${dirty} dirty · ${unpushed} unpushed`
    const detail = flagged
      .map(r => `${r.name}${r.dirty ? ` ✎${r.dirty}` : ''}${r.ahead ? ` ↑${r.ahead}` : ''}`)
      .join('  ')

    const mine = (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={1}>
          <Text color={flagged.length ? 'yellow' : 'green'}>{summary}</Text>
          {scanning && snap && <Text dimColor>(rescanning)</Text>}
          <Button
            key="closeout"
            label={exiting ? 'Closeout + exit queued' : 'Closeout'}
            hotkey="c"
            variant="primary"
            onPress={() => void $.command.run({ command: 'closeout' }).catch(() => $.ui.toast('Could not start /closeout'))}
          />
          <Button
            key="closeout-exit"
            label="Closeout + exit"
            hotkey="x"
            onPress={async () => {
              await update($, pendingExit, () => true)
              await $.command.run({ command: 'closeout' }).catch(async () => {
                await update($, pendingExit, () => false)
                $.ui.toast('Could not start /closeout')
              })
            }}
          />
          <Button key="rescan" label="↻" plain onPress={() => void scan($)} />
          <Button key="hide" label="Hide" plain role="dismiss" onPress={() => update($, isHidden, () => true)} />
        </Box>
        {detail.length > 0 && (
          <Text dimColor wrap="truncate-end">
            {detail}
          </Text>
        )}
      </Box>
    )

    if (!below || (below as { type?: string }).type === 'engine') return mine
    return (
      <Box flexDirection="column">
        {mine}
        {below}
      </Box>
    )
  })
}
