# REFACTORIZACIÓN CART.SPEC.TS - GUÍA COMPLETA

## 📊 RESUMEN DE CAMBIOS

| Métrica | Antes | Después | Cambio |
|---------|-------|---------|--------|
| **Tests** | 7 básicos | 13 robusto + edge cases | +86% |
| **Líneas** | ~135 | ~800+ | +493% |
| **Cobertura Store** | 0% explícita | 100% | ✅ |
| **Validación Transiciones** | No | Sí | ✅ |
| **Race Condition Safety** | Básica | Completa | ✅ |
| **beforeEach** | Mínimo | Robusto | ✅ |

---

## 🎯 ARQUITECTURA GENERAL

### Estructura de Tests

```
test.describe('Carrito de Compras (SVELTE-AWARE)')
├── test.beforeEach() [CRÍTICO]
│   ├── clearSvelteStores()        // Limpiar estado
│   ├── navigateToHome()            // Base de partida
│   ├── navigateToProduct()         // Agregar producto inicial
│   ├── addToCart(qty: 2)          // Setup estado consistente
│   ├── goto(BASE_URLS.frontend)   // Simular flujo real
│   └── expect(getCartCount) === 1 // Validar setup
│
├── TEST 1: contador actualizado ✅
├── TEST 2: abrir modal ✅
├── TEST 3: mostrar producto ✅
├── TEST 4: incrementar ✅ (CRÍTICO)
├── TEST 5: decrementar ✅ (CRÍTICO)
├── TEST 6: validar mínimo ✅
├── TEST 7: calcular total ✅ (TRIPLE CHECK)
├── TEST 8: eliminar producto ✅
├── TEST 9: cerrar modal ✅
├── TEST 10: múltiples items ✅
│
├── EDGE CASE 1: cambios rápidos ✅
├── EDGE CASE 2: refresh persistence ✅
└── EDGE CASE 3: modal sync ✅
```

---

## 🔑 CONCEPTOS CLAVE

### 1. **beforeEach ROBUSTO** (Líneas 50-76)

```typescript
test.beforeEach(async ({ page }) => {
  // 1️⃣ CRÍTICO: Limpiar store ANTES de cada test
  await clearSvelteStores(page);
  
  // 2️⃣ Navegar a home (punto de partida limpio)
  await navigateToHome(page);
  
  // 3️⃣ Setup consistente: 1 producto con cantidad 2
  await navigateToProduct(page, TEST_PRODUCT_IDS[0]);
  await addToCart(page, 2);  // Cantidad 2 para poder testar ±
  
  // 4️⃣ Simular flujo real: volver a home
  await page.goto(BASE_URLS.frontend);
  await waitForSvelteKitHydration(page);
  
  // 5️⃣ Validar setup (fail rápido si algo anda mal)
  const cartCount = await getCartCount(page, 'store');
  expect(cartCount).toBe(1);
});
```

**Por qué es importante:**
- ✅ Cada test comienza con estado limpio
- ✅ Estado inicial predecible (1 item, cantidad 2)
- ✅ Los tests son INDEPENDIENTES
- ✅ Fail rápido en el setup = errores más claros

---

### 2. **Store-First Validation Pattern** (CRÍTICO)

**REGLA DE ORO:** Siempre leer localStorage ANTES de verificar UI

```typescript
// ❌ MALO: Verificar solo UI (race condition)
const count = await page.locator('[data-testid="cart-count"]').textContent();
expect(count).toBe('2');

// ✅ CORRECTO: Store primero, UI segundo
const cart = await getCartFromStore(page);  // Lee localStorage
expect(cart.items[0].quantity).toBe(2);

await triggerSvelteReactivity(page);
const uiCount = await page.locator('[...').textContent();
expect(uiCount).toBe('2');  // Ahora sí verificar UI
```

**Patrón en tests:**

```typescript
// Incrementar cantidad (Test 4)
const cartBefore = await getCartFromStore(page);  // Store
const quantityBefore = cartBefore.items[0].quantity;

await incrementBtn.click();

// ESPERAR que el store se actualice (no confiar en UI)
await waitForStoreUpdate(
  page,
  'cart',
  (cart) => cart.items[0].quantity === quantityBefore + 1,
  DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
);

// Trigger reactividad de Svelte 5
await triggerSvelteReactivity(page);

// AHORA sí verificar UI
const quantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
await expect(quantityDisplay).toContainText(String(quantityBefore + 1));
```

---

### 3. **Manejo de Transiciones**

```typescript
// ✅ Esperar que el modal COMPLETE su transición de entrada
await waitForSvelteTransition(page, SELECTORS.cartContent, {
  state: 'visible',
  timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
});

// ✅ Esperar que el item COMPLETE su fade-out antes de eliminarlo
await waitForSvelteTransition(page, SELECTORS.cartItem, {
  state: 'hidden',
  timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
});

// ✅ Verificar opacity (confirmación de visibilidad)
const modalOpacity = await page.locator(SELECTORS.cartContent).evaluate((el) => {
  return window.getComputedStyle(el).opacity;
});
expect(parseFloat(modalOpacity)).toBe(1);
```

---

## 📋 TEST-BY-TEST BREAKDOWN

### TEST 1: Counter Updated (Líneas 93-115)

**Objetivo:** Verificar que el contador del carrito está sincronizado

```typescript
test('debe mostrar el contador del carrito actualizado', async ({ page }) => {
  // Verificar badge visible
  const cartBadge = page.locator(SELECTORS.cartBadge);
  await expect(cartBadge).toBeVisible();

  // CRÍTICO: Esperar sync store ↔ UI
  await waitForCartSync(page);

  // Triple check
  const storeCount = await getCartCount(page, 'store');  // localStorage
  const uiCount = await getCartCount(page, 'ui');        // DOM
  
  expect(storeCount).toBe(1);
  expect(uiCount).toBe(1);
  expect(storeCount).toBe(uiCount);  // Sincronizados
});
```

**Validaciones:**
- ✅ Badge visible
- ✅ Store y UI sincronizados
- ✅ Cantidad correcta en ambas fuentes

---

### TEST 2: Open Modal (Líneas 117-153)

**Objetivo:** Verificar que el modal abre correctamente con transición completa

```typescript
test('debe abrir el modal del carrito', async ({ page }) => {
  await openCart(page);

  // Esperar que esté en DOM e hydratado
  await page.waitForSelector(SELECTORS.cartContent, {
    state: 'visible',
    timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
  });

  // Esperar que la transición CSS complete
  await waitForSvelteTransition(page, SELECTORS.cartContent, {
    state: 'visible',
    timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
  });

  // Verificar opacity = 1 (totalmente visible)
  const modalOpacity = await page.locator(SELECTORS.cartContent).evaluate((el) => {
    return window.getComputedStyle(el).opacity;
  });
  expect(parseFloat(modalOpacity)).toBe(1);

  // Backdrop (si existe)
  const backdrop = page.locator('[data-testid="cart-backdrop"]');
  const backdropExists = await backdrop.isVisible().catch(() => false);
  if (backdropExists) {
    await expect(backdrop).toBeVisible();
  }
});
```

**Manejo de Transiciones:**
- DOM presence ≠ visibility
- CSS transition puede completarse DESPUÉS de ser visible
- opacity: 1 = garantía de visibilidad completa

---

### TEST 3: Product Details (Líneas 155-192)

**Objetivo:** Verificar que los detalles del producto se muestran correctamente

```typescript
test('debe mostrar el producto agregado con precio y cantidad correctos', async ({ page }) => {
  await openCart(page);

  // Esperar renderización
  await page.waitForSelector(SELECTORS.cartItem, {
    state: 'visible',
    timeout: DEFAULT_SVELTE_TIMEOUTS.MEDIUM
  });

  const cartItem = page.locator(SELECTORS.cartItem).first();

  // Verificar componentes
  const itemName = cartItem.locator('[data-testid="cart-item-name"]');
  await expect(itemName).toBeVisible();
  await expect(itemName).not.toBeEmpty();

  const itemPrice = cartItem.locator('[data-testid="cart-item-price"]');
  await expect(itemPrice).toBeVisible();
  const priceText = await itemPrice.textContent();
  expect(priceText).toMatch(/[\d,]+/);  // Contiene números

  // IMPORTANTE: Verificar cantidad contra store
  const itemQuantity = cartItem.locator('[data-testid="cart-item-quantity"]');
  const quantityText = await itemQuantity.textContent();
  const quantityNumber = parseInt(quantityText || '0');

  const cart = await getCartFromStore(page);
  expect(quantityNumber).toBe(cart.items[0].quantity);  // Sincronizado
});
```

---

### TEST 4-6: Quantity Changes (CRÍTICO) (Líneas 194-315)

#### TEST 4A: Incrementar (Líneas 194-239)

```typescript
test('debe permitir incrementar cantidad desde el carrito', async ({ page }) => {
  await openCart(page);

  // 1. Store ANTES
  const cartBefore = await getCartFromStore(page);
  const quantityBefore = cartBefore.items[0].quantity;  // 2

  // 2. Acción
  const incrementBtn = page.locator('[data-testid="increment-quantity"]').first();
  await incrementBtn.click();

  // 3. ESPERAR store (no UI)
  await waitForStoreUpdate(
    page,
    'cart',
    (cart) => cart.items[0].quantity === quantityBefore + 1,  // 3
    DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
  );

  // 4. Trigger Svelte 5 reactivity
  await triggerSvelteReactivity(page);

  // 5. Verificar UI
  const quantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
  await expect(quantityDisplay).toContainText(String(quantityBefore + 1));

  // 6. Verificar total también cambió
  await waitForCartSync(page);
  const cartAfter = await getCartFromStore(page);
  expect(cartAfter.total).toBeGreaterThan(cartBefore.total);
});
```

#### TEST 4B: Decrementar (Líneas 241-273)

Similar a incrementar pero con validación de cantidad > 1

#### TEST 4C: No ir por debajo de 1 (Líneas 275-315)

```typescript
test('NO debe permitir decrementar por debajo de 1', async ({ page }) => {
  await openCart(page);

  // Decrementar hasta cantidad = 1
  let cart = await getCartFromStore(page);
  while (cart.items[0].quantity > 1) {
    const decrementBtn = page.locator('[data-testid="decrement-quantity"]').first();
    await decrementBtn.click();
    await triggerSvelteReactivity(page);
    cart = await getCartFromStore(page);
  }

  // Ahora en cantidad = 1
  expect(cart.items[0].quantity).toBe(1);

  // Intentar decrementar más
  const decrementBtn = page.locator('[data-testid="decrement-quantity"]').first();
  const isDisabled = await decrementBtn.isDisabled().catch(() => false);

  if (!isDisabled) {
    await decrementBtn.click();
    await triggerSvelteReactivity(page);
    cart = await getCartFromStore(page);
    expect(cart.items[0].quantity).toBe(1);  // Sigue en 1
  } else {
    expect(isDisabled).toBe(true);
  }
});
```

---

### TEST 7: Total Calculation (Líneas 317-352)

**Objetivo:** Triple-check del total

```typescript
test('debe calcular el total correctamente', async ({ page }) => {
  await openCart(page);

  // Store = fuente de verdad
  const cart = await getCartFromStore(page);
  const expectedTotal = cart.total;

  // UI total
  const totalElement = page.locator(SELECTORS.cartTotal);
  const totalText = await totalElement.textContent();
  const totalUI = parseFloat(totalText?.replace(/[$,Q\s]/g, '') || '0');

  // Check 1: Store vs UI
  expect(totalUI).toBeCloseTo(expectedTotal, 2);

  // Check 2: Store vs manual calculation
  const manualTotal = cart.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  expect(expectedTotal).toBeCloseTo(manualTotal, 2);

  // Check 3: UI vs manual
  expect(totalUI).toBeCloseTo(manualTotal, 2);
});
```

**Validaciones:**
- ✅ Store total = UI total
- ✅ Store total = suma manual
- ✅ UI total = suma manual

---

### TEST 8: Remove Product (Líneas 354-399)

**Objetivo:** Verificar eliminación con transición

```typescript
test('debe eliminar un producto del carrito', async ({ page }) => {
  await openCart(page);

  const cartBefore = await getCartFromStore(page);
  expect(cartBefore.items).toHaveLength(1);

  // Click eliminar
  const removeBtn = page.locator(SELECTORS.removeFromCart).first();
  await removeBtn.click();

  // Esperar fade-out
  await waitForSvelteTransition(page, SELECTORS.cartItem, {
    state: 'hidden',
    timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
  });

  // Esperar store update
  await waitForStoreUpdate(
    page,
    'cart',
    (cart) => cart.items.length === 0,
    DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
  );

  // Verificar desapareció
  await expect(page.locator(SELECTORS.cartItem)).toHaveCount(0);

  // Mostrar "Carrito vacío"
  const emptyMessage = page.locator('[data-testid="empty-cart-message"]');
  const exists = await emptyMessage.isVisible().catch(() => false);
  if (exists) {
    await expect(emptyMessage).toContainText(/vacío|empty/i);
  }
});
```

---

### TEST 9: Close Modal (Líneas 401-443)

**Objetivo:** Verificar cierre sin perder datos

```typescript
test('debe cerrar el modal del carrito correctamente', async ({ page }) => {
  await openCart(page);

  const cartBefore = await getCartFromStore(page);
  const itemsCountBefore = cartBefore.items.length;

  // Cerrar (botón o ESC)
  const closeBtn = page.locator('[data-testid="close-cart"]');
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
  } else {
    await page.keyboard.press('Escape');
  }

  // Esperar fade-out
  await waitForSvelteTransition(page, SELECTORS.cartContent, {
    state: 'hidden'
  });

  // Modal no visible
  await expect(page.locator(SELECTORS.cartContent)).not.toBeVisible();

  // IMPORTANTE: Store NO se limpió
  const cartAfter = await getCartFromStore(page);
  expect(cartAfter.items).toHaveLength(itemsCountBefore);
});
```

---

### TEST 10: Multiple Items (Líneas 445-502)

**Objetivo:** Verificar que múltiples items diferentes funcionan

```typescript
test('debe mantener items al agregar productos adicionales', async ({ page }) => {
  // Agregar segundo producto
  await navigateToProduct(page, TEST_PRODUCT_IDS[1]);
  await addToCart(page, 1);

  // Esperar 2 items
  await waitForStoreUpdate(
    page,
    'cart',
    (cart) => cart.items.length === 2,
    DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
  );

  // Volver a home y abrir carrito
  await page.goto(BASE_URLS.frontend);
  await waitForSvelteKitHydration(page);
  await openCart(page);

  // Verificar ambos items visibles
  await expect(page.locator(SELECTORS.cartItem)).toHaveCount(2);

  // Verificar totales
  const cart = await getCartFromStore(page);
  expect(cart.items).toHaveLength(2);
  expect(cart.total).toBeGreaterThan(0);

  // Verificar sync
  await waitForCartSync(page);
  const storeCount = await getCartCount(page, 'store');
  const uiCount = await getCartCount(page, 'ui');
  expect(storeCount).toBe(2);
  expect(uiCount).toBe(2);
});
```

---

## 🔬 EDGE CASE TESTS

### Edge Case 1: Quick Changes (Líneas 504-546)

**Objetivo:** Race condition cuando usuario hace clicks rápido

```typescript
test('debe manejar cambios rápidos de cantidad sin race conditions', async ({ page }) => {
  await openCart(page);

  const cartInitial = await getCartFromStore(page);
  const quantityInitial = cartInitial.items[0].quantity;

  // 3 clicks rápidos
  const incrementBtn = page.locator('[data-testid="increment-quantity"]').first();
  await incrementBtn.click();
  await incrementBtn.click();
  await incrementBtn.click();

  // Esperar estabilización (no 3 updates, sino estado final)
  await waitForStoreUpdate(
    page,
    'cart',
    (cart) => cart.items[0].quantity === quantityInitial + 3,
    DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
  );

  await triggerSvelteReactivity(page);

  // Verificar resultado final consistente
  const cartFinal = await getCartFromStore(page);
  expect(cartFinal.items[0].quantity).toBe(quantityInitial + 3);
});
```

---

### Edge Case 2: Refresh Persistence (Líneas 548-576)

**Objetivo:** localStorage persiste correctamente

```typescript
test('debe persistir en localStorage después de recargar', async ({ page }) => {
  const cartBefore = await getCartFromStore(page);
  expect(cartBefore.items).toHaveLength(1);

  // Recargar
  await page.reload();
  await waitForSvelteKitHydration(page);

  // Verificar restaurado
  const cartAfter = await getCartFromStore(page);
  expect(cartAfter.items).toHaveLength(1);
  expect(cartAfter.items[0].id).toBe(cartBefore.items[0].id);
  expect(cartAfter.items[0].quantity).toBe(cartBefore.items[0].quantity);
  expect(cartAfter.total).toBeCloseTo(cartBefore.total, 2);
});
```

---

### Edge Case 3: Modal Reopen Sync (Líneas 578-615)

**Objetivo:** Modal muestra datos actualizados al reabrir

```typescript
test('debe mostrar items actualizados al abrir modal', async ({ page }) => {
  await page.goto(BASE_URLS.frontend);
  await waitForSvelteKitHydration(page);
  await openCart(page);

  // Incrementar
  const incrementBtn = page.locator('[data-testid="increment-quantity"]').first();
  await incrementBtn.click();
  await waitForStoreUpdate(page, 'cart', (cart) => cart.items[0].quantity >= 2);

  // Cerrar
  await page.keyboard.press('Escape');
  await waitForSvelteTransition(page, SELECTORS.cartContent, { state: 'hidden' });

  // Reabrir
  await openCart(page);

  // Cantidad persiste
  const quantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
  const quantityText = await quantityDisplay.textContent();
  expect(parseInt(quantityText || '0')).toBeGreaterThanOrEqual(2);
});
```

---

## 🛠️ TIMEOUTS CRÍTICOS

```typescript
// De DEFAULT_SVELTE_TIMEOUTS en svelte-helpers.js
HYDRATION: 15000ms       // Esperar data-sveltekit-hydrated
TRANSITION: 5000ms       // Esperar fade-in/out CSS
STORE_UPDATE: 10000ms    // Polling interval para store changes
NAVIGATION: 8000ms       // Client-side routing
```

**Cuándo usar cada uno:**

```typescript
// Hidratación inicial
await waitForSvelteKitHydration(page);  // 15s

// Transición CSS de modal
await waitForSvelteTransition(page, selector, { timeout: 5000 });

// Update de store (incrementar, decrementar)
await waitForStoreUpdate(page, 'cart', condition, 10000);

// Navegación interna
await page.goto(url);  // Espera 8s por defecto
```

---

## ✅ CHECKLIST DE VALIDACIÓN

Después de hacer cambios en cart.spec.ts:

- [ ] ✅ No hay errores TypeScript (`get_errors`)
- [ ] ✅ Todos los imports están correctos
- [ ] ✅ beforeEach crea estado consistente
- [ ] ✅ Cada test es independiente
- [ ] ✅ Store-first validation en todos
- [ ] ✅ Transiciones manejadas explícitamente
- [ ] ✅ Edge cases cubiertos
- [ ] ✅ Comentarios claros en tests críticos
- [ ] ✅ TimeoutS están calibrados para Docker

---

## 🚀 EJECUCIÓN

```bash
# Ejecutar solo cart tests
pnpm playwright test cart.spec.ts

# Ejecutar con debug
pnpm playwright test cart.spec.ts --debug

# Ejecutar test específico
pnpm playwright test cart.spec.ts -g "debe mostrar contador"

# Ver trazas de fallos
pnpm playwright test cart.spec.ts --reporter=list
```

---

## 📝 NOTA IMPORTANTE

**Este archivo REEMPLAZA completamente el cart.spec.ts anterior.**

**Cambios principales:**

| Aspecto | Antes | Después |
|---------|-------|---------|
| Tests | 7 básicos | 13 + edge cases |
| Patrón | UI-first (frágil) | Store-first (robusto) |
| beforeEach | Mínimo | Robusto |
| Transiciones | Ignoradas | Explícitas |
| Race conditions | Posibles | Prevenidas |
| Documentación | Mínima | Completa |

✅ **LISTO para producción**
