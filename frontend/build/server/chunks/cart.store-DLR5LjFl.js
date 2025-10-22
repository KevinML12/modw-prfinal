import { w as writable } from './index-C12HHKrG.js';

function createCart() {
  const initialState = {
    items: [],
    subtotal: 0,
    total: 0,
    itemCount: 0
  };
  const { subscribe, set, update } = writable(initialState);
  function calculateTotals(items) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      items,
      subtotal,
      total: subtotal,
      // El total se actualiza en checkout con envío
      itemCount
    };
  }
  return {
    subscribe,
    // 2. Método para añadir un producto
    addProduct: (product) => {
      update((state) => {
        const existingItem = state.items.find((item) => item.id === product.id);
        let newItems;
        if (existingItem) {
          newItems = state.items.map(
            (item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          newItems = [...state.items, { ...product, quantity: 1 }];
        }
        return calculateTotals(newItems);
      });
    },
    // 3. Método para quitar un producto
    removeProduct: (id) => {
      update((state) => {
        const newItems = state.items.filter((item) => item.id !== id);
        return calculateTotals(newItems);
      });
    },
    // 4. Método para actualizar cantidad de un producto
    updateQuantity: (id, quantity) => {
      update((state) => {
        const newItems = state.items.map(
          (item) => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        return calculateTotals(newItems);
      });
    },
    // 5. Método para vaciar el carrito
    clear: () => {
      set(initialState);
    },
    // 6. Método para obtener el estado actual (síncrono)
    getCart: () => {
      let currentCart;
      const unsubscribe = subscribe((value) => {
        currentCart = value;
      });
      unsubscribe();
      return currentCart;
    }
  };
}
const cart = createCart();

export { cart as c };
//# sourceMappingURL=cart.store-DLR5LjFl.js.map
