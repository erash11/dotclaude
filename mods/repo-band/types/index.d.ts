export type RepoState = {
  name: string
  path: string
  branch: string
  dirty: number
  ahead: number
  hasUpstream: boolean
}

export type Snapshot = {
  scannedAt: number
  total: number
  repos: RepoState[]
}

declare module 'claude-code' {
  interface PluginState {
    'repo-band': {
      snapshot: Snapshot | null
      isScanning: boolean
      pendingExit: boolean
      isHidden: boolean
    }
  }
}
