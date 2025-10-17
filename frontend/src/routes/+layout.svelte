<script>
  // Importamos el objeto de configuración central de la marca.
  import { brand } from '$lib/config/brand.config.js';

  // Importamos la hoja de estilos global. Aquí es donde se inicializa Tailwind CSS.
  // (Este archivo se crearía en la raíz de /src y contendría las directivas de Tailwind).
  import '../app.css';
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link 
    href="https://fonts.googleapis.com/css2?family={brand.identity.fonts.headings.replace(' ', '+')}:wght@400;700&family={brand.identity.fonts.body.replace(' ', '+')}:wght@400;700&display=swap" 
    rel="stylesheet"
  >
</svelte:head>

<div class="min-h-screen flex flex-col font-body">
  <header class="shadow-md bg-background/95 sticky top-0 backdrop-blur-sm z-10">
    <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
      <a href="/" class="font-headings text-2xl font-bold" style="color: {brand.identity.colors.primary};">
        {brand.identity.name}
      </a>
      <div class="font-body space-x-6 text-text">
        <a href="/" class="hover:text-primary transition-colors">Inicio</a>
        <a href="/about" class="hover:text-primary transition-colors">Nosotros</a>
        <a href="/cart" class="hover:text-primary transition-colors">Carrito</a>
      </div>
    </nav>
  </header>
  
  <main class="flex-grow">
    <slot />
  </main>

  <footer class="bg-text text-background font-body mt-16 py-8">
    <div class="container mx-auto text-center px-4">
      <p>&copy; {new Date().getFullYear()} {brand.identity.name}. Todos los derechos reservados.</p>
      <p class="text-sm mt-2 opacity-70">Desarrollado por Proyecto Fénix</p>
    </div>
  </footer>
</div>
