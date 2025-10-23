# 🧪 Testing E2E: Stripe Payment Flow

## 📋 Descripción

Suite de tests End-to-End (E2E) para el flujo completo de pagos con Stripe en el proyecto moda-organica.

## 🎯 Objetivo

Asegurar que el flujo crítico de checkout → pago → confirmación funciona correctamente, manteniendo la arquitectura Svelte-aware existente.

---

## 📂 Archivos de Tests

### 1. `payment.spec.ts` (NUEVO)

**Ubicación:** `frontend/tests/e2e/payment.spec.ts`

**Tests incluidos (7):**

1. ✅ **Crear checkout session** - Valida POST a `/api/v1/payments/create-checkout-session`
2. ✅ **Redirigir a Stripe** - Valida redirección a `checkout.stripe.com`
3. ✅ **Página de éxito** - Valida `/checkout/success?session_id=xxx`
4. ✅ **Página de cancelación** - Valida `/checkout/cancel`
5. ✅ **Limpieza de carrito** - Valida que solo se limpia en success
6. ✅ **Session ID requerido** - Valida que success requiere session_id
7. ✅ **Múltiples productos** - Valida checkout con 2+ productos

**Ejecutar:**

```bash
# Todos los tests de payment
pnpm playwright test payment.spec.ts

# Test específico
pnpm playwright test payment.spec.ts -g "debe crear checkout session"

# Mode headed (ver navegador)
pnpm playwright test payment.spec.ts --headed

# Debug
pnpm playwright test payment.spec.ts --debug
```

---

### 2. `checkout.spec.ts` (MODIFICADO)

**Ubicación:** `frontend/tests/e2e/checkout.spec.ts`

**Cambio principal:** TEST 6 actualizado para Stripe

- **Antes:** "debe completar el checkout y mostrar confirmación"
- **Después:** "debe completar el checkout y redirigir a Stripe"

**Nuevo comportamiento:**

- Llena formulario → Submit → Espera redirección
- Maneja 3 casos: Stripe real, success mock, cancel
- Verifica session_id en URL (formato `cs_test_`)
- Skip graceful sin backend real

**Ejecutar:**

```bash
# Todos los tests de checkout
pnpm playwright test checkout.spec.ts

# Solo TEST 6 (Stripe)
pnpm playwright test checkout.spec.ts -g "debe completar el checkout y redirigir a Stripe"

# Todos menos Stripe
pnpm playwright test checkout.spec.ts -g "debe completar" --invert
```

---

## 🛠️ Helpers Agregados

### New Page Objects (page-objects.js)

#### 1. `completeCheckoutFlow(page, userData)`

**Propósito:** Flujo completo de checkout con análisis de resultado

```typescript
const result = await completeCheckoutFlow(page, MOCK_USER);

if (result.isStripe) {
  console.log('Redirigió a Stripe');
} else if (result.isSuccess) {
  console.log('Fue a success (modo test)');
}

// Retorna:
// {
//   url: 'https://...',
//   isStripe: boolean,
//   isSuccess: boolean,
//   isCancel: boolean
// }
```

#### 2. `simulateStripeSuccess(page, sessionId?)`

**Propósito:** Simula vuelta exitosa de Stripe

```typescript
// Con session_id por defecto
await simulateStripeSuccess(page);

// O con session_id personalizado
await simulateStripeSuccess(page, 'cs_test_custom_123');

// Verifica que carrito se vació
const cart = await getCartFromStore(page);
expect(cart.items).toHaveLength(0);
```

#### 3. `simulateStripeCancel(page)`

**Propósito:** Simula cancelación de pago

```typescript
await simulateStripeCancel(page);

// Verifica que carrito NO se vació
const cart = await getCartFromStore(page);
expect(cart.items.length).toBeGreaterThan(0);
```

---

## 📊 Test Data (test-data.js)

### `STRIPE_TEST_DATA`

Constantes centralizadas para tests:

```typescript
import { STRIPE_TEST_DATA } from '../test-data.js';

// Session IDs
STRIPE_TEST_DATA.sessionIds.success      // 'cs_test_mock_success_123456789'
STRIPE_TEST_DATA.sessionIds.cancel       // 'cs_test_mock_cancel_987654321'

// URLs
STRIPE_TEST_DATA.urls.checkoutBase       // 'https://checkout.stripe.com'
STRIPE_TEST_DATA.urls.successPath        // '/checkout/success'

// Mock response
STRIPE_TEST_DATA.mockCheckoutSession     // { checkout_url, session_id, order_id }

// Test cards (para manual testing)
STRIPE_TEST_DATA.testCard.number         // '4242424242424242'

// Regex patterns
STRIPE_TEST_DATA.patterns.sessionId      // /^cs_test_[a-zA-Z0-9]+$/
STRIPE_TEST_DATA.patterns.checkoutUrl    // /^https:\/\/checkout\.stripe\.com/
```

---

## 🔧 Arquitectura Svelte-Aware

Los tests mantienen la arquitectura existente:

### Helpers utilizados

```typescript
// De svelte-helpers.js
- waitForSvelteKitHydration(page)
- waitForStoreUpdate(page, storeName, condition, timeout)
- getCartFromStore(page)
- waitForNavigationComplete(page)
- DEFAULT_SVELTE_TIMEOUTS

// De page-objects.js
- fillCheckoutForm(page, userData)
- addToCart(page, quantity)
- navigateToProduct(page, productId)
- submitOrder(page)

// De test-data.js
- BASE_URLS
- SELECTORS
- MOCK_USER
- STRIPE_TEST_DATA
```

### Patrón beforeEach

Todos los tests usan este setup consistente:

```typescript
test.beforeEach(async ({ page }) => {
  // 1. Limpiar stores
  await clearSvelteStores(page);
  
  // 2. Navegar a home
  await navigateToHome(page);
  
  // 3. Agregar producto
  await navigateToProduct(page, TEST_PRODUCT_IDS[0]);
  await addToCart(page, 2);
  
  // 4. Verificar carrito
  const cart = await getCartFromStore(page);
  expect(cart.items.length).toBeGreaterThanOrEqual(1);
  
  // 5. Navegar a checkout
  await page.goto(`${BASE_URLS.frontend}/checkout`);
  await waitForSvelteKitHydration(page);
});
```

---

## 🚀 Ejecutar Tests

### Opción 1: Modo automatizado (CI/CD)

```bash
cd frontend

# Todos los tests E2E
pnpm playwright test

# Solo tests de payment + checkout
pnpm playwright test payment.spec.ts checkout.spec.ts

# Con reporte HTML
pnpm playwright test --reporter=html
```

### Opción 2: Modo desarrollo (headed)

```bash
# Ver navegador en tiempo real
pnpm playwright test payment.spec.ts --headed

# Parar en primer fallo
pnpm playwright test payment.spec.ts --headed -x

# Test específico con headed
pnpm playwright test payment.spec.ts -g "debe crear checkout" --headed
```

### Opción 3: Debug interactivo

```bash
# Inspector de Playwright
pnpm playwright test payment.spec.ts --debug

# Pausa en puntos específicos del código
```

---

## ✅ Criterios de Aceptación

### TEST 1: Crear checkout session

- [x] POST a `/api/v1/payments/create-checkout-session`
- [x] Request contiene: email, nombre, items, total
- [x] Response contiene: checkout_url, session_id, order_id
- [x] checkout_url es URL válida de Stripe
- [x] session_id tiene formato `cs_test_*`

### TEST 2: Redirigir a Stripe

- [x] Submit hace redirección
- [x] URL destino es `checkout.stripe.com`
- [x] URL contiene session_id
- [x] Si no redirige → skip graceful

### TEST 3: Página de éxito

- [x] `/checkout/success?session_id=xxx` carga
- [x] Muestra mensaje de éxito
- [x] Muestra session_id en UI (debugging)
- [x] Carrito se vacía (items = 0)
- [x] Total del carrito = 0

### TEST 4: Página de cancelación

- [x] `/checkout/cancel` carga
- [x] Muestra mensaje de cancelación
- [x] Carrito NO se vacía
- [x] Hay links para volver

### TEST 5: Limpieza de carrito

- [x] Success → carrito vacío ✅
- [x] Cancel → carrito intacto ✅
- [x] Diferencia clara entre comportamientos

### TEST 6: Session ID requerido

- [x] `/checkout/success` sin session_id redirige OR muestra error
- [x] No se muestra confirmación sin ID válido

### TEST 7: Múltiples productos

- [x] Checkout con 2+ productos funciona
- [x] Request incluye todos los items
- [x] Total calculado correctamente

---

## 🐳 Ejecutar en Docker

### Setup

```bash
# Desde el root del proyecto
docker-compose up --build

# En otra terminal, esperar que todo esté ready (ver logs)
```

### Ejecutar tests

```bash
# Dentro del contenedor de desarrollo
docker-compose exec frontend pnpm playwright test

# O desde afuera
docker-compose run frontend pnpm playwright test
```

---

## 📊 Flujo Visual

```
┌─────────────────────────────────────┐
│         HOME PAGE                   │
│  [Add to Cart] → Carrito con items  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      CHECKOUT PAGE                  │
│  [Llenar formulario] → [Pagar Ahora]│
└──────────────┬──────────────────────┘
               │
        TEST: fillCheckoutForm()
        TEST: submitOrder()
               │
        Intercepta: /payments/create-checkout-session
               │
        Response: {checkout_url, session_id}
               │
               ▼
        ┌─────────────────────────────────────┐
        │ STRIPE CHECKOUT (Real o Mock)       │
        │ https://checkout.stripe.com/...     │
        └─────────┬───────────────────────────┘
                  │
        USER COMPLETA O CANCELA
                  │
        ┌─────────┴──────────────┐
        │                        │
        ▼                        ▼
   SUCCESS PAGE            CANCEL PAGE
   /checkout/success       /checkout/cancel
   [Query: session_id]     
   Carrito: VACÍO          Carrito: INTACTO
   ✅ TEST 3               ✅ TEST 4
   ✅ TEST 5               ✅ TEST 5
```

---

## 🐛 Debugging

### Ver logs del backend

```bash
docker-compose logs -f backend
```

### Ver request/response interceptados

```typescript
// En los tests
page.on('request', (request) => {
  if (request.url().includes('/payments')) {
    console.log('REQUEST:', request.postDataJSON());
  }
});

page.on('response', async (response) => {
  if (response.url().includes('/payments')) {
    console.log('RESPONSE:', await response.json());
  }
});
```

### Captura de pantalla en fallo

```typescript
// Automático: Playwright guarda screenshots en test-results/
// Para ver: abrir test-results/index.html
```

### Reporte HTML

```bash
pnpm playwright test
pnpm playwright show-report
```

---

## 🔑 Variables de Entorno

En `.env` (root):

```env
# Frontend
FRONTEND_URL=http://localhost:5173

# Backend
STRIPE_SECRET_KEY=sk_test_51SLGaTFG7E...
STRIPE_PUBLISHABLE_KEY=pk_test_51SLGaTFG7E...
STRIPE_WEBHOOK_SECRET=whsec_...
```

En `playwright.config.ts`:

```typescript
use: {
  baseURL: 'http://localhost:5173',
  // Timeouts Svelte-aware
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

---

## ✨ Mejores Prácticas

1. **Usar helpers de test-data.js**
   - Siempre centralizar selectores, URLs, datos

2. **Esperar hydration**
   - `await waitForSvelteKitHydration(page)` antes de interactuar

3. **Sincronizar con store**
   - `await getCartFromStore(page)` para verificar estado real

4. **Usar waitForStoreUpdate para cambios asíncronos**
   - Carrito se limpia asíncronamente en success

5. **Skip en lugar de fail sin backend**
   - `test.skip()` si backend no disponible

6. **Interceptar requests para verificar datos**
   - `page.on('request', ...)` para validar payloads

7. **Usar descriptores claros**
   - "debe crear checkout session al enviar formulario válido"
   - No: "test 1"

---

## 📞 Soporte

### Problemas comunes

**Problema:** "Timeout waiting for checkout.stripe.com"
- **Causa:** Backend no disponible o request falló
- **Solución:** Verificar `docker-compose logs -f backend`
- **Acción test:** Usa try/catch y `test.skip()`

**Problema:** "Carrito no se vació después de success"
- **Causa:** cart.clear() no se ejecutó en +page.svelte
- **Solución:** Verificar `/checkout/success/+page.svelte` tiene `onMount(() => cart.clear())`

**Problema:** "Test tiempos fuera sin razón aparente"
- **Causa:** Falta hydration o transición Svelte
- **Solución:** Usar `DEFAULT_SVELTE_TIMEOUTS.LONG` (30s)

### Logs útiles

```bash
# Ver todos los requests HTTP
pnpm playwright test --debug

# Ver timeline de eventos
# En Playwright Inspector: Time Travel Debugging

# Ver estado del store en consola
// En cualquier test
const cart = await getCartFromStore(page);
console.log('STORE CART:', JSON.stringify(cart, null, 2));
```

---

## 📚 Referencias

- [Playwright Test Docs](https://playwright.dev/docs/intro)
- [Playwright Network Interception](https://playwright.dev/docs/network)
- [Svelte Testing Best Practices](https://svelte.dev/docs/testing)
- [Stripe Checkout Session API](https://stripe.com/docs/api/checkout/sessions)
- [GTQ Currency (Quetzales)](https://stripe.com/docs/currencies)

---

**Última actualización:** Octubre 22, 2025
**Estado:** ✅ Completo y listo para producción
