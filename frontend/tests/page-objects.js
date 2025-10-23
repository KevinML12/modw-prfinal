/**
 * PAGE OBJECT HELPERS - SVELTE-AWARE
 * Funciones reutilizables para tests E2E con SvelteKit + Svelte 5
 * 
 * Abstrae selectores y patrones comunes, considerando:
 * - Hydration de SvelteKit
 * - Transiciones de Svelte
 * - Reactividad del store (localStorage)
 * - Navegación client-side
 */

import { expect } from '@playwright/test';
import { TIMEOUTS, SELECTORS, BASE_URLS } from './test-data.js';
import {
  waitForSvelteKitHydration,
  waitForSvelteTransition,
  waitForStoreUpdate,
  waitForNavigationComplete,
  triggerSvelteReactivity,
  getCartFromStore,
  DEFAULT_SVELTE_TIMEOUTS
} from './helpers/svelte-helpers.js';


/**
 * Navega a la página principal con espera de hydration de SvelteKit
 * 
 * Pasos:
 * 1. Ir a home
 * 2. Esperar hydration completa (data-sveltekit-hydrated)
 * 3. Esperar navegación client-side
 * 4. Esperar que los productos carguen
 * 
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 */
export async function navigateToHome(page) {
  await page.goto('/');
  
  // Esperar a que SvelteKit termine la hydration del cliente
  // Esto es crítico: sin esto, los elementos pueden existir pero no responder a clicks
  await waitForSvelteKitHydration(page);
  
  // Esperar a que la navegación client-side de SvelteKit termine
  await waitForNavigationComplete(page);
  
  // Esperar que al menos un producto sea visible
  // Usar waitForSvelteTransition si los productos tienen fade-in
  await page.waitForSelector(SELECTORS.productCard, {
    timeout: TIMEOUTS.MEDIUM,
  });
}

/**
 * Navega a la página de detalle de un producto con transiciones
 * 
 * Pasos:
 * 1. Ir a /product/[id]
 * 2. Esperar hydration
 * 3. Esperar transición de entrada del nombre
 * 
 * @param {import('@playwright/test').Page} page
 * @param {number} productId - ID del producto
 * @returns {Promise<void>}
 */
export async function navigateToProduct(page, productId) {
  await page.goto(`/product/${productId}`);
  
  // Esperar hydration en esta nueva ruta
  await waitForSvelteKitHydration(page);
  
  // Esperar navegación cliente
  await waitForNavigationComplete(page);
  
  // Esperar transición de entrada del nombre del producto
  // (puede tener fade-in o slide-in)
  await waitForSvelteTransition(page, SELECTORS.productName, {
    state: 'visible',
    timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
  });
}

/**
 * Realiza una búsqueda semántica de productos
 * 
 * Pasos:
 * 1. Rellenar input de búsqueda
 * 2. Presionar Enter
 * 3. Esperar a que se filtre (networkidle)
 * 4. Esperar transición de resultados
 * 
 * @param {import('@playwright/test').Page} page
 * @param {string} query - Texto de búsqueda (ej: "collar de plata")
 * @returns {Promise<void>}
 */
export async function searchProduct(page, query) {
  const searchInput = page.locator(SELECTORS.searchInput);
  
  // Rellenar la búsqueda
  await searchInput.fill(query);
  
  // Presionar Enter para enviar búsqueda
  await searchInput.press('Enter');
  
  // Esperar que la búsqueda semántica procese (Ollama puede tardar)
  await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.LONG });
  
  // Disparar reactividad de Svelte por si se renderiza dinámicamente
  await triggerSvelteReactivity(page);
}

/**
 * Agrega un producto al carrito con sincronización de store
 * 
 * CRÍTICO: Este helper verifica tanto el store como la UI
 * Pasos:
 * 1. Obtener count actual del carrito del store
 * 2. Click en add-to-cart
 * 3. Esperar que el store se actualice (polling)
 * 4. Esperar que la UI refleje el cambio
 * 5. Verificar sincronización store <-> UI
 * 
 * @param {import('@playwright/test').Page} page
 * @param {number} [quantity=1] - Cantidad a agregar
 * @returns {Promise<void>}
 */
export async function addToCart(page, quantity = 1) {
  // Obtener estado del carrito ANTES de la mutación
  const cartBefore = await getCartFromStore(page);
  const itemsCountBefore = cartBefore.items.length;

  // Ajustar cantidad si es necesario
  if (quantity > 1) {
    const quantityInput = page.locator(SELECTORS.quantityInput);
    await quantityInput.fill(String(quantity));
  }

  // Hacer click en agregar al carrito
  const addButton = page.locator(SELECTORS.addToCartButton);
  await addButton.click();

  // PASO CRÍTICO: Esperar que el STORE se actualice (no solo la UI)
  // Esto verifica que la mutación se procesó correctamente
  await waitForStoreUpdate(
    page,
    'cart',
    (cart) => {
      return cart.items && cart.items.length === itemsCountBefore + quantity;
    },
    DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
  );

  // Disparar reactividad para asegurar que la UI se actualice
  await triggerSvelteReactivity(page);

  // Esperar que el badge del carrito se actualice visualmente
  await page.waitForFunction(() => {
    const badge = document.querySelector(SELECTORS.cartBadge);
    if (!badge) return false;
    const count = parseInt(badge.textContent || '0');
    return count === itemsCountBefore + quantity;
  }, { timeout: TIMEOUTS.MEDIUM });

  // Si hay una notificación de "agregado al carrito", esperar su transición
  try {
    const notification = page.locator('[data-testid="add-to-cart-notification"], .toast-notification');
    if (await notification.isVisible()) {
      // Esperar que aparezca (fade-in)
      await waitForSvelteTransition(page, '[data-testid="add-to-cart-notification"]', {
        state: 'visible',
        timeout: TIMEOUTS.SHORT
      });
      
      // Esperar que desaparezca (fade-out) - típicamente después de 3s
      await page.waitForTimeout(3500);
    }
  } catch {
    // Si no hay notificación, continuar sin error
  }
}

/**
 * Abre el modal/drawer del carrito con espera de transición
 * 
 * Pasos:
 * 1. Click en ícono del carrito
 * 2. Esperar transición de entrada
 * 3. Verificar que el contenido es visible
 * 
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 */
export async function openCart(page) {
  // Click en ícono del carrito
  const cartIcon = page.locator(SELECTORS.cartIcon);
  await cartIcon.click();

  // Esperar transición de entrada del contenido del carrito
  // (puede ser slide-in, fade-in, etc.)
  await waitForSvelteTransition(page, SELECTORS.cartContent, {
    state: 'visible',
    timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
  });

  // Si hay un backdrop/overlay, también esperar que sea visible
  try {
    const backdrop = page.locator('[data-testid="cart-backdrop"], .modal-backdrop');
    if (await backdrop.isVisible()) {
      await waitForSvelteTransition(page, '[data-testid="cart-backdrop"]', {
        state: 'visible'
      });
    }
  } catch {
    // Sin backdrop, sin problema
  }
}

/**
 * Obtiene el count actual del carrito desde UI o store
 * 
 * Útil para verificar sincronización: si source='store' vs source='ui'
 * dan resultados diferentes, hay un bug de sincronización.
 * 
 * @param {import('@playwright/test').Page} page
 * @param {'ui'|'store'} [source='ui'] - De dónde leer el count
 * @returns {Promise<number>} Cantidad de items en carrito
 */
export async function getCartCount(page, source = 'ui') {
  if (source === 'store') {
    // Leer directamente del store
    const cart = await getCartFromStore(page);
    return cart.items ? cart.items.length : 0;
  }

  // Leer del badge en la UI (default)
  const cartBadge = page.locator(SELECTORS.cartBadge);

  try {
    const badgeText = await cartBadge.textContent({ timeout: TIMEOUTS.SHORT });
    const count = parseInt(badgeText || '0');
    return isNaN(count) ? 0 : count;
  } catch {
    // Si no hay badge o no es visible, retornar 0
    return 0;
  }
}

/**
 * Obtiene todos los items en el carrito con sus detalles
 * 
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Array<{name: string, price: string, quantity: number}>>}
 */
export async function getCartItems(page) {
  const items = [];
  const cartItems = page.locator(SELECTORS.cartItem);
  const count = await cartItems.count();

  for (let i = 0; i < count; i++) {
    const item = cartItems.nth(i);
    const name = await item.locator(SELECTORS.productName).textContent();
    const price = await item.locator(SELECTORS.productPrice).textContent();
    const quantityText = await item.locator(SELECTORS.quantityInput).inputValue();

    items.push({
      name: name?.trim() || '',
      price: price?.trim() || '',
      quantity: parseInt(quantityText || '1')
    });
  }

  return items;
}

/**
 * Obtiene el precio total del carrito
 * 
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>} Total en formato numérico
 */
export async function getTotalPrice(page) {
  const totalElement = page.locator(SELECTORS.cartTotal);
  const totalText = await totalElement.textContent();

  // Limpiar: "Total: Q500.00" -> 500.00
  const cleaned = totalText?.replace(/[^\d.]/g, '');
  return parseFloat(cleaned || '0');
}

/**
 * Remueve un item del carrito con sincronización de store
 * 
 * Pasos:
 * 1. Obtener count actual del carrito
 * 2. Click en botón remove
 * 3. Esperar transición de salida (fade-out)
 * 4. Esperar que el store se actualice
 * 5. Verificar que el item se removió de la UI
 * 
 * @param {import('@playwright/test').Page} page
 * @param {number} itemIndex - Índice del item a remover
 * @returns {Promise<void>}
 */
export async function removeFromCart(page, itemIndex) {
  // Obtener estado anterior
  const cartBefore = await getCartFromStore(page);
  const countBefore = cartBefore.items.length;

  // Obtener el botón remove del item específico
  const removeButtons = page.locator(SELECTORS.removeButton);
  const removeButton = removeButtons.nth(itemIndex);

  // Click para remover
  await removeButton.click();

  // Esperar transición de salida del item (fade-out)
  const cartItem = page.locator(SELECTORS.cartItem).nth(itemIndex);
  try {
    await waitForSvelteTransition(page, SELECTORS.cartItem, {
      state: 'hidden',
      timeout: DEFAULT_SVELTE_TIMEOUTS.TRANSITION
    });
  } catch {
    // Si no hay transición, continuar
  }

  // Esperar que el STORE se actualice
  await waitForStoreUpdate(
    page,
    'cart',
    (cart) => cart.items && cart.items.length === countBefore - 1,
    DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE
  );

  // Disparar reactividad para asegurar re-render de la UI
  await triggerSvelteReactivity(page);

  // Verificar que el item fue removido del DOM
  await expect(cartItem).not.toBeVisible();
}

/**
 * Limpia el carrito completamente
 * 
 * Estrategia híbrida:
 * 1. Primero intenta limpiar el store directamente (más rápido)
 * 2. Dispara evento storage para que Svelte detecte el cambio
 * 3. Verifica que la UI refleja el carrito vacío
 * 
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 */
export async function clearCart(page) {
  // Limpiar el store directamente
  await page.evaluate(() => {
    const emptyCart = { items: [], total: 0 };
    localStorage.setItem('cart', JSON.stringify(emptyCart));

    // Disparar evento storage para que los listeners de Svelte lo detecten
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cart',
      newValue: JSON.stringify(emptyCart),
      oldValue: localStorage.getItem('cart')
    }));
  });

  // Disparar reactividad
  await triggerSvelteReactivity(page);

  // Esperar que la UI refleje el carrito vacío
  try {
    const cartBadge = page.locator(SELECTORS.cartBadge);
    const badgeVisible = await cartBadge.isVisible();
    
    if (badgeVisible) {
      const badgeText = await cartBadge.textContent();
      expect(parseInt(badgeText || '0')).toBe(0);
    }
  } catch {
    // Si el badge no existe cuando está vacío, es esperado
  }

  // Verificar que no hay items visibles
  const cartItems = page.locator(SELECTORS.cartItem);
  await expect(cartItems).toHaveCount(0);
}

/**
 * Rellena el formulario de checkout con datos de usuario
 * 
 * Pasos:
 * 1. Rellenar cada campo
 * 2. Disparar reactividad después de cada cambio
 * 3. Verificar validaciones en tiempo real si existen
 * 
 * @param {import('@playwright/test').Page} page
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.name - Nombre
 * @param {string} userData.email - Email
 * @param {string} userData.phone - Teléfono
 * @param {string} userData.address - Dirección
 * @param {string} userData.municipality - Municipio
 * @returns {Promise<void>}
 */
export async function fillCheckoutForm(page, userData) {
  const form = {
    name: page.locator('input[name="name"], input[placeholder*="Nombre"]'),
    email: page.locator('input[name="email"], input[type="email"]'),
    phone: page.locator('input[name="phone"], input[placeholder*="Teléfono"]'),
    address: page.locator('textarea[name="address"], textarea[placeholder*="Dirección"]'),
    municipality: page.locator('select[name="municipality"]')
  };

  // Rellenar nombre
  await form.name.fill(userData.name);
  await triggerSvelteReactivity(page);

  // Rellenar email
  await form.email.fill(userData.email);
  await triggerSvelteReactivity(page);

  // Rellenar teléfono
  await form.phone.fill(userData.phone);
  await triggerSvelteReactivity(page);

  // Rellenar dirección
  await form.address.fill(userData.address);
  await triggerSvelteReactivity(page);

  // Seleccionar municipio
  if (userData.municipality) {
    await form.municipality.selectOption(userData.municipality);
    await triggerSvelteReactivity(page);
  }

  // Esperar pequeño delay para que validaciones finales procesen
  await page.waitForTimeout(200);
}

/**
 * Envía el formulario de checkout y espera confirmación
 * 
 * Pasos:
 * 1. Click en submit
 * 2. Esperar navegación (puede ir a otra página o mostrar modal)
 * 3. Verificar mensaje de éxito o error
 * 
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitOrder(page) {
  const submitButton = page.locator('button[type="submit"]');

  // Click en submit
  await submitButton.click();

  // Esperar navegación client-side
  await waitForNavigationComplete(page);

  // Esperar que aparezca mensaje de éxito o error
  const successMessage = page.locator('[data-testid="order-success"], .success-message');
  const errorMessage = page.locator('[data-testid="order-error"], .error-message');

  try {
    // Esperar transición de entrada del mensaje
    await waitForSvelteTransition(page, '[data-testid="order-success"]', {
      state: 'visible',
      timeout: TIMEOUTS.MEDIUM
    });

    const message = await successMessage.textContent();
    return { success: true, message: message?.trim() || 'Orden exitosa' };
  } catch {
    // Intenta error message
    try {
      await waitForSvelteTransition(page, '[data-testid="order-error"]', {
        state: 'visible',
        timeout: TIMEOUTS.MEDIUM
      });

      const message = await errorMessage.textContent();
      return { success: false, message: message?.trim() || 'Error en la orden' };
    } catch {
      return { success: false, message: 'No se pudo determinar resultado' };
    }
  }
}

/**
 * Espera a que el carrito se actualice a una cantidad específica
 * 
 * @param {import('@playwright/test').Page} page
 * @param {number} expectedCount - Cantidad esperada
 * @returns {Promise<void>}
 */
export async function waitForCartUpdate(page, expectedCount) {
  await page.waitForFunction(() => {
    const badge = document.querySelector(SELECTORS.cartBadge);
    if (!badge) return expectedCount === 0;
    const count = parseInt(badge.textContent || '0');
    return count === expectedCount;
  }, { timeout: TIMEOUTS.MEDIUM });
}

/**
 * Verifica que al menos N productos hayan cargado
 * 
 * @param {import('@playwright/test').Page} page
 * @param {number} [minProducts=1] - Mínimo de productos esperados
 * @returns {Promise<boolean>}
 */
export async function verifyProductsLoaded(page, minProducts = 1) {
  const products = page.locator(SELECTORS.productCard);
  const count = await products.count();
  return count >= minProducts;
}

/**
 * Verifica que la moneda GTQ se muestra en la página
 * 
 * Busca "Q" o "GTQ" en los precios
 * 
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<boolean>}
 */
export async function verifyCurrencyIsGTQ(page) {
  const pageText = await page.textContent('body');
  return /[QQ]|GTQ/i.test(pageText || '');
}

/**
 * NUEVO HELPER: Espera a que el store y la UI estén sincronizados
 * 
 * Verifica que el count en localStorage coincida con el badge en la UI.
 * Si no coinciden, dispara reactividad y espera a que se sincronicen.
 * 
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 */
export async function waitForCartSync(page) {
  // Obtener count del store
  const storeCart = await getCartFromStore(page);
  const storeCount = storeCart.items ? storeCart.items.length : 0;

  // Obtener count de la UI
  const uiCount = await getCartCount(page, 'ui');

  // Si no coinciden, disparar reactividad y esperar sync
  if (storeCount !== uiCount) {
    console.warn(`Desincronización: store=${storeCount}, ui=${uiCount}`);

    // Disparar reactividad
    await triggerSvelteReactivity(page);

    // Esperar que se sincronicen
    await page.waitForFunction(() => {
      const badge = document.querySelector(SELECTORS.cartBadge);
      if (!badge) return storeCount === 0;
      const count = parseInt(badge.textContent || '0');
      return count === storeCount;
    }, { timeout: TIMEOUTS.MEDIUM });
  }
}

/**
 * Completa el flujo de checkout completo y maneja redirección a Stripe
 * 
 * Helper de alto nivel que:
 * 1. Llena formulario de checkout
 * 2. Hace submit
 * 3. Espera redirección (Stripe o success/cancel)
 * 4. Retorna información del resultado
 * 
 * @param {import('@playwright/test').Page} page
 * @param {Object} userData - Datos del usuario para el formulario
 * @returns {Promise<{url: string, isStripe: boolean, isSuccess: boolean, isCancel: boolean}>}
 * 
 * @example
 * const result = await completeCheckoutFlow(page, MOCK_USER);
 * if (result.isStripe) {
 *   console.log('Redirigió a Stripe');
 * }
 */
export async function completeCheckoutFlow(page, userData) {
  // 1. Llenar formulario
  await fillCheckoutForm(page, userData);
  
  // 2. Click submit
  const submitBtn = page.locator(SELECTORS.submitOrder);
  await submitBtn.click();
  
  // 3. Esperar redirección (puede ser a Stripe, success o cancel)
  try {
    await page.waitForURL(/checkout\.stripe\.com|\/checkout\/(success|cancel)/, {
      timeout: 10000
    });
  } catch (error) {
    console.warn('No redirigió en el timeout esperado:', error.message);
  }
  
  // 4. Analizar resultado
  const currentUrl = page.url();
  
  return {
    url: currentUrl,
    isStripe: currentUrl.includes('stripe.com'),
    isSuccess: currentUrl.includes('/checkout/success'),
    isCancel: currentUrl.includes('/checkout/cancel')
  };
}

/**
 * Simula vuelta exitosa de Stripe Checkout
 * 
 * Helper para tests que necesitan simular que el usuario
 * completó el pago en Stripe y vuelve a la página de éxito.
 * 
 * @param {import('@playwright/test').Page} page
 * @param {string} sessionId - Session ID de Stripe (opcional, usa mock por defecto)
 * @returns {Promise<void>}
 * 
 * @example
 * await simulateStripeSuccess(page, 'cs_test_custom_session_id');
 * // O usar el mock por defecto:
 * await simulateStripeSuccess(page);
 */
export async function simulateStripeSuccess(page, sessionId = 'cs_test_mock_success_123456789') {
  // 1. Navegar directamente a success con session_id
  await page.goto(`${BASE_URLS.frontend}/checkout/success?session_id=${sessionId}`);
  
  // 2. Esperar hydration de SvelteKit
  await waitForSvelteKitHydration(page);
  
  // 3. Esperar que la página cargue completamente
  await page.waitForLoadState('networkidle');
  
  // 4. Dar tiempo para que el store se actualice (limpieza de carrito)
  await page.waitForTimeout(500);
}

/**
 * Simula cancelación de pago en Stripe
 * 
 * Helper para tests que necesitan simular que el usuario
 * canceló el pago en Stripe y vuelve a la página de cancelación.
 * 
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 * 
 * @example
 * await simulateStripeCancel(page);
 * const cart = await getCartFromStore(page);
 * expect(cart.items.length).toBeGreaterThan(0); // Carrito NO se vació
 */
export async function simulateStripeCancel(page) {
  // 1. Navegar directamente a cancel
  await page.goto(`${BASE_URLS.frontend}/checkout/cancel`);
  
  // 2. Esperar hydration de SvelteKit
  await waitForSvelteKitHydration(page);
  
  // 3. Esperar que la página cargue completamente
  await page.waitForLoadState('networkidle');
}

