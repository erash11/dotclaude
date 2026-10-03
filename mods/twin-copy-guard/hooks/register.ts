import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Drift } from '../types'

// Twin-copy guard: some files live twice on purpose. Hooks are mirrored in
// ~/.claude/hooks and ~/.codex/hooks (Claude Code and Codex), vendored skills
// in ~/.claude/skills and ~/.agents/skills. Patching one copy reads later as
// "the fix reverted" (project_hook-two-copies-trap, project_vendored-skill-repair).
// After an edit to one copy the twin is compared; at the end of the turn any
// twin left behind is named, with an offer to copy the edit across when the
// two were identical before it. A missing twin is one-sided on purpose and is
// left alone. /twins lists every pair that differs now. Local reads only.

const pending = atom({ plugin: 'twin-copy-guard', key: 'pending' } as const, [])

const PAIRS: [string, string][] = [
  ['.claude/hooks/', '.codex/hooks/'],
  ['.claude/skills/', '.agents/skills/'],
]
const SKIP_DIRS = new Set(['.git', 'node_modules', '__pycache__', '.venv'])
const MAX_FILES = 3000

const norm = (p: string) => p.replace(/\\/g, '/')

export function twinOf(path: string, home: string): string | null {
  const p = norm(path)
  const h = norm(home).replace(/\/$/, '')
  for (const [a, b] of PAIRS) {
    for (const [from, to] of [
      [a, b],
      [b, a],
    ] as const) {
      const prefix = `${h}/${from}`
      if (!p.toLowerCase().startsWith(prefix.toLowerCase())) continue
      const rest = p.slice(prefix.length)
      return rest ? `${h}/${to}${rest}` : null
    }
  }
  return null
}

export const pairKey = (a: string, b: string) => [norm(a).toLowerCase(), norm(b).toLowerCase()].sort().join('|')

// One edit's effect on the pending list: the edited file and its twin, each
// before and after the edit (`before` null when the file is new). The twin is
// read again after because a junctioned twin is the same file.
export function track(
  list: Drift[],
  path: string,
  twin: string,
  before: string | null,
  twinBefore: string,
  after: string,
  twinAfter: string,
): Drift[] {
  const key = pairKey(path, twin)
  const old = list.find(d => d.key === key)
  const rest = list.filter(d => d.key !== key)
  if (after === twinAfter) return rest
  // Both sides edited this turn: copying either way would drop an edit.
  const wasMirror = old ? old.wasMirror && norm(old.path).toLowerCase() === norm(path).toLowerCase() : before === twinBefore
  return [...rest, { key, path, twin, wasMirror }]
}

async function homeDir($: EngineInterface): Promise<string> {
  return norm((await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? '')
}

const readText = ($: EngineInterface, p: string) => $.fs.read(p).then(t => String(t), () => null)

function short(p: string, home: string): string {
  const n = norm(p)
  return n.toLowerCase().startsWith(home.toLowerCase()) ? `~${n.slice(home.length)}` : n
}

async function guard<R extends { deny?: string; isError?: boolean }>(
  $: EngineInterface,
  path: string,
  run: () => Promise<R>,
): Promise<R> {
  const home = await homeDir($)
  const twin = home ? twinOf(path, home) : null
  if (!twin) return run()
  const before = await readText($, path)
  const twinBefore = await readText($, twin)
  const ran = await run()
  if (ran.deny !== undefined || ran.isError || twinBefore === null) return ran
  const after = await readText($, path)
  const twinAfter = await readText($, twin)
  if (after !== null && twinAfter !== null) {
    await update($, pending, list => track(list, path, twin, before, twinBefore, after, twinAfter))
  }
  return ran
}

async function offer($: EngineInterface, list: Drift[]): Promise<void> {
  const home = await homeDir($)
  const manual = list.filter(d => !d.wasMirror)
  if (manual.length) {
    $.ui.toast(`Twin already differed, reconcile by hand: ${manual.map(d => short(d.twin, home)).join(', ')}`.slice(0, 200))
  }
  const mirror = list.filter(d => d.wasMirror)
  if (!mirror.length) return
  const names = mirror.map(d => short(d.twin, home)).join(', ')
  const answer = await $.ui
    .ask(`${mirror.length} twin file(s) not patched: ${names}. Copy the edit across?`, {
      options: ['Copy across', 'Leave as is'],
      header: 'Twin copy',
    })
    .catch(() => 'Leave as is')
  if (answer !== 'Copy across') {
    $.ui.toast(`Twins left differing: ${names}`.slice(0, 200))
    return
  }
  const copied: string[] = []
  const failed: string[] = []
  for (const d of mirror) {
    const text = await readText($, d.path)
    const ok = text !== null && (await $.fs.write(d.twin, text).then(() => true, () => false))
    ;(ok ? copied : failed).push(short(d.twin, home))
  }
  $.ui.toast(
    `${copied.length ? `Copied to ${copied.join(', ')}` : ''}${failed.length ? ` Failed: ${failed.join(', ')}` : ''}`.trim().slice(0, 200),
  )
}

type Entry = { name: string; kind: string; size?: number; isLink?: boolean }

async function walk($: EngineInterface, root: string, rel: string, out: { rel: string; size: number }[]): Promise<void> {
  if (out.length >= MAX_FILES) return
  const entries = ((await $.fs.list(rel ? `${root}/${rel}` : root).catch(() => [])) as Entry[]) ?? []
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue
    const r = rel ? `${rel}/${e.name}` : e.name
    if (e.kind === 'dir') await walk($, root, r, out)
    else if (e.kind === 'file') out.push({ rel: r, size: e.size ?? -1 })
  }
}

// Every file present in both copies of a pair whose contents differ.
async function scan($: EngineInterface): Promise<string[]> {
  const home = await homeDir($)
  const found: string[] = []
  for (const [a, b] of PAIRS) {
    const ra = `${home}/${a}`.replace(/\/$/, '')
    const rb = `${home}/${b}`.replace(/\/$/, '')
    const tops = ((await $.fs.list(ra).catch(() => [])) as Entry[]) ?? []
    for (const t of tops) {
      if (t.isLink || SKIP_DIRS.has(t.name) || t.name.startsWith('.')) continue
      const files: { rel: string; size: number }[] = []
      if (t.kind === 'dir') await walk($, `${ra}/${t.name}`, '', files)
      else files.push({ rel: '', size: t.size ?? -1 })
      for (const f of files) {
        const pa = f.rel ? `${ra}/${t.name}/${f.rel}` : `${ra}/${t.name}`
        const pb = f.rel ? `${rb}/${t.name}/${f.rel}` : `${rb}/${t.name}`
        const tb = await readText($, pb)
        if (tb === null) continue
        const ta = await readText($, pa)
        if (ta !== null && ta !== tb) found.push(`- ${short(pa, home)}  ≠  ${short(pb, home)}`)
      }
    }
  }
  return found
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'twins',
      description: 'List hook/skill files whose twin copy differs (~/.claude vs ~/.codex, ~/.agents)',
    })
    return next(e)
  })

  on('tool.call', { tool: 'Write' }, ($, e, next) => guard($, e.file_path, () => next(e)))
  on('tool.call', { tool: 'Edit' }, ($, e, next) => guard($, e.file_path, () => next(e)))
  on('tool.call', { tool: 'NotebookEdit' }, ($, e, next) => guard($, e.notebook_path, () => next(e)))

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId) return result
    const list = await read($, pending)
    if (!list.length) return result
    await update($, pending, () => [])
    // Ask outside the turn's dispatch so the turn ends at once.
    $.clock.after(0, () => void offer($, list).catch(() => {}))
    return result
  })

  on('command.run', { command: 'twins' }, async $ => {
    const found = await scan($)
    return {
      text: found.length
        ? `${found.length} twin file(s) differ:\n${found.join('\n')}`
        : 'All twin copies match (hooks: ~/.claude ↔ ~/.codex; skills: ~/.claude ↔ ~/.agents).',
    }
  })
}
