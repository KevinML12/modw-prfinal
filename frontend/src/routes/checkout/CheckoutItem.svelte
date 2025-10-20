<script>
	/** @type {import('$lib/types').CartItem} */
	export let item;
    import { brand } from '$lib/config/brand.config.js';

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
			src={item.image_url || 'https://dummyimage.com/100x100/2A2A2A/FDFBF8.png&text=Moda'}
			alt={item.name}
			class="object-cover w-full h-full rounded-md bg-secondary"
		/>
		<span
			class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 -mt-2 -mr-2 text-xs font-bold rounded-full bg-primary"
			style:color={brand.identity.colors.primary_content}
		>
			{item.quantity}
		</span>
	</div>

	<div class="flex-grow min-w-0">
		<h3 class="font-medium truncate font-headings text-text">{item.name}</h3>
		<p class="text-sm opacity-70">Cantidad: {item.quantity}</p>
	</div>

	<div class="flex-shrink-0 ml-auto">
		<span class="font-medium text-text">{currency(item.price * item.quantity)}</span>
	</div>
</div>