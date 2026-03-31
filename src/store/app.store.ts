import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  message: string;
  type: ToastType;
}

interface AppState {
  toast: Toast | null;
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    // Auto-dismiss after 3 seconds
    setTimeout(() => set({ toast: null }), 3000);
  },
  dismissToast: () => set({ toast: null }),
}));
