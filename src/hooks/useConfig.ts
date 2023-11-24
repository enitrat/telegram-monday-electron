import create from "zustand";

export type ConfigState = {
  keyConfig: any;
  mondayConfig: any;
  additionalConfig: any;
  setKeyConfig: (config: any) => void;
  setMondayConfig: (config: any) => void;
  setAdditionalConfig: (config: any) => void;
};

export const useStateConfig = create<ConfigState>((set) => ({
  keyConfig: undefined,
  mondayConfig: undefined,
  additionalConfig: {},
  setKeyConfig: (config: any) => set({ keyConfig: config }),
  setMondayConfig: (config: any) => set({ mondayConfig: config }),
  setAdditionalConfig: (config: any) => set({ additionalConfig: config }),
}));
