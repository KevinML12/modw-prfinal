/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

console.warn('⚠️ Service Worker DEPRECATED - Use only in production (adapter-node)');

// Auto-unregister durante desarrollo
self.addEventListener('install', (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			// Limpiar todas las cachés antiguas
			const cacheNames = await caches.keys();
			await Promise.all(cacheNames.map((name) => caches.delete(name)));
			// Reclamar clientes
			await self.clients.claim();
			console.log('✅ Service Worker limpiado, lista para production');
		})()
	);
});

// En desarrollo, ignorar TODO (el hook.client.js lo desregistrará)
self.addEventListener('fetch', (event) => {
	// Pasar por alto - dejar que el navegador maneje todo
	return;
});