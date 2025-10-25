<script>
	import { onMount } from 'svelte';

	let orders = [];
	let loading = true;
	let error = '';
	let selectedOrder = null;
	let showMapModal = false;
	let filterStatus = '';
	let currentPage = 1;
	const itemsPerPage = 20;

	// Formatter de moneda
	const currency = new Intl.NumberFormat('es-GT', {
		style: 'currency',
		currency: 'GTQ'
	}).format;

	// Formatter de fecha
	const dateFormatter = new Intl.DateTimeFormat('es-GT', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	onMount(async () => {
		await fetchOrders();
	});

	async function fetchOrders(status = '') {
		loading = true;
		error = '';
		try {
			const token = localStorage.getItem('supabase_token');
			if (!token) {
				error = 'Token no encontrado';
				loading = false;
				return;
			}

			let url = '/api/v1/admin/orders?limit=100';
			if (status) url += `&status=${status}`;

			const response = await fetch(url, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}`);
			}

			const data = await response.json();
			orders = data.orders || [];
		} catch (err) {
			console.error('Error fetching orders:', err);
			error = 'Error cargando órdenes: ' + err.message;
		} finally {
			loading = false;
		}
	}

	async function updateOrderStatus(orderId, newStatus) {
		try {
			const token = localStorage.getItem('supabase_token');
			const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (response.ok) {
				await fetchOrders(filterStatus);
				alert('Status actualizado correctamente');
			} else {
				alert('Error actualizando status');
			}
		} catch (err) {
			console.error('Error updating status:', err);
			alert('Error actualizando status');
		}
	}

	function openMapModal(order) {
		selectedOrder = order;
		showMapModal = true;
	}

	function closeMapModal() {
		showMapModal = false;
		selectedOrder = null;
	}

	function openGoogleMapsRoute(order) {
		const origin = 'Huehuetenango, Guatemala';
		const destination = order.delivery_lat && order.delivery_lng
			? `${order.delivery_lat},${order.delivery_lng}`
			: `${order.shipping_address}, ${order.shipping_location}, Guatemala`;

		const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
		
		window.open(url, '_blank');
	}

	function getStatusBadgeClass(status) {
		const classes = {
			pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
			processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
			shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
			delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
			cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
		};
		return classes[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
	}

	function getStatusLabel(status) {
		const labels = {
			pending: 'Pendiente',
			processing: 'Procesando',
			shipped: 'Enviado',
			delivered: 'Entregado',
			cancelled: 'Cancelado'
		};
		return labels[status] || status;
	}

	function handleFilterChange(status) {
		filterStatus = status;
		currentPage = 1;
		fetchOrders(status);
	}

	// Pagination
	$: paginatedOrders = orders.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	$: totalPages = Math.ceil(orders.length / itemsPerPage);
</script>

<svelte:head>
	<title>Órdenes - Admin Panel</title>
</svelte:head>

<div>
	<!-- Header con filtros -->
	<div class="mb-8">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
			<div>
				<h1 class="text-4xl font-black text-gray-900 dark:text-white mb-2">
					Gestión de Órdenes
				</h1>
				<p class="text-gray-600 dark:text-gray-400">
					{orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
				</p>
			</div>
		</div>

		<!-- Filtros -->
		<div class="flex flex-wrap gap-2">
			<button
				on:click={() => handleFilterChange('')}
				class="px-4 py-2 rounded-xl font-bold transition-all {filterStatus === '' ? 'bg-gradient-to-r from-primary-magenta to-primary-purple text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
			>
				Todas ({orders.length})
			</button>
			<button
				on:click={() => handleFilterChange('pending')}
				class="px-4 py-2 rounded-xl font-bold transition-all {filterStatus === 'pending' ? 'bg-gradient-to-r from-primary-magenta to-primary-purple text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
			>
				⏳ Pendientes
			</button>
			<button
				on:click={() => handleFilterChange('shipped')}
				class="px-4 py-2 rounded-xl font-bold transition-all {filterStatus === 'shipped' ? 'bg-gradient-to-r from-primary-magenta to-primary-purple text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
			>
				🚚 Enviadas
			</button>
			<button
				on:click={() => handleFilterChange('delivered')}
				class="px-4 py-2 rounded-xl font-bold transition-all {filterStatus === 'delivered' ? 'bg-gradient-to-r from-primary-magenta to-primary-purple text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
			>
				✅ Entregadas
			</button>
		</div>
	</div>

	{#if error}
		<div class="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8">
			<p class="text-red-700 dark:text-red-300 font-medium">
				⚠️ {error}
			</p>
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-magenta"></div>
		</div>
	{:else if orders.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
			<div class="text-6xl mb-4">📦</div>
			<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
				No hay órdenes
			</h3>
			<p class="text-gray-600 dark:text-gray-400">
				{filterStatus ? 'No hay órdenes con este filtro' : 'Aún no tienes órdenes'}
			</p>
		</div>
	{:else}
		<!-- Tabla de órdenes -->
		<div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 dark:bg-gray-700/50">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">ID</th>
							<th class="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Cliente</th>
							<th class="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Ubicación</th>
							<th class="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Total</th>
							<th class="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
							<th class="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Fecha</th>
							<th class="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each paginatedOrders as order}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
								<td class="px-6 py-4">
									<span class="font-mono text-sm font-bold text-gray-900 dark:text-white">
										#{order.id?.substring(0, 8) || 'N/A'}
									</span>
								</td>
								<td class="px-6 py-4">
									<div>
										<p class="font-bold text-gray-900 dark:text-white">{order.customer_name || 'N/A'}</p>
										<p class="text-sm text-gray-600 dark:text-gray-400">{order.customer_phone || 'N/A'}</p>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium text-gray-900 dark:text-white">
											{order.shipping_location || 'N/A'}
										</span>
										{#if order.delivery_lat && order.delivery_lng}
											<button
												on:click={() => openMapModal(order)}
												class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-lg transition-colors"
												title="Ver en mapa"
											>
												🗺️
											</button>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4">
									<span class="font-bold text-gray-900 dark:text-white">
										{currency(order.total || 0)}
									</span>
								</td>
								<td class="px-6 py-4">
									<span class="px-3 py-1 rounded-full text-sm font-bold {getStatusBadgeClass(order.status)}">
										{getStatusLabel(order.status)}
									</span>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm text-gray-600 dark:text-gray-400">
										{dateFormatter.format(new Date(order.created_at))}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-2">
										<!-- Botón Trazar Ruta -->
										<button
											on:click={() => openGoogleMapsRoute(order)}
											class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-bold"
											title="Trazar ruta en Google Maps"
										>
											🚗
										</button>

										<!-- Cambiar Status -->
										<select
											value={order.status}
											on:change={(e) => updateOrderStatus(order.id, e.target.value)}
											class="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:border-primary-magenta dark:hover:border-primary-magenta transition-colors"
										>
											<option value="pending">Pendiente</option>
											<option value="processing">Procesando</option>
											<option value="shipped">Enviado</option>
											<option value="delivered">Entregado</option>
											<option value="cancelled">Cancelado</option>
										</select>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-center gap-2 mt-6">
				<button
					on:click={() => (currentPage = Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
					class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
				>
					← Anterior
				</button>

				{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
					<button
						on:click={() => (currentPage = page)}
						class="px-3 py-2 rounded-lg font-bold transition-all {currentPage === page ? 'bg-gradient-to-r from-primary-magenta to-primary-purple text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
					>
						{page}
					</button>
				{/each}

				<button
					on:click={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
					class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
				>
					Siguiente →
				</button>
			</div>
		{/if}
	{/if}
</div>

<!-- Modal de Mapa -->
{#if showMapModal && selectedOrder}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
	<div 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		on:click={closeMapModal}
		on:keydown={(e) => e.key === 'Escape' && closeMapModal()}
		role="dialog"
		aria-modal="true"
		aria-label="Mapa de ubicacion de entrega"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
		<div 
			class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="document"
		>
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
						Ubicación de Entrega
					</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Orden #{selectedOrder.id?.substring(0, 8) || 'N/A'} - {selectedOrder.customer_name || 'N/A'}
					</p>
				</div>
				<button
					on:click={closeMapModal}
					class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl font-bold"
				>
					×
				</button>
			</div>

			<!-- Mapa -->
			{#if selectedOrder.delivery_lat && selectedOrder.delivery_lng}
				<div class="mb-6">
					<iframe
						title="Mapa de ubicación"
						width="100%"
						height="400"
						frameborder="0"
						style="border:0; border-radius: 12px;"
						src="https://www.google.com/maps/embed/v1/place?key={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q={selectedOrder.delivery_lat},{selectedOrder.delivery_lng}&zoom=16"
						allowfullscreen
					/>
				</div>

				<!-- Coordenadas -->
				<div class="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
					<p class="text-sm font-bold text-green-800 dark:text-green-300 mb-2">📍 Coordenadas:</p>
					<p class="font-mono text-gray-900 dark:text-white font-bold">
						{selectedOrder.delivery_lat}, {selectedOrder.delivery_lng}
					</p>
				</div>
			{:else}
				<div class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
					<p class="text-yellow-800 dark:text-yellow-300 font-bold">
						⚠️ Sin coordenadas de geolocalización
					</p>
					<p class="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
						<strong>Dirección:</strong> {selectedOrder.shipping_address || 'N/A'}, {selectedOrder.shipping_location || 'N/A'}
					</p>
				</div>
			{/if}

			<!-- Acciones -->
			<div class="flex flex-col sm:flex-row gap-4">
				<button
					on:click={() => openGoogleMapsRoute(selectedOrder)}
					class="flex-1 bg-gradient-to-r from-primary-magenta to-primary-purple text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
				>
					<span>🚗</span>
					<span>Trazar Ruta</span>
				</button>
				<button
					on:click={closeMapModal}
					class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
				>
					Cerrar
				</button>
			</div>
		</div>
	</div>
{/if}
