import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import CONFIG from './config.js';

const BASE_URL = CONFIG.BASE_URL;

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
  })
);

registerRoute(
  ({ url }) =>
    url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome'),
  new CacheFirst({
    cacheName: 'fontawesome',
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://ui-avatars.com',
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return url.origin === baseUrl.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'story-api-json',
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return url.origin === baseUrl.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api-images',
  })
);

registerRoute(
  ({ url }) => url.origin.includes('maptiler'),
  new CacheFirst({
    cacheName: 'maptiler-api',
  })
);

self.addEventListener('push', (event) => {

  async function chainPromise() {
    try {
      let notificationData = {};

      if (event.data) {
        notificationData = await event.data.json();
      }

      const title = notificationData.title || 'Story App';
      const options = {
        body: notificationData.options?.body || 'Ada update baru!',
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        tag: 'story-notification',
        data: notificationData,
        requireInteraction: false,
        vibrate: [100, 50, 100],
      };

      await self.registration.showNotification(title, options);

    } catch (error) {

      await self.registration.showNotification('Story App', {
        body: 'Ada update baru!',
        icon: '/images/icon-192x192.png',
        tag: 'story-notification-fallback',
      });
    }
  }

  event.waitUntil(chainPromise());
});

self.addEventListener('notificationclick', (event) => {

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
