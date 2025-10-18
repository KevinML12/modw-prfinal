<script>
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { brand } from '$lib/config/brand.config.js';

	export let data;
	$: products = data.products || [];
	$: initialError = data.error || null;

	// Estado para búsqueda
	let searchQuery = '';
	let searchResults = [];
	let isLoading = false;
	let searchError = null;
	let isSearching = false;

	async function performSearch() {
		if (!searchQuery.trim()) {
			isSearching = false;
			searchResults = [];
			searchError = null;
			return;
		}
		isLoading = true;
		isSearching = true;
		searchError = null;
		searchResults = [];

		try {
			const response = await fetch('http://localhost:8080/api/v1/products/search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query: searchQuery }),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Error ${response.status}`);
			}
			searchResults = await response.json();
		} catch (err) {
			console.error('Error en búsqueda semántica:', err);
			searchError = err.message || 'Ocurrió un error al buscar.';
		} finally {
			isLoading = false;
		}
	}

	// Determina qué productos mostrar
	$: productsToShow = isSearching ? searchResults : products;
</script>

<svelte:head>
	<title>{brand.seo.title}</title>
	<meta name="description" content={brand.seo.description} />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
	<h1 class="font-headings text-text mb-8 text-center text-4xl font-bold tracking-tight md:text-5xl">
		Nuestra Colección
	</h1>

	<!-- Campo de búsqueda -->
	<div class="mb-10 max-w-xl mx-auto">
		<form on:submit|preventDefault={performSearch} class="flex gap-2">
			<input
				type="search"
				bind:value={searchQuery}
				placeholder="Buscar por descripción..."
				class="font-body border-border text-text placeholder:text-text/50 focus:border-primary focus:ring-primary flex-grow rounded-md bg-card shadow-sm"
			/>
			<button
				type="submit"
				class="font-headings bg-primary rounded-md px-5 py-2 text-white transition-colors hover:bg-secondary focus:bg-secondary disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background"
				disabled={isLoading}
			>
				{#if isLoading} Buscando... {:else} Buscar {/if}
			</button>
		</form>

		{#if !isSearching && !searchQuery}
			<p class="text-center text-sm text-text/60 mt-2">
				O prueba nuestra búsqueda por descripción.
			</p>
		{/if}
	</div>

	<!-- Manejo de errores o estados -->
	{#if initialError && !isSearching}
		<div class="bg-red-100 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-300 rounded-lg border p-4 text-center">
			Error: {initialError}
		</div>
	{:else if isSearching}
		{#if isLoading}
			<p class="font-body text-text/70 text-center">Buscando...</p>
		{:else if searchError}
			<div class="bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 text-yellow-800 dark:text-yellow-300 rounded-lg border p-4 text-center">
				Error: {searchError}
			</div>
		{:else if searchResults.length === 0}
			<p class="font-body text-text/70 text-center">
				No hay resultados para "{searchQuery}".
			</p>
		{:else}
			<p class="font-body text-text/70 mb-6 text-center">
				Resultados para "{searchQuery}":
			</p>
		{/if}
	{/if}

	<!-- Cuadrícula de productos -->
	{#if !isLoading && productsToShow.length > 0}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each productsToShow as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	{:else if !isLoading && !isSearching && products.length === 0 && !initialError}
		<p class="font-body text-text/70 text-center text-xl">Colección vacía.</p>
	{/if}
</section>
