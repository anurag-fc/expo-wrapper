import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  incrementUnread: () => void;
  resetUnread: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
