import adapter from '@sveltejs/adapter-static'; // <-- 1. Import the correct adapter
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    vitePreprocess(),
    sveltePreprocess({
      postcss: true,
    }),
  ],

  kit: {
    // 2. Configure the adapter to output to the 'build' directory
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // Important for single-page applications
      precompress: false,
      strict: true
    })
  }
};

export default config;