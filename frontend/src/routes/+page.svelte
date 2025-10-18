<script context="module">
  /**
   * Esta es la función `load` de SvelteKit.
   * Se ejecuta ANTES de que el componente se renderice.
   * Es el lugar perfecto para cargar datos de una API.
   *
   * NOTA: `fetch` aquí es el `fetch` universal de SvelteKit,
   * funciona tanto en el servidor como en el cliente.
   */
  export async function load({ fetch }) {
    try {
      // 1. Llamamos a nuestra API de Go (que está en el puerto 8080)
      const res = await fetch('http://localhost:8080/api/v1/products');

      if (!res.ok) {
        // Si la API de Go falla, lanzamos un error
        throw new Error(`Error ${res.status}: No se pudo conectar a la API de productos`);
      }

      // 2. Obtenemos el JSON con los productos reales de Supabase
      const products = await res.json();

      // 3. Pasamos los productos como 'props' a la página
      return {
        props: {
          products: products || [], // Asegurarnos de pasar un array
        },
      };
    } catch (error) {
      console.error("Error cargando productos en +page.svelte:", error);
      // Si todo falla (ej. el backend está caído), mostramos la página con productos vacíos
      return {
        props: {
          products: [],
          error: error.message,
        },
      };
    }
  }
</script>

<script>
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { brand } from '$lib/config/brand.config.js';

  // Estos 'props' vienen de la función `load` de arriba
  export let products = [];
  export let error = null;

  const fonts = brand.identity.fonts;
  const colors = brand.identity.colors;
</script>

<svelte:head>
  <title>{brand.seo.title}</title>
  <meta name="description" content={brand.seo.description} />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
  <h1
    class="mb-8 text-center text-4xl font-bold tracking-tight md:text-5xl"
    style:font-family={fonts.headings}
    style:color={colors.text}
  >
    Nuestra Colección
  </h1>

  {#if error}
    <div class="rounded-lg border border-red-300 bg-red-50 p-4 text-center">
      <h3 class="font-bold text-red-800">Error al Cargar Productos</h3>
      <p class="text-red-700">{error}</p>
      <p class="mt-2 text-sm text-gray-600">
        Asegúrate de que el contenedor del backend (`phoenix_backend`) esté corriendo.
      </p>
    </div>
  {:else if products.length === 0}
    <div class="text-center text-gray-500" style:font-family={fonts.body}>
      <p class="text-xl">Aún no hay productos en la colección.</p>
      <p>Pronto agregaremos nuevas piezas únicas.</p>
    </div>
  {/if}

  <div class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each products as product (product.id)}
      <ProductCard {product} />
    {/each}
  </div>
</section>