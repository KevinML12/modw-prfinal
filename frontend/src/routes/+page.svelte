<script>
	import ProductCard from '$lib/components/ProductCard.svelte';
	// CORRECCIÓN: Importar desde 'heroicons-svelte/outline'
	// BUENO:
	import { Search as SearchIcon } from 'svelte-hero-icons/outline';

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

<section class="text-center my-12 md:my-16">
	<h1 class="text-4xl md:text-5xl font-bold font-headings">
		Nuestra Colección
	</h1>
</section>

<section class="max-w-2xl mx-auto mb-12">
	<form
		on:submit|preventDefault={performSearch}
		class="flex items-center gap-2"
	>
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Buscar por descripción (ej: 'anillo de plata')..."
			class="flex-grow p-3 rounded-lg bg-secondary border border-gray-700 text-text placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
		/>
		<button
			type="submit"
			class="p-3 rounded-lg bg-primary text-primary-content transition-transform active:scale-95 hover:brightness-90"
		>
			<SearchIcon class="w-6 h-6" />
		</button>
	</form>
	<div class="h-4 mt-2 text-center text-sm">
		{#if isLoading}
			<p class="opacity-70">Buscando...</p>
		{/if}
		{#if searchError}
			<p class="text-red-400">{searchError}</p>
		{/if}
	</div>
</section>

<section class="max-w-7xl mx-auto">
	{#if products.length > 0}
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
		>
			{#each products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	{:else}
		<div classs="text-center py-16">
			<p class="text-xl opacity-70">No hay productos para mostrar.</p>
		</div>
	{/if}
</section>