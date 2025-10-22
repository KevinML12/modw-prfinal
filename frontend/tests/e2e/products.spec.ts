/**
 * ============================================
 * SUITE DE TESTS E2E: Página de Detalle de Producto
 * ============================================
 * 
 * CONTEXTO:
 * - Proyecto: moda-organica (e-commerce joyería artesanal)
 * - Página: /product/[id] con SvelteKit SSR + Hydration
 * - Características: Galería de imágenes, selector reactivo de cantidad
 * - Carrito: Svelte Store + localStorage persistence
 * - Tests ejecutados desde contenedor 'playwright'
 */

import { test, expect } from '@playwright/test';
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
import {
  TIMEOUTS,
  SELECTORS,
  TEST_PRODUCT_IDS
} from '../test-data.js';

/**
 * Setup: Limpiar estado y navegar a página de producto
 * 
 * Cada test inicia con:
 * 1. Stores limpios (carrito vacío)
 * 2. Hydration completa
 * 3. Producto cargado y visible
 * 4. Transiciones completadas
 */
test.beforeEach(async ({ page }) => {
  // 1. Limpiar todos los Svelte stores
  // Esto asegura que cada test empiece con carrito vacío
  await clearSvelteStores(page);

  // 2. Navegar a la página de producto
  // navigateToProduct ya incluye:
  // - page.goto('/product/[id]')
  // - waitForSvelteKitHydration()
  // - waitForNavigationComplete()
  await navigateToProduct(page, TEST_PRODUCT_IDS[0]);

  // 3. Esperar que las imágenes (joyería) terminen de cargar
  // Las imágenes de joyería son de alta calidad y pueden tardar
  await page.waitForLoadState('networkidle', {
    timeout: TIMEOUTS.LONG
  });

  // 4. Esperar transición de entrada del nombre del producto
  // Si hay fade-in o slide-in, esperar que termine
  await waitForSvelteTransition(page, SELECTORS.productName, {
    state: 'visible',
    timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
  });
});

// ========================================
// TEST 1: Carga de página de detalle
// ========================================
test('debe cargar la página de detalle de producto', async ({ page }) => {
  // 1. Verificar URL correcta
  await expect(page).toHaveURL(
    new RegExp(`/product/${TEST_PRODUCT_IDS[0]}`)
  );

  // 2. Verificar que la página está hydrated (crítico para interactividad)
  const isHydrated = await page.evaluate(() => {
    return document.documentElement.getAttribute('data-sveltekit-hydrated') === 'true';
  });
  expect(isHydrated).toBe(true);

  // 3. Verificar que no hay errores 404
  const heading = page.locator('h1, [data-testid="product-name"]');
  await expect(heading).not.toContainText(/404|not found|no encontrado/i);

  // 4. Verificar que el body está visible
  await expect(page.locator('body')).toBeVisible();
});

// ========================================
// TEST 2: Mostrar información del producto
// ========================================
test('debe mostrar nombre, precio, descripción e imagen', async ({ page }) => {
  // 1. Verificar nombre visible y no vacío
  const productName = page.locator(SELECTORS.productName);
  await expect(productName).toBeVisible();

  const nameText = await productName.textContent();
  expect(nameText?.trim()).toBeTruthy();
  expect(nameText?.trim().length).toBeGreaterThan(0);

  // 2. Verificar precio con formato de moneda
  const productPrice = page.locator(SELECTORS.productPrice);
  await expect(productPrice).toBeVisible();

  const priceText = await productPrice.textContent();
  // Esperar formato: "Q500.00" o "$1,234.56" o similar
  expect(priceText).toMatch(/[\$Q][\d,]+/);

  // 3. Verificar descripción visible
  const productDesc = page.locator('[data-testid="product-description"], [data-testid="product-details"]');
  if (await productDesc.isVisible()) {
    const descText = await productDesc.textContent();
    expect(descText?.trim().length).toBeGreaterThan(0);
  }

  // 4. Verificar imagen cargada completamente
  const productImage = page.locator(SELECTORS.productImage);
  await expect(productImage).toBeVisible();

  // Verificar que la imagen se cargó correctamente (no es placeholder roto)
  const imageLoaded = await productImage.evaluate((img: HTMLImageElement) => {
    // Verificar que la imagen está completa y tiene tamaño
    return img.complete && img.naturalHeight > 0 && img.naturalWidth > 0;
  });
  expect(imageLoaded).toBe(true);

  // Verificar que tiene src válido (no vacío)
  await expect(productImage).toHaveAttribute('src', /.+/);

  // 5. Verificar que no tiene bordes rotos (lazy load completado)
  const imageSrc = await productImage.getAttribute('src');
  expect(imageSrc).toBeTruthy();
  expect(imageSrc).not.toContain('undefined');
});

// ========================================
// TEST 3: Cambiar cantidad (Svelte reactivity)
// ========================================
test('debe permitir cambiar la cantidad (min: 1, max: 10)', async ({ page }) => {
  const quantitySelector = page.locator(SELECTORS.quantityInput);

  // 1. Verificar valor inicial es 1
  await expect(quantitySelector).toHaveValue('1');

  // 2. Cambiar a 5 correctamente
  await quantitySelector.fill('5');
  await triggerSvelteReactivity(page); // Forzar tick de Svelte reactivity
  await expect(quantitySelector).toHaveValue('5');

  // 3. Intentar poner 0 (debe validar a 1 mínimo)
  await quantitySelector.fill('0');
  await quantitySelector.blur(); // Trigger validación on blur
  await triggerSvelteReactivity(page);

  // Esperar que Svelte corrija a 1
  const value0 = await quantitySelector.inputValue();
  expect(parseInt(value0)).toBeGreaterThanOrEqual(1);

  // 4. Intentar poner 15 (debe limitarse a 10 máximo)
  await quantitySelector.fill('15');
  await quantitySelector.blur();
  await triggerSvelteReactivity(page);

  // Esperar que Svelte corrija a 10
  const value15 = await quantitySelector.inputValue();
  expect(parseInt(value15)).toBeLessThanOrEqual(10);

  // 5. Intentar poner texto (debe ignorar o limpiar)
  await quantitySelector.fill('abc');
  await quantitySelector.blur();
  await triggerSvelteReactivity(page);

  // Debe ser un número válido entre 1-10
  const finalValue = await quantitySelector.inputValue();
  const parsedValue = parseInt(finalValue);
  expect(parsedValue).toBeGreaterThanOrEqual(1);
  expect(parsedValue).toBeLessThanOrEqual(10);
});

// ========================================
// TEST 4: Agregar producto al carrito
// ========================================
test('debe agregar producto al carrito correctamente', async ({ page }) => {
  // 1. Verificar estado inicial del carrito (vacío después de beforeEach)
  const cartBefore = await getCartFromStore(page);
  expect(cartBefore.items).toHaveLength(0);

  // 2. Establecer cantidad a 3
  const quantitySelector = page.locator(SELECTORS.quantityInput);
  await quantitySelector.fill('3');
  await triggerSvelteReactivity(page);

  // 3. Agregar al carrito usando el helper refactorizado
  // Este helper verifica:
  // - Estado del store ANTES
  // - Click en botón
  // - Store se actualiza (polling)
  // - Reactividad de Svelte
  // - UI refleja cambio
  // - Transición de notificación (si existe)
  await addToCart(page, 3);

  // 4. CRÍTICO: Verificar que el STORE se actualizó primero
  await waitForStoreUpdate(
    page,
    'cart',
    (cart) => {
      return (
        cart.items &&
        cart.items.length === 1 &&
        cart.items[0].quantity === 3
      );
    },
    DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
  );

  // 5. Verificar que la UI del badge del carrito refleja el cambio
  const cartCountUI = await getCartCount(page, 'ui');
  expect(cartCountUI).toBe(1); // 1 item en el carrito

  // 6. Verificar el store directamente
  const cartAfter = await getCartFromStore(page);
  expect(cartAfter.items).toHaveLength(1);
  expect(cartAfter.items[0].quantity).toBe(3);

  // 7. Verificar feedback visual (si existe toast/notificación)
  const toast = page.locator(
    '[data-testid="add-to-cart-notification"], [data-testid="toast"], .toast-notification'
  );

  try {
    const isVisible = await toast.isVisible().catch(() => false);
    if (isVisible) {
      // Verificar que contiene mensaje de éxito
      const toastText = await toast.textContent();
      expect(toastText?.toLowerCase()).toMatch(/agregado|añadido|added/);

      // Esperar transición de salida (fade-out típicamente 3-4s)
      await waitForSvelteTransition(page, '[data-testid="add-to-cart-notification"]', {
        state: 'hidden',
        timeout: 5000
      }).catch(() => {
        // Si no hay transición, continuar
      });
    }
  } catch {
    // Si no hay notificación, está bien
  }
});

// ========================================
// TEST 5: Agregar múltiples veces
// ========================================
test('debe permitir agregar múltiples veces el mismo producto', async ({ page }) => {
  const quantitySelector = page.locator(SELECTORS.quantityInput);

  // 1. Agregar producto con cantidad 2
  await quantitySelector.fill('2');
  await triggerSvelteReactivity(page);
  await addToCart(page, 2);

  // Verificar que el store tiene el producto
  let cart = await getCartFromStore(page);
  expect(cart.items).toHaveLength(1);
  expect(cart.items[0].quantity).toBe(2);

  const firstProductId = cart.items[0].id;

  // 2. Volver a agregar el mismo producto con cantidad 3
  // (La cantidad se resetea a 1 después de agregar, o se mantiene en el form)
  await quantitySelector.fill('3');
  await triggerSvelteReactivity(page);
  await addToCart(page, 3);

  // 3. IMPORTANTE: El carrito debe INCREMENTAR, no reemplazar
  // Si es el mismo producto, debe sumar cantidades (2 + 3 = 5)
  // Si el backend los merge, se verá reflejado aquí
  await waitForStoreUpdate(
    page,
    'cart',
    (cart) => {
      // Buscar nuestro producto
      const item = cart.items?.find((i) => i.id === firstProductId);
      return item && item.quantity === 5; // 2 + 3
    },
    DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
  );

  // 4. Verificar el estado final
  cart = await getCartFromStore(page);
  expect(cart.items).toHaveLength(1); // Mismo producto, no duplicado
  expect(cart.items[0].quantity).toBe(5); // Cantidades sumadas
});

// ========================================
// TEST 6: Persistencia después de refresh
// ========================================
test('debe mantener producto en carrito después de recargar la página', async ({ page }) => {
  // 1. Agregar producto al carrito
  const quantitySelector = page.locator(SELECTORS.quantityInput);
  await quantitySelector.fill('2');
  await triggerSvelteReactivity(page);
  await addToCart(page, 2);

  // 2. Verificar estado del carrito ANTES del refresh
  const cartBefore = await getCartFromStore(page);
  expect(cartBefore.items).toHaveLength(1);

  const productId = cartBefore.items[0].id;
  const productName = cartBefore.items[0].name;
  const quantityBefore = cartBefore.items[0].quantity;

  // 3. Recargar la página (simular refresh del usuario)
  // Esto simula que el usuario abre el navegador de nuevo
  await page.reload();

  // 4. Esperar hydration en la página recargada
  await waitForSvelteKitHydration(page);

  // 5. Esperar transición de entrada
  await waitForSvelteTransition(page, SELECTORS.productName, {
    state: 'visible',
    timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
  });

  // 6. Verificar que el carrito persiste en localStorage
  // Esto valida que el store lee correctamente de localStorage
  const cartAfter = await getCartFromStore(page);
  expect(cartAfter.items).toHaveLength(1);
  expect(cartAfter.items[0].id).toBe(productId);
  expect(cartAfter.items[0].name).toBe(productName);
  expect(cartAfter.items[0].quantity).toBe(quantityBefore);

  // 7. Verificar que la UI refleja el carrito persistido
  // El badge del carrito debe mostrar la cantidad correcta
  const cartCountUI = await getCartCount(page, 'ui');
  expect(cartCountUI).toBe(1);

  // 8. Verificar que también se puede leer del store
  const cartCountStore = await getCartCount(page, 'store');
  expect(cartCountStore).toBe(1);
});

// ========================================
// TEST 7: Moneda GTQ en página de producto
// ========================================
test('debe mostrar precios en moneda GTQ (Quetzal)', async ({ page }) => {
  // 1. Buscar el precio del producto
  const productPrice = page.locator(SELECTORS.productPrice);
  await expect(productPrice).toBeVisible();

  const priceText = await productPrice.textContent();

  // 2. Verificar que contiene símbolo de GTQ
  // Aceptar "Q" o "GTQ"
  const hasGTQSymbol = /Q|GTQ/.test(priceText || '');
  expect(hasGTQSymbol).toBe(true);

  // 3. Verificar que tiene número válido
  const hasNumber = /\d+/.test(priceText || '');
  expect(hasNumber).toBe(true);
});

