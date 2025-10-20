// frontend/tailwind.config.cjs

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ===== LIGHT MODE =====
        // Paleta principal (de Figma)
        'primary-magenta': '#E91E8C',
        'primary-purple': '#B026FF',
        
        // Secundarios
        'soft-pink': '#FFB6D9',
        'pale-pink': '#FFF5F8',
        'hot-pink': '#FF69B4',
        
        // Acentos
        'gold': '#B8860B',
        'gold-light': '#D4AF37',
        'yellow-badge': '#FFC107',
        'turquoise': '#00BCD4',
        
        // Neutrales (fondo blanco, no negro)
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#FAFAFA',
        'bg-card': '#FFF5F8',
        'bg-card-hover': '#FFE8F0',
        
        // Textos Light
        'text-primary': '#000000',
        'text-secondary': '#666666',
        'text-tertiary': '#999999',

        // ===== DARK MODE =====
        // Fondos Dark
        'dark-bg-primary': '#0A0A0F',
        'dark-bg-secondary': '#121218',
        'dark-bg-tertiary': '#1A1A24',
        'dark-bg-card': '#1E1E2E',
        'dark-bg-card-hover': '#252538',

        // Textos Dark
        'dark-text-primary': '#F5F5F7',
        'dark-text-secondary': '#C7C7CC',
        'dark-text-tertiary': '#8E8E93',
        'dark-text-disabled': '#48484A',

        // Bordes Dark
        'dark-border': '#2C2C3A',
        'dark-border-hover': '#3A3A4A',
        'dark-border-focus': '#FF5CAD',

        // Acentos Dark (más vibrantes)
        'dark-magenta': '#FF5CAD',
        'dark-purple': '#A161FF',
        'dark-gold': '#FCD34D',
        'dark-gold-accent': '#FBBF24',
      },
      
      boxShadow: {
        // Light mode shadows
        'soft': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'soft-hover': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'magenta': '0 4px 16px rgba(233, 30, 140, 0.2)',
        'magenta-strong': '0 8px 24px rgba(233, 30, 140, 0.3)',
        
        // Dark mode shadows
        'dark-soft': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'dark-medium': '0 4px 12px rgba(0, 0, 0, 0.5)',
        'dark-magenta': '0 4px 16px rgba(255, 92, 173, 0.3)',
        'dark-magenta-glow': '0 0 20px rgba(255, 92, 173, 0.4)',
        'dark-gold': '0 4px 16px rgba(252, 211, 77, 0.2)',
      },
      
      backgroundImage: {
        // Light gradients
        'gradient-magenta': 'linear-gradient(135deg, #E91E8C 0%, #B026FF 100%)',
        'gradient-gold': 'linear-gradient(135deg, #B8860B 0%, #D4AF37 100%)',
        
        // Dark gradients
        'gradient-dark-magenta': 'linear-gradient(135deg, #FF5CAD 0%, #A161FF 100%)',
        'gradient-dark-gold': 'linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)',
        'gradient-dark-soft': 'linear-gradient(135deg, #1E1E2E 0%, #252538 100%)',
      },
      
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      
      transitionDuration: {
        '400': '400ms',
      },

      keyframes: {
        // Toggle button rotations
        'toggle-moon': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(12deg)' },
        },
        'toggle-sun': {
          '0%': { transform: 'rotate(90deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        // Hover glow effect
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 92, 173, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 92, 173, 0.6)' },
        },
      },

      animation: {
        // Transición suave toggle moon
        'toggle-moon': 'toggle-moon 300ms ease-out',
        // Transición suave toggle sun
        'toggle-sun': 'toggle-sun 300ms ease-out',
        // Efecto glow pulse
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}