<script>
  import { brand } from '$lib/config/brand.config.js';
  import { cart } from '$lib/stores/cart.store.js';

  // Solo necesitamos las reglas de negocio, los estilos ya están en Tailwind
  const shippingRules = brand.businessRules.shipping;

  let clientMunicipality = '';

  $: subtotal = $cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  $: shippingCost = (() => {
    const normalizedInput = clientMunicipality.toLowerCase().trim();
    if (shippingRules.localZones.includes(normalizedInput)) {
      return shippingRules.costs.local;
    }
    return shippingRules.costs.national;
  })();

  $: total = subtotal + shippingCost;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(value);
  };

  function handlePayment() {
    console.log('Orden a procesar:', {
      items: $cart,
      shipping: {
        municipality: clientMunicipality,
        cost: shippingCost,
      },
      total: total,
    });
    alert('¡Procesando pago! (simulación)');
  }
</script>

<svelte:head>
  <title>Finalizar Compra | {brand.identity.name}</title>
</svelte:head>

<div class="bg-background flex min-h-screen justify-center p-4 md:p-8">
  <div class="w-full max-w-4xl">
    <h1 class="font-headings text-text mb-8 text-center text-4xl">
      Finalizar Compra
    </h1>

    {#if $cart.length === 0}
      <div
        class="font-body rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm"
      >
        <p class="text-xl text-gray-700">Tu carrito está vacío.</p>
        <a
          href="/"
          class="bg-primary mt-4 inline-block rounded-md px-6 py-2 text-white hover:bg-secondary focus:bg-secondary"
        >
          Volver a la tienda
        </a>
      </div>
    {:else}
      <div class="font-body grid grid-cols-1 gap-8 md:grid-cols-2">
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="font-headings mb-4 text-2xl">Resumen de tu Orden</h2>

          <div class="mb-4 space-y-3 border-b pb-4">
            {#each $cart as item (item.id)}
              <div class="flex justify-between">
                <span>
                  {item.name} (x{item.quantity})
                </span>
                <span class="font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            {/each}
          </div>

          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div class="flex justify-between">
              <span>Envío ({shippingRules.nationalProvider}):</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
            <div
              class="font-headings text-text flex justify-between border-t pt-2 text-xl font-bold"
            >
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="font-headings mb-4 text-2xl">Información de Envío</h2>

          <form on:submit|preventDefault={handlePayment} class="space-y-4">
            <div>
              <label for="name" class="mb-1 block text-sm font-medium"
                >Nombre Completo</label
              >
              <input
                type="text"
                id="name"
                class="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label for="address" class="mb-1 block text-sm font-medium"
                >Dirección Completa</label
              >
              <input
                type="text"
                id="address"
                class="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label for="municipality" class="mb-1 block text-sm font-medium"
                >Municipio</label
              >
              <input
                type="text"
                id="municipality"
                class="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: Huehuetenango"
                bind:value={clientMunicipality}
                required
              />
              <p class="mt-1 text-xs text-gray-500">
                Costo local ({formatCurrency(shippingRules.costs.local)}) aplica
                para:
                {shippingRules.localZones.join(', ')}.
              </p>
            </div>
            <div>
              <label for="phone" class="mb-1 block text-sm font-medium"
                >Teléfono</label
              >
              <input
                type="tel"
                id="phone"
                class="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div
              class="rounded border border-dashed border-gray-400 bg-gray-50 p-4 text-center"
            >
              <span class="text-gray-600">
                (Aquí iría el Componente de Pago Seguro)
              </span>
            </div>
            <button
              type="submit"
              class="font-headings bg-primary w-full rounded-md px-4 py-3 text-lg font-semibold text-white transition-colors duration-300 hover:bg-secondary focus:bg-secondary"
            >
              Pagar {formatCurrency(total)}
            </button>
          </form>
        </div>
      </div>
    {/if}
  </div>
</div>