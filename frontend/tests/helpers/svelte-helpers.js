/**
 * ============================================
 * ARCHIVO: svelte-helpers.js
 * PROPÓSITO: Helpers específicos para tests E2E con SvelteKit + Svelte 5
 * ============================================
 * 
 * Maneja particularidades de SvelteKit en entorno Docker:
 * - Hydration completion
 * - Svelte store persistence
 * - Transiciones y animaciones
 * - Reactividad asíncrona
 * - Navegación client-side
 */

/**
 * Timeouts calibrados para entorno Docker con latencia variable
 */
export const DEFAULT_SVELTE_TIMEOUTS = {
  HYDRATION: 15000,      // Primera carga puede tardar en Docker
  TRANSITION: 5000,      // Transiciones CSS/Svelte
  STORE_UPDATE: 10000,   // Actualización de stores con polling
  NAVIGATION: 8000       // Navegación client-side de SvelteKit
};

/**
 * Espera a que SvelteKit termine la hydration del cliente
 * 
 * SvelteKit agrega data-sveltekit-hydrated="true" al <html> cuando termina
 * la hydration. También esperamos networkidle para asegurar que no hay 
 * requests pendientes después de la carga inicial.
 * 
 * @param {import('@playwright/test').Page} page - Instancia de página de Playwright
 * @returns {Promise<void>}
 * @throws {Error} Si hydration no ocurre en el timeout
 * 
 * @example
 * await waitForSvelteKitHydration(page);
 */
export async function waitForSvelteKitHydration(page) {
  try {
    const startTime = Date.now();

    // Esperar a que SvelteKit marque hydration como completa
    await page.waitForSelector('html[data-sveltekit-hydrated="true"]', {
      timeout: DEFAULT_SVELTE_TIMEOUTS.HYDRATION
    });

    // Esperar que no haya requests activos
    await page.waitForLoadState('networkidle', {
      timeout: DEFAULT_SVELTE_TIMEOUTS.HYDRATION
    });

    // Micro-delay para que transiciones iniciales terminen
    await page.waitForTimeout(200);

    const duration = Date.now() - startTime;
    if (duration > 10000) {
      console.warn(`Hydration tardó ${duration}ms (Docker latency)`);
    }
  } catch (error) {
    throw new Error(
      `Hydration de SvelteKit no completó en ${DEFAULT_SVELTE_TIMEOUTS.HYDRATION}ms. ` +
      `Es posible que la página no cargó correctamente. Error: ${error.message}`
    );
  }
}

/**
 * Limpia todos los Svelte stores persistidos en localStorage
 * 
 * Ejecuta código en el contexto del navegador para limpiar datos de sesiones anteriores.
 * Esto es crítico para evitar que tests fallen porque heredan estado del test anterior.
 * 
 * Limpia:
 * - localStorage (cart, user, y otras keys)
 * - sessionStorage (datos temporales)
 * 
 * @param {import('@playwright/test').Page} page - Instancia de página de Playwright
 * @returns {Promise<void>}
 * 
 * @example
 * await clearSvelteStores(page);
 */
export async function clearSvelteStores(page) {
  try {
    await page.evaluate(() => {
      // Limpiar keys específicas de localStorage
      localStorage.removeItem('cart');
      localStorage.removeItem('user');
      localStorage.removeItem('theme');
      localStorage.removeItem('language');
      
      // Limpiar todo sessionStorage
      sessionStorage.clear();
    });

    // Verificar que se limpiaron
    const cartAfterClear = await page.evaluate(() => {
      return localStorage.getItem('cart');
    });

    if (cartAfterClear !== null) {
      console.warn('localStorage("cart") no se limpió completamente');
    }
  } catch (error) {
    console.warn(`Error limpiando Svelte stores: ${error.message}`);
    // No lanzar error porque algunos tests pueden funcionar sin esta limpieza
  }
}

/**
 * Espera a que una transición de Svelte termine en un elemento
 * 
 * Las transiciones de Svelte son CSS-based y pueden causar que elementos
 * estén en el DOM pero no sean interactivos o visibles.
 * 
 * @param {import('@playwright/test').Page} page - Instancia de página de Playwright
 * @param {string} selector - Selector del elemento
 * @param {Object} options - Opciones
 * @param {number} [options.timeout=5000] - Timeout en ms
 * @param {'visible'|'hidden'} [options.state='visible'] - Estado esperado
 * @returns {Promise<void>}
 * 
 * @example
 * // Esperar a que un modal aparezca con transición
 * await waitForSvelteTransition(page, '[data-testid="checkout-modal"]', { state: 'visible' });
 * 
 * // Esperar a que un dropdown desaparezca
 * await waitForSvelteTransition(page, '[data-testid="menu"]', { state: 'hidden', timeout: 3000 });
 */
export async function waitForSvelteTransition(page, selector, options = {}) {
  const { timeout = DEFAULT_SVELTE_TIMEOUTS.TRANSITION, state = 'visible' } = options;

  try {
    // Primero, esperar a que el elemento exista en el DOM
    await page.waitForSelector(selector, { timeout });

    // Esperar a que la transición termine verificando opacity y transition duration
    await page.waitForFunction(
      (selector, state) => {
        const element = document.querySelector(selector);
        if (!element) return false;

        const computed = window.getComputedStyle(element);
        const opacity = parseFloat(computed.opacity);
        const transitionDuration = computed.transitionDuration;

        if (state === 'visible') {
          // Elemento debe estar visible (opacity = 1 o similar)
          return opacity >= 0.99 && transitionDuration === '0s';
        } else {
          // Elemento debe estar oculto (opacity = 0 o display = none)
          return opacity <= 0.01 && transitionDuration === '0s';
        }
      },
      [selector, state],
      { timeout }
    );
  } catch (error) {
    console.warn(
      `Transición de Svelte no completó para "${selector}" (${state}). ` +
      `Continuando de todas formas. Error: ${error.message}`
    );
    // No lanzar error porque el elemento podría estar visible aunque la transición siga activa
  }
}

/**
 * Espera a que un Svelte store se actualice a un valor esperado
 * 
 * Lee el store desde localStorage (donde Svelte lo persiste) y verifica
 * que cumpla con la condición especificada usando polling.
 * 
 * @param {import('@playwright/test').Page} page - Instancia de página de Playwright
 * @param {'cart'|'user'|'theme'} storeName - Nombre del store en localStorage
 * @param {Function} checkFunction - Función que recibe el valor del store y retorna boolean
 * @param {number} [timeout=10000] - Timeout en ms
 * @returns {Promise<void>}
 * 
 * @example
 * // Esperar a que el carrito tenga 2 items
 * await waitForStoreUpdate(
 *   page,
 *   'cart',
 *   (cart) => cart.items && cart.items.length === 2
 * );
 * 
 * // Esperar a que el total del carrito sea mayor a 100
 * await waitForStoreUpdate(
 *   page,
 *   'cart',
 *   (cart) => cart.total > 100,
 *   5000
 * );
 */
export async function waitForStoreUpdate(page, storeName, checkFunction, timeout = DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE) {
  try {
    await page.waitForFunction(
      (storeName, checkFunctionStr) => {
        const storeData = localStorage.getItem(storeName);
        const parsed = storeData ? JSON.parse(storeData) : null;

        // Convertir string de función en función ejecutable
        // eslint-disable-next-line no-eval
        const check = eval(`(${checkFunctionStr})`);
        return check(parsed);
      },
      [storeName, checkFunction.toString()],
      { timeout, polling: 100 }
    );
  } catch (error) {
    const currentValue = await page.evaluate((storeName) => {
      const data = localStorage.getItem(storeName);
      return data ? JSON.parse(data) : null;
    }, storeName);

    throw new Error(
      `Store "${storeName}" no se actualizó al valor esperado en ${timeout}ms. ` +
      `Valor actual: ${JSON.stringify(currentValue)}. Error: ${error.message}`
    );
  }
}

/**
 * Fuerza un tick de reactividad de Svelte
 * 
 * En Svelte 5 la reactividad es síncrona en la mayoría de casos, pero a veces
 * necesitamos esperar un microtask para que los cambios se reflejen en el DOM.
 * 
 * @param {import('@playwright/test').Page} page - Instancia de página de Playwright
 * @returns {Promise<void>}
 * 
 * @example
 * // Después de actualizar una variable Svelte
 * await triggerSvelteReactivity(page);
 * // Ahora el DOM debería estar actualizado
 */
export async function triggerSvelteReactivity(page) {
  try {
    // Ejecutar microtask en el contexto del navegador
    await page.evaluate(() => {
      return new Promise(resolve => {
        // Primero, un microtask (Promise)
        Promise.resolve().then(() => {
          // Luego un macrotask pequeño (setTimeout)
          setTimeout(resolve, 0);
        });
      });
    });

    // Esperar adicional en el cliente de Playwright
    await page.waitForTimeout(50);
  } catch (error) {
    console.warn(`Error en triggerSvelteReactivity: ${error.message}`);
  }
}

/**
 * Obtiene el estado actual del carrito directamente del store
 * 
 * Lee localStorage directamente en el contexto del navegador para obtener
 * el estado actual sin pasar por la UI.
 * 
 * @param {import('@playwright/test').Page} page - Instancia de página de Playwright
 * @returns {Promise<{items: Array, total: number}>} Estado del carrito
 * 
 * @example
 * const cart = await getCartFromStore(page);
 * console.log(`Carrito tiene ${cart.items.length} items`);
 * 
 * @typedef {Object} CartStore
 * @property {Array<Object>} items - Items en el carrito
 * @property {number} total - Total del carrito
 */
export async function getCartFromStore(page) {
  try {
    const cart = await page.evaluate(() => {
      const cartData = localStorage.getItem('cart');
      if (!cartData) {
        return { items: [], total: 0 };
      }
      try {
        return JSON.parse(cartData);
      } catch {
        return { items: [], total: 0 };
      }
    });

    return cart;
  } catch (error) {
    console.warn(`Error obteniendo carrito del store: ${error.message}`);
    return { items: [], total: 0 };
  }
}

/**
 * Espera a que SvelteKit complete una navegación client-side
 * 
 * SvelteKit usa routing client-side después de la hydration inicial.
 * Esta función espera a que una navegación termine completamente.
 * 
 * Estrategia:
 * 1. Esperar networkidle (no hay requests pendientes)
 * 2. Esperar domcontentloaded (DOM está listo)
 * 3. Pequeño delay para transiciones de página
 * 
 * @param {import('@playwright/test').Page} page - Instancia de página de Playwright
 * @param {Object} options - Opciones
 * @param {number} [options.timeout=8000] - Timeout en ms
 * @returns {Promise<void>}
 * 
 * @example
 * // Hacer click que causa navegación client-side
 * await page.click('a[href="/checkout"]');
 * // Esperar a que la navegación termine
 * await waitForNavigationComplete(page);
 * // Ahora estamos en /checkout
 */
export async function waitForNavigationComplete(page, options = {}) {
  const { timeout = DEFAULT_SVELTE_TIMEOUTS.NAVIGATION } = options;

  try {
    // Esperar a que no haya requests activos
    await page.waitForLoadState('networkidle', { timeout });

    // Esperar a que el DOM esté completamente cargado
    await page.waitForLoadState('domcontentloaded', { timeout });

    // Delay para que transiciones de página terminen
    await page.waitForTimeout(100);
  } catch (error) {
    console.warn(
      `Navegación no completó completamente en ${timeout}ms. ` +
      `Continuando de todas formas. Error: ${error.message}`
    );
    // No lanzar error porque podemos estar en un estado suficientemente cargado
  }
}

/**
 * Helper compuesto: Limpiar store + esperar hydration + trigger reactividad
 * 
 * Esto se usa típicamente al inicio de cada test para un estado limpio.
 * 
 * @param {import('@playwright/test').Page} page - Instancia de página de Playwright
 * @returns {Promise<void>}
 * 
 * @example
 * test.beforeEach(async ({ page }) => {
 *   await initializeSvelteTestEnvironment(page);
 * });
 */
export async function initializeSvelteTestEnvironment(page) {
  await clearSvelteStores(page);
  await waitForSvelteKitHydration(page);
  await triggerSvelteReactivity(page);
}

/**
 * Espera a que el carrito esté sincronizado con el store
 * 
 * Valida que:
 * - El localStorage tenga la key 'cart'
 * - El carrito sea un JSON válido
 * - El carrito tenga la estructura esperada
 * 
 * @param {import('@playwright/test').Page} page - Instancia de página de Playwright
 * @param {number} timeout - Timeout en ms
 * @returns {Promise<Object>} El objeto del carrito
 * 
 * @example
 * const cart = await waitForCartSync(page);
 * console.log(cart.items.length);
 */
export async function waitForCartSync(page, timeout = DEFAULT_SVELTE_TIMEOUTS.STORE_UPDATE) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const cartJson = await page.evaluate(() => {
        return localStorage.getItem('cart');
      });
      
      if (cartJson) {
        const cart = JSON.parse(cartJson);
        if (cart && typeof cart === 'object' && 'items' in cart) {
          return cart;
        }
      }
    } catch (error) {
      // JSON inválido o localStorage vacío, seguir esperando
    }
    
    // Esperar un poco antes de intentar de nuevo
    await page.waitForTimeout(100);
  }
  
  throw new Error(
    `Cart no sincronizó en ${timeout}ms. Posiblemente el store no se inicializó correctamente.`
  );
}