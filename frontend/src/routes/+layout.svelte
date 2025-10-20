<script>
  // ... (script sin cambios, importa todo lo necesario) ...
  import '../app.css';
  import { brand } from '$lib/config/brand.config.js';
  import { cart } from '$lib/stores/cart.store.js';
  import { theme } from '$lib/stores/theme.store.js';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  $: itemCount = $cart.reduce((sum, item) => sum + item.quantity, 0);

  onMount(() => {
    if (browser) {
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
      theme.set(initialTheme);
    }
  });

  function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (!hex) return '0 0 0';
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r} ${g} ${b}`;
  }

  const lightColors = brand.identity.colors.light;
  const darkColors = brand.identity.colors.dark;
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link rel="icon" href="/icons/favicon.ico" sizes="any" />
  <link rel="icon" href="/icons/favicon-16x16.png" type="image/png" sizes="16x16" />
  <link rel="icon" href="/icons/favicon-32x32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content={lightColors.primary} media="(prefers-color-scheme: light)">
  <meta name="theme-color" content={darkColors.background} media="(prefers-color-scheme: dark)">
  <style>
    :root {
      --color-primary: {hexToRgb(lightColors.primary)};
      --color-secondary: {hexToRgb(lightColors.secondary)};
      --color-background: {hexToRgb(lightColors.background)};
      --color-text: {hexToRgb(lightColors.text)};
      --color-accent: {hexToRgb(lightColors.accent)};
      --color-card: {hexToRgb(lightColors.card)};
      --color-border: {hexToRgb(lightColors.border)};
    }
    html.dark {
      --color-primary: {hexToRgb(darkColors.primary)};
      --color-secondary: {hexToRgb(darkColors.secondary)};
      --color-background: {hexToRgb(darkColors.background)};
      --color-text: {hexToRgb(darkColors.text)};
      --color-accent: {hexToRgb(darkColors.accent)};
      --color-card: {hexToRgb(darkColors.card)};
      --color-border: {hexToRgb(darkColors.border)};
      color-scheme: dark;
    }
    body {
      color: rgb(var(--color-text));
      background-color: rgb(var(--color-background));
      transition: color 0.3s ease, background-color 0.3s ease;
    }
  </style>
</svelte:head>

<div class="font-body text-text bg-background flex min-h-screen flex-col transition-colors duration-300">

  <header class="bg-background/80 dark:bg-background/90 sticky top-0 z-50 w-full border-b border-primary/20 dark:border-primary/30 backdrop-blur-sm transition-colors duration-300">
    <nav class="mx-auto flex max-w-7xl items-center justify-between p-4">
      <a
        href="/"
        class="font-headings text-text text-2xl font-bold transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
      >
        {brand.identity.name}
      </a>
      <div class="flex items-center space-x-4">
        <a
          href="/"
          class="text-text hidden text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none sm:block"
        >
          Tienda
        </a>
        <a
          href="/checkout"
          class="text-text relative flex items-center rounded-full p-1.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Ver carrito"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.121.001.241.015.358.043a5.25 5.25 0 01-4.256 5.207H3.375a.75.75 0 01-.748-.686c-.03-1.667.988-3.033 2.67-3.268m11.438-6.75H5.625m13.5 0v1.149c0 .416-.16.816-.44 1.121l-4.04 4.041a.75.75 0 01-1.06 0l-4.041-4.041A1.875 1.875 0 015.625 8.649V7.5H19.5z"
            />
          </svg>
          {#if itemCount > 0}
            <span
              class="bg-accent absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
            >
              {itemCount}
            </span>
          {/if}
        </a>
        <ThemeToggle />
      </div>
    </nav>
  </header>

  <main class="flex-grow">
    <slot />
  </main>

  <footer class="bg-card mt-16 w-full border-t border-border py-8 transition-colors duration-300">
    <div class="text-text/70 mx-auto max-w-7xl px-4 text-center">
      <p class="font-body text-sm">
        © {new Date().getFullYear()} {brand.identity.name}. Todos los derechos reservados.
      </p>
      <p class="mt-2 text-xs">
        Proyecto Fénix - Moda Orgánica
      </p>
    </div>
  </footer>

</div>
