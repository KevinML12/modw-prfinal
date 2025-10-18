/**
 * @type {import('./$types').PageLoad}
 */
export async function load({ fetch }) {
  try {
    // Esta URL funciona para SSR dentro del entorno Docker.
    const res = await fetch('http://localhost:8080/api/v1/products');

    if (!response.ok) {
      throw new Error(`Error al obtener los productos: ${response.statusText}`);
    }

    const products = await response.json();

    // Los datos devueltos aquí estarán disponibles en +page.svelte
    return {
      products,
    };

  } catch (error) {
    console.error("No se pudo conectar a la API del backend:", error);
    // Devolvemos un array vacío para que la página no se rompa.
    return {
      products: [],
      error: "No se pudieron cargar los productos. Intenta de nuevo más tarde."
    };
  }
}