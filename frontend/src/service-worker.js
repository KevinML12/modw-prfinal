/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Crea un nombre único para la caché actual basado en la versión del build
const CACHE = `cache-${version}`;

// Lista de assets a precachear (archivos del build + archivos estáticos)
const ASSETS = [
	...build, // Archivos generados por SvelteKit (JS, CSS, etc.)
	...files, // Archivos en tu carpeta /static
];

// --- Evento de Instalación ---
self.addEventListener('install', (event) => {
	// Forzar al SW que espera a activarse tan pronto como se instale
	// y todos los assets core estén cacheados.
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => {
				self.skipWaiting();
			})
	);
});

// --- Evento de Activación ---
self.addEventListener('activate', (event) => {
	// Borrar cachés antiguas cuando el SW se activa.
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				// Borra si no es la caché actual
				if (key !== CACHE) {
					await caches.delete(key);
				}
			}
			// Asegura que el SW tome control inmediato de la página
			self.clients.claim();
			console.log(`Service Worker v${version} activated.`);
		})
	);
});

// --- Evento Fetch (Interceptar Peticiones) ---
self.addEventListener('fetch', (event) => {
	// Ignorar peticiones que no sean GET
	if (event.request.method !== 'GET') {
		return;
	}

	const url = new URL(event.request.url);

	// Ignorar peticiones internas de SvelteKit para HMR (hot module replacement)
	if (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/@fs')) {
		return;
	}

	// Estrategia: Cache First para assets precacheados o estáticos
	// Si la URL está en nuestra lista ASSETS, o es un archivo común (imagen, fuente)
	const isAsset =
		ASSETS.includes(url.pathname) ||
		['/icons/', '/logos/', '/images/'].some((prefix) => url.pathname.startsWith(prefix)) ||
		['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.ico', '.woff2', '.woff'].some((ext) =>
			url.pathname.endsWith(ext)
		);

	if (isAsset) {
		event.respondWith(
			caches.open(CACHE).then(async (cache) => {
				// 1. Intenta obtener de la caché
				const cachedResponse = await cache.match(event.request);
				if (cachedResponse) {
					return cachedResponse;
				}
				// 2. Si no está, ve a la red
				try {
					const networkResponse = await fetch(event.request);
					// 3. Cachea la respuesta si fue exitosa
					if (networkResponse.ok) {
						cache.put(event.request, networkResponse.clone());
					}
					return networkResponse;
				} catch (error) {
					console.error(`Fetch failed for asset ${event.request.url}:`, error);
					// Podrías devolver una imagen placeholder aquí si falla
					return new Response('Asset not found', { status: 404 });
				}
			})
		);
		return; // Termina aquí para assets
	}

	// Estrategia: Network First para todo lo demás (páginas, API)
	event.respondWith(
		caches.open(CACHE).then(async (cache) => {
			try {
				// 1. Intenta ir a la red primero
				const networkResponse = await fetch(event.request);
				// 2. Si funciona, cachea la respuesta para offline
				if (networkResponse.ok) {
					cache.put(event.request, networkResponse.clone());
				}
				return networkResponse;
			} catch (error) {
				// 3. Si la red falla, intenta servir desde la caché
				console.log(`Network failed for ${event.request.url}, trying cache...`);
				const cachedResponse = await cache.match(event.request);
				if (cachedResponse) {
					return cachedResponse;
				}
				// 4. Si tampoco está en caché, devuelve un error genérico offline
				// (Podrías devolver una página offline personalizada aquí)
				console.error(`Fetch failed (offline and not in cache) for ${event.request.url}:`, error);
				return new Response('Network error trying to fetch resource.', {
					status: 408, // Request Timeout
					headers: { 'Content-Type': 'text/plain' },
				});
			}
		})
	);
});