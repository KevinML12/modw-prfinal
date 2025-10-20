<script>
	import { cart } from '$lib/stores/cart.store.js';

	/** @type {import('$lib/types').CartItem} */
	export let item;

	// Formateador de moneda
	const currency = (value) =>
		new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
		}).format(value);

	function removeItem() {
		cart.removeProduct(item.id);
	}
</script>

<div class="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0">
	<div class="relative flex-shrink-0 w-20 h-20">
		<img
			src={item.image_url || 'https://dummyimage.com/100x100/FFF5F8/E91E8C.png&text=Moda'}
			alt={item.name}
			class="object-cover w-full h-full rounded-lg bg-bg-secondary border border-gray-200"
		/>
		<span
			class="
				absolute -top-2 -right-2
				flex items-center justify-center
				w-6 h-6
				text-xs font-bold rounded-full
				bg-primary-magenta text-white
			"
		>
			{item.quantity}
		</span>
	</div>

	<div class="flex-grow min-w-0">
		<h4 class="font-semibold text-text-primary truncate">
			{item.name}
		</h4>
		<p class="text-sm text-text-secondary">
			Cantidad: {item.quantity}
		</p>
	</div>

	<div class="flex flex-col items-end gap-2">
		<span class="font-bold text-primary-magenta">
			{currency(item.price * item.quantity)}
		</span>
		<button
			on:click={removeItem}
			class="
				text-xs text-text-secondary
				hover:text-primary-magenta
				transition-colors
				font-medium
			"
		>
			Eliminar
		</button>
	</div>
</div>