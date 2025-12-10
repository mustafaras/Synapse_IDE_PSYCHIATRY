import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Durations = {
  totalMs: number;
  collapseMs: number;
  warpMs: number;
  revealMs: number;
};

type UiFlagsState = {
  enableLaunchTransition: boolean;
  durations: Durations;
  setEnableLaunchTransition: (on: boolean) => void;
  setDurations: (partial: Partial<Durations>) => void;
};

export const useUiFlagsStore = create<UiFlagsState>()(
  persist(
    (set, get) => ({
      enableLaunchTransition: true,
      // Extended defaults: ~6.0s total with calmer pacing
      durations: { totalMs: 6000, collapseMs: 1400, warpMs: 2400, revealMs: 1800 },
      setEnableLaunchTransition(on) { set({ enableLaunchTransition: !!on }); },
      setDurations(partial) { set({ durations: { ...get().durations, ...partial } }); },
    }),
    { name: 'synapse.ui.flags' }
  )
);
