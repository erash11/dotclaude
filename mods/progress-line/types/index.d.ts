export type View = {
  done: number
  total: number
  /** Labels of agents still working: their type, e.g. `Explore`. */
  running: string[]
  agentsDone: number
  agentsFailed: number
  seconds: number
  frame: number
  isFinished: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'progress-line': { view: Shaped<View | null> }
  }
}
