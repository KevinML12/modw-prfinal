<script>
  // dentro de la etiqueta <script>
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { brand } from '$lib/config/brand.config.js';

  /** @type {import('./$types').PageData} */
  export let data; // ¡SvelteKit automáticamente le pasa los datos desde +page.js aquí!
</script>

<svelte:head>
  <title>{brand.seo.title}</title>
  <meta name="description" content={brand.seo.description} />
</svelte:head>

<div class="container mx-auto px-4 py-12">
  <header class="text-center mb-10">
    <h1 class="font-headings text-4xl font-bold text-text">
      Nuestras Colecciones
    </h1>
    <p class="mt-2 font-body text-lg text-gray-600">
      Piezas seleccionadas con esmero, inspiradas en la belleza natural.
    </p>
  </header>
  
  {#if data.error}
    <div class="text-center font-body text-accent bg-red-100 p-4 rounded-md">
      {data.error}
    </div>
  {:else if data.products.length === 0}
    <p class="text-center font-body text-gray-500">
      Actualmente no hay productos disponibles. Vuelve pronto.
    </p>
  {:else}
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each data.products as product (product.id)}
        <ProductCard {product} />
      {/each}
    </div>
  {/if}
</div>