const { brand } = require('./src/lib/config/brand.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			// Paleta neón inspirada en Gumroad
			colors: {
				// Colores principales neón
				'neon-pink': '#FF1493',
				'neon-yellow': '#FFFF00',
				'neon-coral': '#FF6B6B',
				'soft-pink': '#FFB6C1',
				'hot-pink': '#FF69B4',
				'peach': '#FFCBA4',
				// Neutrales
				'black': '#0A0A0A',
				'dark-gray': '#1A1A1A',
				'white': '#FFFFFF',
				// Acentos
				'purple-glow': '#B026FF',
				'blue-neon': '#00F0FF',
				// Mapeamos los colores de la marca
				primary: brand.identity.colors.primary,
				secondary: brand.identity.colors.secondary,
				background: brand.identity.colors.background,
				text: brand.identity.colors.text,
				accent: brand.identity.colors.accent,
				'primary-content': brand.identity.colors.primary_content,
			},
			boxShadow: {
				'neon-pink': '0 0 20px rgba(255, 20, 147, 0.6)',
				'neon-yellow': '0 0 20px rgba(255, 255, 0, 0.6)',
				'neon-coral': '0 0 20px rgba(255, 107, 107, 0.6)',
			},
			borderRadius: {
				'3xl': '24px',
				'4xl': '32px',
			},
			// Mapeamos las fuentes de la marca
			fontFamily: {
				headings: [brand.identity.fonts.headings, 'serif'],
				body: [brand.identity.fonts.body, 'sans-serif'],
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};