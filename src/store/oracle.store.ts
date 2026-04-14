import { create } from 'zustand';

export type OraclePhase = 'idle' | 'listening' | 'processing' | 'revealing';

interface OracleStore {
  phase: OraclePhase;
  setPhase: (p: OraclePhase) => void;
  /** Registered by OracleScreen on mount so the tab bar can trigger it */
  micPress: () => void;
  setMicPress: (fn: () => void) => void;
}

export const useOracleStore = create<OracleStore>((set) => ({
  phase: 'idle',
  setPhase: (phase) => set({ phase }),
  micPress: () => {},
  setMicPress: (fn) => set({ micPress: fn }),
}));
