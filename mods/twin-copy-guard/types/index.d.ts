export type Drift = {
  key: string
  path: string
  twin: string
  wasMirror: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'twin-copy-guard': { pending: Drift[] }
  }
}
