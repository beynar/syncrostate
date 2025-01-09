

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.D-BY-w7U.js","_app/immutable/chunks/disclose-version.DsQ_o76s.js","_app/immutable/chunks/runtime.BVl7ZLM4.js"];
export const stylesheets = ["_app/immutable/assets/0.BceWOqYP.css"];
export const fonts = [];
