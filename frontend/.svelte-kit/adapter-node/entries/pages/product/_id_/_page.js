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
export {
  load
};
