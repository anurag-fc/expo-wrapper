import { SymbolView } from 'expo-symbols';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import type { Tables } from '@/lib/supabase/types';
import { useMarkAsRead, useNotifications } from '@/queries/use-notifications';
import { useNotificationStore } from '@/store/notification.store';
import { BottomTabInset, Primary, Spacing } from '@/constants/theme';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BG     = '#FAF8F3';
const CARD   = '#FFFFFF';
const TEXT   = '#1A1A1A';
const MUTED  = '#6B6868';
const BORDER = '#E8E5DF';
const DARK   = '#1C1C1E';
const ACCENT = '#F5C533';
const UNREAD_BG = '#F0EFFD';

// ─── Notification row ─────────────────────────────────────────────────────────
function NotifRow({ item, onMarkRead }: {
  item: Tables<'notifications'>;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = !item.read_at;
  const timeAgo = (() => {
    const diff = Date.now() - new Date(item.created_at).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  })();

  return (
    <View style={[styles.notifRow, isUnread && styles.notifRowUnread]}>
      <View style={[styles.notifDot, isUnread && styles.notifDotActive]} />
      <View style={styles.notifBody}>
        <View style={styles.notifTop}>
          <ThemedText style={styles.notifTitle} numberOfLines={1}>{item.title}</ThemedText>
          <ThemedText style={styles.notifTime}>{timeAgo}</ThemedText>
        </View>
        <ThemedText style={styles.notifMsg} numberOfLines={2}>{item.body}</ThemedText>
        {isUnread && (
          <Pressable style={styles.markReadBtn} onPress={() => onMarkRead(item.id)} hitSlop={6}>
            <ThemedText style={styles.markReadText}>Mark read</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markAsRead }  = useMarkAsRead();
  const unreadCount             = useNotificationStore((s) => s.unreadCount);
  const resetUnread             = useNotificationStore((s) => s.resetUnread);
  const setUnreadCount          = useNotificationStore((s) => s.setUnreadCount);
  const { status: permStatus, request: requestPermission } = useNotificationPermission();

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter((n) => !n.read_at).length);
    }
  }, [notifications, setUnreadCount]);

  useEffect(() => { resetUnread(); }, [resetUnread]);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <View>
            <ThemedText style={styles.pageTitle}>Notifications</ThemedText>
            {unreadCount > 0 && (
              <ThemedText style={styles.unreadCount}>{unreadCount} unread</ThemedText>
            )}
          </View>
          <View style={[styles.badge, unreadCount === 0 && styles.badgeEmpty]}>
            <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
          </View>
        </View>

        {/* Permission banner */}
        {permStatus === 'undetermined' && (
          <View style={styles.permBanner}>
            <SymbolView
              name={{ ios: 'bell.badge', android: 'notifications_active', web: 'notifications_active' }}
              size={18}
              tintColor={ACCENT}
            />
            <ThemedText style={styles.permText}>{t('notifications.permissionBody')}</ThemedText>
            <Pressable style={styles.permBtn} onPress={requestPermission}>
              <ThemedText style={styles.permBtnText}>{t('notifications.requestPermission')}</ThemedText>
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      {isLoading ? (
        <LoadingSpinner fullscreen />
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotifRow item={item} onMarkRead={markAsRead} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <SymbolView
                name={{ ios: 'bell.slash', android: 'notifications_off', web: 'notifications_off' }}
                size={36}
                tintColor={MUTED}
              />
              <ThemedText style={styles.emptyTitle}>{t('notifications.empty')}</ThemedText>
              <ThemedText style={styles.emptySub}>You're all caught up.</ThemedText>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: 8,
    paddingBottom: 12,
  },
  pageTitle:    { fontSize: 26, fontWeight: '700', color: TEXT, letterSpacing: -0.5 },
  unreadCount:  { fontSize: 12, color: MUTED, marginTop: 2 },
  badge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Primary,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeEmpty: { backgroundColor: '#E8E5DF' },
  badgeText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  permBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Spacing.three,
    marginBottom: 8,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  permText:    { flex: 1, fontSize: 13, color: MUTED },
  permBtn: {
    backgroundColor: DARK,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  permBtnText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },

  list: {
    paddingHorizontal: Spacing.three,
    paddingTop: 4,
    paddingBottom: BottomTabInset + Spacing.four,
  },

  notifRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
  },
  notifRowUnread: { backgroundColor: UNREAD_BG },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: BORDER,
    marginTop: 5,
    flexShrink: 0,
  },
  notifDotActive: { backgroundColor: Primary },
  notifBody: { flex: 1, gap: 4 },
  notifTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notifTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: TEXT },
  notifTime:  { fontSize: 11, color: MUTED, flexShrink: 0 },
  notifMsg:   { fontSize: 13, color: MUTED, lineHeight: 18 },
  markReadBtn: { alignSelf: 'flex-start', marginTop: 4 },
  markReadText: { fontSize: 12, fontWeight: '600', color: Primary },

  separator: { height: 8 },

  empty: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 80,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: TEXT },
  emptySub:   { fontSize: 14, color: MUTED },
});
