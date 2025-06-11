// Service Worker for SkillSwap application
const CACHE_NAME = 'skillswap-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/skill_swap_logo_no_background.png',
  '/skill_swap_logo_white_background.png',
  '/file.svg',
  '/globe.svg',
  '/window.svg',
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network-first strategy for API routes, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-first for API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Cache-first for static assets
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/) ||
    url.pathname.startsWith('/public/')
  ) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }

  // Network-first with fallback for everything else
  event.respondWith(networkFirstWithFallbackStrategy(event.request));
});

// Cache-first strategy: try cache, fallback to network and cache the response
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed for cache-first strategy:', error);
    // No fallback for assets
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Network-first strategy: try network, fallback to cache without caching response
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed for network-first strategy:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({ error: 'Network error' }), {
      status: 408,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Network-first with fallback strategy: try network and cache response, fallback to cache
async function networkFirstWithFallbackStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed for network-first with fallback strategy:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If it's a page navigation, return the offline page
    if (request.mode === 'navigate') {
      return caches.match('/');
    }

    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Listen for message events from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Function to process offline notification actions
async function syncNotifications() {
  try {
    // Get pending notifications from IndexedDB or localStorage
    const pendingNotifications = JSON.parse(
      localStorage.getItem('pending_notifications') || '[]'
    );

    if (pendingNotifications.length === 0) {
      return;
    }

    console.log(`Found ${pendingNotifications.length} pending notifications to sync`);

    // Process each pending notification
    for (let i = 0; i < pendingNotifications.length; i++) {
      const notification = pendingNotifications[i];

      try {
        const response = await fetch('/api/notifications/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notification),
        });

        if (response.ok) {
          // Remove from pending
          pendingNotifications.splice(i, 1);
          i--;
          localStorage.setItem('pending_notifications', JSON.stringify(pendingNotifications));
        }
      } catch (error) {
        console.error('Failed to process notification during sync:', error);
      }
    }

    // Update localStorage with any remaining pending notifications
    localStorage.setItem('pending_notifications', JSON.stringify(pendingNotifications));
  } catch (error) {
    console.error('Error during notification sync:', error);
  }
}
