// This script is responsible for detecting network changes and processing pending notifications
// It runs on the client side to recover from network disruptions
"use client";

import { useEffect } from 'react';
import { processPendingNotifications } from './notification-retry';

export default function NetworkMonitor() {
  useEffect(() => {
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

    // Periodically check for pending notifications
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
    }, 60000); // Check every minute

    // Clean up event listeners and interval
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      if (networkCheckInterval) {
        clearInterval(networkCheckInterval);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
