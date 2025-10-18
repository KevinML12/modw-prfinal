// Archivo: frontend/tailwind.config.cjs
// (Ubicado en la raíz de /frontend)

// 1. Importamos nuestra configuración de marca
// La ruta es relativa a ESTE archivo
const { brand } = require('./src/lib/config/brand.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 2. Esta es la línea que fallaba al ser leída por Tailwind
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      // 3. Extendemos los colores de Tailwind con los nuestros
      colors: {
        primary: brand.identity.colors.primary,
        secondary: brand.identity.colors.secondary,
        background: brand.identity.colors.background,
        text: brand.identity.colors.text,
        accent: brand.identity.colors.accent,
      },
      // 4. Extendemos las fuentes de Tailwind con las nuestras
      fontFamily: {
        headings: [brand.identity.fonts.headings, 'serif'],
        body: [brand.identity.fonts.body, 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin útil para estilizar formularios
  ],
};