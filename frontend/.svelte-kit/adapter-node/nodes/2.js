import * as universal from '../entries/pages/_page.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.Cs-BQln-.js","_app/immutable/chunks/Lu49ep7q.js","_app/immutable/chunks/C6npqHAV.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/A-BvWNr1.js","_app/immutable/chunks/CWuBUEw-.js","_app/immutable/chunks/URQBqU43.js"];
export const stylesheets = [];
export const fonts = [];
