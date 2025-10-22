# 📐 MAPA DE COMPONENTES FRONTEND

## Árbol de Componentes Svelte

```
+layout.svelte (Root Layout)
├── header.svelte (Navigation)
│   ├── Logo "Moda Orgánica"
│   ├── Nav Links (/colecciones, /productos, /contacto, /envios, /devoluciones)
│   └── Theme Toggle + Cart Icon
├── <slot />
│   ├── +page.svelte (Home / Catálogo)
│   │   ├── Hero Section
│   │   ├── Features Grid
│   │   ├── Search Bar
│   │   └── ProductCard.svelte (repeating)
│   │       ├── Image
│   │       ├── Name
│   │       ├── Description
│   │       ├── Price
│   │       └── "View Details" Button
│   │
│   ├── product/[id]/
│   │   └── +page.svelte (Product Detail)
│   │       ├── Product Image
│   │       ├── Product Info
│   │       │   ├── Name
│   │       │   ├── Price
│   │       │   ├── Stock
│   │       │   └── Description
│   │       ├── Add to Cart Button
│   │       └── Related Products
│   │
│   └── checkout/
│       └── +page.svelte (Checkout)
│           ├── CheckoutItem.svelte (for each item)
│           │   ├── Product thumbnail
│           │   ├── Name & Qty
│           │   └── Price calculation
│           ├── Summary
│           │   ├── Subtotal
│           │   ├── Shipping
│           │   └── Total
│           └── Payment Form (TBD)
│
└── footer.svelte (Footer)
    ├── Links Grid
    ├── Newsletter Signup
    └── Copyright
```

---

## Estados de Carga de Datos

### +page.svelte (Catálogo)
```javascript
onMount(async () => {
  isLoading = true;
  try {
    const response = await fetch('/api/v1/products/');
    products = await response.json();
  } catch (err) {
    error = 'Error cargando productos...';
  } finally {
    isLoading = false;
  }
});
```

**Estados UI:**
- 🔄 `isLoading = true` → Mostrar spinner
- ❌ `error !== null` → Mostrar mensaje + retry button
- ✅ `products.length === 0` → "No hay productos"
- ✅ `products.length > 0` → Mostrar grid

### product/[id]/+page.js (Detalle)
```javascript
export async function load({ fetch, params }) {
  try {
    const res = await fetch(`/api/v1/products/${params.id}`);
    const product = await res.json();
    return { product };
  } catch (err) {
    return { product: null, error: err.message };
  }
}
```

---

## Global Stores (Svelte Stores)

### cart.store.js
```javascript
// Estructura
{
  items: [
    { productId: 1, quantity: 2, price: 45.99 },
    { productId: 3, quantity: 1, price: 89.99 }
  ],
  total: 181.97
}

// Acciones
addToCart(productId, quantity)
removeFromCart(productId)
updateQuantity(productId, quantity)
clearCart()
```

### theme.store.js
```javascript
// Estructura
{
  isDark: true,
  color: 'neon-pink'
}

// Acciones
toggleTheme()
setTheme(isDark)
```

---

## Componentes Reutilizables

### ProductCard.svelte
**Props:**
```javascript
export let product = {
  id: 1,
  name: 'Anillo Lunar',
  description: 'Descripción corta...',
  price: 45.99,
  image_url: 'https://...',
  stock: 10
};
export let onViewDetails = () => {};
```

**Estilos:**
- Fondo: `bg-[#1A1A1A]`
- Borde: `border-neon-pink/30`
- Sombra: `shadow-neon-pink/20`
- Hover: `hover:scale-105 hover:shadow-neon-pink/40`
- Radio: `rounded-3xl`

### CheckoutItem.svelte
**Props:**
```javascript
export let item = {
  productId: 1,
  quantity: 2,
  price: 45.99,
  name: 'Anillo Lunar'
};
export let onQuantityChange = (newQty) => {};
export let onRemove = () => {};
```

### TextInput.svelte
**Props:**
```javascript
export let label = 'Email';
export let type = 'text';
export let value = '';
export let placeholder = '';
export let required = false;
```

---

## Flujos de Interacción

### Agregar al Carrito
```
ProductCard → "Add to Cart" Click
    ↓
cartStore.addToCart(productId, 1)
    ↓
Mostrar toast de confirmación (TBD)
    ↓
Actualizar badge de cantidad en Header
```

### Ver Detalle de Producto
```
ProductCard → "View Details" Click
    ↓
Navigate to /product/[id]
    ↓
+page.js load() → fetch /api/v1/products/:id
    ↓
Renderizar +page.svelte con datos
    ↓
Mostrar imagen, descripción, stock, etc.
```

### Procesar Checkout
```
Header → Carrito Click
    ↓
Navigate to /checkout
    ↓
Mostrar lista de CheckoutItem
    ↓
Calcular shipping (POST /api/v1/orders/calculate-shipping)
    ↓
Usuario confirma
    ↓
POST /api/v1/orders/ para crear orden
    ↓
Mostrar confirmación (TBD)
```

---

## Responsive Design

**Breakpoints Tailwind:**
```css
sm: 640px  → 1 columna
md: 768px  → 2 columnas
lg: 1024px → 3 columnas
xl: 1280px → 4 columnas
```

**ProductCard:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

---

## Tipografía

**Familia:** `font-body` (puede ser Poppins, Inter, etc. en tailwind.config.cjs)

**Escalas:**
```css
Hero Title: text-6xl md:text-7xl font-black
Section Title: text-3xl font-bold
Card Title: text-lg font-bold
Body Text: text-sm/text-base
```

---

## Animaciones y Transiciones

**Incluidas en tailwind.config.cjs:**
- `animate-spin` (spinner)
- Transiciones: `transition-all duration-300`
- Transforms: `hover:scale-105`
- Opacidades: `hover:opacity-80`

**Posibles agregar:**
- `animate-bounce` para CTAs
- `animate-pulse` para estados loading
- `transition-transform` para smooth movements

---

## Estructura de Carpetas SvelteKit

```
src/
├── app.html              ← Template HTML
├── app.css               ← Estilos globales (@tailwind directives)
├── +layout.svelte        ← Root layout
├── +page.svelte          ← Página / (catálogo)
├── +page.js              ← (opcional) data loading para /
├── routes/
│   ├── product/
│   │   └── [id]/
│   │       ├── +page.js  ← Data loading por ID
│   │       └── +page.svelte
│   └── checkout/
│       ├── +page.svelte
│       └── CheckoutItem.svelte
├── lib/
│   ├── components/
│   │   ├── ProductCard.svelte
│   │   ├── TextInput.svelte
│   │   ├── layout/
│   │   │   ├── Header.svelte
│   │   │   └── Footer.svelte
│   │   └── ui/
│   │       └── ThemeToggle.svelte
│   ├── config/
│   │   └── brand.config.js
│   └── stores/
│       ├── cart.store.js
│       └── theme.store.js
└── service-worker.js     ← PWA support
```

---

## Patrones de Código Svelte

### Componente Reactivo
```svelte
<script>
  let count = 0;
  
  // Reactividad
  $: doubled = count * 2;
  $: if (count > 10) console.log('Grande!');
  
  // Ciclo de vida
  import { onMount } from 'svelte';
  onMount(async () => {
    // Cargar datos
  });
</script>

<p>{count}</p>
<p>Doubled: {doubled}</p>
<button on:click={() => count++}>Increment</button>
```

### Uso de Stores
```svelte
<script>
  import { cart } from '$lib/stores/cart.store.js';
  
  // Suscribirse a store
  let totalItems = 0;
  const unsubscribe = cart.subscribe(value => {
    totalItems = value.items.length;
  });
</script>

<span>{totalItems} items</span>
```

### Condicionales
```svelte
{#if isLoading}
  <div class="spinner"></div>
{:else if error}
  <div class="error">{error}</div>
{:else}
  <div class="content">...</div>
{/if}
```

### Loops
```svelte
{#each products as product (product.id)}
  <ProductCard {product} />
{:else}
  <p>No hay productos</p>
{/each}
```

---

Este mapa es tu referencia completa de la estructura frontend. 
Cualquier cambio que necesites hacer, simplemente orden por prompt. 🚀
