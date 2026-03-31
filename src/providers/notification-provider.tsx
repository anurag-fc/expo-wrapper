import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { IS_MOCK_MODE } from '@/constants/config';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/store/notification.store';
import { useSession } from '@/queries/use-session';

// Configure how notifications appear when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Handles incoming push notifications and deep-link routing on tap.
 * Does NOT request permission — trigger that from the UI at the right moment.
 * Register push tokens only when a user is signed in.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSession();
  const incrementUnread = useNotificationStore((s) => s.incrementUnread);

  useEffect(() => {
    if (IS_MOCK_MODE || Platform.OS === 'web') return;

    // Register push token when user signs in.
    if (session?.user.id) {
      Notifications.getExpoPushTokenAsync()
        .then(({ data: token }) => {
          notificationsService.registerPushToken(session.user.id, token);
        })
        .catch(() => null);
    }

    // Foreground notification received.
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      incrementUnread();
    });

    // User tapped a notification — deep-link into the app.
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { route?: string } | undefined;
      if (data?.route) {
        router.push(data.route as never);
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [session?.user.id, incrementUnread, router]);

  return <>{children}</>;
}
