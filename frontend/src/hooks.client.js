import { dev } from '$app/environment';

// En desarrollo, deshabilitar el Service Worker para evitar cacheos problemáticos
// que causan errores de timeout con rutas de Vite (/@fs, /@vite)
if (dev) {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.getRegistrations()
			.then((registrations) => {
				registrations.forEach((registration) => registration.unregister());
				console.log('✅ Service Worker deshabilitado en desarrollo');
			})
			.catch((err) => console.error('Error desregistrando SW:', err));
	}
}
