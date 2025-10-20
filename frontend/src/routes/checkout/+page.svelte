<script>
	import { onMount } from 'svelte';
	import { brand } from '$lib/config/brand.config.js';
	import { cart } from '$lib/stores/cart.store.js';

	// Importamos nuestros nuevos componentes
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import CheckoutItem from './CheckoutItem.svelte';

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
	<title>Checkout - Moda Orgánica</title>
</svelte:head>

<div class="min-h-screen bg-bg-primary">
	<!-- Breadcrumb -->
	<div class="border-b border-gray-200 bg-bg-secondary">
		<div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
			<div class="flex items-center gap-2 text-sm">
				<a href="/" class="text-primary-magenta hover:text-primary-purple transition-colors font-medium">
					Tienda
				</a>
				<span class="text-text-secondary">/</span>
				<span class="text-text-secondary">Carrito</span>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
		<!-- Título -->
		<div class="mb-12">
			<h1 class="text-4xl md:text-5xl font-black text-text-primary mb-2">
				Resumen de tu Orden
			</h1>
			<p class="text-text-secondary text-lg">
				Revisa los artículos en tu carrito y completa tu información
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Formulario -->
			<div class="lg:col-span-2">
				<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-8">
					<!-- Información de Contacto -->
					<section class="bg-bg-card rounded-2xl p-8 border-2 border-transparent hover:border-primary-magenta/30 transition-colors">
						<h2 class="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
							<div class="w-8 h-8 bg-gradient-magenta rounded-lg flex items-center justify-center text-white text-lg font-black">
								1
							</div>
							Tu Información
						</h2>
						<div class="flex flex-col gap-5">
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

					<!-- Método de Pago -->
					<section class="bg-bg-card rounded-2xl p-8 border-2 border-transparent hover:border-primary-magenta/30 transition-colors">
						<h2 class="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
							<div class="w-8 h-8 bg-gradient-magenta rounded-lg flex items-center justify-center text-white text-lg font-black">
								2
							</div>
							Método de Pago
						</h2>
						<div class="p-6 bg-bg-secondary rounded-xl border-2 border-dashed border-primary-magenta/30">
							<p class="text-text-secondary text-center">
								<span class="font-semibold text-text-primary">Stripe</span> - La integración con Stripe se añadirá en el siguiente paso
							</p>
						</div>
					</section>

					<!-- Botón de Pago -->
					<button
						type="submit"
						class="
							w-full
							bg-gradient-magenta
							hover:shadow-magenta
							text-white
							font-bold
							text-lg
							py-4 px-6
							rounded-2xl
							transition-all duration-300
							hover:scale-[1.02]
							active:scale-95
						"
					>
						Confirmar Pago - {currency(total)}
					</button>
				</form>
			</div>

			<!-- Resumen del Carrito - Sticky -->
			<div class="lg:col-span-1">
				<div class="sticky top-24 bg-bg-card rounded-2xl p-8 border-2 border-primary-magenta/20 shadow-soft">
					<h3 class="text-xl font-bold text-text-primary mb-6">
						Tu Carrito
					</h3>

					{#if currentCart.items.length > 0}
						<div class="flex flex-col gap-4 mb-6 max-h-96 overflow-y-auto">
							{#each currentCart.items as item (item.id)}
								<CheckoutItem {item} />
							{/each}
						</div>

						<hr class="border-gray-200 my-6" />

						<!-- Totales -->
						<div class="flex flex-col gap-3">
							<div class="flex justify-between items-center">
								<span class="text-text-secondary">Subtotal</span>
								<span class="font-semibold text-text-primary">
									{currency(currentCart.subtotal)}
								</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-text-secondary">Envío</span>
								<span class="font-semibold text-text-primary">
									{currency(shippingCost)}
								</span>
							</div>

							<hr class="border-gray-200 my-4" />

							<div class="flex justify-between items-center text-lg">
								<span class="font-bold text-text-primary">Total</span>
								<span class="font-black text-primary-magenta text-2xl">
									{currency(total)}
								</span>
							</div>
						</div>
					{:else}
						<div class="text-center py-12">
							<p class="text-text-secondary mb-4">
								Tu carrito está vacío
							</p>
							<a
								href="/"
								class="
									inline-block
									bg-gradient-magenta
									text-white
									font-semibold
									py-3 px-6
									rounded-xl
									transition-all duration-300
									hover:shadow-magenta
									hover:scale-105
								"
							>
								Volver a la Tienda
							</a>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>