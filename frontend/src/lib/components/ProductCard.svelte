<script>
  // Importamos las transiciones de Svelte para animaciones elegantes.
  import { fly } from 'svelte/transition';

  /**
   * Prop: 'product'.
   * El componente espera recibir un objeto de producto con esta estructura.
   * Usamos JSDoc para definir el tipo y tener un mejor autocompletado en el editor.
   * @type {{id: number, name: string, price: number, image_url: string}}
   */
  export let product;

  // Variable para controlar la visibilidad de los detalles en el hover.
  let isHovering = false;

  // Función para formatear el precio a moneda local (Quetzales).
  // Ej: 450 -> Q450.00
  function formatCurrency(value) {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(value);
  }
</script>

<a 
  href="/product/{product.id}" 
  class="group relative block overflow-hidden rounded-md shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-xl"
  on:mouseenter={() => isHovering = true}
  on:mouseleave={() => isHovering = false}
>
  <div class="aspect-square w-full overflow-hidden">
    <img
      src={product.image_url}
      alt={product.name}
      class="h-full w-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
    />
  </div>

  {#if isHovering}
    <div 
      class="absolute bottom-0 left-0 w-full bg-background/80 p-4 text-center backdrop-blur-sm"
      transition:fly={{ y: 20, duration: 300 }}
    >
      <h3 class="font-headings text-lg font-medium text-text">
        {product.name}
      </h3>
      <p class="mt-1 font-body text-base text-secondary">
        {formatCurrency(product.price)}
      </p>
    </div>
  {/if}
</a>

<style>
  /* Importamos las fuentes definidas en brand.config.js a través de Tailwind CSS.
    Esta configuración se hará en app.css o en el layout principal.
    Por ahora, el componente se basa en que las clases `font-headings` y `font-body`
    están disponibles globalmente.
  */
</style>