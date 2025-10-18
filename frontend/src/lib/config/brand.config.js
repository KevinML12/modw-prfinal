/**
 * =================================================================
 * ARCHIVO DE CONFIGURACIÓN DE MARCA "MAHORAGA"
 * =================================================================
 *
 * Este archivo DEBE ser un Módulo ES (usar 'export').
 * NO debe contener 'require' en ninguna parte.
 *
 */

export const brand = {
  // --- Identidad Visual y SEO ---
  identity: {
    name: 'Moda Orgánica',
    logo: '/logos/moda-organica-logo.svg',
    colors: {
      primary: '#E1AEC1',
      secondary: '#B08D57',
      background: '#FDFBF8',
      text: '#312E2C',
      accent: '#DDAF3B',
    },
    fonts: {
      headings: 'Playfair Display',
      body: 'Lato',
    },
  },

  // --- Reglas de Negocio ---
  businessRules: {
    shipping: {
      localZones: ['chiantla', 'huehuetenango'],
      costs: {
        local: 15.0,
        national: 35.0,
      },
      nationalProvider: 'Cargo Expreso',
    },
  },

  // --- SEO y Metadatos ---
  seo: {
    title: 'Moda Orgánica | Joyería Única en Guatemala',
    description:
      'Descubre colecciones exclusivas de joyería artesanal y bisutería fina.',
  },
};