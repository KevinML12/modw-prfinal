// frontend/tailwind.config.cjs
const { brand } = require('./src/lib/config/brand.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilitar dark mode basado en clase '.dark' en <html>
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // Definimos colores usando variables CSS para permitir cambio dinámico
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',     // Color para fondos de tarjetas
        border: 'rgb(var(--color-border) / <alpha-value>)', // Color para bordes
      },
      fontFamily: {
        headings: [brand.identity.fonts.headings, 'serif'],
        body: [brand.identity.fonts.body, 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};