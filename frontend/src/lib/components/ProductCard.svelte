<script>
	import { cart } from '$lib/stores/cart.store.js';
	import { fade } from 'svelte/transition';
  import { brand } from '$lib/config/brand.config.js';
	/** @type {import('$lib/types').Product} */
	export let product;

	function addToCart() {
		cart.addItem(product, 1);
	}

	// Formateador de moneda
	const currency = (value) =>
		new Intl.NumberFormat('es-GT', {
			style: 'currency',
			currency: 'GTQ',
		}).format(value);
</script>

<div
	class="flex flex-col rounded-lg bg-secondary overflow-hidden border border-gray-800/50 transition-all duration-300 ease-out hover:border-gray-700"
>
	<a
		href={`/product/${product.id}`}
		class="group"
		aria-label="Ver detalles de {product.name}"
	>
		<div
			class="relative w-full overflow-hidden bg-background aspect-square"
		>
			<img
				src={product.image_url || 'https://dummyimage.com/600x600/181818/FFF.png&text=Moda'}
				alt={product.description || product.name}
				class="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
				loading="lazy"
			/>
		</div>
	</a>

	<div class="p-5 flex-grow">
		<h3 class="text-xl font-headings font-bold text-text truncate">
			{product.name}
		</h3>
		<p class="text-sm opacity-70 mt-2 line-clamp-2">
			{product.description || 'Sin descripción disponible.'}
		</p>
	</div>

	<div
		class="flex items-center justify-between p-5 pt-0"
		in:fade={{ duration: 150, delay: 100 }}
	>
		<span class="text-lg font-bold font-headings text-text">
			{currency(product.price)}
		</span>

		<button
			on:click={addToCart}
			class="text-sm font-medium transition-opacity hover:opacity-70"
			aria-label="Añadir {product.name} al carrito"
			style:color={brand.identity.colors.primary}
		>
			Añadir
		</button>
	</div>
</div>