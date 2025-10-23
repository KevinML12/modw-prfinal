<script>
	import { onMount } from 'svelte';
	import { brand } from '$lib/config/brand.config.js';
	import { cart } from '$lib/stores/cart.store.js';
	import { currencyFormatter } from '$lib/stores/currency.store.js';

	// Importamos nuestros componentes
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import CheckoutItem from './CheckoutItem.svelte';
	import LocationSelector from '$lib/components/LocationSelector.svelte';

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
	let shippingLocation = {
		department: '',
		municipality: '',
		address: ''
	};

	// Referencias a componentes para validación
	let locationSelectorRef;

	// Lógica de Envío
	let shippingCost = 0;
	let total = 0;

	function calculateShipping(location) {
		const { shipping } = brand.businessRules;
		
		// Si no hay municipio, sin costo
		if (!location.municipality) {
			return 0;
		}

		// Obtener el municipio seleccionado para verificar si es local
		const munName = location.municipality;
		
		// Verificar si es zona local (Huehuetenango o Chiantla)
		if (shipping.localZones.some(zone => munName.toLowerCase().includes(zone.toLowerCase()))) {
			return shipping.costs.local;
		}

		// Resto del país
		return shipping.costs.national;
	}

	function recalculateTotal() {
		shippingCost = calculateShipping(shippingLocation);
		total = currentCart.subtotal + shippingCost;
	}

	// Re-calculamos cuando la ubicación cambia
	$: recalculateTotal(shippingLocation);

	// Formateador de moneda
	const currency = currencyFormatter.format;

	// Validación del formulario
	function validateForm() {
		const errors = [];

		// Email validation
		if (!email || !email.includes('@')) {
			errors.push('Email inválido');
		}

		// Name validation
		if (!fullName.trim()) {
			errors.push('Nombre completo requerido');
		}

		// Phone validation (básico - mínimo 7 dígitos)
		const phoneDigits = phone.replace(/\D/g, '');
		if (!phone || phoneDigits.length < 7) {
			errors.push('Teléfono inválido (mínimo 7 dígitos)');
		}

		// Location validation
		if (locationSelectorRef && !locationSelectorRef.validate()) {
			errors.push('Por favor completa la ubicación correctamente');
		}

		// Cart validation
		if (!currentCart.items || currentCart.items.length === 0) {
			errors.push('El carrito está vacío');
		}

		return errors;
	}

	// Manejador del formulario - Procesar checkout con Stripe
	async function handleSubmit(e) {
		e.preventDefault();

		// Validar formulario
		const errors = validateForm();
		if (errors.length > 0) {
			alert('Por favor corrige los siguientes errores:\n\n' + errors.join('\n'));
			return;
		}

		// Preparar payload para backend
		const orderPayload = {
			customer_email: email,
			customer_name: fullName,
			customer_phone: phone,
			shipping_address: {
				department: shippingLocation.department,
				municipality: shippingLocation.municipality,
				address: shippingLocation.address
			},
			items: currentCart.items.map(item => ({
				product_id: item.id,
				name: item.name,
				price: item.price,
				quantity: item.quantity,
				image_url: item.image_url || ''
			})),
			subtotal: currentCart.subtotal,
			shipping_cost: shippingCost,
			total: total
		};

		console.log('Creando sesión de checkout:', orderPayload);

		try {
			// Llamar al backend para crear Checkout Session
			const response = await fetch('/api/v1/payments/create-checkout-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(orderPayload)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Error al crear sesión de pago');
			}

			const data = await response.json();

			console.log('Sesión creada:', data);
			console.log('Redirigiendo a Stripe Checkout...');

			// Redirigir a Stripe Checkout
			window.location.href = data.checkout_url;

		} catch (error) {
			console.error('Error al procesar pago:', error);
			alert('Error al procesar el pago: ' + error.message + '\n\nPor favor intenta nuevamente.');
		}
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
						</div>
					</section>

					<!-- Ubicación de Envío -->
					<section class="bg-bg-card rounded-2xl p-8 border-2 border-transparent hover:border-primary-magenta/30 transition-colors">
						<h2 class="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
							<div class="w-8 h-8 bg-gradient-magenta rounded-lg flex items-center justify-center text-white text-lg font-black">
								2
							</div>
							Ubicación de Envío
						</h2>
						<LocationSelector
							bind:this={locationSelectorRef}
							bind:value={shippingLocation}
							required={true}
						/>
					</section>

					<!-- Método de Pago -->
					<section class="bg-bg-card rounded-2xl p-8 border-2 border-transparent hover:border-primary-magenta/30 transition-colors">
						<h2 class="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
							<div class="w-8 h-8 bg-gradient-magenta rounded-lg flex items-center justify-center text-white text-lg font-black">
								3
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
						Pagar Ahora
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