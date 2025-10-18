async function load({ fetch }) {
  try {
    const res = await fetch("http://localhost:8080/api/v1/products");
    if (!response.ok) {
      throw new Error(`Error al obtener los productos: ${response.statusText}`);
    }
    const products = await response.json();
    return {
      products
    };
  } catch (error) {
    console.error("No se pudo conectar a la API del backend:", error);
    return {
      products: [],
      error: "No se pudieron cargar los productos. Intenta de nuevo más tarde."
    };
  }
}
export {
  load
};
