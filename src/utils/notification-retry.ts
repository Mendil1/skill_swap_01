// A utility file for reliable notification delivery with retry mechanism

import { createNotification } from './notifications';
import { validateNotificationType } from '@/types/notifications';

/**
 * Store notification in local storage
 */
function storeLocalNotification(notification: any) {
  if (typeof window === 'undefined') return null;

  try {
    // Get existing notifications from localStorage
    const existingNotifications = JSON.parse(
      localStorage.getItem("local_notifications") || "[]"
    );

    // Add new notification with a consistent ID format
    const localNotification = {
      ...notification,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    // Add to existing notifications
    existingNotifications.push(localNotification);

    // Store back to localStorage
    localStorage.setItem(
      "local_notifications",
      JSON.stringify(existingNotifications)
    );
    console.log("Notification stored in local storage");

    // Dispatch event for real-time updates in the UI
    try {
      window.dispatchEvent(
        new CustomEvent("local-notification", {
          detail: localNotification,
        })
      );
    } catch (e) {
      console.error("Failed to dispatch local notification event", e);
    }

    return localNotification;
  } catch (e) {
    console.error("Failed to store notification locally", e);
    return null;
  }
}

/**
 * Retries a notification creation with exponential backoff
 * This helps ensure notification delivery even under poor network conditions
 */
export async function retryNotification(params: {
  userId: string;
  type: string;
  message: string;
  referenceId?: string;
  maxRetries?: number;
  initialDelay?: number;
}): Promise<boolean> {
  const { userId, type, message, referenceId, maxRetries = 3, initialDelay = 1000 } = params;

  let retryCount = 0;
  let success = false;

  // Store attempt in localStorage for recovery in case of page refresh
  if (typeof window !== 'undefined') {
    try {
      const pendingNotifications = JSON.parse(
        localStorage.getItem('pending_notifications') || '[]'
      );

      pendingNotifications.push({
        userId,
        type,
        message,
        referenceId,
        timestamp: Date.now(),
        retries: 0
      });

      localStorage.setItem('pending_notifications', JSON.stringify(pendingNotifications));
    } catch (e) {
      console.error('Failed to store pending notification:', e);
    }
  }

  while (retryCount < maxRetries && !success) {
    try {
      console.log(`Notification attempt ${retryCount + 1}/${maxRetries}`);

      // Attempt to create notification
      const result = await createNotification({
        userId,
        type: validateNotificationType(type),
        message,
        referenceId
      });

      if (result) {
        success = true;
        console.log('Notification created successfully');

        // Remove from pending if successful
        if (typeof window !== 'undefined') {
          try {
            const pendingNotifications = JSON.parse(
              localStorage.getItem('pending_notifications') || '[]'
            );

            // Remove this notification from pending
            const updatedPending = pendingNotifications.filter(
              (n: any) => !(n.userId === userId &&
                           n.message === message &&
                           n.type === type &&
                           n.referenceId === referenceId)
            );

            localStorage.setItem('pending_notifications', JSON.stringify(updatedPending));
          } catch (e) {
            console.error('Failed to update pending notifications:', e);
          }
        }

        break;
      }
    } catch (error) {
      console.error(`Notification attempt ${retryCount + 1} failed:`, error);
    }

    // Update retry count in localStorage
    if (typeof window !== 'undefined') {
      try {
        const pendingNotifications = JSON.parse(
          localStorage.getItem('pending_notifications') || '[]'
        );

        const updatedPending = pendingNotifications.map((n: any) => {
          if (n.userId === userId &&
              n.message === message &&
              n.type === type &&
              n.referenceId === referenceId) {
            return { ...n, retries: retryCount + 1 };
          }
          return n;
        });

        localStorage.setItem('pending_notifications', JSON.stringify(updatedPending));
      } catch (e) {
        console.error('Failed to update pending notification retries:', e);
      }
    }

    // Exponential backoff delay
    const delay = initialDelay * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));

    retryCount++;
  }

  return success;
}

/**
 * Process any pending notifications that might have failed previously
 * Call this on app startup or when network is restored
 */
export function processPendingNotifications(): { processed: number } {
  if (typeof window === 'undefined') return { processed: 0 };

  try {
    const pendingNotifications = JSON.parse(
      localStorage.getItem('pending_notifications') || '[]'
    );

    if (pendingNotifications.length === 0) return { processed: 0 };

    console.log(`Processing ${pendingNotifications.length} pending notifications`);

    let processedCount = 0;

    // Process each pending notification
    pendingNotifications.forEach((notification: any) => {
      // Skip notifications older than 24 hours
      const isExpired = Date.now() - notification.timestamp > 24 * 60 * 60 * 1000;

      if (isExpired) {
        console.log('Skipping expired notification:', notification);
        return;
      }

      // Always save to local storage even if API call fails
      storeLocalNotification({
        user_id: notification.userId,
        type: notification.type,
        message: notification.message,
        reference_id: notification.referenceId
      });

      processedCount++;

      // Try API call again with lower retries
      retryNotification({
        userId: notification.userId,
        type: notification.type,
        message: notification.message,
        referenceId: notification.referenceId,
        maxRetries: 2 // Fewer retries for pending notifications
      });
    });

    return { processed: processedCount };
  } catch (e) {
    console.error('Failed to process pending notifications:', e);
    return { processed: 0 };
  }
}

// Export a simplified interface for messaging notifications specifically
export async function sendMessageNotification(
  recipientId: string,
  senderName: string,
  conversationId: string
): Promise<boolean> {
  return retryNotification({
    userId: recipientId,
    type: 'message',
    message: `${senderName} sent you a message`,
    referenceId: conversationId
  });
}
