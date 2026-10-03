export type Damage = {
  path: string
  bom: boolean
  garbled: number
}

declare module 'claude-code' {
  interface PluginState {
    'config-encoding-guard': { found: Damage[] }
  }
}
