<script>
  import '../app.css';
  import { brand } from '$lib/config/brand.config.js';
  import { cart } from '$lib/stores/cart.store.js';

  // 👇 Ya no necesitamos 'colors' ni 'fonts' aquí

  $: itemCount = $cart.reduce((sum, item) => sum + item.quantity, 0);
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="font-body text-text bg-background flex min-h-screen flex-col">
  <header
    class="bg-background sticky top-0 z-50 w-full border-b border-gray-200/50 shadow-sm"
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between p-4">
      <a
        href="/"
        class="font-headings text-text text-2xl font-bold transition-opacity hover:opacity-80"
      >
        {brand.identity.name}
      </a>

      <div class="flex items-center space-x-6">
        <a
          href="/"
          class="text-text text-sm font-medium transition-colors hover:text-primary focus:text-primary"
        >
          Tienda
        </a>
        <a
          href="/checkout"
          class="text-text relative flex items-center rounded-full p-2 transition-colors hover:bg-primary/20 focus:bg-primary/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.121.001.241.015.358.043a5.25 5.25 0 01-4.256 5.207H3.375a.75.75 0 01-.748-.686c-.03-1.667.988-3.033 2.67-3.268m11.438-6.75H5.625m13.5 0v1.149c0 .416-.16.816-.44 1.121l-4.04 4.041a.75.75 0 01-1.06 0l-4.041-4.041A1.875 1.875 0 015.625 8.649V7.5H19.5z"
            />
          </svg>

          {#if itemCount > 0}
            <span
              class="bg-secondary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
            >
              {itemCount}
            </span>
          {/if}
        </a>
      </div>
    </nav>
  </header>

  <main class="flex-grow">
    <slot />
  </main>

  <footer class="bg-text/5 mt-16 w-full py-8">
    <div class="text-text/60 mx-auto max-w-7xl px-4 text-center">
      <p class="font-body text-sm">
        © {new Date().getFullYear()} {brand.identity.name}. Todos los derechos
        reservados.
      </p>
      <p class="mt-2 text-xs">
        Construido con SvelteKit, Go y Supabase para el Proyecto Fénix.
      </p>
    </div>
  </footer>
</div>