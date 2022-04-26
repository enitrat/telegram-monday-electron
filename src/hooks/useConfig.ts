import create from 'zustand'

export type ConfigState = {
  keyConfig: any
  mondayConfig: any
  setKeyConfig: (config: any) => void
  setMondayConfig: (config: any) => void
}

export const useStateConfig = create<ConfigState>(set => ({
  keyConfig: undefined,
  mondayConfig: undefined,
  setKeyConfig: (config: any) => set(({keyConfig: config})),
  setMondayConfig: (config: any) => set({mondayConfig: config})
}))
