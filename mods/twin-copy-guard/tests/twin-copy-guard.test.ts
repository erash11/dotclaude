import { describe, expect, test } from 'claude-code/testing'

import { pairKey, track, twinOf } from '../hooks/register'

const H = 'C:/Users/me'

describe('twinOf', () => {
  test('hooks both ways', async () => {
    expect(twinOf(String.raw`C:\Users\me\.claude\hooks\memsearch-sync.js`, H)).toBe('C:/Users/me/.codex/hooks/memsearch-sync.js')
    expect(twinOf('C:/Users/me/.codex/hooks/a.sh', H)).toBe('C:/Users/me/.claude/hooks/a.sh')
  })
  test('skills both ways, case-insensitive home', async () => {
    expect(twinOf('c:/users/me/.claude/skills/harvest/SKILL.md', H)).toBe('C:/Users/me/.agents/skills/harvest/SKILL.md')
    expect(twinOf('C:/Users/me/.agents/skills/x/a.py', H)).toBe('C:/Users/me/.claude/skills/x/a.py')
  })
  test('not a pair', async () => {
    expect(twinOf('C:/Users/me/.claude/settings.json', H)).toBeNull()
    expect(twinOf('C:/Users/me/.claude/hooks-old/a.js', H)).toBeNull()
    expect(twinOf('C:/Users/me/.claude/hooks/', H)).toBeNull()
  })
})

describe('track', () => {
  const a = 'C:/Users/me/.claude/hooks/a.js'
  const b = 'C:/Users/me/.codex/hooks/a.js'
  test('mirror edited on one side is offered for copy', async () => {
    const l = track([], a, b, 'old', 'old', 'new', 'old')
    expect(l).toEqual([{ key: pairKey(a, b), path: a, twin: b, wasMirror: true }])
  })
  test('second edit to the same side keeps it a mirror', async () => {
    const l = track(track([], a, b, 'old', 'old', 'mid', 'old'), a, b, 'mid', 'old', 'new', 'old')
    expect(l[0]?.wasMirror).toBe(true)
  })
  test('twin patched too clears it', async () => {
    const l = track(track([], a, b, 'old', 'old', 'new', 'old'), b, a, 'old', 'new', 'new', 'new')
    expect(l).toEqual([])
  })
  test('both sides edited differently: hand reconcile', async () => {
    const l = track(track([], a, b, 'old', 'old', 'new', 'old'), b, a, 'old', 'new', 'other', 'new')
    expect(l[0]?.wasMirror).toBe(false)
  })
  test('junctioned twin (same file) is never flagged', async () => {
    expect(track([], a, b, 'old', 'old', 'new', 'new')).toEqual([])
  })
  test('already drifted before the edit: hand reconcile', async () => {
    expect(track([], a, b, 'x', 'y', 'z', 'y')[0]?.wasMirror).toBe(false)
  })
})
