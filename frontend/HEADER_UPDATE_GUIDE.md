/**
 * ============================================
 * GUÍA: Agregar User Menu al Header
 * ============================================
 * 
 * Este archivo muestra cómo actualizar el Header existente
 * para mostrar el usuario logueado o el botón de "Iniciar Sesión"
 * 
 * ARCHIVO: frontend/src/lib/components/layout/Header.svelte
 * 
 * ============================================
 * PASO 1: AGREGAR IMPORTS
 * ============================================
 * 
 * Al inicio del <script> del Header, agregar:
 */

import { userStore } from '$lib/stores/user.store.js';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

/**
 * ============================================
 * PASO 2: AGREGAR ESTADO DEL USUARIO
 * ============================================
 * 
 * Después de los imports y antes de otras variables, agregar:
 */

let user = null;
let showUserMenu = false;

onMount(() => {
	const unsubscribe = userStore.subscribe(state => {
		user = state.user;
	});
	
	return unsubscribe;
});

async function handleLogout() {
	await userStore.logout();
	showUserMenu = false;
	goto('/');
}

/**
 * ============================================
 * PASO 3: AGREGAR HTML DEL USER MENU
 * ============================================
 * 
 * En el <header>, donde está el carrito (icono de bolsa),
 * AGREGAR DESPUÉS del botón del carrito y ANTES del ícono dark mode:
 * 
 * (Ajustar la posición según el layout actual del Header)
 */

<!-- User Menu - Agregar esto en el header junto al carrito -->
<div class="relative">
	{#if user}
		<!-- Usuario Logueado - Dropdown -->
		<button 
			onclick={() => showUserMenu = !showUserMenu}
			class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-card dark:hover:bg-dark-bg-card transition-colors"
			title="Mi cuenta"
		>
			<div class="w-8 h-8 bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-dark-magenta dark:to-dark-purple rounded-full flex items-center justify-center text-white font-bold text-sm">
				{user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
			</div>
			<span class="hidden md:block text-sm font-medium text-text-primary dark:text-dark-text-primary">
				{user.user_metadata?.full_name?.split(' ')[0] || 'Mi cuenta'}
			</span>
			<svg class="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
			</svg>
		</button>
		
		{#if showUserMenu}
			<!-- Dropdown Menu -->
			<div class="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-bg-card rounded-xl shadow-soft dark:shadow-dark-soft border-2 border-gray-200 dark:border-dark-border z-50 overflow-hidden">
				<!-- Header del dropdown con email -->
				<div class="p-4 border-b-2 border-gray-200 dark:border-dark-border bg-bg-secondary dark:bg-dark-bg-secondary">
					<p class="text-sm font-semibold text-text-primary dark:text-dark-text-primary truncate">
						{user.user_metadata?.full_name || 'Mi Cuenta'}
					</p>
					<p class="text-xs text-text-secondary dark:text-dark-text-secondary truncate">
						{user.email}
					</p>
				</div>
				
				<!-- Menu items -->
				<div class="py-1">
					<a 
						href="/orders"
						onclick={() => showUserMenu = false}
						class="flex items-center gap-2 px-4 py-3 text-sm text-text-primary dark:text-dark-text-primary hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Mis Pedidos
					</a>
					<a 
						href="/"
						onclick={() => showUserMenu = false}
						class="flex items-center gap-2 px-4 py-3 text-sm text-text-primary dark:text-dark-text-primary hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						Configuración
					</a>
				</div>
				
				<!-- Separator -->
				<div class="border-t-2 border-gray-200 dark:border-dark-border"></div>
				
				<!-- Logout button -->
				<div class="p-1">
					<button 
						onclick={handleLogout}
						class="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg m-1"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Cerrar Sesión
					</button>
				</div>
			</div>
		{/if}
	{:else}
		<!-- Usuario NO logueado - Link simple -->
		<a 
			href="/login"
			class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-card dark:hover:bg-dark-bg-card transition-colors text-text-primary dark:text-dark-text-primary"
			title="Iniciar sesión"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
			<span class="hidden md:block text-sm font-medium">Iniciar Sesión</span>
		</a>
	{/if}
</div>

/**
 * ============================================
 * PASO 4: NOTAS IMPORTANTES
 * ============================================
 * 
 * 1. El user menu es TOTALMENTE REACTIVO
 *    - Se abre/cierra al hacer click
 *    - Se cierra automáticamente al navegar
 * 
 * 2. POSICIONAMIENTO del dropdown:
 *    - Es absolute y posicionado a la derecha (right-0)
 *    - Usa z-50 para estar encima de otros elementos
 * 
 * 3. VALIDACIONES:
 *    - Verifica si hay usuario en userStore
 *    - Si no hay, muestra link a /login
 *    - Si hay, muestra dropdown con opciones
 * 
 * 4. DATOS DEL USUARIO:
 *    - user.email: email del usuario
 *    - user.user_metadata.full_name: nombre completo del usuario
 *    - Esto viene de Supabase auth
 * 
 * 5. ESTILOS:
 *    - Usa colores del proyecto (primary-magenta, etc)
 *    - Dark mode completo
 *    - Transiciones suaves
 * 
 * ============================================
 */
