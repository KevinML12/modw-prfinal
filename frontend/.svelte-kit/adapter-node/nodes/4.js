import * as universal from '../entries/pages/product/_id_/_page.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/product/_id_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/product/[id]/+page.js";
export const imports = ["_app/immutable/nodes/4.Db67LLao.js","_app/immutable/chunks/Lu49ep7q.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/DF0AeUBT.js","_app/immutable/chunks/A-BvWNr1.js","_app/immutable/chunks/CWuBUEw-.js","_app/immutable/chunks/DZB2pNWn.js"];
export const stylesheets = [];
export const fonts = [];
