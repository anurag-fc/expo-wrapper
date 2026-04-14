import { create } from 'zustand';

export type OraclePhase = 'idle' | 'listening' | 'processing' | 'revealing';

interface OracleStore {
  phase: OraclePhase;
  setPhase: (p: OraclePhase) => void;
  /** Registered by OracleScreen on mount so the tab bar can trigger it */
  micPress: () => void;
  setMicPress: (fn: () => void) => void;
  /**
   * Set to true by CustomTabBar when the user taps the mic from a non-oracle
   * tab. OracleScreen consumes it once navigation has settled.
   */
  pendingMicPress: boolean;
  setPendingMicPress: (v: boolean) => void;
}

export const useOracleStore = create<OracleStore>((set) => ({
  phase: 'idle',
  setPhase: (phase) => set({ phase }),
  micPress: () => {},
  setMicPress: (fn) => set({ micPress: fn }),
  pendingMicPress: false,
  setPendingMicPress: (v) => set({ pendingMicPress: v }),
}));
