import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// En Docker, intenta obtener desde variables de entorno del proceso
if (!supabaseUrl || !supabaseAnonKey) {
	if (typeof process !== 'undefined' && process.env) {
		supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL;
		supabaseAnonKey = supabaseAnonKey || process.env.VITE_SUPABASE_ANON_KEY;
	}
}

if (!supabaseUrl || !supabaseAnonKey) {
	console.error('ADVERTENCIA: Configuración de Supabase incompleta');
	console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'OK' : 'FALTANTE');
	console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'OK' : 'FALTANTE');
	console.error('\nSoluciones:');
	console.error('1. En desarrollo local: Asegúrate que .env existe en raíz con VITE_SUPABASE_*');
	console.error('2. En Docker: Verifica docker-compose.yml tenga environment: VITE_SUPABASE_*');
	console.error('3. Luego reinicia: docker-compose restart frontend');
	
	// En desarrollo, crear un cliente dummy para no romper la app
	if (import.meta.env.DEV) {
		console.warn('Usando cliente Supabase en modo desarrollo limitado');
	} else {
		throw new Error('Configuración de Supabase faltante en variables de entorno');
	}
}

export const supabase = supabaseUrl && supabaseAnonKey 
	? createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true
		}
	})
	: null;

if (import.meta.env.DEV && supabase) {
	console.log('Supabase client inicializado correctamente');
	console.log('URL:', supabaseUrl);
}
