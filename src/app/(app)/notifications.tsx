import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import { useMarkAsRead, useNotifications } from '@/queries/use-notifications';
import { useNotificationStore } from '@/store/notification.store';
import type { Tables } from '@/lib/supabase/types';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const resetUnread = useNotificationStore((s) => s.resetUnread);
  const { status: permStatus, request: requestPermission } = useNotificationPermission();

  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  // Sync unread count whenever notifications data changes.
  React.useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter((n) => !n.read_at).length);
    }
  }, [notifications, setUnreadCount]);

  // Reset the badge when the screen is opened.
  React.useEffect(() => {
    resetUnread();
  }, [resetUnread]);

  const renderItem = ({ item }: { item: Tables<'notifications'> }) => (
    <Card
      style={[styles.notifCard, !item.read_at && styles.unread]}>
      <View style={styles.notifHeader}>
        <ThemedText type="smallBold">{item.title}</ThemedText>
        {!item.read_at ? (
          <Button
            onPress={() => markAsRead(item.id)}
            variant="ghost"
            size="sm">
            {t('notifications.markRead')}
          </Button>
        ) : null}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {item.body}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.timestamp}>
        {new Date(item.created_at).toLocaleString()}
      </ThemedText>
    </Card>
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleRow}>
          <ThemedText type="subtitle">{t('notifications.title')}</ThemedText>
          {unreadCount > 0 ? (
            <ThemedView type="backgroundElement" style={styles.badge}>
              <ThemedText type="smallBold">{unreadCount}</ThemedText>
            </ThemedView>
          ) : null}
        </View>

        {/* Permission prompt */}
        {permStatus === 'undetermined' ? (
          <ThemedView type="backgroundElement" style={styles.permBanner}>
            <ThemedText type="small">{t('notifications.permissionBody')}</ThemedText>
            <Button onPress={requestPermission} size="sm">
              {t('notifications.requestPermission')}
            </Button>
          </ThemedView>
        ) : null}

        {isLoading ? (
          <LoadingSpinner fullscreen />
        ) : (
          <FlatList
            data={notifications ?? []}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                title={t('notifications.empty')}
                subtitle="You're all caught up."
              />
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  permBanner: {
    margin: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.two,
  },
  notifCard: {
    gap: Spacing.one,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: '#208AEF',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
});
