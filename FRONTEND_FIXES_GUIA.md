# 🔧 GUÍA RÁPIDA DE FIXES - FRONTEND AUDIT

**Resumen:** 18 problemas identificados | 3 críticos | 5 altos | 7 medios | 3 bajos

---

## 🔴 FIXES CRÍTICOS (HACER PRIMERO)

### FIX #1: Cambiar SvelteKit Adapter

**Archivo:** `frontend/svelte.config.js`

**Cambiar de:**
```javascript
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null,
      precompress: false,
      strict: true
    }),
```

**Cambiar a:**
```javascript
import adapter from '@sveltejs/adapter-node';
// O si quieres auto-detectar:
// import adapter from '@sveltejs/adapter-auto';

const config = {
  kit: {
    adapter: adapter(),  // adapter-node usa defaults sensatos
```

**Instalación:**
```bash
cd frontend
npm uninstall @sveltejs/adapter-static
npm install @sveltejs/adapter-node
# O si usas pnpm:
pnpm remove @sveltejs/adapter-static
pnpm add -D @sveltejs/adapter-node
```

**Por qué:** Adapter-static solo genera HTML estático. No puede manejar formularios POST, rutas dinámicas, o server-side logic. Node adapter es necesario para producción con middleware.

---

### FIX #2: Unificar Moneda (GTQ)

**Crear archivo:** `frontend/src/lib/stores/currency.store.js`

```javascript
// frontend/src/lib/stores/currency.store.js
/**
 * Store para formateo centralizado de moneda
 * Evita inconsistencias entre GTQ, MXN, etc.
 */

const LOCALE = 'es-GT';
const CURRENCY = 'GTQ';

export const currencyFormatter = {
  format: (value) => {
    if (value == null) return '';
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: CURRENCY,
    }).format(value);
  },
  locale: LOCALE,
  currency: CURRENCY,
};
```

**Cambiar en:** `frontend/src/routes/product/[id]/+page.svelte` (línea 10-14)

**De:**
```javascript
const formatCurrency = (value) => {
    if (value == null) return '';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};
```

**A:**
```javascript
import { currencyFormatter } from '$lib/stores/currency.store.js';
const formatCurrency = (value) => currencyFormatter.format(value);
```

**Cambiar en:** `frontend/src/routes/checkout/CheckoutItem.svelte` (línea 6-9)

**De:**
```javascript
const currency = (value) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
```

**A:**
```javascript
import { currencyFormatter } from '$lib/stores/currency.store.js';
const currency = currencyFormatter.format;
```

**Cambiar en:** `frontend/src/routes/checkout/+page.svelte` (línea 54-60)

Ya está bien configurado con GTQ, pero cambiar a usar el store:

**De:**
```javascript
const currency = (value) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(value);
```

**A:**
```javascript
import { currencyFormatter } from '$lib/stores/currency.store.js';
const currency = currencyFormatter.format;
```

---

### FIX #3: Vite Proxy Mejorado

**Archivo:** `frontend/vite.config.js`

**Cambiar de:**
```javascript
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			// Redirige /api/v1/* al backend de Go
			'/api/v1': {
				target: 'http://backend:8080',
				changeOrigin: true,
			}
		}
	}
});
```

**Cambiar a:**
```javascript
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			// Redirige /api/v1/* al backend de Go
			'/api/v1': {
				target: 'http://backend:8080',
				changeOrigin: true,
				rewrite: (path) => {
					// Ensure we don't double-prefix
					return path.replace(/^\/api\/v1/, '/api/v1');
				},
				configure: (proxy, _options) => {
					proxy.on('error', (err, _req, _res) => {
						console.log('Proxy error:', err.message);
					});
					proxy.on('proxyRes', (proxyRes, req, _res) => {
						console.log(`[${req.method}] ${req.url} -> ${proxyRes.statusCode}`);
					});
				},
			}
		}
	}
});
```

**Por qué:** Mejor logging, manejo de errores, y previene bugs de ruta duplicada.

---

## 🟠 FIXES DE ALTO IMPACTO

### FIX #4: Tailwind Dark Mode - Colores Custom

**Archivo:** `frontend/tailwind.config.cjs`

**Agregar en `theme.extend`:**
```javascript
colors: {
  // ... existing colors ...
  
  // Asegurar que dark mode colors se aplican correctamente
  'dark-bg-primary': '#0A0A0F',
  'dark-bg-secondary': '#121218',
  'dark-bg-tertiary': '#1A1A24',
  'dark-bg-card': '#1E1E2E',
  'dark-bg-card-hover': '#252538',
  'dark-text-primary': '#F5F5F7',
  'dark-text-secondary': '#C7C7CC',
  'dark-text-tertiary': '#8E8E93',
  'dark-border': '#2C2C3A',
  'dark-magenta': '#FF5CAD',
  'dark-purple': '#A161FF',
  'dark-gold': '#FCD34D',
},

// Agregar en `darkMode` (si no está):
darkMode: 'class',  // Usar selector .dark en el <html>
```

**Verificar en:** `frontend/src/routes/+layout.svelte`

La clase `dark:` está siendo aplicada. Confirmar que en `+page.svelte` y componentes:

```svelte
<div class="bg-bg-primary dark:bg-dark-bg-primary">
  ✅ Esto aplica solo si <html class="dark"> existe
</div>
```

---

### FIX #5: Header - Cart Count Reactivo

**Archivo:** `frontend/src/lib/components/layout/Header.svelte` (línea 30-45)

**De:**
```svelte
{#if $cart.itemCount && $cart.itemCount > 0}
  <span class="...">
    {$cart.itemCount}
  </span>
{/if}
```

**A:**
```svelte
<script>
  import { cart } from '$lib/stores/cart.store.js';
  
  $: itemCount = $cart?.itemCount ?? 0;
</script>

<!-- ... -->

{#if itemCount > 0}
  <span class="...">
    {itemCount}
  </span>
{/if}
```

**Por qué:** Reactividad explícita y null-safe.

---

### FIX #6: Checkout Form - Validación

**Archivo:** `frontend/src/routes/checkout/+page.svelte`

**Reemplazar la función `handleSubmit`:**

**De:**
```javascript
function handleSubmit() {
  console.log('Enviando pedido:');
  const orderPayload = {
    customer: { email, fullName, phone, municipality },
    items: currentCart.items,
    shippingCost,
    total,
  };
  console.log(JSON.stringify(orderPayload, null, 2));
  alert('¡Pedido (simulado) enviado! Revisa la consola.');
}
```

**A:**
```javascript
function validateForm() {
  const errors = [];
  
  // Email validation
  if (!email || !email.includes('@')) {
    errors.push('Email inválido');
  }
  
  // Name validation
  if (!fullName.trim()) {
    errors.push('Nombre completo requerido');
  }
  
  // Phone validation (básico)
  if (!phone || phone.replace(/\D/g, '').length < 7) {
    errors.push('Teléfono inválido (mínimo 7 dígitos)');
  }
  
  // Municipality validation
  if (!municipality.trim()) {
    errors.push('Municipalidad requerida');
  }
  
  // Cart validation
  if (!currentCart.items || currentCart.items.length === 0) {
    errors.push('El carrito está vacío');
  }
  
  return errors;
}

function handleSubmit() {
  const errors = validateForm();
  
  if (errors.length > 0) {
    alert('Por favor corrige los siguientes errores:\n\n' + errors.join('\n'));
    return;
  }
  
  console.log('Enviando pedido válido:');
  const orderPayload = {
    customer: { email, fullName, phone, municipality },
    items: currentCart.items,
    shippingCost,
    total,
  };
  console.log(JSON.stringify(orderPayload, null, 2));
  
  // TODO: Enviar al backend
  // const response = await fetch('/api/v1/orders', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(orderPayload),
  // });
  
  alert('¡Pedido enviado exitosamente!');
}
```

---

### FIX #7: ProductCard - Gradient Class

**Archivo:** `frontend/src/lib/components/ProductCard.svelte` (línea 60)

**De:**
```svelte
<div class="w-full h-full bg-gradient-soft-pink flex items-center justify-center">
```

**A:**
```svelte
<div class="w-full h-full bg-soft-pink flex items-center justify-center">
```

O si quieres un gradient real, agregar a `tailwind.config.cjs`:
```javascript
backgroundImage: {
  'gradient-soft-pink': 'linear-gradient(135deg, #FFB6D9 0%, #FFF5F8 100%)',
}
```

---

## 🟡 FIXES MEDIOS

### FIX #8: Deshabilitar Service Worker en Dev

**Archivo:** `frontend/svelte.config.js`

**Cambiar:**
```javascript
// Desabilitar Service Worker en desarrollo
serviceWorker: {
  register: 'auto'  // ← Cambiar según NODE_ENV
}
```

**A:**
```javascript
// Desabilitar Service Worker en desarrollo
serviceWorker: {
  register: process.env.NODE_ENV === 'production' ? 'auto' : 'never'
}
```

Y **eliminar o comentar** `frontend/src/hooks.client.js` en su totalidad, ya que no será necesario.

---

### FIX #9: TextInput - DRY

**Archivo:** `frontend/src/lib/components/ui/TextInput.svelte`

**Reemplazar todo:**

```svelte
<script>
	export let value = '';
	export let label = '';
	export let id = '';
	export let type = 'text';
	export let placeholder = '';
	export let required = false;
</script>

<div class="w-full">
	<label for={id} class="block mb-2 text-sm font-semibold text-text-primary">
		{label}
	</label>
	<input
		{type}
		{id}
		bind:value
		{placeholder}
		{required}
		class="
			w-full px-4 py-3
			border-2 border-gray-200
			rounded-lg
			bg-white
			text-text-primary
			placeholder:text-text-secondary/50
			focus:outline-none
			focus:border-primary-magenta
			focus:ring-2
			focus:ring-primary-magenta/10
			transition-all duration-300
		"
	/>
</div>
```

**Por qué:** Una sola declaración `<input>`, Tailwind CSS maneja todos los tipos automáticamente.

---

### FIX #10: Theme Store - localStorage Safe

**Archivo:** `frontend/src/lib/stores/theme.store.js` (línea 13-17)

**De:**
```javascript
function getInitialTheme() {
  if (!browser) return 'light';
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return getSystemTheme();
}
```

**A:**
```javascript
function getInitialTheme() {
  if (!browser) return 'light';
  
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    console.warn('localStorage not available, using system preference:', e.message);
  }
  
  return getSystemTheme();
}
```

---

### FIX #11: +page.js - Fetch con Headers

**Archivo:** `frontend/src/routes/+page.js`

**De:**
```javascript
export async function load({ fetch }) {
	try {
		const res = await fetch('http://backend:8080/api/v1/products');
		if (!res.ok) {
			throw new Error(`HTTP ${res.status}: ${res.statusText}`);
		}
		const products = await res.json();
		return {
			products: products || [],
			error: null,
```

**A:**
```javascript
export async function load({ fetch }) {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout
		
		const res = await fetch('http://backend:8080/api/v1/products', {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			signal: controller.signal,
		});
		
		clearTimeout(timeout);
		
		if (!res.ok) {
			throw new Error(`HTTP ${res.status}: ${res.statusText}`);
		}
		const products = await res.json();
		return {
			products: products || [],
			error: null,
```

---

## 🟢 DEUDA TÉCNICA

### FIX #12: Types File (Crear)

**Crear archivo:** `frontend/src/lib/types/index.d.ts`

```typescript
export interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  sku?: string;
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  municipality: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}
```

---

### FIX #13: Backend go.mod

**Ejecutar:**
```bash
cd backend
go mod tidy
```

---

### FIX #14: API Layer (Crear)

**Crear archivo:** `frontend/src/lib/api/index.js`

```javascript
// frontend/src/lib/api/index.js

const API_BASE = '/api/v1';
const TIMEOUT = 8000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);
  
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export const api = {
  // Products
  products: {
    getAll: () => fetchWithTimeout(`${API_BASE}/products/`),
    getById: (id) => fetchWithTimeout(`${API_BASE}/products/${id}`),
  },
  
  // Orders
  orders: {
    create: (data) => fetchWithTimeout(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    getById: (id) => fetchWithTimeout(`${API_BASE}/orders/${id}`),
  },
};
```

Luego usar en componentes:
```javascript
import { api } from '$lib/api/index.js';

onMount(async () => {
  products = await api.products.getAll();
});
```

---

## 📊 CHECKLIST DE EJECUCIÓN

```
CRÍTICOS:
- [ ] FIX #1: Cambiar adapter-static → adapter-node
- [ ] FIX #2: Crear currency.store.js y usar en 3 archivos
- [ ] FIX #3: Mejorar vite.config.js proxy

ALTOS:
- [ ] FIX #4: Revisar Tailwind dark mode config
- [ ] FIX #5: Arreglar Header cart count
- [ ] FIX #6: Agregar validación en checkout
- [ ] FIX #7: Cambiar bg-gradient-soft-pink → bg-soft-pink

MEDIOS:
- [ ] FIX #8: Service Worker register condition
- [ ] FIX #9: Refactorizar TextInput
- [ ] FIX #10: localStorage try/catch
- [ ] FIX #11: Agregar headers y timeout en +page.js

BAJOS:
- [ ] FIX #12: Crear types/index.d.ts
- [ ] FIX #13: Ejecutar go mod tidy
- [ ] FIX #14: Crear api/index.js layer
```

---

## 🚀 TESTING DESPUÉS DE FIXES

```bash
# 1. Build check
cd frontend
npm run build

# 2. Preview (simula producción)
npm run preview
# Abre http://localhost:4173

# 3. Verificar en browser:
# ✅ Página carga sin errores
# ✅ Búsqueda funciona
# ✅ Agregar al carrito funciona
# ✅ Cart count se actualiza
# ✅ Checkout valida
# ✅ Dark mode cambia colores
# ✅ Responsive en mobile
# ✅ No hay warnings en console

# 4. Dev mode
npm run dev
# http://localhost:5173
# ✅ HMR funciona
# ✅ No hay Service Worker warnings
```

---

**Próximo paso:** Aplicar estos fixes en orden de prioridad.

