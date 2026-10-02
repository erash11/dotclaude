export type Suggestion = { label: string; prompt: string }

export type SuggestionSet = {
  source: 'handoffs' | 'model'
  items: Suggestion[]
}

declare module 'claude-code' {
  interface PluginState {
    'next-steps': {
      current: SuggestionSet | null
      isThinking: boolean
      isHidden: boolean
    }
  }
}
