import { expect, mock, test } from 'claude-code/testing'

test('/pm runs board.py --background from the configured project-triage', async ($, on) => {
  const ran: string[][] = []
  const norm = (p: string) => p.replace(/\\/g, '/')
  mock.env(on, { USERPROFILE: 'C:/Users/eric' })
  mock.clock(on)
  on('fs.read', ($: any, e: any) => {
    if (norm(e.path).endsWith('config.windows.json')) return { value: JSON.stringify({ portfolio_json: 'C:\\DEV\\project-triage\\portfolio.json' }) }
    throw new Error('missing')
  })
  on('fs.exists', ($: any, e: any) => ({ value: norm(e.path) === 'C:/DEV/project-triage/board.py' }))
  on('process.run', ($: any, e: any) => {
    ran.push([...e.argv])
    return { value: { exitCode: 0, stdout: 'board already running at http://127.0.0.1:5555/?token=t', stderr: '' } }
  })
  const { text } = await $.command.run({ command: 'pm', args: '' })
  expect(ran.at(-1)).toEqual(['python', 'C:/DEV/project-triage/board.py', '--background'])
  expect(text).toContain('http://127.0.0.1:5555/')
})
