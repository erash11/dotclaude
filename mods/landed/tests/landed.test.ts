import { expect, mock, test } from 'claude-code/testing'
import { parse } from '../hooks/register'

test('arguments: days, refresh and a project filter', () => {
  expect(parse('')).toEqual({ days: 1, refresh: false, project: undefined })
  expect(parse('week refresh')).toEqual({ days: 7, refresh: true, project: undefined })
  expect(parse('3 HPI Protocol')).toEqual({ days: 3, refresh: false, project: 'HPI Protocol' })
})

test('/landed runs landed.py show with the configured path', async ($, on) => {
  const ran: string[][] = []
  const norm = (p: string) => p.replace(/\\/g, '/')
  mock.env(on, { USERPROFILE: 'C:/Users/eric' })
  mock.clock(on)
  on('fs.read', ($: any, e: any) => {
    if (norm(e.path).endsWith('config.windows.json')) return { value: JSON.stringify({ portfolio_json: 'C:\\DEV\\project-triage\\portfolio.json' }) }
    throw new Error('missing')
  })
  on('fs.exists', ($: any, e: any) => ({ value: norm(e.path) === 'C:/DEV/project-triage/landed.py' }))
  on('process.run', ($: any, e: any) => { ran.push([...e.argv]); return { value: { exitCode: 0, stdout: 'Where files landed', stderr: '' } } })
  const { text } = await $.command.run({ command: 'landed', args: 'week' })
  expect(ran.at(-1)).toEqual(['python', 'C:/DEV/project-triage/landed.py', 'show', '--days', '7'])
  expect(text).toContain('Where files landed')
})
