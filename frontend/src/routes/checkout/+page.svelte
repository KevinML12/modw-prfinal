<script>
	import { brand } from '$lib/config/brand.config.js';
	import { cart } from '$lib/stores/cart.store.js';
	import { goto } from '$app/navigation'; // Para redirigir

	const shippingRules = brand.businessRules.shipping;
	let clientMunicipality = '';

	$: subtotal = $cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
	$: shippingCost = (() => {
		const normalizedInput = clientMunicipality.toLowerCase().trim();
		if (shippingRules.localZones.includes(normalizedInput)) { return shippingRules.costs.local; }
		return shippingRules.costs.national;
	})();
	$: total = subtotal + shippingCost;

	const formatCurrency = (value) => {
        if (value == null) return '';
		return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);
	};

	let isSubmitting = false; // Estado para deshabilitar botón

	async function handlePayment() {
		isSubmitting = true;
		console.log('Enviando orden...');
		try {
			// Recolectar datos del formulario (mejor usar bind:value en los inputs)
			const nameInput = document.getElementById('name');
			const addressInput = document.getElementById('address');
			const phoneInput = document.getElementById('phone');

			if (!nameInput || !addressInput || !phoneInput) {
				throw new Error("Error interno del formulario.");
			}

			const shippingInfo = {
				name: nameInput.value,
				address: addressInput.value,
				municipality: clientMunicipality,
				phone: phoneInput.value
			};

			// Llamar a la API del backend (desde el navegador -> localhost)
			const response = await fetch('http://localhost:8080/api/v1/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				// Enviar items del carrito y datos de envío
				body: JSON.stringify({ items: $cart, shippingInfo: shippingInfo }),
			});

			if (!response.ok) {
				let errorMsg = 'Error al crear la orden.';
				try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch (e) {/*ignore*/}
				throw new Error(errorMsg);
			}

			const result = await response.json();
			console.log("Orden creada:", result);

			// Éxito: Limpiar carrito y redirigir (o mostrar mensaje)
			cart.clear();
			alert(`¡Pedido #${result.orderId} realizado con éxito! (Simulación completa)`);
			goto('/order-success'); // Redirige a una página de éxito (crearla si no existe)

		} catch (error) {
			console.error('Error al enviar orden:', error);
			alert(`Error al procesar el pedido: ${error.message}`);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head> <title>Finalizar Compra | {brand.identity.name}</title> </svelte:head>

<div class="bg-background flex min-h-screen justify-center p-4 md:p-8">
	<div class="w-full max-w-4xl">
		<h1 class="font-headings text-text mb-8 text-center text-4xl">Finalizar Compra</h1>

		{#if $cart.length === 0}
			<div class="font-body bg-card border-border rounded-lg border p-8 text-center shadow-sm">
				<p class="text-xl text-text/80">Tu carrito está vacío.</p>
				<a href="/" class="bg-primary mt-4 inline-block rounded-md px-6 py-2 text-white hover:bg-secondary focus:bg-secondary"> Volver </a>
			</div>
		{:else}
			<div class="font-body grid grid-cols-1 gap-8 md:grid-cols-2">
				
				<div class="bg-card border-border rounded-lg border p-6 shadow-sm">
					<h2 class="font-headings text-text mb-4 text-2xl">Resumen</h2>
					<div class="mb-4 space-y-3 border-b border-border pb-4">
						{#each $cart as item (item.id)}
							<div class="flex justify-between text-sm">
								<span class="text-text/90">{item.name} (x{item.quantity})</span>
								<span class="font-medium text-text">{formatCurrency(item.price * item.quantity)}</span>
							</div>
						{/each}
					</div>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between text-text/90"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
						<div class="flex justify-between text-text/90"><span>Envío:</span><span>{formatCurrency(shippingCost)}</span></div>
						<div class="font-headings text-text flex justify-between border-t border-border pt-2 text-lg font-bold"><span>Total:</span><span>{formatCurrency(total)}</span></div>
					</div>
				</div>
        
				<div class="bg-card border-border rounded-lg border p-6 shadow-sm">
					<h2 class="font-headings text-text mb-4 text-2xl">Envío y Pago</h2>
					<form on:submit|preventDefault={handlePayment} class="space-y-4">
						<div>
							<label for="name" class="mb-1 block text-sm font-medium text-text/80">Nombre</label>
							<input type="text" id="name" required class="border-border text-text placeholder:text-text/50 focus:border-primary focus:ring-primary block w-full rounded-md bg-white dark:bg-gray-800 shadow-sm sm:text-sm"/>
						</div>
						<div>
							<label for="address" class="mb-1 block text-sm font-medium text-text/80">Dirección</label>
							<input type="text" id="address" required class="border-border text-text placeholder:text-text/50 focus:border-primary focus:ring-primary block w-full rounded-md bg-white dark:bg-gray-800 shadow-sm sm:text-sm"/>
						</div>
						<div>
							<label for="municipality" class="mb-1 block text-sm font-medium text-text/80">Municipio</label>
							<input type="text" id="municipality" bind:value={clientMunicipality} required placeholder="Ej: Huehuetenango" class="border-border text-text placeholder:text-text/50 focus:border-primary focus:ring-primary block w-full rounded-md bg-white dark:bg-gray-800 shadow-sm sm:text-sm"/>
							<p class="mt-1 text-xs text-text/60">Costo local ({formatCurrency(shippingRules.costs.local)}) aplica para: {shippingRules.localZones.join(', ')}.</p>
						</div>
						<div>
							<label for="phone" class="mb-1 block text-sm font-medium text-text/80">Teléfono</label>
							<input type="tel" id="phone" required class="border-border text-text placeholder:text-text/50 focus:border-primary focus:ring-primary block w-full rounded-md bg-white dark:bg-gray-800 shadow-sm sm:text-sm"/>
						</div>
						<div class="border-border bg-background rounded border border-dashed p-4 text-center">
							<span class="text-text/60 text-sm">(Componente de Pago Seguro - Simulado)</span>
						</div>
						<button type="submit" disabled={isSubmitting} class="font-headings bg-primary w-full rounded-md px-4 py-3 text-lg font-semibold text-white transition-colors duration-300 hover:bg-secondary focus:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                          {#if isSubmitting} Procesando... {:else} Pagar {formatCurrency(total)} {/if}
                        </button>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>