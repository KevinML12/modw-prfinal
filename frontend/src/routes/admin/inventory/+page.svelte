<script>
	import { onMount } from 'svelte';

	let products = [];
	let loading = true;
	let error = '';
	let searchQuery = '';
	let showDeleteConfirm = false;
	let productToDelete = null;

	const currency = new Intl.NumberFormat('es-GT', {
		style: 'currency',
		currency: 'GTQ'
	}).format;

	onMount(async () => {
		await fetchProducts();
	});

	async function fetchProducts() {
		loading = true;
		error = '';
		try {
			const response = await fetch('/api/v1/products/');
			if (!response.ok) {
				throw new Error(`Error ${response.status}`);
			}
			products = await response.json();
		} catch (err) {
			console.error('Error fetching products:', err);
			error = 'Error cargando productos: ' + err.message;
		} finally {
			loading = false;
		}
	}

	async function deleteProduct(id) {
		try {
			const token = localStorage.getItem('supabase_token');
			const response = await fetch(`/api/v1/admin/products/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				products = products.filter(p => p.id !== id);
				showDeleteConfirm = false;
				productToDelete = null;
				alert('Producto eliminado correctamente');
			} else {
				throw new Error('Error en la respuesta del servidor');
			}
		} catch (err) {
			console.error('Error deleting product:', err);
			alert('Error eliminando producto: ' + err.message);
		}
	}

	function confirmDelete(product) {
		productToDelete = product;
		showDeleteConfirm = true;
	}

	function cancelDelete() {
		showDeleteConfirm = false;
		productToDelete = null;
	}

	// Filtrar productos por búsqueda
	$: filteredProducts = products.filter(p => 
		p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Calcular estadísticas
	$: totalProducts = products.length;
	$: totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
	$: outOfStock = products.filter(p => p.stock === 0).length;
	$: lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
</script>

<svelte:head>
	<title>Inventario - Admin Panel</title>
</svelte:head>

<div>
	<!-- Header -->
	<div class="mb-8">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
			<div>
				<h1 class="text-4xl font-black text-gray-900 dark:text-white mb-2">
					Gestión de Inventario
				</h1>
				<p class="text-gray-600 dark:text-gray-400">
					{totalProducts} productos en catálogo
				</p>
			</div>

			<a
				href="/admin/inventory/new"
				class="bg-gradient-to-r from-primary-magenta to-primary-purple text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 md:w-auto w-full"
			>
				<span class="text-xl">+</span>
				<span>Nuevo Producto</span>
			</a>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
			<div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
				<p class="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Valor Total</p>
				<p class="text-2xl font-black text-gray-900 dark:text-white">
					{currency(totalValue)}
				</p>
			</div>
			<div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
				<p class="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Sin Stock</p>
				<p class="text-2xl font-black text-red-600 dark:text-red-400">
					{outOfStock}
				</p>
			</div>
			<div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
				<p class="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Stock Bajo</p>
				<p class="text-2xl font-black text-yellow-600 dark:text-yellow-400">
					{lowStock}
				</p>
			</div>
		</div>

		<!-- Search -->
		<div class="relative">
			<input
				type="text"
				placeholder="Buscar por nombre o SKU..."
				bind:value={searchQuery}
				class="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-magenta focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
			/>
			<span class="absolute right-4 top-3 text-gray-400 text-xl">🔍</span>
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
	{:else if filteredProducts.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
			<div class="text-6xl mb-4">📦</div>
			<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
				{searchQuery ? 'No se encontraron productos' : 'Sin productos'}
			</h3>
			<p class="text-gray-600 dark:text-gray-400 mb-6">
				{searchQuery ? 'Intenta con otra búsqueda' : 'Comienza agregando tu primer producto'}
			</p>
			{#if !searchQuery}
				<a
					href="/admin/inventory/new"
					class="inline-flex items-center gap-2 bg-gradient-to-r from-primary-magenta to-primary-purple text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
				>
					<span>+</span>
					<span>Crear Producto</span>
				</a>
			{/if}
		</div>
	{:else}
		<!-- Grid de Productos -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredProducts as product}
				<div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
					<!-- Imagen -->
					<div class="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
						{#if product.image_url}
							<img
								src={product.image_url}
								alt={product.name}
								class="w-full h-full object-cover"
								onerror="this.style.display='none'"
							/>
						{/if}
						{#if product.stock === 0}
							<div class="absolute inset-0 bg-black/40 flex items-center justify-center">
								<span class="text-white font-black text-2xl">AGOTADO</span>
							</div>
						{/if}
					</div>

					<!-- Contenido -->
					<div class="p-5">
						<div class="mb-3">
							<h3 class="font-bold text-gray-900 dark:text-white text-lg line-clamp-2">
								{product.name}
							</h3>
							{#if product.sku}
								<p class="text-sm text-gray-600 dark:text-gray-400 font-mono">
									SKU: {product.sku}
								</p>
							{/if}
						</div>

						<!-- Price & Stock -->
						<div class="flex items-baseline justify-between mb-4">
							<p class="text-2xl font-black text-primary-magenta">
								{currency(product.price || 0)}
							</p>
							<span class="px-3 py-1 rounded-full text-sm font-bold {product.stock > 10 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : product.stock > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}">
								{product.stock || 0} unid.
							</span>
						</div>

						{#if product.category}
							<p class="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
								📁 {product.category}
							</p>
						{/if}

						<!-- Actions -->
						<div class="flex gap-2">
							<a
								href="/admin/inventory/{product.id}/edit"
								class="flex-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
							>
								<span>✏️</span>
								<span>Editar</span>
							</a>
							<button
								on:click={() => confirmDelete(product)}
								class="flex-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
							>
								<span>🗑️</span>
								<span>Eliminar</span>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm && productToDelete}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		on:click={cancelDelete}
		on:keydown={(e) => e.key === 'Escape' && cancelDelete()}
		role="dialog"
		aria-modal="true"
		aria-label="Confirmacion de eliminacion de producto"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
		<div
			class="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="document"
		>
			<div class="mb-6 text-center">
				<div class="text-5xl mb-4">Delete</div>
				<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					Eliminar Producto?
				</h3>
				<p class="text-gray-600 dark:text-gray-400">
					Estas seguro de que deseas eliminar <strong>{productToDelete.name}</strong>? Esta accion no se puede deshacer.
				</p>
			</div>

			<div class="flex gap-4">
				<button
					on:click={() => deleteProduct(productToDelete.id)}
					class="flex-1 bg-red-600 dark:bg-red-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
				>
					Eliminar
				</button>
				<button
					on:click={cancelDelete}
					class="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold px-6 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
{/if}
