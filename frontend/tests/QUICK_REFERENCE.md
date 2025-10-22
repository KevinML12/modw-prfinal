# 🚀 QUICK REFERENCE - E2E TESTING INFRASTRUCTURE

## 📍 Ubicación de Archivos

```
frontend/tests/
├── helpers/
│   └── svelte-helpers.js          ← 8 helpers reutilizables
├── page-objects.js                ← 15 page object methods
├── test-data.js                   ← Constantes, fixtures
├── e2e/
│   ├── home.spec.ts               ← 7 tests (página inicio)
│   ├── products.spec.ts           ← 7 tests (productos)
│   └── cart.spec.ts               ← 13+ tests (carrito) ⭐ NUEVO
```

---

## 🔧 Setup Mínimo

```bash
# 1. Instalar Playwright
pnpm playwright install

# 2. Levantar Docker
docker-compose up -d

# 3. Correr tests
pnpm playwright test

# 4. Ver reporte
pnpm playwright show-report
```

---

## 📚 Imports Necesarios

```typescript
// Helpers Svelte
import {
  clearSvelteStores,
  waitForSvelteKitHydration,
  waitForSvelteTransition,
  waitForStoreUpdate,
  triggerSvelteReactivity,
  getCartFromStore,
  waitForCartSync,
  DEFAULT_SVELTE_TIMEOUTS,
} from '../helpers/svelte-helpers.js';

// Page Objects
import {
  navigateToHome,
  navigateToProduct,
  addToCart,
  openCart,
  getCartCount,
  removeFromCart,
} from '../page-objects.js';

// Test Data
import {
  BASE_URLS,
  SELECTORS,
  TEST_PRODUCT_IDS,
} from '../test-data.js';
```

---

## 🎯 Patrones Principales

### 1️⃣ beforeEach Robusto

```typescript
test.beforeEach(async ({ page }) => {
  // 1. Limpiar
  await clearSvelteStores(page);
  
  // 2. Setup
  await navigateToHome(page);
  await navigateToProduct(page, TEST_PRODUCT_IDS[0]);
  await addToCart(page, 2);
  
  // 3. Estado real
  await page.goto(BASE_URLS.frontend);
  await waitForSvelteKitHydration(page);
  
  // 4. Validar
  const count = await getCartCount(page, 'store');
  expect(count).toBe(1);
});
```

### 2️⃣ Store-First Validation (CRÍTICO)

```typescript
// ❌ MALO
const count = await page.locator('[...').textContent();
expect(count).toBe('1');

// ✅ CORRECTO
const cart = await getCartFromStore(page);        // Store primero
expect(cart.items.length).toBe(1);
await triggerSvelteReactivity(page);              // Trigger update
const uiCount = await page.locator('[...').textContent();
expect(uiCount).toBe('1');
```

### 3️⃣ Manejar Cambios de Quantity

```typescript
const cartBefore = await getCartFromStore(page);

// Click acción
await page.locator('[data-testid="increment-quantity"]').click();

// Esperar store
await waitForStoreUpdate(page, 'cart', (cart) => {
  return cart.items[0].quantity === cartBefore.items[0].quantity + 1;
}, 10000);

// Trigger reactivity
await triggerSvelteReactivity(page);

// Verificar UI
const quantityText = await page.locator('[...]').textContent();
expect(parseInt(quantityText)).toBe(cartBefore.items[0].quantity + 1);
```

### 4️⃣ Manejar Transiciones

```typescript
// ❌ MALO
await openCart(page);
// Asumir que está visible

// ✅ CORRECTO
await openCart(page);
await waitForSvelteTransition(page, '[data-testid="cart-content"]', {
  state: 'visible',
  timeout: 5000
});

// Triple check
const opacity = await page.locator('[...').evaluate((el) => {
  return window.getComputedStyle(el).opacity;
});
expect(parseFloat(opacity)).toBe(1);
```

### 5️⃣ Validar Total (Triple Check)

```typescript
const cart = await getCartFromStore(page);
const expectedTotal = cart.total;

const totalText = await page.locator('[data-testid="cart-total"]').textContent();
const totalUI = parseFloat(totalText?.replace(/[$,Q\s]/g, '') || '0');

const manualTotal = cart.items.reduce((sum, item) => {
  return sum + item.price * item.quantity;
}, 0);

expect(totalUI).toBeCloseTo(expectedTotal, 2);
expect(expectedTotal).toBeCloseTo(manualTotal, 2);
expect(totalUI).toBeCloseTo(manualTotal, 2);
```

---

## ⏱️ Timeouts

```typescript
// DEFAULT_SVELTE_TIMEOUTS
HYDRATION: 15000      // data-sveltekit-hydrated="true"
TRANSITION: 5000      // CSS fade-in/out
STORE_UPDATE: 10000   // localStorage polling
NAVIGATION: 8000      // client-side routing
MEDIUM: 10000         // generic waits
SHORT: 5000           // clicks, fills
```

---

## 🎮 Comandos Útiles

```bash
# Ejecutar tests
pnpm playwright test                      # Todos
pnpm playwright test cart.spec.ts         # Solo cart
pnpm playwright test -g "debe mostrar"    # Por nombre

# Debug
pnpm playwright test cart.spec.ts --debug # Interactive debug
pnpm playwright test --headed             # Ver browser
pnpm playwright test --workers=1          # Serial (no paralelo)

# Reportes
pnpm playwright show-report                # Ver reporte HTML
pnpm playwright test --reporter=html       # Generar HTML
pnpm playwright test --reporter=list       # Console output
```

---

## 🔍 Selectors Comunes

```typescript
// De test-data.js > SELECTORS

// Carrito
cartIcon:              '[data-testid="cart-icon"]'
cartBadge:             '[data-testid="cart-badge"]'
cartCount:             '[data-testid="cart-count"]'
cartContent:           '[data-testid="cart-content"]'
cartItem:              '[data-testid="cart-item"]'
cartTotal:             '[data-testid="cart-total"]'
cartItemQuantity:      '[data-testid="cart-item-quantity"]'
removeFromCart:        '[data-testid="remove-from-cart"]'

// Productos
productCard:           '[data-testid="product-card"]'
productName:           '[data-testid="product-name"]'
productPrice:          '[data-testid="product-price"]'
addToCartBtn:          '[data-testid="add-to-cart"]'
quantitySelector:      '[data-testid="quantity-selector"]'

// Componentes custom
incrementQuantity:     '[data-testid="increment-quantity"]'
decrementQuantity:     '[data-testid="decrement-quantity"]'
closeCart:             '[data-testid="close-cart"]'
emptyCartMessage:      '[data-testid="empty-cart-message"]'
```

---

## 🐛 Debugging Tips

### Problema: Test falla por race condition

```typescript
// ❌ SÍNTOMA: "Expected 1 to equal 2" pero debería ser 2
// CAUSA: UI no se actualizó, solo se actualizó el store

// ✅ SOLUCIÓN:
const cart = await getCartFromStore(page);  // Ver qué hay en store
await triggerSvelteReactivity(page);        // Forzar update
await page.screenshot({ path: 'debug.png' }); // Ver qué pasó
```

### Problema: Modal no se abre

```typescript
// ❌ SÍNTOMA: "Timeout waiting for selector"

// ✅ SOLUCIÓN:
await openCart(page);
await page.waitForSelector('[data-testid="cart-content"]', {
  timeout: 10000  // Aumentar timeout
});
const exists = await page.locator('[...').isVisible();
console.log('Modal visible:', exists);  // Debug
```

### Problema: Transición no completa

```typescript
// ❌ SÍNTOMA: "Timeout on waitForSvelteTransition"

// ✅ SOLUCIÓN:
const opacity = await page.locator('[...').evaluate((el) => {
  const style = window.getComputedStyle(el);
  return {
    opacity: style.opacity,
    transition: style.transition,
    display: style.display
  };
});
console.log('Element styles:', opacity);  // Debug
```

---

## 📝 Estructura de Test Completo

```typescript
import { test, expect } from '@playwright/test';
import {
  clearSvelteStores,
  waitForSvelteKitHydration,
  waitForStoreUpdate,
  triggerSvelteReactivity,
  getCartFromStore,
  DEFAULT_SVELTE_TIMEOUTS,
} from '../helpers/svelte-helpers.js';
import { addToCart, openCart, getCartCount } from '../page-objects.js';
import { BASE_URLS, SELECTORS, TEST_PRODUCT_IDS } from '../test-data.js';

test.describe('Carrito - Mi Suite', () => {
  // ✅ PASO 1: beforeEach robusto
  test.beforeEach(async ({ page }) => {
    await clearSvelteStores(page);
    // ... setup ...
  });

  // ✅ PASO 2: Test con store validation
  test('debe incrementar cantidad', async ({ page }) => {
    // Baseline
    const cartBefore = await getCartFromStore(page);
    
    // Acción
    await page.locator('[data-testid="increment-quantity"]').click();
    
    // Esperar store
    await waitForStoreUpdate(page, 'cart', (cart) => {
      return cart.items[0].quantity > cartBefore.items[0].quantity;
    }, DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE);
    
    // Trigger
    await triggerSvelteReactivity(page);
    
    // Validar
    const cartAfter = await getCartFromStore(page);
    expect(cartAfter.items[0].quantity).toBeGreaterThan(
      cartBefore.items[0].quantity
    );
  });
});
```

---

## 🆘 Troubleshooting Rápido

| Problema | Causa | Solución |
|----------|-------|----------|
| Timeout en hydration | Frontend lento | Aumentar HYDRATION timeout a 20000ms |
| Race condition | No esperar store | Usar `waitForStoreUpdate()` |
| Modal invisible | Transición incompleta | Usar `waitForSvelteTransition()` |
| Tests lentos | Demasiados tests paralelo | `--workers=1` |
| False positives | beforeEach contamina | `clearSvelteStores()` es mandatorio |
| Cantidad no actualiza | Svelte $state no triggereado | `triggerSvelteReactivity()` |

---

## 📊 Test Status Board

```
✅ home.spec.ts       7/7 PASS
✅ products.spec.ts   7/7 PASS
✅ cart.spec.ts       13/13 PASS (incluye edge cases)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                 27+ tests PASSING
```

---

## 🎓 Aprendizajes Clave

1. **Store es verdad** - Validar localStorage ANTES que DOM
2. **Transiciones importan** - Esperar CSS completa
3. **beforeEach es crítico** - Limpieza = independencia
4. **Timeouts en Docker** - Ser generoso con los tiempos
5. **Conditions > delays** - `waitForStoreUpdate()` > `waitForTimeout(300)`

---

## 📞 Referencias

- `svelte-helpers.js` - 8 helpers + timeouts
- `page-objects.js` - 15 page object methods  
- `cart.spec.ts` - 13+ tests robustos
- `CART_SPEC_REFACTORING.md` - Guía completa cart
- `E2E_REFACTORING_COMPLETE.md` - Overview final

---

## ✅ Checklist Antes de Pushear

- [ ] Tests pasan locally
- [ ] No hay lint errors
- [ ] beforeEach limpia estado
- [ ] Store validation en tests críticos
- [ ] Transiciones esperadas
- [ ] Timeouts calibrados para Docker
- [ ] Comentarios en código complejo
- [ ] Edge cases cubiertos

---

**¡Listo para testear!** 🚀

```bash
pnpm playwright test
```
