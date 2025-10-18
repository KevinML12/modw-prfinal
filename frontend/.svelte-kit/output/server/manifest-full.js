export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["icons/android-chrome-192x192.png","icons/android-chrome-512x512.png","icons/apple-touch-icon.png","icons/favicon-16x16.png","icons/favicon-32x32.png","icons/favicon.ico","manifest.json","service-worker.js"]),
	mimeTypes: {".png":"image/png",".json":"application/json"},
	_: {
		client: {start:"_app/immutable/entry/start.CF5tMOLQ.js",app:"_app/immutable/entry/app.Cn5flKRv.js",imports:["_app/immutable/entry/start.CF5tMOLQ.js","_app/immutable/chunks/BtkSPeIC.js","_app/immutable/chunks/BLzuDzTN.js","_app/immutable/chunks/DqJylSoy.js","_app/immutable/entry/app.Cn5flKRv.js","_app/immutable/chunks/BLzuDzTN.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/checkout",
				pattern: /^\/checkout\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
