<script>
	import { onMount } from 'svelte';
	import { brand, isLocalDelivery as checkIsLocal, formatCurrency } from '$lib/config/brand.config.js';
	import { cart } from '$lib/stores/cart.store.js';
	import { getMunicipalityName, isSpecialDeliveryZone } from '$lib/data/guatemala-locations.js';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import CheckoutItem from './CheckoutItem.svelte';
	import LocationSelector from '$lib/components/LocationSelector.svelte';
	import MapLocationPicker from '$lib/components/MapLocationPicker.svelte';

	// Estado del Carrito
	let currentCart = { items: [], subtotal: 0, total: 0 };
	
	onMount(() => {
		const unsubscribe = cart.subscribe((value) => {
			currentCart = value;
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

	// Opciones de entrega
	let deliveryType = 'home_delivery';
	let selectedBranch = '';
	let deliveryNotes = '';

	// Estados de calculo
	let shippingCost = 0;
	let total = 0;
	let isLocal = false;
	let isFreeShipping = false;

	// Ubicacion del mapa (para entregas locales)
	let mapLocation = {
		lat: null,
		lng: null,
		address: '',
		formattedAddress: ''
	};

	// Sucursales Cargo Expreso
	const cargoExpresoBranches = brand.businessRules.cargoExpresoBranches;

	// Computed: nombre del municipio (para validaciones y mostrar)
	$: municipalityName = shippingLocation.municipality 
		? getMunicipalityName(shippingLocation.department, shippingLocation.municipality) 
		: '';

	// Computed: verificar si es zona especial (Huehue/Chiantla)
	$: isSpecialZone = shippingLocation.department && shippingLocation.municipality
		? isSpecialDeliveryZone(shippingLocation.department, shippingLocation.municipality)
		: false;

	// Computed: obtener sucursal de Cargo Expreso para el municipio seleccionado
	$: branchForMunicipality = (() => {
		if (!municipalityName) return null;
		
		// Map municipios a sucursales
		const municipioToBranch = {
			'guatemala': 'gt-zona10',
			'antigua guatemala': 'antigua',
			'quetzaltenango': 'xela-centro',
			'escuintla': 'escuintla',
			'coban': 'coban',
			'peten': 'peten'
		};
		
		const branchId = municipioToBranch[municipalityName.toLowerCase()] || null;
		if (!branchId) return null;
		
		return cargoExpresoBranches.find(b => b.id === branchId) || null;
	})();

	// Watcher: cuando selecciona pickup y hay sucursal para el municipio, asignarla automáticamente
	$: if (deliveryType === 'pickup_at_branch' && branchForMunicipality && !selectedBranch) {
		selectedBranch = branchForMunicipality.id;
	}

	/**
	 * Calcular costo de envio segun ubicacion
	 */
	function calculateShipping(location) {
		const { localZones, costs } = brand.businessRules.shipping;
		
		if (!location.municipality) {
			isLocal = false;
			isFreeShipping = false;
			return 0;
		}

		const munName = location.municipality.toLowerCase();
		const isLocalZone = localZones.some(zone => munName.includes(zone.toLowerCase()));
		
		isLocal = isLocalZone;
		isFreeShipping = isLocalZone;
		
		if (isLocalZone) {
			deliveryType = 'home_delivery';
			return costs.local;
		}

		return costs.national;
	}

	function recalculateTotal() {
		shippingCost = calculateShipping(shippingLocation);
		total = currentCart.subtotal + shippingCost;
	}

	$: recalculateTotal(shippingLocation);

	/**
	 * Manejar evento de ubicacion seleccionada en el mapa
	 */
	function handleLocationSelected(event) {
		mapLocation = event.detail;
		
		// Actualizar direccion si esta vacia
		if (!shippingLocation.address && mapLocation.address) {
			shippingLocation.address = mapLocation.address;
		}
		
		console.log('Ubicacion en mapa seleccionada:', mapLocation);
	}

	/**
	 * Validar formulario
	 */
	function validateForm() {
		const errors = [];
		const val = brand.businessRules.validation;

		if (!email || !email.includes('@')) {
			errors.push('Email invalido');
		}

		if (!fullName || fullName.trim().length < val.fullName.minLength) {
			errors.push('Nombre completo es requerido (minimo 3 caracteres)');
		}

		if (!phone || phone.trim().length < val.phone.minLength) {
			errors.push('Numero de telefono valido es requerido (minimo 8 digitos)');
		}

		if (!shippingLocation.department || !shippingLocation.municipality) {
			errors.push('Selecciona departamento y municipio');
		}

		if (deliveryType === 'home_delivery') {
			if (!shippingLocation.address || shippingLocation.address.trim().length < val.address.minLength) {
				errors.push('Direccion completa es requerida (minimo 10 caracteres)');
			}
		}

		if (deliveryType === 'pickup_at_branch' && !selectedBranch) {
			errors.push('Selecciona una sucursal para recoger tu pedido');
		}

		return errors;
	}

	/**
	 * Submit del formulario
	 */
	async function handleSubmit(e) {
		e.preventDefault();

		const errors = validateForm();
		if (errors.length > 0) {
			alert('Por favor corrige los siguientes errores:\n\n' + errors.join('\n'));
			return;
		}

		const orderPayload = {
			customer_email: email,
			customer_name: fullName,
			customer_phone: phone,
			shipping_address: {
				department: shippingLocation.department,
				municipality: shippingLocation.municipality,
				address: deliveryType === 'home_delivery' ? shippingLocation.address : 'N/A'
			},
			delivery_lat: mapLocation.lat || null,
			delivery_lng: mapLocation.lng || null,
			delivery_type: deliveryType,
			pickup_branch: deliveryType === 'pickup_at_branch' ? selectedBranch : null,
			delivery_notes: deliveryNotes,
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

		console.log('Enviando pedido:', orderPayload);

		try {
			const response = await fetch('/api/v1/payments/create-checkout-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(orderPayload)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Error al crear sesion de pago');
			}

			const data = await response.json();
			window.location.href = data.checkout_url;

		} catch (error) {
			console.error('Error:', error);
			alert('Error al procesar el pago: ' + error.message);
		}
	}
</script>

<svelte:head>
	<title>Checkout - Moda Organica</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
	<div class="container mx-auto max-w-6xl">
		
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
				Finalizar Compra
			</h1>
			<p class="text-gray-600 dark:text-gray-400">
				Completa tu informacion para recibir tu pedido
			</p>
		</div>

		<div class="grid lg:grid-cols-3 gap-8">
			<div class="lg:col-span-2">
				<form on:submit={handleSubmit} class="flex flex-col gap-6">
					
					<!-- SECCION 1: Datos del Cliente -->
					<section class="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
						<h2 class="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
							<div class="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded flex items-center justify-center text-white font-bold">
								1
							</div>
							Informacion de Contacto
						</h2>

						<div class="flex flex-col gap-4">
							<TextInput
								label="Email"
								type="email"
								placeholder="tu@email.com"
								bind:value={email}
								required
								data-testid="checkout-email"
							/>

							<TextInput
								label="Nombre Completo"
								type="text"
								placeholder="Maria Lopez Garcia"
								bind:value={fullName}
								required
								data-testid="checkout-name"
							/>

							<TextInput
								label="Numero de Telefono"
								type="tel"
								placeholder="7777-7777 o 3333-3333"
								bind:value={phone}
								required
								helperText="Necesitamos tu telefono para coordinar la entrega"
								data-testid="checkout-phone"
							/>
						</div>
					</section>

					<!-- SECCION 2: Ubicacion -->
					<section class="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
						<h2 class="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
							<div class="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded flex items-center justify-center text-white font-bold">
								2
							</div>
							Ubicacion de Entrega
						</h2>

						<LocationSelector bind:value={shippingLocation} />

						<!-- GOOGLE MAPS DESHABILITADO TEMPORALMENTE PARA ENTREGA
						     El mapa tiene problemas de inicialización.
						     Se reactivará después de la entrega con fix definitivo.
						{#if isSpecialZone && municipalityName}
							<div class="mt-6">
								<MapLocationPicker 
									municipality={municipalityName}
									on:locationSelected={handleLocationSelected}
								/>
							</div>
						{/if}
						-->

						{#if isFreeShipping}
							<div class="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
								<div class="flex items-start gap-3">
									<div class="text-3xl">Success</div>
									<div>
										<h3 class="font-bold text-green-800 dark:text-green-300 mb-1 text-lg">
											Envio GRATIS para ti!
										</h3>
										<p class="text-sm text-green-700 dark:text-green-400">
											Tu pedido sera entregado personalmente en Huehuetenango o Chiantla en 1-2 dias habiles sin costo adicional.
										</p>
									</div>
								</div>
							</div>
						{/if}

						{#if isSpecialZone}
							<!-- ZONA LOCAL: Huehue/Chiantla -->
							<div class="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
								<h3 class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
									Ubicacion de Entrega
								</h3>
								<p class="text-sm text-blue-800 dark:text-blue-400 mb-2">
									Tenemos una ubicacion en {municipalityName} desde donde realizamos entregas.
								</p>
								<p class="text-sm text-blue-800 dark:text-blue-400">
									Tu pedido te sera enviado a domicilio sin costo adicional en 1-2 dias habiles.
								</p>
							</div>
						{:else if !isLocal && shippingCost > 0}
							<!-- ZONA NACIONAL: Cargo Expreso -->
							<div class="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-pink-200 dark:border-pink-800">
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
									Opciones de Entrega
								</h3>

								<div class="flex flex-col gap-3">
									<label class="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer border-2 transition-all {deliveryType === 'home_delivery' ? 'border-pink-500 shadow-md' : 'border-gray-200 dark:border-gray-700'}">
										<input 
											type="radio" 
											name="deliveryType" 
											value="home_delivery"
											bind:group={deliveryType}
											class="mt-1 w-5 h-5"
										/>
										<div class="flex-1">
											<div class="font-semibold text-gray-900 dark:text-white">
												Entrega a Domicilio
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
												Recibiras tu pedido en la direccion indicada
											</div>
										</div>
									</label>

									<label class="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer border-2 transition-all {deliveryType === 'pickup_at_branch' ? 'border-pink-500 shadow-md' : 'border-gray-200 dark:border-gray-700'}">
										<input 
											type="radio" 
											name="deliveryType" 
											value="pickup_at_branch"
											bind:group={deliveryType}
											class="mt-1 w-5 h-5"
										/>
										<div class="flex-1">
											<div class="font-semibold text-gray-900 dark:text-white">
												Recoger en Sucursal
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
												Recoge en sucursal de Cargo Expreso (mismo precio)
											</div>
										</div>
									</label>
								</div>

								{#if deliveryType === 'pickup_at_branch'}
									<div class="mt-4 animate-fadeIn">
										{#if branchForMunicipality}
											<div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
												<p class="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
													Sucursal de recogida:
												</p>
												<p class="text-sm font-semibold text-green-900 dark:text-green-200">
													{branchForMunicipality.name}
												</p>
												<p class="text-xs text-green-700 dark:text-green-400 mt-1">
													Tu pedido estara disponible en 1-2 dias habiles
												</p>
											</div>
										{:else}
											<p class="text-sm text-gray-500 dark:text-gray-400">
												No hay sucursal disponible en este municipio
											</p>
										{/if}
									</div>
								{/if}
							</div>
						{/if}

						<div class="mt-6">
							<label for="notes-textarea" class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
								Notas Adicionales (Opcional)
							</label>
							<textarea
								id="notes-textarea"
								bind:value={deliveryNotes}
								placeholder="Referencias, horarios preferidos, etc."
								class="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-pink-500 focus:outline-none resize-none h-24"
							></textarea>
						</div>
					</section>

					<!-- SECCION 3: Pago -->
					<section class="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
						<h2 class="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
							<div class="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded flex items-center justify-center text-white font-bold">
								3
							</div>
							Metodo de Pago
						</h2>
						<div class="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
							<p class="text-center text-gray-900 dark:text-white">
								<span class="font-semibold">Stripe</span> - Pago seguro
							</p>
						</div>
					</section>

					<button
						type="submit"
						class="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg text-white font-bold text-lg py-4 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
					>
						Proceder al Pago - {formatCurrency(total)}
					</button>

				</form>
			</div>

			<!-- Resumen -->
			<div class="lg:col-span-1">
				<div class="sticky top-24 bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
					<h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">Tu Carrito</h3>

					{#if currentCart.items.length > 0}
						<div class="flex flex-col gap-4 mb-6 max-h-96 overflow-y-auto">
							{#each currentCart.items as item (item.id)}
								<CheckoutItem {item} />
							{/each}
						</div>

						<hr class="border-gray-200 dark:border-gray-700 my-6" />

						<div class="flex flex-col gap-3">
							<div class="flex justify-between text-gray-600 dark:text-gray-400">
								<span>Subtotal</span>
								<span class="font-semibold text-gray-900 dark:text-white">
									{formatCurrency(currentCart.subtotal)}
								</span>
							</div>
							<div class="flex justify-between text-gray-600 dark:text-gray-400">
								<span>Envio</span>
								{#if isFreeShipping}
									<span class="font-bold text-green-600 dark:text-green-400">
										GRATIS
									</span>
								{:else}
									<span class="font-semibold text-gray-900 dark:text-white">
										{formatCurrency(shippingCost)}
									</span>
								{/if}
							</div>

							<hr class="border-gray-200 dark:border-gray-700 my-4" />

							<div class="flex justify-between text-lg">
								<span class="font-bold text-gray-900 dark:text-white">Total</span>
								<span class="font-black text-pink-500 text-2xl">
									{formatCurrency(total)}
								</span>
							</div>
						</div>
					{:else}
						<div class="text-center py-12">
							<p class="text-gray-600 dark:text-gray-400 mb-4">Carrito vacio</p>
							<a href="/" class="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all">
								Ir a la Tienda
							</a>
						</div>
					{/if}
				</div>
			</div>

		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from { 
			opacity: 0; 
			transform: translateY(-10px); 
		}
		to { 
			opacity: 1; 
			transform: translateY(0); 
		}
	}
	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out;
	}
</style>