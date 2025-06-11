"use client";

import { memo } from 'react';
import NotificationBell from './notifications/notification-bell';

// Create a properly memoized version of the NotificationBell component
// This prevents unnecessary re-renders when parent components change
// Only re-renders when its internal state changes
const MemoizedNotificationBell = memo(NotificationBell, () => {
  // Always return true for empty props (component has no props)
  return true;
});

export default MemoizedNotificationBell;
