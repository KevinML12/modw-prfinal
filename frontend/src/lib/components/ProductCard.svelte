<script>
  import { fly } from 'svelte/transition';
  import { brand } from '$lib/config/brand.config.js';
  import { cart } from '$lib/stores/cart.store.js';

  /**
   * @type {{ id: number, name: string, price: number, image_url: string, description: string }}
   */
  export let product;

  const fonts = brand.identity.fonts;
  const colors = brand.identity.colors;

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
        class="text-lg font-medium hover:underline"
        style:font-family={fonts.headings}
        style:color={colors.text}
      >
        {product.name}
      </a>
      <p class="mt-1 text-sm text-gray-500" style:font-family={fonts.body}>
        {product.description.substring(0, 50)}...
      </p>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <p
        class="text-xl font-semibold"
        style:font-family={fonts.body}
        style:color={colors.secondary}
      >
        {formatCurrency(product.price)}
      </p>

      <button
        on:click={handleAddToCart}
        class="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors"
        style:background-color={colors.primary}
        on:mouseover={(e) => (e.target.style.backgroundColor = colors.secondary)}
        on:mouseout={(e) => (e.target.style.backgroundColor = colors.primary)}
        on:focus={(e) => (e.target.style.backgroundColor = colors.secondary)}
        on:blur={(e) => (e.target.style.backgroundColor = colors.primary)}
      >
        Añadir
      </button>
    </div>
  </div>
</div>