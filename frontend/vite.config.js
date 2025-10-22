import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',
		proxy: {
			// Redirige /api/v1/* al backend de Go (en Docker)
			'/api/v1': {
				target: 'http://backend:8080',
				changeOrigin: true,
				rewrite: (path) => {
					// Ensure we don't double-prefix the path
					return path.replace(/^\/api\/v1/, '/api/v1');
				},
				configure: (proxy, _options) => {
					proxy.on('error', (err, _req, _res) => {
						console.error('❌ Proxy error:', err.message);
					});
					proxy.on('proxyRes', (proxyRes, req, _res) => {
						console.log(`✅ [${req.method}] ${req.url} -> ${proxyRes.statusCode}`);
					});
				},
			}
		}
	}
});