<script>
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let products = [];
  let isLoading = true;
  let error = null;
  let searchQuery = '';
  let selectedCategory = 'all';

  // Cargar productos del backend Go (a través del proxy de Vite)
  onMount(async () => {
    try {
      const response = await fetch('/api/v1/products/');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      products = await response.json();
      isLoading = false;
    } catch (err) {
      console.error('Error cargando productos:', err);
      error = 'No se pudieron cargar los productos. Intenta más tarde.';
      isLoading = false;
    }
  });

  // Filtrar productos por búsqueda
  $: filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll a la sección de productos
  async function scrollToProducts() {
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<svelte:head>
  <title>Moda Orgánica - Joyería Artesanal</title>
</svelte:head>

<!-- Hero Section -->
<section class="relative h-[600px] overflow-hidden">
  <div class="absolute inset-0">
    <img 
      src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop" 
      alt="Joyería artesanal"
      class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent dark:from-[#0A0A0F]/80 dark:via-[#0A0A0F]/60 dark:to-transparent"></div>
  </div>
  
  <div class="relative container mx-auto px-6 h-full flex items-center">
    <div class="max-w-2xl">
      <!-- Badge -->
      <div class="inline-block mb-6">
        <span class="bg-gradient-magenta dark:bg-gradient-dark-magenta text-white text-sm font-bold px-6 py-2 rounded-full shadow-magenta dark:shadow-[0_0_20px_rgba(255,92,173,0.4)] uppercase tracking-wider transition-all duration-300 hover:scale-105 inline-block">
          Colección 2025
        </span>
      </div>
      
      <!-- Subtítulo -->
      <p class="text-white/90 text-lg mb-4 font-medium">
        Lujo Silencioso
      </p>
      
      <!-- Título principal -->
      <h2 class="text-white text-5xl md:text-6xl font-black mb-6 leading-tight">
        Joyería artesanal que celebra la elegancia atemporal
      </h2>
      
      <!-- Descripción -->
      <p class="text-white/90 text-lg mb-8 leading-relaxed max-w-xl">
        Cada pieza es una obra de arte única, creada con materiales nobles y sostenibles.
      </p>
      
      <!-- CTA -->
      <button 
        on:click={scrollToProducts}
        class="bg-gradient-to-r from-[#E91E8C] to-[#B026FF] dark:from-[#FF5CAD] dark:to-[#A161FF] text-white font-bold px-8 py-4 rounded-full hover:shadow-[0_10px_30px_rgba(233,30,140,0.3)] dark:hover:shadow-[0_0_25px_rgba(255,92,173,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2"
      >
        Explorar Colección
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="container mx-auto px-6 py-20 transition-colors duration-300">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Feature 1 -->
    <div class="bg-pale-pink dark:bg-dark-bg-card rounded-2xl p-8 hover:bg-rose-light dark:hover:bg-dark-bg-card-hover transition-all duration-300 hover:scale-[1.02] hover:shadow-soft dark:hover:shadow-[0_0_15px_rgba(255,92,173,0.3)]">
      <div class="w-14 h-14 bg-gradient-magenta dark:bg-gradient-dark-magenta rounded-xl flex items-center justify-center mb-4 shadow-magenta dark:shadow-dark-magenta transition-all duration-300 group-hover:scale-110">
        <span class="text-2xl">✨</span>
      </div>
      <h3 class="font-bold text-text-primary dark:text-dark-text-primary text-lg mb-2">Diseño Único</h3>
      <p class="text-primary-magenta dark:text-dark-magenta text-sm leading-relaxed">
        Cada pieza es creada individualmente por artesanos expertos, garantizando que tu joya sea verdaderamente única y exclusiva.
      </p>
    </div>
    
    <!-- Feature 2 -->
    <div class="bg-pale-pink dark:bg-dark-bg-card rounded-2xl p-8 hover:bg-rose-light dark:hover:bg-dark-bg-card-hover transition-all duration-300 hover:scale-[1.02] hover:shadow-soft dark:hover:shadow-[0_0_15px_rgba(255,92,173,0.3)]">
      <div class="w-14 h-14 bg-primary-purple/20 dark:bg-dark-purple/20 rounded-xl flex items-center justify-center mb-4">
        <span class="text-2xl">🍃</span>
      </div>
      <h3 class="font-bold text-text-primary dark:text-dark-text-primary text-lg mb-2">Materiales Sostenibles</h3>
      <p class="text-primary-magenta dark:text-dark-magenta text-sm leading-relaxed">
        Utilizamos oro y plata reciclados, certificados por FairTrade. Lujo consciente comprometido con el planeta.
      </p>
    </div>
    
    <!-- Feature 3 -->
    <div class="bg-pale-pink dark:bg-[#1E1E2E] rounded-2xl p-8 hover:bg-rose-light dark:hover:bg-[#252538] transition-all duration-300 hover:scale-[1.02] hover:shadow-soft dark:hover:shadow-[0_0_15px_rgba(255,92,173,0.3)]">
      <div class="w-14 h-14 bg-yellow-badge/30 dark:bg-[#FCD34D]/20 rounded-xl flex items-center justify-center mb-4">
        <span class="text-2xl">🛡️</span>
      </div>
      <h3 class="font-bold text-text-primary dark:text-dark-text-primary text-lg mb-2">Calidad Garantizada</h3>
      <p class="text-primary-magenta dark:text-dark-magenta text-sm leading-relaxed">
        Certificado de autenticidad incluido con cada pieza. Garantía de por vida en manufactura.
      </p>
    </div>
    
    <!-- Feature 4 -->
    <div class="bg-pale-pink dark:bg-[#1E1E2E] rounded-2xl p-8 hover:bg-rose-light dark:hover:bg-[#252538] transition-all duration-300 hover:scale-[1.02] hover:shadow-soft dark:hover:shadow-[0_0_15px_rgba(255,92,173,0.3)]">
      <div class="w-14 h-14 bg-soft-pink/40 dark:bg-[#FF5CAD]/20 rounded-xl flex items-center justify-center mb-4">
        <span class="text-2xl">💕</span>
      </div>
      <h3 class="font-bold text-text-primary dark:text-dark-text-primary text-lg mb-2">Hecho con Amor</h3>
      <p class="text-primary-magenta dark:text-dark-magenta text-sm leading-relaxed">
        Artesanos dedicados invierten horas perfeccionando cada detalle con pasión y cuidado.
      </p>
    </div>
  </div>
</section>

<!-- Search Section -->
<section class="container mx-auto px-6 py-12">
  <div class="text-center mb-12">
    <h2 class="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-magenta via-primary-purple to-primary-magenta dark:from-[#FF5CAD] dark:via-[#A161FF] dark:to-[#FF5CAD] bg-clip-text text-transparent mb-4">
      Nuestra Colección
    </h2>
    <p class="text-text-secondary dark:text-dark-text-secondary text-lg">
      Diseño orgánico con estilo contemporáneo
    </p>
  </div>
  
  <!-- Search Bar -->
  <div class="max-w-3xl mx-auto flex gap-4 mb-12">
    <input 
      type="text"
      placeholder="Buscar por descripción..."
      bind:value={searchQuery}
      class="
        flex-1
        bg-white dark:bg-dark-bg-card
        border-2 
        border-gray-200 dark:border-dark-border
        focus:border-primary-magenta dark:focus:border-dark-magenta
        rounded-full 
        px-8 
        py-4 
        text-text-primary dark:text-dark-text-primary
        placeholder-text-tertiary dark:placeholder-dark-text-tertiary
        outline-none
        transition-all
        duration-300
        shadow-soft dark:shadow-dark-soft
        focus:shadow-magenta dark:focus:shadow-dark-magenta
      "
    />
    <button 
      type="submit"
      aria-label="Botón de búsqueda"
      class="
        bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-[#FF5CAD] dark:to-[#A161FF]
        hover:shadow-[0_10px_30px_rgba(233,30,140,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,92,173,0.5)]
        text-white 
        font-bold 
        px-10 
        py-4 
        rounded-full
        transition-all
        duration-300
        hover:scale-[1.05]
        active:scale-95
      "
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  </div>
  
  <!-- Products Count -->
  <div class="mb-8">
    {#if isLoading}
      <p class="text-primary-magenta dark:text-dark-magenta font-bold text-lg animate-pulse">
        Cargando productos...
      </p>
    {:else if error}
      <p class="text-red-500 font-bold text-lg">
        {error}
      </p>
    {:else}
      <p class="text-primary-magenta dark:text-dark-magenta font-bold text-lg">
        {filteredProducts.length} productos encontrados
      </p>
    {/if}
  </div>
</section>

<!-- Products Grid -->
<section id="products-section" class="container mx-auto px-6 pb-20">
  {#if isLoading}
    <div class="flex items-center justify-center min-h-96">
      <div class="text-center">
        <div class="inline-flex animate-spin rounded-full h-12 w-12 border-b-2 border-primary-magenta dark:border-dark-magenta"></div>
        <p class="text-text-secondary dark:text-dark-text-secondary mt-4">Cargando productos...</p>
      </div>
    </div>
  {:else if error}
    <div class="flex items-center justify-center min-h-96">
      <div class="text-center">
        <p class="text-red-500 text-lg font-bold mb-4">{error}</p>
    <button 
      class="bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-[#FF5CAD] dark:to-[#A161FF] text-white font-bold px-6 py-2 rounded-full hover:shadow-[0_10px_30px_rgba(233,30,140,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,92,173,0.5)] transition-all duration-300 hover:scale-[1.05] active:scale-95"
      on:click={() => location.reload()}
    >
          Reintentar
        </button>
      </div>
    </div>
  {:else if filteredProducts.length === 0}
    <div class="flex items-center justify-center min-h-96">
      <div class="text-center">
        <p class="text-text-secondary dark:text-dark-text-secondary text-lg">No se encontraron productos.</p>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each filteredProducts as product (product.id)}
        <ProductCard {product} />
      {/each}
    </div>
  {/if}
  
  <!-- Load More (opcional) -->
  {#if !isLoading && filteredProducts.length > 0}
    <div class="text-center mt-12">
    <button class="border-2 border-primary-magenta dark:border-dark-magenta text-primary-magenta dark:text-dark-magenta hover:bg-primary-magenta dark:hover:bg-[#FF5CAD] hover:text-white dark:hover:text-white font-bold px-8 py-3 rounded-full transition-all duration-300 hover:scale-[1.05] active:scale-95">
        Cargar más productos
      </button>
    </div>
  {/if}
</section>

<!-- CTA Section -->
<section class="bg-gradient-to-br from-[#FFE8F0] to-[#FFF5F8] dark:from-[#1E1E2E] dark:to-[#252538] py-20">
  <div class="container mx-auto px-6 text-center">
    <h2 class="text-4xl font-black text-text-primary dark:text-dark-text-primary mb-4">
      ¿Lista para encontrar tu joya perfecta?
    </h2>
    <p class="text-text-secondary dark:text-dark-text-secondary text-lg mb-8 max-w-2xl mx-auto">
      Explora nuestra colección completa y descubre piezas únicas que cuentan tu historia.
    </p>
    <button class="bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-[#FF5CAD] dark:to-[#A161FF] text-white font-bold px-10 py-4 rounded-full hover:shadow-[0_10px_30px_rgba(233,30,140,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,92,173,0.5)] transition-all duration-300 hover:scale-[1.05] active:scale-95 inline-flex items-center gap-2">
      Ver todas las colecciones
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>
  </div>
</section>