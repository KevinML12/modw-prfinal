import { supabase } from '$lib/supabaseClient.js';

/**
 * Realiza un fetch autenticado agregando el JWT de Supabase
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise<Response>}
 * @throws {Error} Si no hay sesión activa
 */
export async function authenticatedFetch(url, options = {}) {
	const { data: { session }, error } = await supabase.auth.getSession();
	
	if (error || !session) {
		throw new Error('No hay sesión activa. Por favor inicia sesión.');
	}
	
	const headers = {
		...options.headers,
		'Authorization': `Bearer ${session.access_token}`,
		'Content-Type': 'application/json'
	};
	
	return fetch(url, {
		...options,
		headers
	});
}

/**
 * Realiza un POST autenticado
 * @param {string} url 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export async function apiPost(url, data) {
	const response = await authenticatedFetch(url, {
		method: 'POST',
		body: JSON.stringify(data)
	});
	
	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
		throw new Error(error.message || `HTTP ${response.status}`);
	}
	
	return response.json();
}

/**
 * Realiza un GET autenticado
 * @param {string} url 
 * @returns {Promise<Object>}
 */
export async function apiGet(url) {
	const response = await authenticatedFetch(url, {
		method: 'GET'
	});
	
	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
		throw new Error(error.message || `HTTP ${response.status}`);
	}
	
	return response.json();
}

/**
 * Realiza un PUT autenticado
 * @param {string} url 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export async function apiPut(url, data) {
	const response = await authenticatedFetch(url, {
		method: 'PUT',
		body: JSON.stringify(data)
	});
	
	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
		throw new Error(error.message || `HTTP ${response.status}`);
	}
	
	return response.json();
}

/**
 * Realiza un DELETE autenticado
 * @param {string} url 
 * @returns {Promise<Object>}
 */
export async function apiDelete(url) {
	const response = await authenticatedFetch(url, {
		method: 'DELETE'
	});
	
	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
		throw new Error(error.message || `HTTP ${response.status}`);
	}
	
	return response.json();
}
