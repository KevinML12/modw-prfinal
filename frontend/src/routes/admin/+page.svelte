<script>
	import { onMount } from 'svelte';

	let stats = {
		total_orders: 0,
		pending_orders: 0,
		processing_orders: 0,
		shipped_orders: 0,
		delivered_orders: 0,
		cancelled_orders: 0,
		total_revenue: 0
	};

	let loading = true;
	let error = '';

	onMount(async () => {
		await fetchStats();
	});

	async function fetchStats() {
		try {
			const token = localStorage.getItem('supabase_token');
			if (!token) {
				error = 'Token no encontrado. Por favor inicia sesión nuevamente.';
				loading = false;
				return;
			}

			const response = await fetch('/api/v1/admin/orders/stats', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			stats = await response.json();
		} catch (err) {
			console.error('Error fetching stats:', err);
			error = err.message || 'Error cargando estadísticas';
		} finally {
			loading = false;
		}
	}

	// Formatter de moneda
	const currency = new Intl.NumberFormat('es-GT', {
		style: 'currency',
		currency: 'GTQ'
	}).format;

	// Calcular porcentajes
	$: pendingPercent = stats.total_orders > 0 ? Math.round((stats.pending_orders / stats.total_orders) * 100) : 0;
	$: shippedPercent = stats.total_orders > 0 ? Math.round((stats.shipped_orders / stats.total_orders) * 100) : 0;
	$: deliveredPercent = stats.total_orders > 0 ? Math.round((stats.delivered_orders / stats.total_orders) * 100) : 0;
</script>

<svelte:head>
	<title>Dashboard - Admin Panel</title>
</svelte:head>

<div>
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-4xl font-black text-gray-900 dark:text-white mb-2">
			Dashboard
		</h1>
		<p class="text-gray-600 dark:text-gray-400">
			Resumen general de tu tienda
		</p>
	</div>

	{#if error}
		<div class="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8">
			<p class="text-red-700 dark:text-red-300 font-medium">
				 {error}
			</p>
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-magenta"></div>
		</div>
	{:else}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<!-- Total de Órdenes -->
			<div
				class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
			>
				<div class="flex items-center justify-between mb-4">
					<div class="text-4xl">📦</div>
					<span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold"
						>TOTAL</span
					>
				</div>
				<h3 class="text-4xl font-black text-gray-900 dark:text-white mb-1">
					{stats.total_orders}
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Órdenes totales
				</p>
			</div>

			<!-- Órdenes Pendientes -->
			<div
				class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
			>
				<div class="flex items-center justify-between mb-4">
					<div class="text-4xl">⏳</div>
					<span class="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-bold"
						>{pendingPercent}%</span
					>
				</div>
				<h3 class="text-4xl font-black text-gray-900 dark:text-white mb-1">
					{stats.pending_orders}
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Requieren atención
				</p>
			</div>

			<!-- Órdenes Enviadas -->
			<div
				class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
			>
				<div class="flex items-center justify-between mb-4">
					<div class="text-4xl">🚚</div>
					<span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold"
						>{shippedPercent}%</span
					>
				</div>
				<h3 class="text-4xl font-black text-gray-900 dark:text-white mb-1">
					{stats.shipped_orders}
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					En tránsito
				</p>
			</div>

			<!-- Revenue Total -->
			<div
				class="bg-gradient-to-br from-primary-magenta to-primary-purple rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
			>
				<div class="flex items-center justify-between mb-4">
					<div class="text-4xl"></div>
					<span class="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
						INGRESOS
					</span>
				</div>
				<h3 class="text-3xl font-black mb-1">
					{currency(stats.total_revenue)}
				</h3>
				<p class="text-sm text-white/80">
					Total generado
				</p>
			</div>
		</div>

		<!-- Status Distribution -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
			<!-- Pendiente -->
			<div
				class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
			>
				<h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<span class="text-2xl">⏳</span>
					Pendientes
				</h3>
				<div class="flex items-end gap-4">
					<div class="flex-1">
						<div class="h-32 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg relative overflow-hidden">
							<div
								class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-400 to-yellow-300"
								style="height: {pendingPercent}%"
							/>
						</div>
					</div>
					<div class="text-right">
						<p class="text-3xl font-black text-yellow-600 dark:text-yellow-400">
							{stats.pending_orders}
						</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{pendingPercent}%
						</p>
					</div>
				</div>
			</div>

			<!-- Enviadas -->
			<div
				class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
			>
				<h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<span class="text-2xl"></span>
					Enviadas
				</h3>
				<div class="flex items-end gap-4">
					<div class="flex-1">
						<div class="h-32 bg-purple-50 dark:bg-purple-900/10 rounded-lg relative overflow-hidden">
							<div
								class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-400 to-purple-300"
								style="height: {shippedPercent}%"
							/>
						</div>
					</div>
					<div class="text-right">
						<p class="text-3xl font-black text-purple-600 dark:text-purple-400">
							{stats.shipped_orders}
						</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{shippedPercent}%
						</p>
					</div>
				</div>
			</div>

			<!-- Entregadas -->
			<div
				class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
			>
				<h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<span class="text-2xl"></span>
					Entregadas
				</h3>
				<div class="flex items-end gap-4">
					<div class="flex-1">
						<div class="h-32 bg-green-50 dark:bg-green-900/10 rounded-lg relative overflow-hidden">
							<div
								class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-400 to-green-300"
								style="height: {deliveredPercent}%"
							/>
						</div>
					</div>
					<div class="text-right">
						<p class="text-3xl font-black text-green-600 dark:text-green-400">
							{stats.delivered_orders}
						</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{deliveredPercent}%
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Órdenes Pendientes -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-xl font-bold text-gray-900 dark:text-white">
						Órdenes Pendientes
					</h2>
					<a 
						href="/admin/orders?status=pending"
						class="text-primary-magenta hover:text-primary-purple font-bold text-sm"
					>
						Ver todas →
					</a>
				</div>
				{#if stats.pending_orders > 0}
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Tienes <span class="font-bold">{stats.pending_orders}</span> {stats.pending_orders === 1 ? 'orden pendiente' : 'órdenes pendientes'} que requieren atención.
					</p>
					<a
						href="/admin/orders?status=pending"
						class="inline-flex items-center gap-2 bg-gradient-to-r from-primary-magenta to-primary-purple text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
					>
						<span>📋</span>
						<span>Gestionar Órdenes</span>
					</a>
				{:else}
					<div class="text-center py-8">
						<p class="text-2xl mb-2"></p>
						<p class="text-gray-600 dark:text-gray-400 font-medium">
							¡No hay órdenes pendientes!
						</p>
						<p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
							Excelente trabajo
						</p>
					</div>
				{/if}
			</div>

			<!-- Acceso Rápido -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
				<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
					Acceso Rápido
				</h2>
				<div class="space-y-3">
					<a
						href="/admin/orders"
						class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<span class="text-3xl"></span>
						<div>
							<p class="font-bold text-gray-900 dark:text-white">Ver Órdenes</p>
							<p class="text-sm text-gray-600 dark:text-gray-400">Gestionar envíos y entregas</p>
						</div>
					</a>
					<a
						href="/admin/inventory"
						class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<span class="text-3xl"></span>
						<div>
							<p class="font-bold text-gray-900 dark:text-white">Inventario</p>
							<p class="text-sm text-gray-600 dark:text-gray-400">Gestionar productos y stock</p>
						</div>
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>
