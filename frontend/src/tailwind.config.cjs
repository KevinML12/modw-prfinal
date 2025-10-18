// frontend/tailwind.config.cjs

const { brand } = require('./src/lib/config/brand.config.js');

/** @type {import('tailwindcss').Config} */
const config = {
  // Archivos a los que Tailwind debe prestar atención para buscar clases.
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    // Aquí extendemos el tema por defecto de Tailwind.
    extend: {
      // Definimos nuestra paleta de colores personalizada.
      // Ahora podemos usar clases como `bg-primary`, `text-accent`, etc.
      colors: {
        primary: brand.identity.colors.primary,
        secondary: brand.identity.colors.secondary,
        background: brand.identity.colors.background,
        text: brand.identity.colors.text,
        accent: brand.identity.colors.accent,
      },
      // Definimos nuestras familias de fuentes personalizadas.
      // Ahora podemos usar `font-headings` y `font-body`.
      fontFamily: {
        headings: [brand.identity.fonts.headings, 'serif'],
        body: [brand.identity.fonts.body, 'sans-serif'],
      },
    },
  },

  plugins: [
    // Plugin oficial de Tailwind para estilizar formularios con clases.
    require('@tailwindcss/forms'),
  ],
};

module.exports = config;