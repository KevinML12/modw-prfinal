<script>
  import { fly } from 'svelte/transition';
  import { cart } from '$lib/stores/cart.store.js';

  export let product;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);
  };

  function handleAddToCart() {
    cart.addProduct(product);
    console.log('Producto añadido:', product.name);
  }
</script>

<div
  class="bg-card group flex flex-col overflow-hidden rounded-lg border border-border shadow-sm transition-shadow duration-300 hover:shadow-lg dark:hover:border-primary/50"
  in:fly={{ y: 20, duration: 300, delay: 50 }}
>
  <div class="relative overflow-hidden">
    <a
      href={`/product/${product.id}`}
      class="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg"
    >
      <img
        src={product.image_url || '/images/placeholder.jpg'}
        alt={product.name}
        class="h-64 w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        loading="lazy"
      />
    </a>
    {#if product.stock === 0}
      <span class="absolute top-2 left-2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        Agotado
      </span>
    {/if}
  </div>

  <div class="flex flex-1 flex-col justify-between p-4">
    <div>
      <a
        href={`/product/${product.id}`}
        class="font-headings text-text text-lg font-medium hover:text-primary focus:text-primary focus:outline-none"
      >
        {product.name}
      </a>
      <p class="font-body mt-1 text-sm text-text/70 dark:text-text/60">
        {product.description?.substring(0, 50) ?? ''}...
      </p>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <p class="font-body text-secondary text-xl font-semibold">
        {formatCurrency(product.price)}
      </p>
      <button
        on:click={handleAddToCart}
        class="bg-primary rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary focus:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-card"
        disabled={product.stock === 0}
        aria-label="Añadir al carrito"
      >
        {#if product.stock === 0} Agotado {:else} Añadir {/if}
      </button>
    </div>
  </div>
</div>
