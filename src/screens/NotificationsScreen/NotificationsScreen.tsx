import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import type { Tables } from '@/lib/supabase/types';
import { useMarkAsRead, useNotifications } from '@/queries/use-notifications';
import { useNotificationStore } from '@/store/notification.store';

import { styles } from './NotificationsScreen.styles';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const resetUnread = useNotificationStore((s) => s.resetUnread);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const { status: permStatus, request: requestPermission } = useNotificationPermission();

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter((n) => !n.read_at).length);
    }
  }, [notifications, setUnreadCount]);

  useEffect(() => {
    resetUnread();
  }, [resetUnread]);

  const renderItem = ({ item }: { item: Tables<'notifications'> }) => (
    <Card style={[styles.notifCard, !item.read_at && styles.unread]}>
      <View style={styles.notifHeader}>
        <ThemedText type="smallBold">{item.title}</ThemedText>
        {!item.read_at ? (
          <Button onPress={() => markAsRead(item.id)} variant="ghost" size="sm">
            {t('notifications.markRead')}
          </Button>
        ) : null}
      </View>
      <ThemedText type="small" themeColor="textSecondary">{item.body}</ThemedText>
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
              <EmptyState title={t('notifications.empty')} subtitle="You're all caught up." />
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
