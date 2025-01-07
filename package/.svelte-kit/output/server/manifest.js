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
		client: {"start":"_app/immutable/entry/start.04gsunzh.js","app":"_app/immutable/entry/app.5n1DNLaV.js","imports":["_app/immutable/entry/start.04gsunzh.js","_app/immutable/chunks/entry.BNzY0nhi.js","_app/immutable/chunks/runtime.CmYt-64r.js","_app/immutable/chunks/sources.DOKvnx5X.js","_app/immutable/chunks/index-client.BE7_J8JC.js","_app/immutable/entry/app.5n1DNLaV.js","_app/immutable/chunks/runtime.CmYt-64r.js","_app/immutable/chunks/sources.DOKvnx5X.js","_app/immutable/chunks/render.C4cB-gXu.js","_app/immutable/chunks/disclose-version.h9Td5Wq-.js","_app/immutable/chunks/if.BCSrqHVc.js","_app/immutable/chunks/proxy.SgGlwbcE.js","_app/immutable/chunks/this.FI2Ce4DF.js","_app/immutable/chunks/index-client.BE7_J8JC.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
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
