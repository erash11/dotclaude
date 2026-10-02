import { describe, expect, test } from 'claude-code/testing'

import { parseWorktrees, repoDirOf, targetOf } from '../hooks/register'

describe('targetOf', () => {
  test('another repo with no directory: skip', async () => {
    expect(targetOf('gh pr merge 12 --repo erash11/Flint --squash')).toBeNull()
    expect(targetOf('gh pr merge 12 -R erash11/Flint')).toBeNull()
  })
  test('another repo with a cd: clean there', async () => {
    expect(targetOf('cd C:/x/Flint && gh pr merge 12 --repo erash11/Flint')).toEqual({ dir: 'C:/x/Flint' })
  })
  test('plain merge: session cwd', async () => {
    expect(targetOf('gh pr merge 7 --squash')).toEqual({ dir: undefined })
  })
})

describe('repoDirOf', () => {
  test('cd prefix', async () => {
    expect(repoDirOf('cd "C:/x/Flint" && gh pr merge 12 --squash')).toBe('C:/x/Flint')
    expect(repoDirOf('cd ~/DEV/PP && gh pr merge --merge')).toBe('~/DEV/PP')
  })
  test('git -C', async () => {
    expect(repoDirOf("git -C '/a/b' pull && gh pr merge 3")).toBe('/a/b')
  })
  test('none means the session cwd', async () => {
    expect(repoDirOf('gh pr merge 7 --squash --delete-branch')).toBeUndefined()
  })
})

test('parseWorktrees', async () => {
  const out = 'worktree C:/r\nHEAD abc\nbranch refs/heads/main\n\nworktree C:/r/.claude/worktrees/x\nHEAD def\nbranch refs/heads/feat/x\n\nworktree C:/r/w2\nHEAD 123\ndetached\n'
  expect(parseWorktrees(out)).toEqual([
    { path: 'C:/r', branch: 'main' },
    { path: 'C:/r/.claude/worktrees/x', branch: 'feat/x' },
    { path: 'C:/r/w2', branch: null },
  ])
})
