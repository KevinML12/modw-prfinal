import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient.js';

/**
 * User Store - Estado global de autenticación
 * @typedef {Object} UserState
 * @property {Object|null} user - Usuario autenticado de Supabase
 * @property {Object|null} session - Sesión actual con tokens
 * @property {boolean} loading - Estado de carga
 * @property {string|null} error - Mensaje de error si existe
 */

function createUserStore() {
	const { subscribe, set, update } = writable({
		user: null,
		session: null,
		loading: true,
		error: null
	});

	/**
	 * Inicializa el store verificando si hay sesión existente
	 */
	async function initialize() {
		console.log('[User Store] Inicializando...');
		
		try {
			const { data: { session }, error } = await supabase.auth.getSession();
			
			if (error) throw error;
			
			if (session) {
				console.log('[User Store] Sesión existente encontrada:', session.user.email);
			} else {
				console.log('[User Store] No hay sesión activa');
			}
			
			set({
				user: session?.user ?? null,
				session: session,
				loading: false,
				error: null
			});
		} catch (error) {
			console.error('[User Store] Error inicializando sesión:', error);
			set({ 
				user: null, 
				session: null, 
				loading: false, 
				error: error.message 
			});
		}
	}

	/**
	 * Escucha cambios en el estado de autenticación
	 * Se ejecuta automáticamente cuando Supabase detecta cambios
	 */
	supabase.auth.onAuthStateChange((event, session) => {
		console.log('[User Store] Auth state cambió:', event);
		
		set({
			user: session?.user ?? null,
			session: session,
			loading: false,
			error: null
		});
	});

	/**
	 * Inicia sesión con email y contraseña
	 * @param {string} email 
	 * @param {string} password 
	 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
	 */
	async function login(email, password) {
		console.log('[User Store] Intentando login:', email);
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) throw error;

			console.log('[User Store] Login exitoso:', data.user.email);

			set({
				user: data.user,
				session: data.session,
				loading: false,
				error: null
			});

			return { success: true, user: data.user };
		} catch (error) {
			console.error('[User Store] Error en login:', error);
			
			const errorMessage = 
				error.message === 'Invalid login credentials'
					? 'Email o contraseña incorrectos'
					: error.message || 'Error al iniciar sesión';
			
			update(state => ({ ...state, loading: false, error: errorMessage }));
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Registra un nuevo usuario
	 * @param {string} email 
	 * @param {string} password 
	 * @param {Object} metadata - Datos adicionales del usuario (nombre, teléfono, etc.)
	 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
	 */
	async function register(email, password, metadata = {}) {
		console.log('[User Store] Registrando nuevo usuario:', email);
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: metadata
				}
			});

			if (error) throw error;

			if (data.user && !data.session) {
				console.warn('[User Store] Usuario creado pero requiere confirmación de email');
				return { 
					success: false, 
					error: 'Por favor verifica tu email para activar tu cuenta' 
				};
			}

			console.log('[User Store] Registro exitoso:', data.user.email);

			set({
				user: data.user,
				session: data.session,
				loading: false,
				error: null
			});

			return { success: true, user: data.user };
		} catch (error) {
			console.error('[User Store] Error en registro:', error);
			
			const errorMessage = 
				error.message.includes('already registered')
					? 'Este email ya está registrado'
					: error.message || 'Error al registrarse';
			
			update(state => ({ ...state, loading: false, error: errorMessage }));
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Cierra la sesión actual
	 * @returns {Promise<{success: boolean, error?: string}>}
	 */
	async function logout() {
		console.log('[User Store] Cerrando sesión...');
		update(state => ({ ...state, loading: true }));
		
		try {
			const { error } = await supabase.auth.signOut();
			
			if (error) throw error;

			console.log('[User Store] Sesión cerrada correctamente');

			set({ user: null, session: null, loading: false, error: null });
			return { success: true };
		} catch (error) {
			console.error('[User Store] Error al cerrar sesión:', error);
			
			const errorMessage = error.message || 'Error al cerrar sesión';
			update(state => ({ ...state, loading: false, error: errorMessage }));
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Actualiza el perfil del usuario (metadata)
	 * @param {Object} updates - Datos a actualizar
	 * @returns {Promise<{success: boolean, error?: string}>}
	 */
	async function updateProfile(updates) {
		console.log('[User Store] Actualizando perfil...');
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const { data, error } = await supabase.auth.updateUser({
				data: updates
			});

			if (error) throw error;

			console.log('[User Store] Perfil actualizado');

			update(state => ({
				...state,
				user: data.user,
				loading: false
			}));

			return { success: true };
		} catch (error) {
			console.error('[User Store] Error actualizando perfil:', error);
			
			const errorMessage = error.message || 'Error al actualizar perfil';
			update(state => ({ ...state, loading: false, error: errorMessage }));
			return { success: false, error: errorMessage };
		}
	}

	// Inicializar automáticamente al crear el store
	initialize();

	return {
		subscribe,
		login,
		register,
		logout,
		updateProfile,
		initialize
	};
}

export const userStore = createUserStore();

/**
 * Helper: Obtiene el usuario actual (no reactivo)
 * Útil para verificaciones fuera de componentes Svelte
 */
export async function getCurrentUser() {
	const { data: { user } } = await supabase.auth.getUser();
	return user;
}

/**
 * Helper: Obtiene el access token actual
 * Necesario para hacer requests autenticados al backend
 */
export async function getAccessToken() {
	const { data: { session } } = await supabase.auth.getSession();
	return session?.access_token ?? null;
}

/**
 * Helper: Verifica si hay un usuario autenticado
 */
export async function isAuthenticated() {
	const user = await getCurrentUser();
	return user !== null;
}
