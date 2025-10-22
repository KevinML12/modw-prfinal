# ARQUITECTURA E2E TESTS - SVELTE-AWARE

```
moda-organica/
├── frontend/
│   ├── tests/
│   │   ├── helpers/
│   │   │   └── svelte-helpers.js ⭐ NUEVO
│   │   │       ├── waitForSvelteKitHydration()
│   │   │       ├── clearSvelteStores()
│   │   │       ├── waitForSvelteTransition()
│   │   │       ├── waitForStoreUpdate()
│   │   │       ├── triggerSvelteReactivity()
│   │   │       ├── getCartFromStore()
│   │   │       ├── waitForNavigationComplete()
│   │   │       ├── initializeSvelteTestEnvironment()
│   │   │       └── DEFAULT_SVELTE_TIMEOUTS
│   │   │
│   │   ├── page-objects.js ⭐ REFACTORIZADO
│   │   │   ├── navigateToHome()
│   │   │   ├── navigateToProduct()
│   │   │   ├── searchProduct()
│   │   │   ├── addToCart() ← CRÍTICO
│   │   │   ├── openCart()
│   │   │   ├── getCartCount()
│   │   │   ├── getCartItems()
│   │   │   ├── getTotalPrice()
│   │   │   ├── removeFromCart() ← CRÍTICO
│   │   │   ├── clearCart()
│   │   │   ├── fillCheckoutForm()
│   │   │   ├── submitOrder()
│   │   │   ├── waitForCartUpdate()
│   │   │   ├── verifyProductsLoaded()
│   │   │   ├── verifyCurrencyIsGTQ()
│   │   │   └── waitForCartSync() ← NUEVO
│   │   │
│   │   ├── test-data.js (SIN CAMBIOS)
│   │   │   ├── BASE_URLS
│   │   │   ├── TIMEOUTS
│   │   │   ├── MOCK_USER
│   │   │   ├── TEST_PRODUCT_IDS
│   │   │   ├── SEARCH_QUERIES
│   │   │   ├── SELECTORS
│   │   │   └── Helper functions
│   │   │
│   │   └── e2e/
│   │       ├── home.spec.ts ⭐ NUEVO
│   │       │   ├── Carga de página principal
│   │       │   ├── Encabezado visible
│   │       │   ├── Catálogo de productos
│   │       │   ├── Campo de búsqueda
│   │       │   ├── Búsqueda semántica
│   │       │   ├── Navegación a detalle
│   │       │   └── Ícono del carrito
│   │       ├── products.spec.ts (EXISTENTE)
│   │       │   ├── Cargar productos
│   │       │   ├── Mostrar info
│   │       │   ├── Agregar al carrito
│   │       │   ├── Actualizar badge
│   │       │   └── Moneda GTQ
│   │       ├── cart.spec.ts (EXISTENTE + REFACTORIZADO)
│   │       │   ├── Carrito vacío
│   │       │   ├── Actualizar contador
│   │       │   ├── Múltiples productos
│   │       │   ├── Persistencia
│   │       │   ├── Detalles del carrito
│   │       │   ├── Cálculo total
│   │       │   └── Cantidades
│   │       └── checkout.spec.ts (EXISTENTE + REFACTORIZADO)
│   │           ├── Navegar checkout
│   │           ├── Validar formulario vacío
│   │           ├── Validar email
│   │           ├── Aceptar formulario válido
│   │           ├── Mostrar resumen
│   │           ├── Moneda GTQ
│   │           └── Selección municipio
│   │
│   ├── playwright.config.ts (EXISTENTE)
│   │   ├── Base URL: http://frontend:5173
│   │   ├── Workers: 1 (sequential)
│   │   ├── Retries: 2
│   │   └── Timeouts: Docker-optimized
│   │
│   └── package.json (EXISTENTE)
│       ├── test:e2e
│       ├── test:e2e:ui
│       ├── test:e2e:headed
│       ├── test:e2e:debug
│       ├── test:e2e:report
│       └── test:e2e:codegen
│
├── docker-compose.yml (EXISTENTE)
│   └── playwright service (profile: test)
│       ├── Image: mcr.microsoft.com/playwright:v1.40.0-focal
│       ├── Depends: frontend (5173), backend (8080)
│       ├── Volumes: playwright-report, playwright-results
│       └── Env: BASE_URL, API_URL
│
├── REFACTORING_COMPLETE.md ⭐ DOCUMENTACIÓN
├── REFACTORING_SUMMARY.md ⭐ DOCUMENTACIÓN
└── validate-tests.sh ⭐ HERRAMIENTA
```

---

## 📐 Diagrama de Flujo: addToCart() REFACTORIZADO

```
┌─────────────────────────────────────────────────────────────┐
│ TEST: await addToCart(page, quantity)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 1️⃣ PRE-STATE: Obtener count ANTES                            │
│ const cartBefore = await getCartFromStore(page)             │
│ const itemsCountBefore = cartBefore.items.length            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2️⃣ UI: Ajustar cantidad si quantity > 1                     │
│ await quantityInput.fill(String(quantity))                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3️⃣ MUTATE: Click en add-to-cart                             │
│ await addButton.click()                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4️⃣ ⭐ CRÍTICO: Esperar que el STORE se actualice            │
│ await waitForStoreUpdate(page, 'cart', (cart) => {          │
│   return cart.items.length === itemsCountBefore + quantity  │
│ }, 10000)                                                   │
│                                                             │
│ Internamente: page.waitForFunction con polling 100ms        │
│ Lee: localStorage.getItem('cart')                           │
│ Ejecuta: checkFunction(cart)                                │
│ Verifica: cart.items.length cambió correctamente            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5️⃣ REACTIVITY: Disparar tick de Svelte                      │
│ await triggerSvelteReactivity(page)                         │
│ (Promise + setTimeout para microtask)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6️⃣ VERIFY UI: Esperar que el badge se actualice            │
│ await page.waitForFunction(() => {                          │
│   const count = document.querySelector(badge).textContent   │
│   return count === itemsCountBefore + quantity              │
│ }, 5000)                                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 7️⃣ TRANSITION: Esperar notificación (si existe)             │
│ await waitForSvelteTransition(notification, {               │
│   state: 'visible',                                         │
│   timeout: 5000                                             │
│ })                                                          │
│                                                             │
│ Espera fade-out típicamente 3-4 segundos                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ TEST PASA: Carrito actualizado (store + UI sincronizados)│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔀 Comparativa: ANTES vs DESPUÉS

### ANTES (Sin Svelte-awareness)

```javascript
// ❌ FRÁGIL: No verifica store, confía solo en UI
async function addToCart(page, quantity = 1) {
  const addButton = page.locator(SELECTORS.addToCartBtn);
  await addButton.click({ timeout: TIMEOUTS.SHORT });
  
  // Espera ciega que el badge se vea actualizado
  await page.waitForFunction(
    () => {
      const badge = document.querySelector('[data-testid="cart-count"]');
      return badge && parseInt(badge.textContent, 10) > 0;
    },
    { timeout: TIMEOUTS.MEDIUM }
  );
  
  // ❌ PROBLEMAS:
  // - No verifica que localStorage se actualizó
  // - No maneja reactividad de Svelte
  // - Puede fallar con latencia variable de Docker
  // - No espera transiciones de Svelte
  // - Falsos negativos en tests
}
```

### DESPUÉS (Svelte-aware)

```javascript
// ✅ ROBUSTO: Verifica store, UI, reactividad y transiciones
async function addToCart(page, quantity = 1) {
  // Obtener estado ANTES
  const cartBefore = await getCartFromStore(page);
  const itemsCountBefore = cartBefore.items.length;

  // Ajustar cantidad
  if (quantity > 1) {
    const quantityInput = page.locator(SELECTORS.quantityInput);
    await quantityInput.fill(String(quantity));
  }

  // Hacer click
  const addButton = page.locator(SELECTORS.addToCartButton);
  await addButton.click();

  // ✅ Esperar que el STORE se actualice (polling inteligente)
  await waitForStoreUpdate(
    page,
    'cart',
    (cart) => cart.items && cart.items.length === itemsCountBefore + quantity,
    DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
  );

  // ✅ Disparar reactividad de Svelte
  await triggerSvelteReactivity(page);

  // ✅ Verificar que la UI refleja cambio
  await page.waitForFunction(() => {
    const badge = document.querySelector(SELECTORS.cartBadge);
    if (!badge) return false;
    const count = parseInt(badge.textContent || '0');
    return count === itemsCountBefore + quantity;
  }, { timeout: TIMEOUTS.MEDIUM });

  // ✅ Esperar transición de notificación si existe
  try {
    const notification = page.locator('[data-testid="add-to-cart-notification"]');
    if (await notification.isVisible()) {
      await waitForSvelteTransition(page, '[data-testid="add-to-cart-notification"]', {
        state: 'visible',
        timeout: TIMEOUTS.SHORT
      });
      await page.waitForTimeout(3500); // Esperar fade-out
    }
  } catch {
    // Sin notificación, sin problema
  }
  
  // ✅ BENEFICIOS:
  // + Verifica localStorage (source of truth)
  // + Maneja reactividad correctamente
  // + Robusto con latencia variable
  // + Espera transiciones de Svelte
  // + Detecta bugs de sincronización
}
```

---

## 📊 Matriz de Cobertura E2E

| Flujo | Test | Helper | Svelte-Aware |
|-------|------|--------|-------------|
| 🏠 Home | home.spec.ts | navigateToHome | ✅ Hydration |
| 📦 Productos | products.spec.ts | navigateToProduct | ✅ Transiciones |
| 🛒 Carrito | cart.spec.ts | addToCart, removeFromCart | ✅ Store sync |
| 💳 Checkout | checkout.spec.ts | fillCheckoutForm | ✅ Reactivity |
| 🔍 Búsqueda | home.spec.ts | searchProduct | ✅ Networkidle |

---

## 🎛️ Timeouts Calibrados para Docker

```javascript
DEFAULT_SVELTE_TIMEOUTS = {
  HYDRATION: 15000,      // Primera carga puede tardar
  TRANSITION: 5000,      // Transiciones CSS/Svelte
  STORE_UPDATE: 10000,   // Polling sobre localStorage
  NAVIGATION: 8000       // Navegación client-side
}
```

Estos timeouts son:
- ✅ Suficientemente largos para Docker con latencia
- ✅ No tan largos como para ocultar bugs reales
- ✅ Basados en observación empírica del sistema

---

## 🧪 Test Execution Flow

```
┌─────────────────────────────────────────────────┐
│ docker-compose exec playwright pnpm test:e2e   │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ Playwright lee playwright.config.ts             │
│ - baseURL: http://frontend:5173                 │
│ - workers: 1 (sequential)                       │
│ - retries: 2                                    │
│ - timeout per test: 45000                       │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ Para cada .spec.ts en e2e/:                     │
│ - home.spec.ts (7 tests)                        │
│ - products.spec.ts (5 tests)                    │
│ - cart.spec.ts (7 tests)                        │
│ - checkout.spec.ts (7 tests)                    │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ Para cada test:                                 │
│ 1. page.goto('/') ← Base URL automático         │
│ 2. Ejecutar test body                           │
│ 3. Cleanup + reset                              │
│ 4. Si falla, retry (max 2 times)                │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ Resultados:                                     │
│ - playwright-report/ (HTML)                     │
│ - playwright-results/ (JSON)                    │
│ - Terminal: passed/failed summary               │
└─────────────────────────────────────────────────┘
```

---

## 📝 Total de Tests E2E

- **home.spec.ts**: 7 tests
- **products.spec.ts**: 5 tests (existente)
- **cart.spec.ts**: 7 tests (existente)
- **checkout.spec.ts**: 7 tests (existente)

**Total: 26 tests E2E** cubriendo todos los flujos críticos

---

## 🎓 Conceptos Clave Implementados

1. **Page Object Model** - Abstracción de selectores y patrones
2. **Svelte-aware Testing** - Manejo de hydration, reactividad, transiciones
3. **Docker Optimization** - Timeouts y waits calibrados para latencia variable
4. **Store-driven Tests** - Verifica datos, no solo UI
5. **Polling Pattern** - Polling inteligente en lugar de esperas ciegas
6. **Transition Handling** - CSS transition detection y waiting

---

Generated with ❤️ by GitHub Copilot | Moda Orgánica E2E Testing Infrastructure
