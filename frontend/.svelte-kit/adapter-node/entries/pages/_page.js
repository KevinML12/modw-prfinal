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
export {
  load
};
