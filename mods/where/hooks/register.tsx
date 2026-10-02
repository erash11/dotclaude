import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Written } from '../types'

// /where: "remind me where it is" without asking. Every file Claude writes
// (Write, NotebookEdit, Edit) is remembered in $.store across sessions;
// /where [filter] opens a pane of the newest ones, each with a copy-path
// button. No model calls; the pane's text never reaches the model.

const PANE = 'where'
const STORE_KEY = 'recent'
const KEEP = 300

const filter = atom({ plugin: 'where', key: 'filter' } as const, '')
const recent = atom({ plugin: 'where', key: 'recent' } as const, [])

export function remember(list: Written[], item: Written): Written[] {
  const norm = (p: string) => p.replace(/\\/g, '/').toLowerCase()
  return [item, ...list.filter(w => norm(w.path) !== norm(item.path))].slice(0, KEEP)
}

export function matches(w: Written, f: string): boolean {
  if (!f) return true
  const hay = w.path.replace(/\\/g, '/').toLowerCase()
  return f
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every(term => hay.includes(term))
}

export function age(at: number, now: number): string {
  const m = Math.round((now - at) / 60_000)
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  return h < 48 ? `${h}h` : `${Math.round(h / 24)}d`
}

async function load($: EngineInterface): Promise<Written[]> {
  const stored = await $.store.get(STORE_KEY)
  return Array.isArray(stored) ? (stored as Written[]) : []
}

async function record($: EngineInterface, path: string, tool: string): Promise<void> {
  const item: Written = { path, at: await $.clock.now(), tool }
  const next = remember(await load($), item)
  await $.store.set(STORE_KEY, next)
  await update($, recent, () => next)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'where',
      description: 'Recent files Claude wrote, with copy-path buttons: /where [words to filter]',
    })
    const list = await load($)
    await update($, recent, () => list)
    return next(e)
  })

  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && !ran.isError) await record($, e.file_path, 'Write')
    return ran
  })

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && !ran.isError) await record($, e.file_path, 'Edit')
    return ran
  })

  on('tool.call', { tool: 'NotebookEdit' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && !ran.isError) await record($, e.notebook_path, 'NotebookEdit')
    return ran
  })

  on('command.run', { command: 'where' }, async ($, e) => {
    await update($, filter, () => e.args.trim())
    await $.ui.open({ id: PANE, title: e.args.trim() ? `Where: ${e.args.trim()}` : 'Where: recent files' })
    return { text: 'Opened the where pane.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const f = await read($, filter)
    const list = (await read($, recent)).filter(w => matches(w, f))
    const now = await $.clock.now()
    const room = Math.max(3, (e.viewport?.rows ?? 24) - 4)
    const surface = e.surface
    const width = Math.max(20, (e.props.bodyColumns ?? 80) - 14)

    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>{f ? `Nothing matches "${f}".` : 'No files written yet.'}</Text>}
        {list.slice(0, room).map((w, i) => (
          <Box flexDirection="row" gap={1}>
            <Button
              key={`copy-${i}`}
              label="copy"
              plain
              onPress={async () => {
                const r = await $.ui.copy({ text: w.path, surface })
                $.ui.toast(r.isCopied ? `Copied ${w.path}` : `Copy failed: ${w.path}`)
              }}
            />
            <Text dimColor>{age(w.at, now).padStart(3)}</Text>
            <Text wrap="truncate-start">{w.path.length > width ? `…${w.path.slice(-width)}` : w.path}</Text>
          </Box>
        ))}
      </Box>
    )
  })
}
