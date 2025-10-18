// Archivo: frontend/src/lib/stores/cart.store.js
import { writable } from 'svelte/store';

// 1. Definimos la función que crea nuestro store
function createCart() {
  // 'writable' significa que podemos añadir, borrar y actualizar
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    // 2. Método para añadir un producto
    addProduct: (product) => {
      update((items) => {
        // Buscamos si el producto ya está en el carrito
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          // Si ya existe, solo aumentamos la cantidad
          return items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        // Si es nuevo, lo añadimos con cantidad 1
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
    },
  };
}

// 5. Exportamos la instancia de nuestro store
export const cart = createCart();