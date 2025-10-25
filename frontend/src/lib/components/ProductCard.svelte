<script>
  import { cart } from '$lib/stores/cart.store.js';
  import { goto } from '$app/navigation';
  
  export let product;
  
  let isHovered = false;

  async function handleAddToCart(e) {
    e.stopPropagation();
    cart.addProduct(product);
    // TODO: Mostrar toast de confirmación
    console.log('Producto agregado al carrito:', product.name);
  }

  async function handleViewDetails() {
    await goto(`/product/${product.id}`);
  }
</script>

<div 
  class="
    group relative
    rounded-2xl 
    overflow-hidden
    border-2 border-transparent
    hover:border-primary-magenta/30 dark:hover:border-[#FF5CAD]/30
    transition-all duration-300
    hover:scale-[1.02]
    hover:shadow-magenta dark:hover:shadow-[0_0_20px_rgba(255,92,173,0.4)]
    cursor-pointer
    bg-bg-card dark:bg-[#1E1E2E]
  "
  style="aspect-ratio: 3/4;"
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => isHovered = false}
  on:click={handleViewDetails}
  on:keydown={(e) => e.key === 'Enter' && handleViewDetails()}
  role="button"
  tabindex="0"
>
  <!-- Imagen de fondo -->
  <div class="absolute inset-0">
    {#if product.image_url}
      <img 
        src={product.image_url} 
        alt={product.name}
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    {:else}
      <!-- Placeholder elegante si no hay imagen -->
      <div class="w-full h-full bg-soft-pink flex items-center justify-center">
        <div class="text-center">
          <span class="text-8xl opacity-20">💍</span>
          <p class="text-text-tertiary mt-4 text-sm">Imagen próximamente</p>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Overlay gradiente oscuro (visible en hover) -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  
  <!-- Contenido sobre la imagen (siempre visible con sombra) -->
  <div class="absolute bottom-0 left-0 right-0 p-5 translate-y-0 transition-all duration-400">
    <!-- Nombre del producto -->
    <h3 class="text-white font-bold text-lg mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] line-clamp-1">
      {product.name}
    </h3>
    
    <!-- Precio -->
    <p class="text-white font-bold text-2xl mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
      ${product.price.toLocaleString('es-MX')}
    </p>
    
    <!-- Línea decorativa rosa -->
    <div class="w-10 h-1 bg-primary-magenta dark:bg-[#FF5CAD] dark:shadow-[0_0_10px_rgba(255,92,173,0.3)] rounded-full mb-3 shadow-magenta transition-shadow duration-300 group-hover:dark:shadow-[0_0_15px_rgba(255,92,173,0.5)]"></div>
    
    <!-- Descripción (solo visible en hover) -->
    <p class="text-white/95 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-300 line-clamp-2 drop-shadow-lg max-h-0 group-hover:max-h-20">
      {product.description}
    </p>
  </div>
  
  <!-- Badge "NUEVO" si aplica (ejemplo) -->
  {#if product.id === '1'}
    <div class="absolute top-4 left-4">
      <span class="bg-gradient-magenta dark:bg-gradient-dark-magenta text-white text-xs font-bold px-3 py-1 rounded-full shadow-magenta dark:shadow-[0_0_20px_rgba(255,92,173,0.4)] uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:dark:shadow-[0_0_25px_rgba(255,92,173,0.6)]">
        Nuevo
      </span>
    </div>
  {/if}
  
  <!-- Botón de acción rápida (siempre visible) -->
  <div class="absolute bottom-6 left-6 right-6 z-20">
    <button 
      class="
        w-full
        bg-gradient-magenta dark:bg-gradient-dark-magenta
        hover:shadow-magenta dark:hover:shadow-[0_0_20px_rgba(255,92,173,0.5)]
        text-white
        font-bold
        py-3 px-4
        rounded-xl
        transition-all duration-300
        hover:scale-[1.05]
        active:scale-95
        flex items-center justify-center gap-2
      "
      on:click={handleAddToCart}
      aria-label="Añadir al carrito"
      title="Agregar a carrito"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <span>Agregar</span>
    </button>
  </div>
</div>