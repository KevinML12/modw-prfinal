<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { cart } from '$lib/stores/cart.store.js';
	import { goto } from '$app/navigation';
	
	let sessionId = '';
	let loading = true;
	let orderConfirmed = false;
	
	onMount(() => {
		// Obtener session_id de la URL
		sessionId = $page.url.searchParams.get('session_id');
		
		if (!sessionId) {
			console.error('No se encontró session_id en URL');
			goto('/');
			return;
		}
		
		console.log('Pago completado. Session ID:', sessionId);
		
		// Limpiar carrito
		cart.clear();
		
		// Marcar como confirmado
		orderConfirmed = true;
		loading = false;
		
		// TODO FUTURO: Llamar a /api/v1/orders/{id} para obtener detalles
	});
</script>

<svelte:head>
	<title>Pago Exitoso | Moda Orgánica</title>
</svelte:head>

<div class="min-h-screen bg-bg-primary dark:bg-dark-bg-primary py-12 px-4">
	<div class="container mx-auto max-w-2xl">
		{#if loading}
			<!-- Loading State -->
			<div class="flex items-center justify-center min-h-[400px]">
				<div class="text-center">
					<div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-magenta dark:border-dark-magenta mx-auto mb-4"></div>
					<p class="text-text-secondary dark:text-dark-text-secondary">Confirmando tu pago...</p>
				</div>
			</div>
		{:else if orderConfirmed}
			<!-- Success State -->
			<div class="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-12 shadow-soft dark:shadow-dark-soft text-center">
				<!-- Success Icon -->
				<div class="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg class="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
				</div>
				
				<!-- Title -->
				<h1 class="text-4xl font-bold bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-dark-magenta dark:to-dark-purple bg-clip-text text-transparent mb-4">
					¡Pago Exitoso!
				</h1>
				
				<!-- Message -->
				<p class="text-lg text-text-secondary dark:text-dark-text-secondary mb-8">
					Tu pedido ha sido confirmado. En breve recibirás un email con los detalles.
				</p>
				
				<!-- Session ID (for debugging) -->
				<div class="bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-4 mb-8">
					<p class="text-sm text-text-tertiary dark:text-dark-text-tertiary mb-1">
						ID de Sesión:
					</p>
					<p class="text-xs font-mono text-text-secondary dark:text-dark-text-secondary break-all">
						{sessionId}
					</p>
				</div>
				
				<!-- Action Buttons -->
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a 
						href="/"
						class="inline-block bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-dark-magenta dark:to-dark-purple text-white font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform"
					>
						Volver a la Tienda
					</a>
					
					<!-- TODO FUTURO: Link a "Mis Pedidos" cuando esté auth completo -->
					<!-- 
					<a 
						href="/orders"
						class="inline-block bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-dark-text-primary font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-transform border-2 border-primary-magenta/30"
					>
						Ver Mis Pedidos
					</a>
					-->
				</div>
			</div>
		{/if}
	</div>
</div>
