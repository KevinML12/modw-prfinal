/**
 * @type {import('./$types').PageLoad}
 */
export async function load({ fetch, params }) {
	// 'params' contiene los parámetros dinámicos de la ruta, en este caso 'id'
	const productId = params.id;

	try {
		// Llamamos al endpoint del backend usando ruta relativa
		// En desarrollo, Vite redirige esto al backend
		// En producción, debe estar configurado en el reverse proxy
		const res = await fetch(`/api/v1/products/${productId}`);

		if (!res.ok) {
			// Si el producto no se encuentra (404) o hay otro error
			let errorMessage = `Error ${res.status}: ${res.statusText}`;
			if (res.status === 404) {
				errorMessage = 'Producto no encontrado.';
			} else {
				try {
					const errorBody = await res.json();
					if (errorBody && errorBody.error) {
						errorMessage = errorBody.error;
					}
				} catch (e) {
					/* ignora si no es JSON */
				}
			}
			// Lanzamos un error que SvelteKit puede manejar para mostrar una página de error
			throw new Error(`No se pudo cargar el producto: ${errorMessage}`);
		}

		// Obtenemos el JSON del producto
		const product = await res.json();

		// Devolvemos el producto. Estará disponible como 'data.product' en +page.svelte
		return {
			product: product,
			error: null,
		};
	} catch (error) {
		console.error(`Error cargando producto ID ${productId}:`, error);
		// Devolvemos el error para que SvelteKit lo maneje o lo mostremos en la página
		// Es importante lanzar o devolver el error aquí para que SvelteKit muestre su página de error por defecto si es necesario.
		return {
			product: null,
			error: error.message || 'Error al cargar el producto.',
		};
	}
}