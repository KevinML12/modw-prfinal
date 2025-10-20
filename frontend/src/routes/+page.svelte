<script>
	import ProductCard from '$lib/components/ProductCard.svelte';

	// 1. Script (Carga de datos)
	export let data;
	let products = data.products || [];

	// 2. Lógica de Búsqueda (simplificada por ahora)
	let searchQuery = '';
	let isLoading = false;
	let searchError = null;
	let initialProducts = products; // Guardamos los productos iniciales

	async function performSearch() {
		if (searchQuery.length < 3) {
			products = initialProducts;
			searchError = null;
			return;
		}

		isLoading = true;
		searchError = null;
		try {
			const res = await fetch(
				`/api/v1/products/search?q=${encodeURIComponent(searchQuery)}`
			);
			if (!res.ok) throw new Error('Error en la búsqueda');
			const data = await res.json();
			products = data.products || [];

			if (products.length === 0) {
				searchError = 'No se encontraron productos para tu búsqueda.';
			}
		} catch (err) {
			searchError = 'No se pudo conectar al servicio de búsqueda.';
			products = [];
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Nuestra Colección - Moda Orgánica</title>
</svelte:head>

<section class="text-center my-12 md:my-16 px-4">
	<h1 class="text-5xl md:text-6xl font-bold font-headings text-neon-pink mb-4">
		Nuestra Colección
	</h1>
	<p class="text-white/60 text-lg">Diseño orgánico con estilo neón</p>
</section>

<section class="max-w-2xl mx-auto mb-12 px-4">
	<form
		on:submit|preventDefault={performSearch}
		class="flex items-center gap-3"
	>
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Buscar por descripción (ej: 'anillo de plata')..."
			class="flex-grow px-6 py-3 rounded-2xl bg-dark-gray border border-neon-pink/30 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-neon-pink transition-all duration-300"
		/>
		<button
			type="submit"
			class="p-3 rounded-2xl bg-neon-yellow text-black transition-all duration-300 hover:shadow-neon-yellow hover:scale-110 active:scale-95"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.5 5.5a7.5 7.5 0 0 0 10.5 10.5Z" />
			</svg>
		</button>
	</form>
	<div class="h-4 mt-3 text-center text-sm">
		{#if isLoading}
			<p class="text-white/60">Buscando...</p>
		{/if}
		{#if searchError}
			<p class="text-neon-coral">{searchError}</p>
		{/if}
	</div>
</section>

<section class="max-w-7xl mx-auto px-4 pb-12">
	{#if products.length > 0}
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
		>
			{#each products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-16">
			<p class="text-xl text-white/60">No hay productos para mostrar.</p>
		</div>
	{/if}
</section>