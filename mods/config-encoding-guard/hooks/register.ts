import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Damage } from '../types'

// Config encoding guard: one bad write from Windows PowerShell damages config
// two ways at once (project_settings-json-bom-trap): a UTF-8 BOM (dcg and
// other parsers choke) and CP1252 double-encoding (`—` becomes `â€”`, the
// statusline's `▓` becomes `â–“`), which nothing reports. This checks the
// files that were hit before, and any ~/.claude or ~/.codex config Claude
// writes, at session start and after each Write/Edit/Bash/PowerShell call.
// Damage is named at the end of the turn with an offer to repair: the BOM is
// dropped, garbled runs are decoded back only where they decode cleanly, a
// .encoding-bak copy is kept, and a JSON file that would not parse is left.

const found = atom({ plugin: 'config-encoding-guard', key: 'found' } as const, [])

const WATCH = [
  '.claude/settings.json',
  '.claude/settings.local.json',
  '.claude/CLAUDE.md',
  '.claude/AGENTS.md',
  '.claude/machine.md',
  '.claude/keybindings.json',
  '.codex/config.toml',
  '.codex/AGENTS.md',
]
const EXT = /\.(json|jsonc|md|toml|ya?ml)$/i

// CP1252 0x80-0x9F as Unicode; the rest of 0xA0-0xFF maps to itself.
const CP1252: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91,
  0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
}
// A lead byte (0xC2-0xF4) then continuation bytes (0x80-0xBF) as CP1252 shows them.
const RUN = /[Â-ô][\u0080-¿ŒœŠšŸŽžƒˆ˜–—‘-„†-•…‰‹›€™]{1,3}/g

const norm = (p: string) => p.replace(/\\/g, '/')

function toByte(ch: string): number | null {
  const c = ch.codePointAt(0) ?? 0
  if (c >= 0xa0 && c <= 0xff) return c
  if (c >= 0x80 && c <= 0x9f) return c // C1 controls survive some encoders as-is
  return CP1252[c] ?? null
}

// Strict UTF-8 decode of one garbled run; null unless it is exactly one
// well-formed non-ASCII character (so real accented text is left alone).
export function decodeRun(run: string): string | null {
  const bytes: number[] = []
  for (const ch of run) {
    const b = toByte(ch)
    if (b === null) return null
    bytes.push(b)
  }
  const lead = bytes[0] ?? 0
  const len = lead >= 0xf0 ? 4 : lead >= 0xe0 ? 3 : lead >= 0xc2 ? 2 : 0
  if (len !== bytes.length) return null
  if (bytes.slice(1).some(b => b < 0x80 || b > 0xbf)) return null
  let cp = lead & (len === 2 ? 0x1f : len === 3 ? 0x0f : 0x07)
  for (const b of bytes.slice(1)) cp = (cp << 6) | (b & 0x3f)
  if (cp < 0x80 || (len === 3 && cp < 0x800) || (len === 4 && cp < 0x10000) || cp > 0x10ffff) return null
  if (cp >= 0xd800 && cp <= 0xdfff) return null
  return String.fromCodePoint(cp)
}

// The repaired text and how many garbled characters it fixed.
export function repairText(text: string): { text: string; fixed: number } {
  let fixed = 0
  const out = text.replace(/^﻿/, '').replace(RUN, run => {
    // A run may hold more than one character's worth: try the longest prefix.
    for (let n = run.length; n >= 2; n--) {
      const ch = decodeRun(run.slice(0, n))
      if (ch !== null) {
        fixed++
        return ch + run.slice(n)
      }
    }
    return run
  })
  return { text: out, fixed }
}

export function hasBom(base64: string): boolean {
  return base64.startsWith('77u/') // EF BB BF
}

async function homeDir($: EngineInterface): Promise<string> {
  return norm((await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? '')
}

function short(p: string, home: string): string {
  return p.toLowerCase().startsWith(home.toLowerCase()) ? `~${p.slice(home.length)}` : p
}

// The damage in one file, or null when it is clean or unreadable.
async function inspect($: EngineInterface, path: string): Promise<Damage | null> {
  const bytes = await $.fs.read(path, { as: 'bytes' }).catch(() => null)
  if (!bytes || typeof bytes !== 'object') return null
  const bom = hasBom((bytes as { base64: string }).base64)
  const text = await $.fs.read(path).then(t => String(t), () => null)
  if (text === null) return null
  const { fixed } = repairText(text)
  if (!bom && fixed === 0) return null
  return { path, bom, garbled: fixed }
}

function inScope(path: string, home: string): boolean {
  const p = norm(path).toLowerCase()
  const h = home.toLowerCase()
  if (!EXT.test(p)) return false
  if (!(p.startsWith(`${h}/.claude/`) || p.startsWith(`${h}/.codex/`))) return false
  // Transcripts, caches and plugin copies are not config.
  return !/\/(projects|plugins|cache|jobs|transcripts|node_modules|file-history|todos|shell-snapshots)\//.test(p)
}

// Module state: starts over on reload, which only means one extra check.
const seen = new Map<string, number>() // path -> mtime last inspected
const declined = new Set<string>()

async function check($: EngineInterface, paths: string[], force = false): Promise<Damage[]> {
  const hits: Damage[] = []
  for (const p of paths) {
    const st = await $.fs.stat(p).catch(() => null)
    if (!st) continue
    const mtime = (st as { mtimeMs?: number }).mtimeMs ?? 0
    if (!force && seen.get(p.toLowerCase()) === mtime) continue
    seen.set(p.toLowerCase(), mtime)
    const d = await inspect($, p)
    if (d) hits.push(d)
  }
  if (hits.length) {
    await update($, found, list => [...list.filter(x => !hits.some(h => h.path === x.path)), ...hits])
  }
  return hits
}

async function watchList($: EngineInterface): Promise<string[]> {
  const home = await homeDir($)
  return home ? WATCH.map(w => `${home}/${w}`) : []
}

async function repair($: EngineInterface, list: Damage[]): Promise<void> {
  const home = await homeDir($)
  const names = list.map(d => `${short(d.path, home)} (${[d.bom ? 'BOM' : '', d.garbled ? `${d.garbled} garbled` : ''].filter(Boolean).join(', ')})`)
  const answer = await $.ui
    .ask(`Encoding damage: ${names.join('; ')}. Repair?`.slice(0, 400), {
      options: ['Repair (keeps .encoding-bak)', 'Leave'],
      header: 'Encoding',
    })
    .catch(() => 'Leave')
  if (!answer.startsWith('Repair')) {
    for (const d of list) declined.add(d.path.toLowerCase())
    $.ui.toast(`Left as is: ${list.map(d => short(d.path, home)).join(', ')}. /encoding to repair later.`.slice(0, 200))
    return
  }
  const done: string[] = []
  const skipped: string[] = []
  for (const d of list) {
    const text = await $.fs.read(d.path).then(t => String(t), () => null)
    if (text === null) {
      skipped.push(`${short(d.path, home)} (unreadable)`)
      continue
    }
    const fixed = repairText(text).text
    if (/\.json$/i.test(d.path)) {
      try {
        JSON.parse(fixed)
      } catch {
        skipped.push(`${short(d.path, home)} (would not parse)`)
        continue
      }
    }
    const ok = await $.fs
      .write(`${d.path}.encoding-bak`, text)
      .then(() => $.fs.write(d.path, fixed))
      .then(() => true, () => false)
    ;(ok ? done : skipped).push(ok ? short(d.path, home) : `${short(d.path, home)} (write failed)`)
  }
  await update($, found, cur => cur.filter(x => !list.some(d => d.path === x.path)))
  for (const p of await watchList($)) seen.delete(p.toLowerCase())
  $.ui.toast(`${done.length ? `Repaired ${done.join(', ')}.` : ''}${skipped.length ? ` Skipped ${skipped.join(', ')}.` : ''}`.trim().slice(0, 200))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'encoding',
      description: 'Check ~/.claude and ~/.codex config for a BOM or CP1252-garbled characters, and offer to repair',
    })
    $.clock.after(1_500, () =>
      void watchList($)
        .then(l => check($, l, true))
        .then(hits => {
          if (hits.length) $.ui.toast(`Encoding damage in ${hits.length} config file(s): /encoding to repair`)
        })
        .catch(() => {}),
    )
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined) return ran
    const home = await homeDir($)
    if (!home) return ran
    const paths = await watchList($)
    if (e.tool === 'Write' || e.tool === 'Edit') {
      if (inScope(e.file_path, home)) paths.push(norm(e.file_path))
    } else if (e.tool !== 'Bash' && e.tool !== 'PowerShell') {
      return ran
    }
    await check($, paths).catch(() => [])
    return ran
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId) return result
    const list = (await read($, found)).filter(d => !declined.has(d.path.toLowerCase()))
    if (list.length) $.clock.after(0, () => void repair($, list).catch(() => {}))
    return result
  })

  on('command.run', { command: 'encoding' }, async $ => {
    declined.clear()
    const hits = await check($, await watchList($), true)
    const all = await read($, found)
    if (!all.length) return { text: 'No BOM or garbled characters in the watched config files.' }
    $.clock.after(0, () => void repair($, all).catch(() => {}))
    const home = await homeDir($)
    return {
      text: `Encoding damage (${hits.length} new):\n${all.map(d => `- ${short(d.path, home)}: ${d.bom ? 'BOM ' : ''}${d.garbled ? `${d.garbled} garbled char(s)` : ''}`).join('\n')}`,
    }
  })
}
