<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/user.store.js';
	import { apiGet } from '$lib/utils/api.js';
	
	let user = null;
	let loading = true;
	let orders = [];
	let error = null;
	
	onMount(async () => {
		const unsubscribe = userStore.subscribe(state => {
			user = state.user;
			loading = state.loading;
			
			if (!state.loading && !state.user) {
				goto('/login?redirect=/orders');
			}
		});
		
		if (user && !loading) {
			await loadOrders();
		}
		
		return unsubscribe;
	});
	
	async function loadOrders() {
		try {
			loading = true;
			orders = await apiGet('/api/v1/orders');
			loading = false;
		} catch (err) {
			console.error('[Orders Page] Error cargando pedidos:', err);
			error = err.message;
			loading = false;
		}
	}
	
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('es-GT', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	function getStatusColor(status) {
		const colors = {
			'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
			'paid': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
			'shipped': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
			'delivered': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
			'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
		};
		return colors[status] || colors['pending'];
	}
	
	function getStatusText(status) {
		const texts = {
			'pending': 'Pendiente',
			'paid': 'Pagado',
			'shipped': 'Enviado',
			'delivered': 'Entregado',
			'cancelled': 'Cancelado'
		};
		return texts[status] || status;
	}
</script>

<svelte:head>
	<title>Mis Pedidos | Moda Orgánica</title>
</svelte:head>

<div class="min-h-screen bg-bg-primary dark:bg-dark-bg-primary py-12 px-4">
	<div class="container mx-auto max-w-6xl">
		<div class="mb-8">
			<h1 class="text-4xl font-bold bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-dark-magenta dark:to-dark-purple bg-clip-text text-transparent mb-2">
				Mis Pedidos
			</h1>
			<p class="text-text-secondary dark:text-dark-text-secondary">
				Historial completo de tus compras
			</p>
		</div>
		
		{#if loading}
			<div class="flex items-center justify-center min-h-[400px]">
				<div class="text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-magenta dark:border-dark-magenta mx-auto mb-4"></div>
					<p class="text-text-secondary dark:text-dark-text-secondary">Cargando pedidos...</p>
				</div>
			</div>
		{:else if error}
			<div class="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
				<p class="text-red-800 dark:text-red-200 mb-4">{error}</p>
				<button 
					onclick={loadOrders}
					class="bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-dark-magenta dark:to-dark-purple text-white font-bold px-6 py-2 rounded-xl hover:scale-105 transition-transform"
				>
					Reintentar
				</button>
			</div>
		{:else if orders.length === 0}
			<div class="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-12 text-center">
				<span class="text-6xl mb-4 block">📦</span>
				<h3 class="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-2">
					No tienes pedidos aún
				</h3>
				<p class="text-text-secondary dark:text-dark-text-secondary mb-6">
					Explora nuestra colección y realiza tu primera compra
				</p>
				<a 
					href="/"
					class="inline-block bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-dark-magenta dark:to-dark-purple text-white font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform"
				>
					Ver Productos
				</a>
			</div>
		{:else}
			<div class="space-y-6">
				{#each orders as order (order.id)}
					<div class="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-6 shadow-soft dark:shadow-dark-soft border-2 border-transparent hover:border-primary-magenta/30 dark:hover:border-dark-magenta/30 transition-colors">
						<div class="flex items-start justify-between mb-4 pb-4 border-b-2 border-gray-200 dark:border-dark-border">
							<div>
								<p class="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
									Pedido #{order.id}
								</p>
								<p class="text-sm text-text-tertiary dark:text-dark-text-tertiary">
									{formatDate(order.created_at)}
								</p>
							</div>
							<span class="px-4 py-1 rounded-full text-xs font-bold {getStatusColor(order.status)}">
								{getStatusText(order.status)}
							</span>
						</div>
						
						<div class="space-y-3 mb-4">
							{#each order.items as item (item.id)}
								<div class="flex items-center gap-4">
									<div class="w-16 h-16 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg flex items-center justify-center">
										{#if item.product?.image_url}
											<img src={item.product.image_url} alt={item.product.name} class="w-full h-full object-cover rounded-lg" />
										{:else}
											<span class="text-2xl">💎</span>
										{/if}
									</div>
									<div class="flex-1">
										<p class="font-semibold text-text-primary dark:text-dark-text-primary">
											{item.product?.name || 'Producto'}
										</p>
										<p class="text-sm text-text-secondary dark:text-dark-text-secondary">
											Cantidad: {item.quantity}
										</p>
									</div>
									<p class="font-bold text-primary-magenta dark:text-dark-magenta">
										${(item.price * item.quantity).toFixed(2)}
									</p>
								</div>
							{/each}
						</div>
						
						<div class="flex justify-between items-center pt-4 border-t-2 border-gray-200 dark:border-dark-border">
							<span class="font-semibold text-text-primary dark:text-dark-text-primary">Total:</span>
							<span class="text-2xl font-bold text-primary-magenta dark:text-dark-magenta">
								${order.total.toFixed(2)}
							</span>
						</div>
						
						{#if order.shipping_department}
							<div class="mt-4 pt-4 border-t-2 border-gray-200 dark:border-dark-border">
								<p class="text-sm font-semibold text-text-primary dark:text-dark-text-primary mb-2">
									Dirección de envío:
								</p>
								<p class="text-sm text-text-secondary dark:text-dark-text-secondary">
									{order.shipping_address}<br />
									{order.shipping_municipality}, {order.shipping_department}
								</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
