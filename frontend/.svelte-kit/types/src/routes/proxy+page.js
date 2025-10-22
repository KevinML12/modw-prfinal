// @ts-nocheck
/**
 * @param {Parameters<import('./$types').PageLoad>[0]} event
 */
export async function load({ fetch }) {
	try {
		// Configurar timeout de 8 segundos
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 8000);

		// Usa el nombre del servicio Docker para SSR, SvelteKit lo maneja.
		const res = await fetch('http://backend:8080/api/v1/products', {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			signal: controller.signal,
		});

		clearTimeout(timeout);

		// Verifica si la respuesta fue exitosa (código 2xx)
		if (!res.ok) {
			// Intenta leer el mensaje de error del backend si existe
			let errorMessage = `Error ${res.status}: ${res.statusText}`;
			try {
				const errorBody = await res.json();
				if (errorBody && errorBody.error) {
					errorMessage = errorBody.error;
				}
			} catch (e) {
				// Ignora si el cuerpo no es JSON
			}
			throw new Error(`No se pudo conectar a la API de productos: ${errorMessage}`);
		}

		// Convierte la respuesta a JSON
		const products = await res.json();

		// Devuelve los productos. Estarán disponibles como 'data.products' en +page.svelte
		return {
			products: products || [], // Asegura devolver siempre un array
			error: null, // Indica que no hubo error
		};
	} catch (error) {
		console.error('No se pudo conectar a la API del backend:', error);
		// Devuelve un array vacío y el mensaje de error
		return {
			products: [],
			error: error.message || 'No se pudieron cargar los productos. Intenta de nuevo más tarde.',
		};
	}
}