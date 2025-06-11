"use client";

/**
 * Service Worker Registration Utility
 *
 * This module handles service worker registration for offline capabilities
 * and background syncing in the SkillSwap application.
 */

// Initialize service worker registration
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';

      registerValidSW(swUrl);
    });
  }
}

// Register the service worker
function registerValidSW(swUrl: string) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);

      // Check for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older content
              console.log('New content is available; please refresh.');

              // Display update notification to the user
              showUpdateNotification(registration);
            } else {
              // At this point, everything has been precached.
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

// Show an update notification to the user
function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // Create a custom notification or UI element to inform the user
  // For now, we'll just add a simple button to the DOM
  const updateButton = document.createElement('button');
  updateButton.textContent = 'Update Available - Click to Refresh';
  updateButton.className = 'service-worker-update-button';
  updateButton.style.position = 'fixed';
  updateButton.style.bottom = '10px';
  updateButton.style.left = '10px';
  updateButton.style.backgroundColor = '#3b82f6';
  updateButton.style.color = 'white';
  updateButton.style.padding = '8px 16px';
  updateButton.style.borderRadius = '4px';
  updateButton.style.border = 'none';
  updateButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  updateButton.style.cursor = 'pointer';
  updateButton.style.zIndex = '9999';

  updateButton.addEventListener('click', () => {
    if (registration.waiting) {
      // Send message to service worker to skip waiting and activate new version
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    // Remove the button
    document.body.removeChild(updateButton);

    // Reload the page to load the new version
    window.location.reload();
  });

  // Add the button to the DOM
  document.body.appendChild(updateButton);
}

// Request background sync for notifications
export function requestNotificationSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then((registration) => {
        // Check if sync is available on registration
        if ('sync' in registration) {
          return (registration as any).sync.register('sync-notifications');
        } else {
          console.warn('Background sync not available on service worker registration');
          processPendingNotifications();
        }
      })
      .catch((err) => {
        console.error('Background sync failed:', err);
      });
  } else {
    // If background sync is not supported, try to process immediately
    console.log('Background sync not supported, attempting immediate processing');
    processPendingNotifications();
  }
}

// Process pending notifications directly when background sync is not available
function processPendingNotifications() {
  try {
    const pendingNotifications = JSON.parse(
      localStorage.getItem('pending_notifications') || '[]'
    );

    if (pendingNotifications.length === 0) {
      return;
    }

    console.log(`Processing ${pendingNotifications.length} pending notifications directly`);

    pendingNotifications.forEach((notification: any, index: number) => {
      fetch('/api/notifications/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      })
        .then((response) => {
          if (response.ok) {
            // Remove from pending
            pendingNotifications.splice(index, 1);
            localStorage.setItem('pending_notifications', JSON.stringify(pendingNotifications));
          }
        })
        .catch((error) => {
          console.error('Failed to process notification:', error);
        });
    });
  } catch (error) {
    console.error('Error processing pending notifications:', error);
  }
}
