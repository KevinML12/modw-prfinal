// frontend/src/lib/config/brand.config.js
export const brand = {
  identity: {
    name: "Moda Orgánica", // O el nombre final
    logo: "/logos/moda-organica-logo.svg", // Asegúrate que exista
    colors: {
      // --- Modo Claro ---
      light: {
        primary: "#EC4899",   // Rosa Vibrante (Gumroad/Tienda)
        secondary: "#F472B6", // Rosa Más Suave
        background: "#F9FAFB", // Blanco Hueso / Gris Muy Claro (Gumroad bg)
        text: "#1F2937",     // Gris Oscuro Intenso (Gumroad text)
        accent: "#EF4444",   // Rojo (Tienda acento)
        card: "#FFFFFF",     // Blanco para tarjetas/contenedores
        border: "#E5E7EB",   // Gris claro para bordes
      },
      // --- Modo Oscuro ---
      dark: {
        primary: "#EC4899",   // Mantenemos Rosa Vibrante
        secondary: "#F9A8D4", // Rosa Más Claro (para contraste)
        background: "#111827", // Gris Muy Oscuro / Casi Negro (Gumroad dark bg)
        text: "#E5E7EB",     // Gris Claro (Gumroad dark text)
        accent: "#F87171",   // Rojo Más Claro
        card: "#1F2937",     // Gris Oscuro para tarjetas
        border: "#374151",   // Gris más oscuro para bordes
      }
    },
    fonts: {
      headings: "Playfair Display", // Mantenemos por ahora
      body: "Lato",             // Mantenemos por ahora
    },
  },
  businessRules: {
    shipping: {
      localZones: ["chiantla", "huehuetenango"],
      costs: { local: 15.00, national: 35.00 },
      nationalProvider: "Cargo Expreso",
    },
  },
  seo: {
    title: "Moda Orgánica | Joyería Única en Guatemala",
    description: "Descubre colecciones exclusivas de joyería y bisutería.",
  }
};