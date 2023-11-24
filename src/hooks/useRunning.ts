import create from "zustand";

export type RunningState = {
  running: boolean;
  setRunning: (value: boolean) => void;
};

export const useRunningState = create<RunningState>((set) => ({
  running: false,
  setRunning: (value: boolean) => set({ running: value }),
}));
