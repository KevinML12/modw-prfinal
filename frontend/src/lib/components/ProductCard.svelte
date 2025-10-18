<script>
  import { fly } from 'svelte/transition';
  import { brand } from '$lib/config/brand.config.js';
  import { cart } from '$lib/stores/cart.store.js';

  /**
   * @type {{ id: number, name: string, price: number, image_url: string, description: string }}
   */
  export let product;

  // 👇 Ya no necesitamos 'colors' ni 'fonts' aquí

  // Formateador de moneda (Quetzales)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(value);
  };

  function handleAddToCart() {
    cart.addProduct(product);
    console.log('Producto añadido:', product.name);
  }
</script>

<div
  class="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
  in:fly={{ y: 20, duration: 300, delay: 50 }}
>
  <div class="relative overflow-hidden">
    <a href={`/product/${product.id}`}>
      <img
        src={product.image_url || '/images/placeholder.jpg'}
        alt={product.name}
        class="h-64 w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        loading="lazy"
      />
    </a>
  </div>

  <div class="flex flex-1 flex-col justify-between p-4">
    <div>
      <a
        href={`/product/${product.id}`}
        class="font-headings text-text text-lg font-medium hover:underline"
      >
        {product.name}
      </a>
      <p class="font-body mt-1 text-sm text-gray-500">
        {product.description.substring(0, 50)}...
      </p>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <p class="font-body text-secondary text-xl font-semibold">
        {formatCurrency(product.price)}
      </p>

      <button
        on:click={handleAddToCart}
        class="bg-primary rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary focus:bg-secondary"
      >
        Añadir
      </button>
    </div>
  </div>
</div>