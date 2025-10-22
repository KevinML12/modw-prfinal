async function load({ fetch, params }) {
  const productId = params.id;
  try {
    const res = await fetch(`/api/v1/products/${productId}`);
    if (!res.ok) {
      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      if (res.status === 404) {
        errorMessage = "Producto no encontrado.";
      } else {
        try {
          const errorBody = await res.json();
          if (errorBody && errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch (e) {
        }
      }
      throw new Error(`No se pudo cargar el producto: ${errorMessage}`);
    }
    const product = await res.json();
    return {
      product,
      error: null
    };
  } catch (error) {
    console.error(`Error cargando producto ID ${productId}:`, error);
    return {
      product: null,
      error: error.message || "Error al cargar el producto."
    };
  }
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CHXWwI1I.js')).default;
const universal_id = "src/routes/product/[id]/+page.js";
const imports = ["_app/immutable/nodes/4.Db67LLao.js","_app/immutable/chunks/Lu49ep7q.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/DF0AeUBT.js","_app/immutable/chunks/A-BvWNr1.js","_app/immutable/chunks/CWuBUEw-.js","_app/immutable/chunks/DZB2pNWn.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _page as universal, universal_id };
//# sourceMappingURL=4-NccsSTRC.js.map
