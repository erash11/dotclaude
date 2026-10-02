export type Job = {
  name: string
  lastRun: string | null
  result: number | null
  nextRun: string | null
}

export type JobReport = {
  checkedAt: number
  jobs: Job[]
  errorLines: number
  evalStatus: string | null
}

declare module 'claude-code' {
  interface PluginState {
    'job-watch': { report: JobReport | null }
  }
}
