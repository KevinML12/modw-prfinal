const { brand } = require('./src/lib/config/brand.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			// 1. Mapeamos los colores de la marca
			colors: {
				primary: brand.identity.colors.primary,
				secondary: brand.identity.colors.secondary,
				background: brand.identity.colors.background,
				text: brand.identity.colors.text,
				accent: brand.identity.colors.accent,
				'primary-content': brand.identity.colors.primary_content,
			},
			// 2. Mapeamos las fuentes de la marca
			fontFamily: {
				headings: [brand.identity.fonts.headings, 'serif'],
				body: [brand.identity.fonts.body, 'sans-serif'],
			},
		},
	},
	plugins: [require('@tailwindcss/line-clamp'), require('@tailwindcss/forms')],
};