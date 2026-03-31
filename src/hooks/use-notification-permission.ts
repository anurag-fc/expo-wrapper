import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { IS_MOCK_MODE } from '@/constants/config';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export function useNotificationPermission() {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');

  useEffect(() => {
    if (IS_MOCK_MODE || Platform.OS === 'web') {
      setStatus('granted');
      return;
    }
    Notifications.getPermissionsAsync().then(({ status: s }) => {
      setStatus(s as PermissionStatus);
    });
  }, []);

  const request = useCallback(async (): Promise<PermissionStatus> => {
    if (IS_MOCK_MODE || Platform.OS === 'web') {
      setStatus('granted');
      return 'granted';
    }
    const { status: s } = await Notifications.requestPermissionsAsync();
    setStatus(s as PermissionStatus);
    return s as PermissionStatus;
  }, []);

  return { status, request };
}
