<script>
	import { brand } from '$lib/config/brand.config.js';
	import { cart } from '$lib/stores/cart.store.js';
	import { fly } from 'svelte/transition';

	export let data;
	$: product = data.product;
	$: error = data.error;

	const formatCurrency = (value) => {
        if (value == null) return '';
		return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);
	};

	function handleAddToCart() {
        if (product) {
			cart.addProduct(product);
			alert(`${product.name} añadido al carrito!`);
		}
    }
</script>

<svelte:head>
	<title>{product ? product.name : 'Error'} | {brand.identity.name}</title>
	{#if product} <meta name="description" content={product.description?.substring(0, 150)} /> {/if}
</svelte:head>

<section class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
	{#if error}
		<div class="bg-red-100 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-300 rounded-lg border p-6 text-center">
			<h2 class="font-headings text-2xl font-bold">Error</h2>
			<p class="font-body mt-2">{error}</p>
			<a href="/" class="bg-primary mt-6 inline-block rounded-md px-6 py-2 text-white hover:bg-secondary focus:bg-secondary"> Volver </a>
		</div>
	{:else if product}
		<div class="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12" in:fly={{ y: 20, duration: 300 }}>
			
			<div class="aspect-square overflow-hidden rounded-lg border border-border shadow-sm">
				<img src={product.image_url || '/images/placeholder.jpg'} alt={product.name} class="h-full w-full object-cover"/>
			</div>
			
			<div class="flex flex-col">
				<h1 class="font-headings text-text mb-3 text-3xl font-bold md:text-4xl">{product.name}</h1>
				<p class="font-body text-secondary mb-5 text-2xl font-semibold">{formatCurrency(product.price)}</p>
				<div class="font-body text-text/80 prose prose-sm dark:prose-invert mb-6 max-w-none">
					<p>{product.description}</p>
				</div>
				<p class="font-body mb-6 text-sm text-text/60">
					{#if product.stock > 0} Disponible: {product.stock} u. {:else} Agotado {/if}
				</p>
				<button
					on:click={handleAddToCart}
					class="font-headings bg-primary w-full rounded-md px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-secondary focus:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
					disabled={product.stock === 0}
				>
					{#if product.stock === 0} Agotado {:else} Añadir al Carrito {/if}
				</button>
			</div>
		</div>
	{:else}
      <p class="font-body text-text/70 text-center">Cargando producto...</p>
    {/if}
</section>