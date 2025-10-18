import * as universal from '../entries/pages/_page.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.DaYJTkZZ.js","_app/immutable/chunks/BLzuDzTN.js","_app/immutable/chunks/DD-Pidvo.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Dxf3pmbq.js","_app/immutable/chunks/DqJylSoy.js"];
export const stylesheets = [];
export const fonts = [];
