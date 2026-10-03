export type Job = {
  name: string
  lastRun: string | null
  result: number | null
  nextRun: string | null
}

export type DockerState = 'up' | 'docker-down' | 'milvus-down' | null

export type JobReport = {
  checkedAt: number
  jobs: Job[]
  errorLines: number
  evalStatus: string | null
  docker: DockerState
}

declare module 'claude-code' {
  interface PluginState {
    'job-watch': { report: JobReport | null }
  }
}
