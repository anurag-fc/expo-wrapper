import { IS_MOCK_MODE } from '@/constants/config';
import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/types';
import { MOCK_NOTIFICATIONS } from '@/mocks/data';
import { mockDelay } from '@/mocks/delay';

type ServiceResult<T> = Promise<{ data: T; error: Error | null }>;

// In-memory mock notification state so mark-as-read updates are reflected in the session
let mockNotifications = [...MOCK_NOTIFICATIONS];

export const notificationsService = {
  getNotifications: async (_userId: string): ServiceResult<Tables<'notifications'>[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return { data: mockNotifications, error: null };
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', _userId)
      .order('created_at', { ascending: false });
    if (error) return { data: [], error: error as Error };
    return { data: (data ?? []) as Tables<'notifications'>[], error: null };
  },

  markAsRead: async (notificationId: string): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      await mockDelay(300);
      mockNotifications = mockNotifications.map((n) =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n,
      );
      return { data: undefined, error: null };
    }
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
    return { data: undefined, error: error as Error | null };
  },

  registerPushToken: async (userId: string, token: string): ServiceResult<void> => {
    if (IS_MOCK_MODE) {
      await mockDelay(200);
      return { data: undefined, error: null };
    }
    const { error } = await supabase.from('push_tokens').upsert(
      { user_id: userId, token, platform: 'expo' },
      { onConflict: 'user_id' },
    );
    return { data: undefined, error: error as Error | null };
  },
};
