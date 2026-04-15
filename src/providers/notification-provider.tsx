import React from 'react';

/**
 * Notifications are not used in Choice.
 * This provider is kept as a no-op so the root layout doesn't need changes.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
