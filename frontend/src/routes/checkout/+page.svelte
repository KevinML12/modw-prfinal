<script>
	import { onMount } from 'svelte';
	import { brand } from '$lib/config/brand.config.js';
	import { cart } from '$lib/stores/cart.store.js';

	// Importamos nuestros nuevos componentes
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import CheckoutItem from '$lib/components/checkout/CheckoutItem.svelte';

	// Estado del Carrito
	let currentCart = { items: [], subtotal: 0, total: 0, shippingCost: 0 };
	onMount(() => {
		const unsubscribe = cart.subscribe((value) => {
			currentCart = value;
			// Forzamos el recálculo total cuando el carrito cambia
			recalculateTotal();
		});
		return unsubscribe;
	});

	// Estado del Formulario
	let email = '';
	let fullName = '';
	let phone = '';
	let municipality = '';

	// Lógica de Envío
	let shippingCost = 0;
	let total = 0;

	function calculateShipping(mun) {
		const { shipping } = brand.businessRules;
		if (shipping.localZones.includes(mun)) {
			return shipping.costs.local;
		}
		// Si el campo no está vacío pero no es local, es nacional
		if (mun.length > 2) {
			return shipping.costs.national;
		}
		return 0; // Sin costo si está vacío
	}

	function recalculateTotal() {
		shippingCost = calculateShipping(municipality.toLowerCase().trim());
		total = currentCart.subtotal + shippingCost;
	}

	// Re-calculamos cuando la municipalidad cambia
	$: recalculateTotal(municipality);

	// Formateador de moneda
	const currency = (value) =>
		new Intl.NumberFormat('es-GT', {
			style: 'currency',
			currency: 'GTQ',
		}).format(value);

	// Manejador del formulario (aquí irá la lógica de pago)
	function handleSubmit() {
		console.log('Enviando pedido:');
		const orderPayload = {
			customer: { email, fullName, phone, municipality },
			items: currentCart.items,
			shippingCost,
			total,
		};
		console.log(JSON.stringify(orderPayload, null, 2));
		// TODO:
		// 1. Llamar al endpoint de 'create-payment-intent' en nuestro backend de Go
		// 2. Usar Stripe.js para confirmar el pago
		// 3. Si es exitoso, redirigir a la página de "gracias"
		alert('¡Pedido (simulado) enviado! Revisa la consola.');
	}
</script>

<svelte:head>
	<title>Checkout - {brand.identity.name}</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8">
	<h1 class="text-4xl font-headings font-bold mb-8 text-neon-pink">Checkout</h1>

	<div
		class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
	>
		<div class="lg:order-last">
			<form
				on:submit|preventDefault={handleSubmit}
				class="flex flex-col gap-6"
			>
				<section>
					<h2 class="text-xl font-headings font-semibold mb-4 text-neon-yellow">
						Tu Información
					</h2>
					<div class="flex flex-col gap-4 p-8 rounded-3xl bg-dark-gray border border-neon-pink/30">
						<TextInput
							label="Email"
							id="email"
							type="email"
							placeholder="tu@correo.com"
							bind:value={email}
							required
						/>
						<TextInput
							label="Nombre Completo"
							id="fullName"
							placeholder="Nombre Apellido"
							bind:value={fullName}
							required
						/>
						<TextInput
							label="Teléfono"
							id="phone"
							type="tel"
							placeholder="12345678"
							bind:value={phone}
							required
						/>
						<TextInput
							label="Municipalidad (para envío)"
							id="municipality"
							placeholder="ej: huehuetenango"
							bind:value={municipality}
							required
						/>
					</div>
				</section>

				<section>
					<h2 class="text-xl font-headings font-semibold mb-4 text-neon-yellow">Pago</h2>
					<div class="p-8 rounded-3xl bg-dark-gray border border-neon-pink/30">
						<p class="text-white/60">
							La integración con Stripe (tarjeta de crédito) se añadirá en
							el siguiente paso.
						</p>
						</div>
				</section>

				<div
					class="mt-4 p-6 lg:p-0 bg-dark-gray lg:bg-transparent rounded-3xl lg:rounded-none border border-neon-pink/30 lg:border-none"
				>
					<button
						type="submit"
						class="w-full p-4 rounded-2xl text-lg font-bold transition-all duration-300 bg-neon-pink text-black hover:shadow-neon-pink hover:scale-105 active:scale-95"
					>
						Pagar {currency(total)}
					</button>
				</div>
			</form>
		</div>

		<div class="lg:order-first">
			<h2 class="text-xl font-headings font-semibold mb-4 text-neon-yellow">
				Resumen de tu Orden
			</h2>

			<div class="p-8 rounded-3xl bg-dark-gray border border-neon-pink/30">
				<div class="flex flex-col gap-5 mb-6">
					{#if currentCart.items.length > 0}
						{#each currentCart.items as item (item.id)}
							<CheckoutItem {item} />
						{/each}
					{:else}
						<p class="text-white/60">Tu carrito está vacío.</p>
						<a
							href="/"
							class="text-neon-pink font-medium hover:text-neon-yellow transition-colors"
						>Volver a la tienda</a
						>
					{/if}
				</div>

				<hr class="border-neon-pink/20 my-6" />

				<div class="flex flex-col gap-3">
					<div class="flex justify-between text-white/70">
						<span>Subtotal</span>
						<span class="font-medium">{currency(currentCart.subtotal)}</span>
					</div>
					<div class="flex justify-between text-white/70">
						<span>Envío</span>
						<span class="font-medium">{currency(shippingCost)}</span>
					</div>

					<hr class="border-neon-pink/20 my-4" />

					<div class="flex justify-between text-xl font-bold font-headings text-neon-yellow">
						<span>Total</span>
						<span>{currency(total)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>