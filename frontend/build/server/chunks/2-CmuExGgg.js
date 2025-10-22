async function load({ fetch }) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8e3);
    const res = await fetch("http://backend:8080/api/v1/products", {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      try {
        const errorBody = await res.json();
        if (errorBody && errorBody.error) {
          errorMessage = errorBody.error;
        }
      } catch (e) {
      }
      throw new Error(`No se pudo conectar a la API de productos: ${errorMessage}`);
    }
    const products = await res.json();
    return {
      products: products || [],
      // Asegura devolver siempre un array
      error: null
      // Indica que no hubo error
    };
  } catch (error) {
    console.error("No se pudo conectar a la API del backend:", error);
    return {
      products: [],
      error: error.message || "No se pudieron cargar los productos. Intenta de nuevo más tarde."
    };
  }
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CPG_PHSN.js')).default;
const universal_id = "src/routes/+page.js";
const imports = ["_app/immutable/nodes/2.Cs-BQln-.js","_app/immutable/chunks/Lu49ep7q.js","_app/immutable/chunks/C6npqHAV.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/A-BvWNr1.js","_app/immutable/chunks/CWuBUEw-.js","_app/immutable/chunks/URQBqU43.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _page as universal, universal_id };
//# sourceMappingURL=2-CmuExGgg.js.map
