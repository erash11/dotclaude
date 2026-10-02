import { describe, expect, test } from 'claude-code/testing'

import { age, matches, remember } from '../hooks/register'

describe('remember', () => {
  test('newest first, deduped across slash styles and case', async () => {
    let list = remember([], { path: 'C:\\x\\a.md', at: 1, tool: 'Write' })
    list = remember(list, { path: 'C:/x/b.md', at: 2, tool: 'Write' })
    list = remember(list, { path: 'c:/X/A.md', at: 3, tool: 'Edit' })
    expect(list.map(w => w.at)).toEqual([3, 2])
  })
})

describe('matches', () => {
  test('every word must appear in the path', async () => {
    const w = { path: 'C:\\DEV\\Flint\\docs\\shortlist.md', at: 0, tool: 'Write' }
    expect(matches(w, 'flint shortlist')).toBe(true)
    expect(matches(w, 'flint video')).toBe(false)
    expect(matches(w, '')).toBe(true)
  })
})

test('age', async () => {
  expect(age(0, 5 * 60_000)).toBe('5m')
  expect(age(0, 3 * 3_600_000)).toBe('3h')
  expect(age(0, 72 * 3_600_000)).toBe('3d')
})
