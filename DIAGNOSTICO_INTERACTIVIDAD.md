# 🔍 DIAGNÓSTICO DE INTERACTIVIDAD - Frontend

**Fecha:** Octubre 19, 2025  
**Estado:** 🔴 MÚLTIPLES ISSUES ENCONTRADOS

---

## 🔴 PROBLEMAS ENCONTRADOS

### 1. **Cart Store Incompleto**
**Ubicación:** `src/lib/stores/cart.store.js`

**Problema:**
- Solo expone `subscribe` y métodos para agregar/quitar productos
- Header intenta acceder a `$cart.itemCount` pero no existe
- Checkout espera `$cart.subtotal` y `$cart.total` pero no existen

**Código Actual:**
```javascript
const { subscribe, set, update } = writable([]);

return {
  subscribe,
  addProduct: (product) => { ... },
  removeProduct: (id) => { ... },
  clear: () => { ... }
}
```

**Código Esperado:**
```javascript
// Debe devolver objeto con items, no array directo
writable({
  items: [],
  subtotal: 0,
  total: 0,
  itemCount: 0
});
```

---

### 2. **ProductCard No Conectado al Store**
**Ubicación:** `src/lib/components/ProductCard.svelte`

**Problema:**
- Botón "Añadir al carrito" tiene `on:click` pero no hace nada
- Solo loguea a consola: `console.log('Añadir al carrito:', product.id);`
- No importa el store de carrito
- No actualiza el carrito

**Código Actual:**
```javascript
on:click|stopPropagation={() => {
  console.log('Añadir al carrito:', product.id);
  // Aquí iría la lógica del carrito
}}
```

**Código Esperado:**
```javascript
import { cart } from '$lib/stores/cart.store.js';

on:click|stopPropagation={() => {
  cart.addProduct(product);
  // Mostrar notificación (toast)
}}
```

---

### 3. **Header No Muestra Cantidad de Items**
**Ubicación:** `src/lib/components/layout/Header.svelte`

**Problema:**
- Accede a `$cart.itemCount` que no existe
- Badge de carrito nunca se actualiza
- El icono del carrito no funciona completamente

**Código Actual:**
```svelte
{#if $cart.itemCount > 0}
  <span class="...">
    {$cart.itemCount}
  </span>
{/if}
```

**Código Esperado:**
```svelte
{#if $cart.items && $cart.items.length > 0}
  <span class="...">
    {$cart.items.length}
  </span>
{/if}
```

---

### 4. **Checkout Espera Estructura Diferente**
**Ubicación:** `src/routes/checkout/+page.svelte`

**Problema:**
- Espera: `currentCart.subtotal` y `currentCart.items`
- El store devuelve: `items: []` (array directo)
- No hay cálculo de subtotal en el store

**Código Actual:**
```javascript
const unsubscribe = cart.subscribe((value) => {
  currentCart = value;  // value es array []
  recalculateTotal();
});
```

**Código Esperado:**
```javascript
const unsubscribe = cart.subscribe((value) => {
  currentCart = value;  // value debe ser { items: [...], subtotal: 0, ... }
  recalculateTotal();
});
```

---

### 5. **ProductCard Falta Navegación**
**Ubicación:** `src/lib/components/ProductCard.svelte`

**Problema:**
- No hay forma de hacer click para ver detalles del producto
- Toda la tarjeta debería ser clickeable para ir a `/product/[id]`
- Solo hay botón de carrito, sin botón de detalles

**Falta:**
- Click handler para navegar a `/product/[id]`
- Diferenciar entre "ver detalles" y "agregar carrito"

---

### 6. **Hero Button No Funciona**
**Ubicación:** `src/routes/+page.svelte` (línea ~75)

**Problema:**
```svelte
<button class="bg-gradient-magenta ...">
  Explorar Colección
  ...
</button>
```

**Sin Handler:** No tiene `on:click` ni navega a nada

---

### 7. **Header Navigation Links Incompletos**
**Ubicación:** `src/lib/components/layout/Header.svelte`

**Problema:**
- Links a `/colecciones`, `/contacto`, etc. existen en el código
- Pero las rutas NO existen en SvelteKit (`src/routes/`)
- Harán 404

**Rutas que Faltan:**
- `/colecciones` → No existe
- `/contacto` → No existe
- `/envios` → No existe
- `/devoluciones` → No existe

---

### 8. **SearchQuery y Filter No Conectados**
**Ubicación:** `src/routes/+page.svelte`

**Problema:**
```javascript
let searchQuery = '';
$: filteredProducts = products.filter(p => ...);
```

**Sin Usar:** No hay input field para `searchQuery`
**Sin Mostrar:** `filteredProducts` nunca se usa en el template

---

## 📊 TABLA RESUMEN

| Componente | Funciona? | Problema |
|-----------|-----------|----------|
| ProductCard (render) | ✅ Sí | ❌ Botón carrito no hace nada |
| ProductCard (detalles link) | ❌ No | ❌ No hay navegación a producto |
| Header (logo) | ✅ Sí | - |
| Header (nav links) | ⚠️ Parcial | ⚠️ Rutas 404 |
| Header (cart badge) | ❌ No | ❌ $cart.itemCount no existe |
| Cart Store | ❌ Incompleto | ❌ Falta itemCount, subtotal, total |
| Checkout (form render) | ✅ Sí | ❌ currentCart.subtotal es undefined |
| Checkout (submit) | ⚠️ Parcial | ⚠️ Solo log, no POST a backend |
| Hero Button | ❌ No | ❌ No tiene on:click |
| Search Bar | ❌ No | ❌ No existe en template |

---

## 🛠️ PLAN DE CORRECCIÓN

### PRIORIDAD 1 (Crítica - Bloquea interactividad)
1. ✅ Arreglar structure del cart store
2. ✅ Conectar ProductCard button al store
3. ✅ Arreglar Header para mostrar cantidad
4. ✅ Arreglar Checkout para leer del store correcto

### PRIORIDAD 2 (Alta - Falta navegación)
5. ✅ Agregar navegación en ProductCard a `/product/[id]`
6. ✅ Agregar handler al Hero button
7. ✅ Crear rutas faltantes (colecciones, contacto, etc.)

### PRIORIDAD 3 (Media - UX/Features)
8. ⏳ Implementar search bar
9. ⏳ Agregar toast notifications
10. ⏳ Agregar confirmación de agregar al carrito

---

## 📝 PRÓXIMOS PASOS

Espero tus órdenes, arquitecto. ¿Comenzamos con las correcciones de PRIORIDAD 1?

