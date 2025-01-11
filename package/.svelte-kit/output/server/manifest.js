export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.BvV2kCja.js","app":"_app/immutable/entry/app.EWufW2kU.js","imports":["_app/immutable/entry/start.BvV2kCja.js","_app/immutable/chunks/entry.BuHi9ciL.js","_app/immutable/chunks/runtime.BVl7ZLM4.js","_app/immutable/chunks/sources.BIb9Frml.js","_app/immutable/chunks/index-client.Bxko3Z-Z.js","_app/immutable/entry/app.EWufW2kU.js","_app/immutable/chunks/runtime.BVl7ZLM4.js","_app/immutable/chunks/sources.BIb9Frml.js","_app/immutable/chunks/render.DQICMmcn.js","_app/immutable/chunks/disclose-version.DsQ_o76s.js","_app/immutable/chunks/if.BrwSCR6L.js","_app/immutable/chunks/proxy.B3p0uDm0.js","_app/immutable/chunks/this.fPLeM_sq.js","_app/immutable/chunks/index-client.Bxko3Z-Z.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/proxy",
				pattern: /^\/proxy\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
