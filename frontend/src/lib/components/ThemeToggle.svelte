<script>
  import { theme, toggleTheme } from '$lib/stores/theme.store.js';

  // Iconos SVG simples para Sol y Luna
  const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12H.75m.386-6.364l1.591 1.591M12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" /></svg>`;
  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>`;
</script>

<button
  on:click={toggleTheme}
  class="p-2 rounded-full text-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
  aria-label="Cambiar tema"
>
  {#if $theme === 'light'}
    {@html moonIcon}
  {:else}
    {@html sunIcon}
  {/if}
</button>