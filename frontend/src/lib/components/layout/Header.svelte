<script>
	import { brand } from '$lib/config/brand.config.js';
	// CORRECCIÓN: Importar desde 'heroicons-svelte/outline'
	// BUENO:
    import { ShoppingBag as ShoppingBagIcon, Moon as MoonIcon } from 'svelte-hero-icons/outline';
	import { cart } from '$lib/stores/cart.store.js';
</script>

<header
	class="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 flex items-center justify-between"
>
	<a href="/" class="text-2xl font-bold font-headings text-text">
		{brand.identity.name}
	</a>

	<nav class="flex items-center gap-6">
		<a
			href="/"
			class="text-sm font-medium transition-opacity hover:opacity-70"
		>
			Tienda
		</a>

		<a
			href="/checkout"
			class="relative flex items-center transition-opacity hover:opacity-70"
			aria-label="Ver carrito"
		>
			<ShoppingBagIcon class="w-6 h-6" />
			{#if $cart.itemCount > 0}
				<span
					class="absolute top-0 right-0 flex items-center justify-center w-4 h-4 -mt-1 -mr-2 text-xs font-bold rounded-full bg-primary"
					style:color={brand.identity.colors.primary_content}
				>
					{$cart.itemCount}
				</span>
			{/if}
		</a>

		<button
			class="flex items-center transition-opacity hover:opacity-70"
			aria-label="Cambiar modo"
		>
			<MoonIcon class="w-6 h-6" />
		</button>
	</nav>
</header>