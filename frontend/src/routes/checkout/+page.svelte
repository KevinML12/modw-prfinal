<script>
  import { brand } from '$lib/config/brand.config.js';

  // --- Simulación de un Carrito de Compras ---
  // En una aplicación real, estos datos vendrían de un store global de Svelte.
  const mockCartItems = [
    { id: 2, name: "Anillo 'Sol de Jade'", price: 680.00, quantity: 1, image_url: '/images/products/anillo-jade.jpg' },
    { id: 4, name: "Pulsera 'Bosque Encantado'", price: 250.00, quantity: 2, image_url: '/images/products/pulsera-bosque.jpg' },
  ];

  // --- Estado del Formulario y Cálculos ---
  let customerName = '';
  let customerEmail = '';
  let shippingAddress = '';
  let shippingCity = ''; // La ciudad que ingresa el usuario.
  let shippingPhone = '';

  // --- Reactividad de Svelte (`$:`) ---
  // Estas variables se recalculan AUTOMÁTICAMENTE cada vez que una de sus dependencias cambia.

  // 1. Calculamos el subtotal basado en los artículos del carrito.
  $: subtotal = mockCartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // 2. Calculamos el costo de envío. Esta es la lógica "Mahoraga" en acción.
  $: shippingCost = (() => {
    // Normalizamos la entrada del usuario para una comparación robusta (minúsculas, sin espacios).
    const normalizedCity = shippingCity.trim().toLowerCase();
    
    // Si la ciudad no ha sido ingresada, el costo es 0.
    if (!normalizedCity) {
      return 0;
    }

    // Comprobamos si la ciudad está en la lista de zonas locales de nuestra configuración.
    if (brand.businessRules.shipping.localZones.includes(normalizedCity)) {
      return brand.businessRules.shipping.costs.local;
    }
    
    // Si no es local, aplicamos el costo nacional.
    return brand.businessRules.shipping.costs.national;
  })();

  // 3. Calculamos el total final.
  $: total = subtotal + shippingCost;


  // --- Funciones Auxiliares ---
  function formatCurrency(value) {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);
  }

  function handlePlaceOrder() {
    // Lógica para enviar el pedido al backend.
    // Se implementará en el futuro.
    alert('¡Pedido realizado! (Simulación)');
  }
</script>

<svelte:head>
  <title>Finalizar Compra - {brand.identity.name}</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12">
  <h1 class="font-headings text-3xl font-bold text-center mb-8 text-text">
    Finalizar Compra
  </h1>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
    <section class="font-body">
      <h2 class="font-headings text-xl font-semibold mb-4 text-text">Información de Envío</h2>
      <form class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <input type="text" id="name" bind:value={customerName} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
          <input type="email" id="email" bind:value={customerEmail} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary">
        </div>
        <div>
          <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
          <input type="text" id="address" bind:value={shippingAddress} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary">
        </div>
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700">Municipio/Ciudad</label>
          <input type="text" id="city" bind:value={shippingCity} placeholder="Ej: Huehuetenango" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary">
        </div>
      </form>
    </section>

    <section class="bg-background p-6 rounded-md shadow-sm border">
      <h2 class="font-headings text-xl font-semibold mb-4 text-text">Resumen del Pedido</h2>
      <div class="space-y-4">
        {#each mockCartItems as item}
          <div class="flex justify-between items-center font-body">
            <span class="text-text">{item.name} x {item.quantity}</span>
            <span class="font-medium text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        {/each}
      </div>
      <hr class="my-4">
      <div class="space-y-2 font-body">
        <div class="flex justify-between">
          <span class="text-gray-600">Subtotal</span>
          <span class="font-medium text-text">{formatCurrency(subtotal)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Envío</span>
          <span class="font-medium text-text">{shippingCost > 0 ? formatCurrency(shippingCost) : 'Calculando...'}</span>
        </div>
      </div>
      <hr class="my-4">
      <div class="flex justify-between font-headings text-lg font-bold">
        <span class="text-text">Total</span>
        <span class="text-secondary">{formatCurrency(total)}</span>
      </div>
      <button 
        on:click={handlePlaceOrder}
        class="w-full mt-6 bg-accent text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors"
      >
        Realizar Pedido
      </button>
    </section>
  </div>
</div>