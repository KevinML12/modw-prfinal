// Importa las utilidades de Workbox (una librería de Google para PWAs)
import { build, files, version } from '$service-worker';

const CACHE_NAME = `cache-${version}`;

const ASSETS_TO_CACHE = build.concat(files); // Archivos generados por SvelteKit + archivos en /static

// --- Ciclo de Vida del Service Worker ---

// 1. Instalación: Cachea los assets iniciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        self.skipWaiting(); // Activa el nuevo SW inmediatamente
      })
  );
});

// 2. Activación: Limpia cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      // Borra todas las cachés excepto la actual
      for (const key of keys) {
        if (key !== CACHE_NAME) {
          await caches.delete(key);
        }
      }
      self.clients.claim(); // Toma control de las pestañas abiertas
    })
  );
});

// 3. Fetch: Intercepta peticiones y decide estrategia de caché
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignora peticiones que no sean GET (POST, PUT, etc.)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Estrategia: Network First para API, Cache First para lo demás
  if (url.pathname.startsWith('/api/')) {
    // Intenta ir a la red primero para datos de API
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Si la red funciona, cachea la respuesta y devuélvela
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si la red falla, intenta servir desde la caché
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || Response.error(); // Devuelve error si tampoco está en caché
          });
        })
    );
  } else {
    // Estrategia: Cache First para assets estáticos y páginas
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Si está en caché, devuélvelo
        if (cachedResponse) {
          return cachedResponse;
        }
        // Si no, ve a la red, cachea la respuesta y devuélvela
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
  }
});