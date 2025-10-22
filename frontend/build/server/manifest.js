const manifest = (() => {
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
		client: {start:"_app/immutable/entry/start.0ozmplHN.js",app:"_app/immutable/entry/app.C3BXeglT.js",imports:["_app/immutable/entry/start.0ozmplHN.js","_app/immutable/chunks/URQBqU43.js","_app/immutable/chunks/Lu49ep7q.js","_app/immutable/chunks/CWuBUEw-.js","_app/immutable/entry/app.C3BXeglT.js","_app/immutable/chunks/Lu49ep7q.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BsgjamND.js')),
			__memo(() => import('./chunks/1-Cu_TuF4m.js')),
			__memo(() => import('./chunks/2-CmuExGgg.js')),
			__memo(() => import('./chunks/3-B_tC8mJp.js')),
			__memo(() => import('./chunks/4-NccsSTRC.js'))
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
			},
			{
				id: "/product/[id]",
				pattern: /^\/product\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
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

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
