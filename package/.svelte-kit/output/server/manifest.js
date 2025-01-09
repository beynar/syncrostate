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
		client: {"start":"_app/immutable/entry/start.B3NVU5Mo.js","app":"_app/immutable/entry/app.BrB0TqMN.js","imports":["_app/immutable/entry/start.B3NVU5Mo.js","_app/immutable/chunks/entry.CZ5Oed7b.js","_app/immutable/chunks/runtime.CbYia6-Y.js","_app/immutable/chunks/sources.CF79SpFM.js","_app/immutable/chunks/index-client.D1AqtzPV.js","_app/immutable/entry/app.BrB0TqMN.js","_app/immutable/chunks/runtime.CbYia6-Y.js","_app/immutable/chunks/sources.CF79SpFM.js","_app/immutable/chunks/render.BMIIEHYv.js","_app/immutable/chunks/disclose-version._E9WSv7M.js","_app/immutable/chunks/if.J6tM_ou6.js","_app/immutable/chunks/proxy.aSlObE7i.js","_app/immutable/chunks/this.CCyCLflU.js","_app/immutable/chunks/index-client.D1AqtzPV.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
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
