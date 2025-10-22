# REFACTORIZACIÓN COMPLETADA: products.spec.ts SVELTE-AWARE

## 📋 Resumen Ejecutivo

Se ha refactorizado `products.spec.ts` (tests de página de detalle de producto) para ser **Svelte-aware**, integrando todos los helpers de Svelte e implementando **7 tests robustos** que validan:
- Carga de página y hydration
- Información del producto (nombre, precio, imagen)
- Reactividad del selector de cantidad
- Sincronización store/UI al agregar al carrito
- Casos edge (agregar múltiples veces, refresh)
- Persistencia de carrito

**Estado:** ✅ COMPLETO Y VALIDADO

---

## 🔄 Transformación

### ANTES (Frágil)
```typescript
// ❌ No verifica hydration
// ❌ Esperas ciegas
// ❌ Solo verifica UI, no store
// ❌ Falsos negativos en Docker

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 30000 });
});

test('debería poder agregar un producto al carrito', async ({ page }) => {
  const addButton = page.locator('[data-testid="add-to-cart"]').first();
  await addButton.click();
  const cartCount = page.locator('[data-testid="cart-count"]');
  await expect(cartCount).toContainText('1');
  // ❌ PROBLEMA: No verifica localStorage, puede fallar con latencia Docker
});
```

### DESPUÉS (Robusto)
```typescript
// ✅ Limpia estado
// ✅ Espera hydration
// ✅ Verifica store Y UI
// ✅ Síncrono con Svelte reactivity

test.beforeEach(async ({ page }) => {
  await clearSvelteStores(page);
  await navigateToProduct(page, TEST_PRODUCT_IDS[0]);
  await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.LONG });
  await waitForSvelteTransition(page, SELECTORS.productName, { state: 'visible' });
});

test('debe agregar producto al carrito correctamente', async ({ page }) => {
  const cartBefore = await getCartFromStore(page);
  expect(cartBefore.items).toHaveLength(0);

  await quantitySelector.fill('3');
  await triggerSvelteReactivity(page);
  await addToCart(page, 3);

  await waitForStoreUpdate(page, 'cart', 
    (cart) => cart.items.length === 1 && cart.items[0].quantity === 3
  );

  const cartAfter = await getCartFromStore(page);
  expect(cartAfter.items).toHaveLength(1);
  expect(cartAfter.items[0].quantity).toBe(3);
  
  const cartCountUI = await getCartCount(page, 'ui');
  expect(cartCountUI).toBe(1);
  // ✅ SOLUCIÓN: Verifica store, UI, y sincronización
});
```

---

## 📦 Cambios Principales

### 1. **Imports Agregados**
```typescript
import {
  navigateToProduct,
  addToCart,
  getCartCount,
  getCartFromStore,
  triggerSvelteReactivity
} from '../page-objects.js';

import {
  clearSvelteStores,
  waitForSvelteKitHydration,
  waitForSvelteTransition,
  waitForStoreUpdate,
  DEFAULT_SVELTE_TIMEOUTS
} from '../helpers/svelte-helpers.js';
```

### 2. **beforeEach Refactorizado**
```typescript
test.beforeEach(async ({ page }) => {
  // 1. Limpiar stores (carrito vacío)
  await clearSvelteStores(page);
  
  // 2. Navegar a producto (con hydration)
  await navigateToProduct(page, TEST_PRODUCT_IDS[0]);
  
  // 3. Esperar imágenes de joyería
  await page.waitForLoadState('networkidle');
  
  // 4. Esperar transiciones de entrada
  await waitForSvelteTransition(page, SELECTORS.productName, {
    state: 'visible',
    timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
  });
});
```

### 3. **7 Tests Completos**

#### **TEST 1: Carga de página**
- ✅ URL correcta
- ✅ Hydration verificada
- ✅ Sin errores 404
- ✅ Body visible

#### **TEST 2: Información del producto**
- ✅ Nombre visible y no vacío
- ✅ Precio con formato de moneda
- ✅ Descripción (si existe)
- ✅ Imagen completamente cargada (no placeholder roto)

#### **TEST 3: Cambiar cantidad (Svelte reactivity)**
- ✅ Valor inicial = 1
- ✅ Cambiar a 5 correctamente
- ✅ Validación mínimo 1 (si pone 0)
- ✅ Validación máximo 10 (si pone 15)
- ✅ Ignorar texto no numérico

#### **TEST 4: Agregar al carrito (CRÍTICO)**
- ✅ Carrito inicia vacío
- ✅ Establecer cantidad = 3
- ✅ **Verificar que el STORE se actualizó** (no solo UI)
- ✅ Verificar UI refleja cambio
- ✅ Verificar toast/notificación (si existe)

#### **TEST 5: Agregar múltiples veces**
- ✅ Agregar producto con qty=2
- ✅ Agregar el mismo producto con qty=3
- ✅ Verificar que se SUMARON (5 total) no se reemplazaron

#### **TEST 6: Persistencia después de refresh**
- ✅ Agregar producto al carrito
- ✅ Guardar estado (id, nombre, cantidad)
- ✅ Recargar la página
- ✅ Verificar que carrito persiste en localStorage
- ✅ Verificar que UI refleja carrito persistido

#### **TEST 7: Moneda GTQ**
- ✅ Precio contiene símbolo Q o GTQ
- ✅ Precio contiene número válido

---

## 🎯 Mejoras Clave

### 1. **Sincronización Store/UI (CRÍTICO)**
```javascript
// ANTES: Solo verifica UI
await expect(badge).toContainText('1');

// DESPUÉS: Verifica PRIMERO el store, LUEGO la UI
const cartBefore = await getCartFromStore(page);
await addToCart(page, quantity);
await waitForStoreUpdate(page, 'cart', 
  (cart) => cart.items.length === cartBefore.items.length + 1
);
const cartCountUI = await getCartCount(page, 'ui');
expect(cartCountUI).toBe(expectedCount);
```

### 2. **Validación de Reactividad Svelte**
```javascript
// Cambiar cantidad
await quantitySelector.fill('5');
// Forzar reactividad de Svelte 5
await triggerSvelteReactivity(page);
// Verificar que el valor se estableció
await expect(quantitySelector).toHaveValue('5');
```

### 3. **Validación de Imágenes**
```javascript
// Verificar que la imagen se cargó completamente
const imageLoaded = await productImage.evaluate((img: HTMLImageElement) => {
  return img.complete && img.naturalHeight > 0 && img.naturalWidth > 0;
});
expect(imageLoaded).toBe(true);
```

### 4. **Manejo de Transiciones**
```javascript
// Esperar que transiciones CSS terminen
await waitForSvelteTransition(page, SELECTORS.productName, {
  state: 'visible',
  timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
});
```

---

## 📊 Cambios Estadísticos

| Métrica | ANTES | DESPUÉS | Delta |
|---------|-------|---------|-------|
| Líneas de test | ~56 | 365 | +609% |
| Número de tests | 5 | 7 | +40% |
| Coverage | Básica | Completa | ++++++ |
| Robustez Docker | Baja | Alta | ++++++ |
| Validación Store | No | Sí | ✅ |

---

## 🧪 Test Execution Matrix

```
┌─────────────────────────────────────────────────────┐
│ beforeEach                                          │
│ - clearSvelteStores() → Carrito vacío              │
│ - navigateToProduct() → Hydration + setup          │
│ - waitForLoadState('networkidle') → Imágenes OK   │
│ - waitForSvelteTransition() → Transiciones OK      │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ TEST 1: Carga página       ✅                       │
│ TEST 2: Información        ✅                       │
│ TEST 3: Cantidad           ✅ (Svelte reactivity)  │
│ TEST 4: Agregar (CRÍTICO)  ✅ (Store sync)         │
│ TEST 5: Múltiples veces    ✅ (Store merge)        │
│ TEST 6: Persistencia       ✅ (localStorage)       │
│ TEST 7: Moneda GTQ         ✅                       │
└─────────────────────────────────────────────────────┘
                    TOTAL: 7 tests
```

---

## 🚀 Cómo Ejecutar

```bash
# Ejecutar solo tests de productos
docker-compose exec playwright pnpm test:e2e products.spec.ts

# UI mode para debug
docker-compose exec playwright pnpm test:e2e:ui products.spec.ts

# Debug mode paso a paso
docker-compose exec playwright pnpm test:e2e:debug products.spec.ts

# Ver report HTML
docker-compose exec playwright pnpm test:e2e:report
```

---

## ✅ Validación Checklist

- ✅ 7 tests completos
- ✅ beforeEach con setup correcto
- ✅ Imports de svelte-helpers y page-objects
- ✅ Limpieza de estado (clearSvelteStores)
- ✅ Hydration verificada
- ✅ Transiciones de Svelte manejadas
- ✅ Validación de imágenes cargadas
- ✅ Reactividad Svelte testada
- ✅ Sincronización store/UI verificada
- ✅ Casos edge cubiertos (valores inválidos, múltiples adds, refresh)
- ✅ Persistencia de localStorage validada
- ✅ Sin lint errors
- ✅ TypeScript types correctos

---

## 📈 Coverage Análisis

### Funcionalidades Cubiertas:
- ✅ Carga de página de detalle
- ✅ Visualización de información de producto
- ✅ Validación de inputs (cantidad)
- ✅ Interacción con carrito
- ✅ Sincronización de estado (Svelte Store + localStorage)
- ✅ Persistencia de datos
- ✅ Moneda y formato de precios

### Edge Cases Cubiertos:
- ✅ Entrada válida (cantidad 5)
- ✅ Límite mínimo (cantidad 0 → 1)
- ✅ Límite máximo (cantidad 15 → 10)
- ✅ Entrada inválida (texto "abc")
- ✅ Múltiples adiciones del mismo producto
- ✅ Refresh de página (persistencia)
- ✅ Transiciones CSS
- ✅ Imágenes de carga lenta

---

## 🔗 Integración con Suite E2E

**Test Suite Completa:**
- `home.spec.ts` - 7 tests (página inicio)
- `products.spec.ts` - 7 tests (página detalle) ⭐ NUEVO
- `cart.spec.ts` - 7 tests (carrito)
- `checkout.spec.ts` - 7 tests (checkout)

**Total: 28 tests E2E** cubriendo el flujo completo

---

## 📝 Notas Importantes

1. **Hydration Critical:**
   - Sin esperar hydration, los tests fallan aleatoriamente en Docker
   - `data-sveltekit-hydrated="true"` es verificado explícitamente

2. **Store vs UI:**
   - SIEMPRE verificar el store PRIMERO (source of truth)
   - LUEGO verificar la UI (puede haber delays de reactividad)

3. **Reactividad Svelte 5:**
   - `triggerSvelteReactivity()` dispara tick después de cambios
   - Necesario después de `fill()` en inputs reactivos

4. **Docker Latency:**
   - Timeouts calibrados para variabilidad de contenedores
   - `networkidle` para esperar imágenes cargadas

5. **Moneda GTQ:**
   - Joyería artesanal guatemalteca
   - Validar que siempre muestra "Q" o "GTQ"

---

## 📚 Referencias

- `page-objects.js` - Helpers reutilizables
- `svelte-helpers.js` - Helpers de Svelte
- `test-data.js` - Datos de test
- `REFACTORING_COMPLETE.md` - Guía completa
- `E2E_ARCHITECTURE.md` - Arquitectura

---

**Refactorización completada:** products.spec.ts
**Versión:** 2.0 (SVELTE-AWARE)
**Total tests:** 7
**Status:** ✅ LISTO PARA PRODUCCIÓN
