import { describe, expect, test } from 'claude-code/testing'

import { isFailure, parseDocker, parseLaunchctl, parseWindows, statusText, taskNotice } from '../hooks/register'

const WIN = '[{"name":"Backup AI Sessions to Drive","lastRun":"2026-10-02T00:30:01.0000000-05:00","result":0,"nextRun":"2026-10-03T00:30:00.0000000-05:00"},{"name":"memsearch-drain-weekly","lastRun":null,"result":267011,"nextRun":"2026-10-04T02:00:00.0000000-05:00"}]'

describe('parsing', () => {
  test('windows JSON, never-run is not a failure', async () => {
    const jobs = parseWindows(WIN)
    expect(jobs.length).toBe(2)
    expect(jobs.some(isFailure)).toBe(false)
  })
  test('a single object (no array) still parses', async () => {
    expect(parseWindows('{"name":"x","lastRun":null,"result":1,"nextRun":null}').length).toBe(1)
  })
  test('launchctl keeps only com.keystone jobs', async () => {
    const out = 'PID\tStatus\tLabel\n-\t0\tcom.keystone.backup\n-\t78\tcom.keystone.stackdoctor\n123\t0\tcom.apple.foo\n'
    const jobs = parseLaunchctl(out)
    expect(jobs.map(j => j.name)).toEqual(['backup', 'stackdoctor'])
    expect(isFailure(jobs[1]!)).toBe(true)
  })
})

describe('status line', () => {
  test('failures lead', async () => {
    const text = statusText({ checkedAt: 0, jobs: [{ name: 'backup', lastRun: null, result: 1, nextRun: null }], errorLines: 2, evalStatus: 'OK', docker: null })
    expect(text.startsWith('jobs ✗ backup (0x1)')).toBe(true)
    expect(text.includes('errors.log 2')).toBe(true)
  })
  test('all good', async () => {
    const text = statusText({ checkedAt: 0, jobs: parseWindows(WIN), errorLines: 0, evalStatus: 'OK', docker: null })
    expect(text.startsWith('jobs ✓ 2')).toBe(true)
  })
})

test('task notification summary', async () => {
  expect(taskNotice('<task-notification><status>completed</status><summary>Agent "Audit" finished</summary></task-notification>')).toBe('✓ Agent "Audit" finished')
  expect(taskNotice('hello')).toBe(null)
})

describe('docker', () => {
  test('milvus up, down, or not used here', async () => {
    const up = 'milvus-standalone|Up About an hour (healthy)\nmilvus-minio|Up About an hour (healthy)\n'
    expect(parseDocker(0, up)).toBe('up')
    expect(parseDocker(0, 'milvus-etcd|Up 2 hours\nmilvus-standalone|Exited (137) 3 hours ago\n')).toBe('milvus-down')
    expect(parseDocker(1, '')).toBe('docker-down')
    expect(parseDocker(0, '')).toBeNull()
    expect(parseDocker(null, '')).toBeNull()
  })
  test('status line names it only when there is a container', async () => {
    const base = { checkedAt: 0, jobs: [], errorLines: 0, evalStatus: null }
    expect(statusText({ ...base, docker: 'up' })).toContain('milvus ✓')
    expect(statusText({ ...base, docker: 'docker-down' })).toContain('docker ✗')
    expect(statusText({ ...base, docker: null })).not.toContain('milvus')
  })
})
