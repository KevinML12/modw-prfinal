import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			// Redirige /api/v1/* al backend de Go
			'/api/v1': {
				target: 'http://backend:8080',
				changeOrigin: true,
			}
		}
	}
});