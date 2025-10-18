import { w as writable } from "./index.js";
const brand = {
  // --- Identidad Visual y SEO ---
  identity: {
    name: "Moda Orgánica",
    colors: {
      text: "#312E2C"
    },
    fonts: {
      headings: "Playfair Display",
      body: "Lato"
    }
  },
  // --- Reglas de Negocio ---
  businessRules: {
    shipping: {
      localZones: ["chiantla", "huehuetenango"],
      costs: {
        local: 15,
        national: 35
      },
      nationalProvider: "Cargo Expreso"
    }
  },
  // --- SEO y Metadatos ---
  seo: {
    title: "Moda Orgánica | Joyería Única en Guatemala",
    description: "Descubre colecciones exclusivas de joyería artesanal y bisutería fina."
  }
};
function createCart() {
  const { subscribe, set, update } = writable([]);
  return {
    subscribe,
    // 2. Método para añadir un producto
    addProduct: (product) => {
      update((items) => {
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
          return items.map(
            (item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...items, { ...product, quantity: 1 }];
      });
    },
    // 3. Método para quitar un producto
    removeProduct: (id) => {
      update((items) => items.filter((item) => item.id !== id));
    },
    // 4. Método para vaciar el carrito
    clear: () => {
      set([]);
    }
  };
}
const cart = createCart();
export {
  brand as b,
  cart as c
};
