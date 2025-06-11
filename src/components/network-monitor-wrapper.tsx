"use client";

import { useEffect } from 'react';
import { processPendingNotifications } from '@/utils/notification-retry';

// This is a client component wrapper that we can use in the server component layout
export default function NetworkMonitorWrapper({ userId }: { userId: string | undefined }) {
  useEffect(() => {
    // Only set up monitoring if we have a userId (user is logged in)
    if (!userId) {
      return;
    }

    let networkCheckInterval: NodeJS.Timeout | null = null;

    // Function to handle online status changes
    const handleOnlineStatusChange = () => {
      if (navigator.onLine) {
        console.log('Network connection restored - checking for pending notifications');
        processPendingNotifications();
      }
    };

    // Set up network event listeners
    window.addEventListener('online', handleOnlineStatusChange);
    
    // Periodically check for pending notifications (optimized frequency)
    networkCheckInterval = setInterval(() => {
      if (navigator.onLine) {
        const pendingNotifications = JSON.parse(
          localStorage.getItem('pending_notifications') || '[]'
        );

        if (pendingNotifications.length > 0) {
          console.log(`Found ${pendingNotifications.length} pending notifications - attempting to send`);
          processPendingNotifications();
        }
      }
    }, 600000); // Check every 10 minutes (reduced from 5 for better performance)

    // Clean up event listeners and interval
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      if (networkCheckInterval) {
        clearInterval(networkCheckInterval);
      }
    };
  }, [userId]);

  // This component doesn't render anything
  return null;
}
