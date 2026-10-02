export type Written = { path: string; at: number; tool: string }

declare module 'claude-code' {
  interface PluginState {
    where: { filter: string; recent: Written[] }
  }
}
