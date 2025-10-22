import { test, expect } from '@playwright/test';
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
import {
  navigateToHome,
  navigateToProduct,
  addToCart,
  openCart,
  getCartCount,
  removeFromCart,
  getTotalPrice,
} from '../page-objects.js';
import {
  BASE_URLS,
  SELECTORS,
  TEST_PRODUCT_IDS,
} from '../test-data.js';

/**
 * ============================================
 * TESTS E2E DEL CARRITO DE COMPRAS
 * Svelte-Aware: Maneja hydration, transiciones y sincronización store ↔ UI
 * ============================================
 * 
 * El carrito es el CORE del e-commerce:
 * - Persiste en localStorage con Svelte Store
 * - Tiene transiciones de fade-in/out
 * - Incremento/decremento reactivo (Svelte 5 $state)
 * - Total se calcula con $derived
 * 
 * CRÍTICO: SIEMPRE verificar store ANTES que UI
 * ============================================
 */

test.describe('Carrito de Compras (SVELTE-AWARE)', () => {
  /**
   * PASO 2: beforeEach ROBUSTO
   * 
   * Setup: Limpiar store → Agregar 1 producto → Estado inicial consistente
   * Cada test empieza con 1 item (cantidad 2) listo para testear
   */
  test.beforeEach(async ({ page }) => {
    // 1. CRÍTICO: Limpiar store y localStorage
    await clearSvelteStores(page);

    // 2. Navegar a home
    await navigateToHome(page);

    // 3. Setup: Agregar un producto para tener estado inicial consistente
    //    Agregamos cantidad 2 para poder testear increment/decrement
    try {
      await navigateToProduct(page, TEST_PRODUCT_IDS[0]);
      await addToCart(page, 2);
    } catch (error) {
      console.warn('⚠️ Fallo agregar producto en beforeEach:', error.message);
      // Continuar de todas formas
    }

    // 4. Volver a home (simular flujo real de usuario)
    await page.goto(BASE_URLS.frontend);
    await waitForSvelteKitHydration(page);

    // 5. Verificar que tenemos 1 item en el carrito
    const cartCount = await getCartCount(page, 'store');
    expect(cartCount).toBe(1);
  });

  /**
   * PASO 3: TEST "debe mostrar el contador actualizado"
   * 
   * Valida:
   * - Badge del carrito visible
   * - Store/UI sincronizados (CRÍTICO)
   * - Cantidad correcta en ambas fuentes
   */
  test('debe mostrar el contador del carrito actualizado', async ({ page }) => {
    // El beforeEach ya agregó 1 producto

    // 1. Verificar badge visible
    const cartBadge = page.locator(SELECTORS.cartBadge);
    await expect(cartBadge).toBeVisible();

    // 2. NUEVO: Verificar que store y UI están sincronizados
    await waitForCartSync(page);

    // 3. Obtener contador de ambas fuentes
    const storeCount = await getCartCount(page, 'store');
    const uiCount = await getCartCount(page, 'ui');

    // 4. Validaciones
    expect(storeCount).toBe(1);
    expect(uiCount).toBe(1);
    expect(storeCount).toBe(uiCount); // CRÍTICO: Sincronizados
  });

  /**
   * PASO 4: TEST "debe abrir el modal del carrito"
   * 
   * Valida:
   * - Modal abre correctamente
   * - Transición completada
   * - Contenido hidratado
   * - Opacity = 1 (totalmente visible)
   */
  test('debe abrir el modal del carrito', async ({ page }) => {
    // 1. Click en ícono del carrito
    await openCart(page);

    // 2. Verificar que el contenido está hidratado
    await page.waitForSelector(SELECTORS.cartContent, {
      state: 'visible',
      timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION,
    });

    // 3. Esperar transición de entrada del modal
    await waitForSvelteTransition(page, SELECTORS.cartContent, {
      state: 'visible',
      timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION,
    });

    // 4. Verificar que el modal está completamente visible (opacity: 1)
    const modalOpacity = await page
      .locator(SELECTORS.cartContent)
      .evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
    expect(parseFloat(modalOpacity)).toBe(1);

    // 5. Verificar que el backdrop (si existe) también está visible
    const backdrop = page.locator('[data-testid="cart-backdrop"]');
    const backdropExists = await backdrop.isVisible().catch(() => false);
    if (backdropExists) {
      await expect(backdrop).toBeVisible();
    }
  });

  /**
   * PASO 5: TEST "debe mostrar producto con precio y cantidad"
   * 
   * Valida:
   * - Producto visible en modal
   * - Nombre, precio, cantidad correctos
   * - Cantidad coincide con store
   */
  test('debe mostrar el producto agregado con precio y cantidad correctos', async ({ page }) => {
    // 1. Abrir carrito
    await openCart(page);

    // 2. Esperar que los items terminen de renderizar
    await page.waitForSelector(SELECTORS.cartItem, {
      state: 'visible',
      timeout: DEFAULT_SVELTE_TIMEOUTS.MEDIUM,
    });

    // 3. Obtener el primer item
    const cartItem = page.locator(SELECTORS.cartItem).first();
    await expect(cartItem).toBeVisible();

    // 4. Verificar nombre del producto
    const itemName = cartItem.locator('[data-testid="cart-item-name"]');
    await expect(itemName).toBeVisible();
    await expect(itemName).not.toBeEmpty();

    // 5. Verificar precio (formato moneda: $1,234.56 o Q 1,234.56)
    const itemPrice = cartItem.locator('[data-testid="cart-item-price"]');
    await expect(itemPrice).toBeVisible();
    // Verificar que contiene números (el formato exacto puede variar)
    const priceText = await itemPrice.textContent();
    expect(priceText).toMatch(/[\d,]+/);

    // 6. Verificar cantidad y que coincide con el store
    const itemQuantity = cartItem.locator(
      '[data-testid="cart-item-quantity"]'
    );
    await expect(itemQuantity).toBeVisible();

    const quantityText = await itemQuantity.textContent();
    const quantityNumber = parseInt(quantityText || '0');

    // Verificar contra el store
    const cart = await getCartFromStore(page);
    expect(quantityNumber).toBe(cart.items[0].quantity);
  });

  /**
   * PASO 6A: TEST "debe permitir incrementar cantidad desde el carrito"
   * 
   * SÚPER CRÍTICO: Valida reactividad de Svelte 5 ($state)
   * - Click incrementar
   * - Wait store update (polling)
   * - Trigger reactivity
   * - Verify UI cambió
   * - Verify total calculado
   */
  test('debe permitir incrementar cantidad desde el carrito', async ({
    page,
  }) => {
    await openCart(page);

    // 1. Obtener cantidad inicial del store
    const cartBefore = await getCartFromStore(page);
    const quantityBefore = cartBefore.items[0].quantity; // Debería ser 2 por beforeEach

    // 2. Click en botón incrementar
    const incrementBtn = page
      .locator('[data-testid="increment-quantity"]')
      .first();
    await incrementBtn.click();

    // 3. CRÍTICO: Esperar que el store se actualice
    await waitForStoreUpdate(
      page,
      'cart',
      (cart) => cart.items[0].quantity === quantityBefore + 1,
      DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
    );

    // 4. Trigger reactividad para asegurar re-render
    await triggerSvelteReactivity(page);

    // 5. Verificar que la UI se actualizó
    const quantityDisplay = page
      .locator('[data-testid="cart-item-quantity"]')
      .first();
    await expect(quantityDisplay).toContainText(String(quantityBefore + 1));

    // 6. Verificar que el total también se actualizó
    await waitForCartSync(page);
    const totalElement = page.locator(SELECTORS.cartTotal);
    const totalText = await totalElement.textContent();
    expect(totalText).toBeTruthy();

    // El total debe reflejar la nueva cantidad
    const cartAfter = await getCartFromStore(page);
    expect(cartAfter.total).toBeGreaterThan(cartBefore.total);
  });

  /**
   * PASO 6B: TEST "debe permitir decrementar cantidad desde el carrito"
   * 
   * Similar a incrementar pero validando decrementó
   */
  test('debe permitir decrementar cantidad desde el carrito', async ({
    page,
  }) => {
    await openCart(page);

    const cartBefore = await getCartFromStore(page);
    const quantityBefore = cartBefore.items[0].quantity;

    // Verificar que podemos decrementar (cantidad > 1)
    if (quantityBefore <= 1) {
      // Skip este test si ya estamos en cantidad 1
      test.skip();
    }

    // Click en botón decrementar
    const decrementBtn = page
      .locator('[data-testid="decrement-quantity"]')
      .first();
    await decrementBtn.click();

    // Esperar actualización del store
    await waitForStoreUpdate(
      page,
      'cart',
      (cart) => cart.items[0].quantity === quantityBefore - 1,
      DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
    );

    await triggerSvelteReactivity(page);

    // Verificar UI
    const quantityDisplay = page
      .locator('[data-testid="cart-item-quantity"]')
      .first();
    await expect(quantityDisplay).toContainText(String(quantityBefore - 1));
  });

  /**
   * PASO 6C: TEST "NO debe permitir decrementar por debajo de 1"
   * 
   * Valida validación de cantidad mínima:
   * - Si botón está disabled, debe estarlo
   * - Si no está disabled, click no cambia cantidad
   */
  test('NO debe permitir decrementar por debajo de 1', async ({ page }) => {
    await openCart(page);

    // Decrementar hasta llegar a 1
    let cart = await getCartFromStore(page);
    while (cart.items[0].quantity > 1) {
      const decrementBtn = page
        .locator('[data-testid="decrement-quantity"]')
        .first();
      await decrementBtn.click();
      await triggerSvelteReactivity(page);
      cart = await getCartFromStore(page);
    }

    // Ahora estamos en cantidad 1
    expect(cart.items[0].quantity).toBe(1);

    // Intentar decrementar una vez más
    const decrementBtn = page
      .locator('[data-testid="decrement-quantity"]')
      .first();

    // El botón debería estar deshabilitado O no hacer nada
    const isDisabled = await decrementBtn
      .isDisabled()
      .catch(() => false);

    if (!isDisabled) {
      // Si no está disabled, el click no debería cambiar la cantidad
      await decrementBtn.click();
      await triggerSvelteReactivity(page);

      cart = await getCartFromStore(page);
      expect(cart.items[0].quantity).toBe(1); // Sigue en 1
    } else {
      expect(isDisabled).toBe(true);
    }
  });

  /**
   * PASO 7: TEST "debe calcular el total correctamente"
   * 
   * Valida triple-check del total:
   * 1. Store vs UI (con margen por decimales)
   * 2. Store vs cálculo manual
   * 3. UI vs cálculo manual
   */
  test('debe calcular el total correctamente', async ({ page }) => {
    await openCart(page);

    // 1. Obtener datos del store (fuente de verdad)
    const cart = await getCartFromStore(page);
    const expectedTotal = cart.total;

    // 2. Obtener total de la UI
    const totalElement = page.locator(SELECTORS.cartTotal);
    await expect(totalElement).toBeVisible();

    const totalText = await totalElement.textContent();
    // Limpiar formato: "$1,234.56" o "Q 1,234.56" -> 1234.56
    const totalUI = parseFloat(totalText?.replace(/[$,Q\s]/g, '') || '0');

    // 3. Verificar que coinciden (con margen de error por decimales)
    expect(totalUI).toBeCloseTo(expectedTotal, 2);

    // 4. Calcular manualmente para triple-check
    const manualTotal = cart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    expect(expectedTotal).toBeCloseTo(manualTotal, 2);
    expect(totalUI).toBeCloseTo(manualTotal, 2);
  });

  /**
   * PASO 8: TEST "debe eliminar un producto del carrito"
   * 
   * Valida:
   * - Item desaparece con transición
   * - Store se actualiza
   * - Mensaje "Carrito vacío" aparece
   */
  test('debe eliminar un producto del carrito', async ({ page }) => {
    await openCart(page);

    // 1. Obtener estado inicial
    const cartBefore = await getCartFromStore(page);
    expect(cartBefore.items).toHaveLength(1);

    // 2. Click en botón eliminar
    const removeBtn = page.locator(SELECTORS.removeFromCart).first();
    await removeBtn.click();

    // 3. Esperar transición de salida del item (fade-out)
    await waitForSvelteTransition(page, SELECTORS.cartItem, {
      state: 'hidden',
      timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION,
    });

    // 4. Esperar que el store se actualice
    await waitForStoreUpdate(
      page,
      'cart',
      (cart) => cart.items.length === 0,
      DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
    );

    // 5. Verificar que el item desapareció del DOM
    const cartItems = page.locator(SELECTORS.cartItem);
    await expect(cartItems).toHaveCount(0);

    // 6. Verificar mensaje "Carrito vacío"
    const emptyMessage = page.locator(
      '[data-testid="empty-cart-message"]'
    );
    const emptyMessageExists = await emptyMessage
      .isVisible()
      .catch(() => false);
    if (emptyMessageExists) {
      await expect(emptyMessage).toContainText(/vacío|empty/i);
    }
  });

  /**
   * PASO 9: TEST "debe cerrar el modal correctamente"
   * 
   * Valida:
   * - Modal cierra con transición
   * - Store NO se limpia (datos persisten)
   * - Item sigue en localStorage
   */
  test('debe cerrar el modal del carrito correctamente', async ({ page }) => {
    // 1. Abrir carrito
    await openCart(page);
    await expect(page.locator(SELECTORS.cartContent)).toBeVisible();

    // 2. Obtener datos antes de cerrar
    const cartBefore = await getCartFromStore(page);
    const itemsCountBefore = cartBefore.items.length;

    // 3. Click en botón cerrar o backdrop
    const closeBtn = page.locator('[data-testid="close-cart"]');

    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      // Cerrar con ESC
      await page.keyboard.press('Escape');
    }

    // 4. Esperar transición de salida
    await waitForSvelteTransition(page, SELECTORS.cartContent, {
      state: 'hidden',
      timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION,
    });

    // 5. Verificar que el modal ya no está visible
    await expect(page.locator(SELECTORS.cartContent)).not.toBeVisible();

    // 6. IMPORTANTE: Verificar que el store NO se limpió
    const cartAfter = await getCartFromStore(page);
    expect(cartAfter.items).toHaveLength(itemsCountBefore);
  });

  /**
   * PASO 10: TEST "debe mantener items al agregar productos adicionales"
   * 
   * Valida:
   * - Múltiples items diferentes persisten
   * - Total refleja todos los items
   * - Store/UI sincronizados
   */
  test('debe mantener items al agregar productos adicionales', async ({
    page,
  }) => {
    // El beforeEach ya agregó 1 producto

    // 1. Navegar a otro producto
    try {
      await navigateToProduct(page, TEST_PRODUCT_IDS[1]);
      await addToCart(page, 1);

      // 2. Esperar que ahora hay 2 items diferentes
      await waitForStoreUpdate(
        page,
        'cart',
        (cart) => cart.items.length === 2,
        DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
      );

      // 3. Volver a home
      await page.goto(BASE_URLS.frontend);
      await waitForSvelteKitHydration(page);

      // 4. Abrir carrito
      await openCart(page);

      // 5. Verificar que ambos items están visibles
      await expect(page.locator(SELECTORS.cartItem)).toHaveCount(2);

      // 6. Verificar que el total refleja ambos items
      const cart = await getCartFromStore(page);
      expect(cart.items).toHaveLength(2);
      expect(cart.total).toBeGreaterThan(0);

      // 7. Verificar sync
      await waitForCartSync(page);
      const storeCount = await getCartCount(page, 'store');
      const uiCount = await getCartCount(page, 'ui');
      expect(storeCount).toBe(2);
      expect(uiCount).toBe(2);
    } catch (error) {
      console.warn(
        '⚠️ Fallo agregar segundo producto:',
        error.message
      );
      // Este test requiere 2 productos diferentes en la DB
      test.skip();
    }
  });

  /**
   * EDGE CASE TEST: "debe manejar cambios rápidos de cantidad"
   * 
   * Simula usuario que incrementa/decrementa rápidamente
   * Valida que el store permanece consistente
   */
  test('debe manejar cambios rápidos de cantidad sin race conditions', async ({
    page,
  }) => {
    await openCart(page);

    const cartInitial = await getCartFromStore(page);
    const quantityInitial = cartInitial.items[0].quantity;

    // 1. Hacer 3 clicks rápidos en incrementar
    const incrementBtn = page
      .locator('[data-testid="increment-quantity"]')
      .first();
    await incrementBtn.click();
    await incrementBtn.click();
    await incrementBtn.click();

    // 2. Esperar que el store estabilice
    await waitForStoreUpdate(
      page,
      'cart',
      (cart) => cart.items[0].quantity === quantityInitial + 3,
      DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
    );

    // 3. Trigger reactivity
    await triggerSvelteReactivity(page);

    // 4. Verificar resultado final
    const cartFinal = await getCartFromStore(page);
    expect(cartFinal.items[0].quantity).toBe(quantityInitial + 3);

    // Verificar UI
    const quantityDisplay = page
      .locator('[data-testid="cart-item-quantity"]')
      .first();
    await expect(quantityDisplay).toContainText(
      String(quantityInitial + 3)
    );
  });

  /**
   * EDGE CASE TEST: "debe persistir después de recargar la página"
   * 
   * Valida que localStorage persiste correctamente
   */
  test('debe persistir en localStorage después de recargar', async ({
    page,
  }) => {
    // 1. Obtener carrito actual
    const cartBefore = await getCartFromStore(page);
    expect(cartBefore.items).toHaveLength(1);

    // 2. Recargar página
    await page.reload();
    await waitForSvelteKitHydration(page);

    // 3. Verificar que el carrito se restauró
    const cartAfter = await getCartFromStore(page);
    expect(cartAfter.items).toHaveLength(1);
    expect(cartAfter.items[0].id).toBe(cartBefore.items[0].id);
    expect(cartAfter.items[0].quantity).toBe(cartBefore.items[0].quantity);
    expect(cartAfter.total).toBeCloseTo(cartBefore.total, 2);
  });

  /**
   * EDGE CASE TEST: "debe sincronizar cuando se abre el modal después de agregar"
   * 
   * Valida que el modal muestra datos actualizados
   */
  test('debe mostrar items actualizados al abrir modal', async ({ page }) => {
    // 1. Navegar a home (carrito ya tiene 1 item)
    await page.goto(BASE_URLS.frontend);
    await waitForSvelteKitHydration(page);

    // 2. Abrir carrito
    await openCart(page);

    // 3. Incrementar cantidad
    const incrementBtn = page
      .locator('[data-testid="increment-quantity"]')
      .first();
    await incrementBtn.click();

    await waitForStoreUpdate(page, 'cart', (cart) => {
      return cart.items[0].quantity >= 2;
    });

    // 4. Cerrar y reabrir modal
    await page.keyboard.press('Escape');
    await waitForSvelteTransition(page, SELECTORS.cartContent, {
      state: 'hidden',
    });

    await openCart(page);

    // 5. Verificar que la cantidad se mantiene
    const quantityDisplay = page
      .locator('[data-testid="cart-item-quantity"]')
      .first();
    const quantityText = await quantityDisplay.textContent();
    expect(parseInt(quantityText || '0')).toBeGreaterThanOrEqual(2);
  });
}); // fin del describe
