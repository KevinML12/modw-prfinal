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
	class="flex flex-col rounded-3xl bg-dark-gray overflow-hidden border border-neon-pink/20 transition-all duration-300 ease-out hover:shadow-neon-pink hover:border-neon-pink/60 hover:scale-105"
>
	<a
		href={`/product/${product.id}`}
		class="group"
		aria-label="Ver detalles de {product.name}"
	>
		<div
			class="relative w-full overflow-hidden bg-black aspect-square"
		>
			<img
				src={product.image_url || 'https://dummyimage.com/600x600/0A0A0A/FFF.png&text=Moda'}
				alt={product.description || product.name}
				class="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
				loading="lazy"
			/>
		</div>
	</a>

	<div class="p-8 flex-grow">
		<h3 class="text-xl font-headings font-bold text-neon-pink truncate">
			{product.name}
		</h3>
		<p class="text-sm text-white/60 mt-3 line-clamp-2">
			{product.description || 'Sin descripción disponible.'}
		</p>
	</div>

	<div
		class="flex items-center justify-between p-8 pt-0 gap-4"
		in:fade={{ duration: 150, delay: 100 }}
	>
		<span class="text-lg font-bold font-headings text-neon-yellow">
			{currency(product.price)}
		</span>

		<button
			on:click={addToCart}
			class="px-6 py-2 rounded-2xl bg-neon-pink text-black font-bold text-sm transition-all duration-300 hover:shadow-neon-pink hover:scale-110 active:scale-95"
			aria-label="Añadir {product.name} al carrito"
		>
			Añadir
		</button>
	</div>
</div>