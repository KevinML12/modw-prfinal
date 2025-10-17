// frontend/src/lib/config/brand.config.js

/**
 * @typedef {Object} BrandIdentity
 * @property {string} name - El nombre de la tienda.
 * @property {string} logo - La ruta al archivo SVG del logo.
 * @property {{primary: string, secondary: string, background: string, text: string, accent: string}} colors - La paleta de colores principal.
 * @property {{headings: string, body: string}} fonts - Las familias de fuentes de Google Fonts.
 */

/**
 * @typedef {Object} BusinessRules
 * @property {{localZones: string[], costs: {local: number, national: number}, nationalProvider: string}} shipping - Reglas de negocio para envíos.
 */

/**
 * @typedef {Object} SEOConfig
 * @property {string} title - El título por defecto para el SEO.
 * @property {string} description - La descripción por defecto para el SEO.
 */

/**
 * @typedef {Object} BrandConfig
 * @property {BrandIdentity} identity
 * @property {BusinessRules} businessRules
 * @property {SEOConfig} seo
 */

/**
 * Configuración central de la marca para "Moda Orgánica".
 * Este objeto define toda la identidad y reglas de negocio de la tienda.
 * @type {BrandConfig}
 */
export const brand = {
  // --- Identidad Visual y Verbal de la Marca ---
  identity: {
    name: "Moda Orgánica",
    logo: "/logos/moda-organica-logo.svg",
    colors: {
      primary: "#E1AEC1",   // Rosa pálido, evoca delicadeza.
      secondary: "#B08D57", // Dorado/Bronce, sugiere lujo y artesanía.
      background: "#FDFBF8",// Blanco hueso, un fondo cálido y limpio.
      text: "#312E2C",      // Marrón oscuro, alta legibilidad y calidez.
      accent: "#DDAF3B",    // Amarillo ocre, para llamadas a la acción (botones, ofertas).
    },
    fonts: {
      headings: "Playfair Display", // Fuente serif elegante para títulos.
      body: "Lato",                 // Fuente sans-serif limpia y legible para el texto.
    },
  },

  // --- Reglas de Negocio Específicas de la Tienda ---
  businessRules: {
    shipping: {
      // Zonas locales para costos de envío reducidos (coincide con el backend).
      localZones: ["chiantla", "huehuetenango"],
      costs: {
        local: 15.00,    // Costo en Quetzales (GTQ) para zonas locales.
        national: 35.00, // Costo para el resto del país.
      },
      nationalProvider: "Cargo Expreso", // Proveedor de logística nacional.
    },
  },

  // --- Configuración para Motores de Búsqueda (SEO) ---
  seo: {
    title: "Moda Orgánica | Joyería Única en Guatemala",
    description: "Descubre colecciones exclusivas de joyería artesanal, piezas únicas que cuentan una historia.",
  }
};