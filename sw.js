// HabitFlow Service Worker - Code Ahumada
// Versión: habitflow-v1.3

const CACHE_NAME = 'habitflow-v1.3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/storage.js',
  './js/audio.js',
  './js/reminders.js',
  './js/habits.js',
  './js/app.js',
  './js/pwa.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

// Instalación: Cachear assets y forzar activación inmediata
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activación: Reclamar clientes y purgar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Intercepción de peticiones (Network first con fallback a caché para HTML, Cache first para assets estáticos)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // No interceptar peticiones no GET o de esquemas raros
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Petición de documento de navegación principal (index.html)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Actualizar caché con la versión fresca
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // Para assets locales y librerías externas (Tailwind / Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback silencioso si no hay conexión
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Interacción con notificaciones en segundo plano
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (action === 'drink_250') {
            client.postMessage({ type: 'QUICK_ADD_WATER', amount: 250 });
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
