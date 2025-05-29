// src/scripts/sw.js

const CACHE_NAME = 'story-app-v1';

// Hanya cache file yang benar-benar ada dan penting
const CACHE_FILES = [
  '/',
  '/index.html',
  // Tambahkan file lain yang pasti ada di project Anda
  // '/styles/styles.css',
  // '/scripts/index.js',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        // Use individual cache.add() for better error handling
        return Promise.all(
          CACHE_FILES.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`Service Worker: Failed to cache ${url}:`, err);
              // Don't fail the entire installation for one missing file
              return Promise.resolve();
            });
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Cached files successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // If both cache and network fail, return a basic offline page
          if (event.request.destination === 'document') {
            return new Response(
              '<h1>Offline</h1><p>Anda sedang offline dan halaman ini tidak tersedia dalam cache.</p>',
              {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/html' }
              }
            );
          }
        });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  async function chainPromise() {
    try {
      let notificationData = {};
      
      // Parse push data
      if (event.data) {
        notificationData = await event.data.json();
        console.log('Push data received:', notificationData);
      }

      const title = notificationData.title || 'Story App';
      const options = {
        body: notificationData.options?.body || 'Ada update baru!',
        icon: '/images/icon-192x192.png', // Sesuaikan dengan icon Anda
        badge: '/images/badge-72x72.png', // Sesuaikan dengan badge Anda
        tag: 'story-notification',
        data: notificationData,
        requireInteraction: false,
        vibrate: [100, 50, 100],
      };

      // Show notification
      await self.registration.showNotification(title, options);
      console.log('Notification shown:', title);
      
    } catch (error) {
      console.error('Error handling push event:', error);
      
      // Fallback notification if parsing fails
      await self.registration.showNotification('Story App', {
        body: 'Ada update baru!',
        icon: '/images/icon-192x192.png',
        tag: 'story-notification-fallback'
      });
    }
  }

  event.waitUntil(chainPromise());
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});