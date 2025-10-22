# 🔍 AUDITORÍA COMPLETA DEL FRONTEND - MODA ORGÁNICA

**Fecha:** Octubre 21, 2025  
**Estado General:** ⚠️ **MÚLTIPLES PROBLEMAS IDENTIFICADOS**  
**Versión:** SvelteKit 2.47.2 + Vite 5.4.20 + Tailwind CSS 3.4.18

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Estado | Problemas | Severidad |
|-----------|--------|-----------|-----------|
| **Configuración** | ❌ CRÍTICO | 3 problemas | 🔴 CRÍTICO |
| **Service Worker** | ✅ PARCIAL | 1 problema residual | 🟡 MEDIO |
| **Componentes** | ⚠️ DEFECTOS | 5 problemas | 🟠 ALTO |
| **Stores** | ❌ ERRORES | 2 problemas | 🟡 MEDIO |
| **CSS/Tailwind** | ⚠️ INCONSISTENCIA | 3 problemas | 🟡 MEDIO |
| **Rutas** | ⚠️ FUNCIONALES | 2 problemas | 🟡 MEDIO |
| **Package.json** | ❌ DEUDA TÉCNICA | 2 problemas | 🟡 MEDIO |

**Total de Problemas:** 18 identificados  
**Bloqueadores:** 3  
**Warnings:** 7  
**Deuda Técnica:** 8

---

## 🔴 PROBLEMAS CRÍTICOS (BLOQUEADORES)

### 1. **SvelteKit: Adapter-Static vs Adapter-Auto**

**Ubicación:** `frontend/svelte.config.js` (línea 10)

**Problema:**
```javascript
adapter: adapter({...})  // adapter-static
```

El proyecto usa `adapter-static` pero el middleware de checkout y formularios requieren **SSR o ISR**. Adapter-static es solo para sitios estáticos pre-generados.

**Impacto:** 
- ❌ Formularios POST no van a funcionar en producción
- ❌ Rutas dinámicas `/product/[id]` no se pre-generan
- ❌ API calls en formularios pueden fallar

**Solución Recomendada:**
```javascript
// Cambiar a adapter-auto o adapter-node
import adapter from '@sveltejs/adapter-auto';  // Para auto-detectar
// O
import adapter from '@sveltejs/adapter-node';  // Para Docker/production
```

**Prioridad:** 🔴 **CRÍTICO** - Debe arreglarse antes de producción

---

### 2. **Conflicto de Stores: Currency Formatter**

**Ubicación:** Múltiples archivos
- `frontend/src/routes/product/[id]/+page.svelte` (línea 12)
- `frontend/src/routes/checkout/CheckoutItem.svelte` (línea 6-9)
- `frontend/src/routes/checkout/+page.svelte` (línea 56-60)

**Problema:**

El formateo de moneda **NO es consistente**:

```javascript
// En +page.svelte (checkout):
new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
}).format(value)

// En product/[id]/+page.svelte:
new Intl.NumberFormat('es-MX', { 
  style: 'currency', 
  currency: 'MXN' 
}).format(value)

// En CheckoutItem.svelte:
new Intl.NumberFormat('es-MX', { 
  style: 'currency', 
  currency: 'MXN' 
}).format(value)
```

**Impacto:**
- 💰 Mostrar precios en diferentes monedas (GTQ vs MXN)
- 🤯 Confusión del usuario
- 💥 Cálculos de carrito incorrectos

**Solución:**
Crear store único para formato de moneda:

```javascript
// frontend/src/lib/stores/currency.store.js
import { writable } from 'svelte/store';

function createCurrencyFormatter() {
  const locale = 'es-GT';
  const currencyCode = 'GTQ';
  
  return {
    format: (value) => 
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
      }).format(value)
  };
}

export const currencyFormatter = createCurrencyFormatter();
```

Luego usarlo en todos los componentes:
```javascript
import { currencyFormatter } from '$lib/stores/currency.store.js';
const currency = (val) => currencyFormatter.format(val);
```

**Prioridad:** 🔴 **CRÍTICO** - Los precios son incorrectos

---

### 3. **Vite Proxy Configuration Insuficiente**

**Ubicación:** `frontend/vite.config.js`

**Problema:**
```javascript
proxy: {
  '/api/v1': {
    target: 'http://backend:8080',
    changeOrigin: true,
  }
}
```

**Issues:**
- ❌ No maneja `/api/v1/` (con trailing slash)
- ❌ No configura `rewrite` para rutas específicas
- ❌ Faltan headers CORS en desarrollo

**Versión Mejorada:**
```javascript
server: {
  proxy: {
    '/api/v1': {
      target: 'http://backend:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      configure: (proxy, _options) => {
        proxy.on('error', (err, _req, _res) => {
          console.log('proxy error', err);
        });
      },
    }
  }
}
```

**Prioridad:** 🟡 **MEDIO** - Puede causar problemas intermitentes en dev

---

## 🟠 PROBLEMAS DE ALTO IMPACTO

### 4. **Tailwind Config: Colores No Están en Clase HTML Dark**

**Ubicación:** `frontend/tailwind.config.cjs` (línea 5)

**Problema:**

Los colores custom de dark mode NO aplican automáticamente:

```javascript
// Definido en config:
'dark-bg-primary': '#0A0A0F',
'dark-text-primary': '#F5F5F7',

// Pero en +layout.svelte:
<div class="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
```

Esto **funciona solo si `darkMode: 'class'` está activo en raíz HTML**, pero:
- La transición de tema puede no ser fluida
- Los colores pueden no aplicar si JS no ejecuta

**Solución:**

Crear una clase CSS explícita para el toggle:

```css
/* frontend/src/app.css */
html.dark {
  --color-bg-primary: #0A0A0F;
  --color-text-primary: #F5F5F7;
  --color-bg-card: #1E1E2E;
  /* ... */
}

/* Luego usar en Tailwind config */
colors: {
  'bg-primary': 'var(--color-bg-primary, #FFFFFF)',
}
```

**Prioridad:** 🟠 **ALTO** - Dark mode puede no verse correctamente

---

### 5. **Header: Cart Count Puede No Renderizar**

**Ubicación:** `frontend/src/lib/components/layout/Header.svelte` (línea 30-45)

**Problema:**
```svelte
{#if $cart.itemCount && $cart.itemCount > 0}
  <span class="...">
    {$cart.itemCount}
  </span>
{/if}
```

El store `$cart` es un objeto, no un Svelte Store reactivo. El count puede:
- ❌ No actualizarse cuando se agrega un producto
- ❌ Mostrar `undefined` si el store no inicializa
- ❌ Causar errores si `itemCount` es falsy pero existe

**Solución:**
```svelte
<script>
import { cart } from '$lib/stores/cart.store.js';

$: itemCount = $cart?.itemCount ?? 0;
</script>

{#if itemCount > 0}
  <span>{itemCount}</span>
{/if}
```

**Prioridad:** 🟠 **ALTO** - UX rota en header

---

### 6. **Cart Store: Missing Binding en Componentes**

**Ubicación:** `frontend/src/routes/checkout/+page.svelte` (línea 11-20)

**Problema:**
```javascript
let currentCart = { items: [], subtotal: 0, total: 0, shippingCost: 0 };
onMount(() => {
  const unsubscribe = cart.subscribe((value) => {
    currentCart = value;
    recalculateTotal();
  });
  return unsubscribe;
});
```

Esto **funciona pero es frágil**:
- Si el carrito cambia externamente, la UI no actualiza
- El `recalculateTotal()` puede ejecutarse fuera de sincronía

**Mejor Patrón:**
```javascript
// Directamente usar store reactivo
$: currentCart = $cart;
$: recalculateTotal($cart);
```

**Prioridad:** 🟠 **ALTO** - Puede causar bugs de sincronización

---

### 7. **ProductCard: Missing Error Handling**

**Ubicación:** `frontend/src/lib/components/ProductCard.svelte` (línea 55-65)

**Problema:**
```svelte
{:else}
  <!-- Placeholder elegante si no hay imagen -->
  <div class="w-full h-full bg-gradient-soft-pink flex items-center justify-center">
    <div class="text-center">
      <span class="text-8xl opacity-20">💍</span>
      <p class="text-text-tertiary mt-4 text-sm">Imagen próximamente</p>
    </div>
  </div>
{/if}
```

El gradient `bg-gradient-soft-pink` **NO existe en Tailwind config**. Solo existe:
- `bg-soft-pink` (color sólido)
- `gradient-magenta` (gradient)

Debería ser:
```svelte
<div class="w-full h-full bg-soft-pink flex items-center justify-center">
```

**Prioridad:** 🟠 **ALTO** - Imagen quebrada en productos sin foto

---

## 🟡 PROBLEMAS MEDIOS

### 8. **Service Worker: Aún Hay Conflicto en Desarrollo**

**Ubicación:** `frontend/src/service-worker.js` + `frontend/src/hooks.client.js`

**Problema:**

Ambos archivos están ejecutándose:
1. Service Worker intenta registrarse
2. Hooks intenta desregistrarlo
3. Race condition potencial

**Error en console:**
```
⚠️ Service Worker DEPRECATED - Use only in production (adapter-node)
✅ Service Worker deshabilitado en desarrollo
```

Ambos ejecutan. Es una batalla entre registración y desregistración.

**Solución:**

Deshabilitar Service Worker registro en dev **totalmente**:

```javascript
// frontend/svelte.config.js
kit: {
  serviceWorker: {
    register: 'auto'  // ← Debería ser 'never' en dev
  }
}
```

O usar variable de entorno:

```javascript
register: process.env.NODE_ENV === 'production' ? 'auto' : 'never'
```

**Prioridad:** 🟡 **MEDIO** - Funciona pero con warnings

---

### 9. **TextInput Component: Type Handling Redundante**

**Ubicación:** `frontend/src/lib/components/ui/TextInput.svelte`

**Problema:**
```svelte
{#if type === 'email'}
  <input type="email" ... />
{:else if type === 'tel'}
  <input type="tel" ... />
{:else}
  <input type="text" ... />
{/if}
```

Todo el HTML se repite. Es DRY violation.

**Solución:**
```svelte
<input
  type={type}
  {id}
  bind:value
  {placeholder}
  {required}
  class="..."
/>
```

Tailwind CSS no necesita `{#if}` para cada tipo. El HTML es idéntico.

**Prioridad:** 🟡 **MEDIO** - Deuda técnica, funciona pero ineficiente

---

### 10. **Theme Store: localStorage No es SSR-Safe**

**Ubicación:** `frontend/src/lib/stores/theme.store.js` (línea 25-27)

**Problema:**
```javascript
function getInitialTheme() {
  if (!browser) return 'light';  // ✅ Buen check
  const saved = localStorage.getItem('theme');  // ← Pero no valida si localStorage existe
  // ...
}
```

En algunos navegadores, `localStorage` puede estar disabled:
- Private browsing en Safari
- Cross-origin iframes
- Contenedores de seguridad

**Solución:**
```javascript
function getInitialTheme() {
  if (!browser) return 'light';
  
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {
    console.warn('localStorage not available, using system preference');
  }
  
  return getSystemTheme();
}
```

**Prioridad:** 🟡 **MEDIO** - Edge case, pero importante para resiliencia

---

### 11. **+page.js: Fetch en Server Load sin Headers**

**Ubicación:** `frontend/src/routes/+page.js` (línea 6)

**Problema:**
```javascript
export async function load({ fetch }) {
  const res = await fetch('http://backend:8080/api/v1/products');
  // No agrega headers, puede causar CORS issues
}
```

Falta:
- Headers de autorización (si lo necesita backend)
- User-Agent
- Accept headers

**Versión Mejorada:**
```javascript
const res = await fetch('http://backend:8080/api/v1/products', {
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'SvelteKit/Frontend',
  },
  signal: AbortSignal.timeout(5000), // 5s timeout
});
```

**Prioridad:** 🟡 **MEDIO** - Puede causar timeouts

---

### 12. **Checkout: Validation Ausente**

**Ubicación:** `frontend/src/routes/checkout/+page.svelte` (línea 60-70)

**Problema:**
```javascript
function handleSubmit() {
  console.log('Enviando pedido:');
  // Directamente envía sin validar
  const orderPayload = {
    customer: { email, fullName, phone, municipality },
    // ...
  };
  alert('¡Pedido (simulado) enviado!');
}
```

Faltan validaciones:
- ❌ Email válido
- ❌ Nombre no vacío
- ❌ Teléfono formato correcto
- ❌ Municipio es válido
- ❌ Carrito no está vacío

**Solución:**
```javascript
function handleSubmit() {
  // Validar
  if (!email.includes('@')) {
    alert('Email inválido');
    return;
  }
  if (!fullName.trim()) {
    alert('Nombre requerido');
    return;
  }
  // ... resto de validaciones
  
  if (currentCart.items.length === 0) {
    alert('El carrito está vacío');
    return;
  }
  
  // Enviar
  submitOrder();
}
```

**Prioridad:** 🟡 **MEDIO** - UX pobre, datos inválidos en backend

---

## 🟢 PROBLEMAS MENORES (DEUDA TÉCNICA)

### 13. **Backend go.mod: Dependency Conflict**

**Ubicación:** `backend/go.mod` (línea 59)

**Problema:**
```
gorm.io/driver/postgres should be direct
```

La dependencia aparece como `// indirect` pero debería ser directa.

**Solución:**
```bash
cd backend
go mod tidy
go get gorm.io/driver/postgres
```

**Prioridad:** 🟢 **BAJO** - Go mod warning, no afecta runtime

---

### 14. **Package.json: Versiones Muy Flexibles**

**Ubicación:** `frontend/package.json`

**Problema:**
```json
"@sveltejs/kit": "^2.0.0",  // Permite 2.x.x
"vite": "^5.0.3",           // Permite 5.x.x
"tailwindcss": "^3.4.3",    // Permite 3.x.x
```

Versiones pinned pero con `^` permite cambios menores. Mejor usar versiones exactas para reproducibilidad.

**Prioridad:** 🟢 **BAJO** - Deuda técnica de DevOps

---

### 15. **App.css: Duplicate Dark Mode Styles**

**Ubicación:** `frontend/src/app.css` (línea 20-35)

**Problema:**

Los estilos dark mode se definen en:
1. `app.css` (línea 20+)
2. `tailwind.config.cjs` (línea 39+)

Hay duplicación y posibles conflictos.

**Solución:**

Mover todo a Tailwind config (es más limpio):

```javascript
// tailwind.config.cjs
theme: {
  extend: {
    colors: {
      'dark-bg-primary': '#0A0A0F',
      // ...
    }
  }
}
```

Y eliminar los estilos duplicados de `app.css`.

**Prioridad:** 🟢 **BAJO** - Limpieza de código

---

### 16. **Missing Types File**

**Ubicación:** `frontend/src/lib/types` (NO EXISTE)

**Problema:**

En `CheckoutItem.svelte` se referencia:
```javascript
/** @type {import('$lib/types').CartItem} */
export let item;
```

Pero el archivo `$lib/types/index.d.ts` no existe. Comentario JSDoc orphaned.

**Solución:**

Crear `frontend/src/lib/types/index.d.ts`:

```typescript
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
}
```

**Prioridad:** 🟢 **BAJO** - Mejora DX pero no es bloqueador

---

### 17. **Missing API Module**

**Ubicación:** `frontend/src/lib/api/` (VACÍO)

**Problema:**

Existe el directorio pero está vacío. Los fetch calls se hacen directo en componentes.

Mejor tener una capa API centralizada:

```javascript
// frontend/src/lib/api/products.js
export async function fetchProducts() {
  const res = await fetch('/api/v1/products/');
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`/api/v1/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

// frontend/src/lib/api/orders.js
export async function createOrder(orderData) {
  const res = await fetch('/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}
```

Luego usar en componentes:
```javascript
import { fetchProducts } from '$lib/api/products.js';

onMount(async () => {
  products = await fetchProducts();
});
```

**Prioridad:** 🟢 **BAJO** - Mejora mantenibilidad pero no es crítico

---

### 18. **Missing Error Boundary Component**

**Ubicación:** `frontend/src/routes/+error.svelte` (NO EXISTE)

**Problema:**

Si ocurre un error no manejado, SvelteKit muestra la página de error default. Debería tener una página personalizada.

**Solución:**

Crear `frontend/src/routes/+error.svelte`:

```svelte
<script>
  import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center bg-bg-primary">
  <div class="text-center max-w-md">
    <h1 class="text-6xl font-black text-primary-magenta mb-4">
      {$page.status}
    </h1>
    <p class="text-2xl text-text-primary mb-6">
      {$page.error?.message || 'Oops! Algo salió mal'}
    </p>
    <a href="/" class="bg-primary-magenta text-white px-8 py-3 rounded-lg hover:shadow-magenta">
      Volver al inicio
    </a>
  </div>
</div>
```

**Prioridad:** 🟢 **BAJO** - UX polish

---

## 📋 CHECKLIST DE FIXES ORDENADO POR PRIORIDAD

### NIVEL 1: CRÍTICO (Debe corregirse YA)
- [ ] **1.** Cambiar adapter de `adapter-static` a `adapter-auto` o `adapter-node`
- [ ] **2.** Unificar formateo de moneda (GTQ vs MXN)
- [ ] **3.** Mejorar Vite proxy configuration

### NIVEL 2: ALTO (Antes de QA)
- [ ] **4.** Arreglar Tailwind CSS dark mode class application
- [ ] **5.** Corregir Header cart count binding
- [ ] **6.** Simplificar cart.store subscribe pattern
- [ ] **7.** Arreglar ProductCard gradient class

### NIVEL 3: MEDIO (Sprint actual)
- [ ] **8.** Eliminar Service Worker race condition
- [ ] **9.** Refactorizar TextInput component (DRY)
- [ ] **10.** Hacer localStorage SSR-safe
- [ ] **11.** Agregar timeout y headers en +page.js fetch
- [ ] **12.** Agregar validación en checkout form

### NIVEL 4: BAJO (Deuda técnica, backlog)
- [ ] **13.** Ejecutar `go mod tidy` en backend
- [ ] **14.** Pinear versiones en package.json
- [ ] **15.** Consolidar estilos dark mode
- [ ] **16.** Crear archivo de types
- [ ] **17.** Implementar capa API centralizada
- [ ] **18.** Crear +error.svelte página

---

## 🎯 RECOMENDACIONES FINALES

### Estrategia de Corrección:

**Semana 1:** Arreglar bloqueadores (Adapter, moneda, proxy)  
**Semana 2:** Corregir bugs de alto impacto (dark mode, cart, validación)  
**Semana 3:** Limpiar deuda técnica (types, API layer, error boundary)

### Testing Recomendado:

```bash
# 1. Verificar compilación
npm run build

# 2. Ejecutar en preview (simula producción)
npm run preview

# 3. Revisar console (no warnings)
# 4. Verificar en navegador:
#    - Hero page carga
#    - Busca funciona
#    - Agrega productos al carrito
#    - Checkout valida
#    - Dark mode cambia colores
#    - Responsive en mobile
```

### Monitoreo:

Una vez arreglado, monitorear:
- ❌ Errores de consola en producción
- ❌ Rendimiento de carga inicial
- ❌ Comportamiento del carrito
- ❌ Conversiones de checkout

---

## 📞 REFERENCIAS

- **SvelteKit Adapters:** https://kit.svelte.dev/docs/adapters
- **Vite Proxy:** https://vitejs.dev/config/server-options.html#server-proxy
- **Tailwind Dark Mode:** https://tailwindcss.com/docs/dark-mode
- **Svelte Stores:** https://svelte.dev/docs/svelte-store

---

**Auditoría Completada por:** GitHub Copilot  
**Fecha:** Octubre 21, 2025  
**Próxima Revisión:** Después de aplicar fixes de Nivel 1

