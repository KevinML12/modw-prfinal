<script>
	/** @type {import('$lib/types').CartItem} */
	export let item;

	// Formateador de moneda
	const currency = (value) =>
		new Intl.NumberFormat('es-GT', {
			style: 'currency',
			currency: 'GTQ',
		}).format(value);
</script>

<div class="flex items-center w-full gap-4">
	<div class="relative flex-shrink-0 w-16 h-16">
		<img
			src={item.image_url || 'https://dummyimage.com/100x100/0A0A0A/FF1493.png&text=Moda'}
			alt={item.name}
			class="object-cover w-full h-full rounded-2xl bg-dark-gray border border-neon-pink/30"
		/>
		<span
			class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 -mt-2 -mr-2 text-xs font-bold rounded-full bg-neon-yellow text-black"
		>
			{item.quantity}
		</span>
	</div>

	<div class="flex-grow min-w-0">
		<h3 class="font-medium truncate font-headings text-neon-pink">{item.name}</h3>
		<p class="text-sm text-white/60">Cantidad: {item.quantity}</p>
	</div>

	<div class="flex-shrink-0 ml-auto">
		<span class="font-medium text-neon-yellow">{currency(item.price * item.quantity)}</span>
	</div>
</div>