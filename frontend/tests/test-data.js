/**
 * Datos de prueba reutilizables para tests E2E de Moda Orgánica
 * Se ejecutan dentro del contenedor 'playwright' de Docker
 */

// ============================================
// URLS DE SERVICIOS
// ============================================

export const BASE_URLS = {
  frontend: process.env.BASE_URL || 'http://frontend:5173',
  backend: process.env.API_URL || 'http://backend:8080',
};

// ============================================
// TIMEOUTS (en ms)
// ============================================

export const TIMEOUTS = {
  SHORT: 5000,      // Esperas cortas (clicks, fills)
  MEDIUM: 10000,    // Esperas medias (cargas, navegación)
  LONG: 30000,      // Esperas largas (búsqueda semántica)
  XLARGE: 60000,    // Muy largas (embeddings Ollama)
};

// ============================================
// USUARIO DE PRUEBA VÁLIDO
// ============================================

/**
 * @type {Object}
 * Usuario válido para pruebas de checkout y formularios
 */
export const MOCK_USER = {
  name: 'María Rodríguez Test',
  email: 'maria.test@modaorganica.com',
  phone: '+52 55 1234 5678',
  address: 'Av. Reforma 123, Col. Centro',
  city: 'Ciudad de México',
  state: 'CDMX',
  postalCode: '06000',
  country: 'México',
};

// ============================================
// DATOS INVÁLIDOS PARA TESTS NEGATIVOS
// ============================================

/**
 * @type {Object}
 * Datos inválidos para validar manejo de errores
 */
export const MOCK_USER_INVALID = {
  name: '', // Vacío
  email: 'invalid-email-sin-arroba', // Sin @
  phone: '123', // Muy corto
  postalCode: 'ABCDE', // Letras en lugar de números
};

// ============================================
// IDS DE PRODUCTOS PARA TESTS
// ============================================

/**
 * IMPORTANTE: ACTUALIZAR ESTOS IDS CON PRODUCTOS REALES
 * 
 * Para obtener IDs de productos reales:
 * 1. docker-compose exec backend sh
 * 2. Conectar a Supabase y ejecutar:
 *    SELECT id, name FROM products LIMIT 5;
 * 3. Copiar los IDs y reemplazar en TEST_PRODUCT_IDS
 * 
 * Estos son IDs de ejemplo
 */
export const TEST_PRODUCT_IDS = [1, 2, 3];

// ============================================
// BÚSQUEDAS SEMÁNTICAS DE JOYERÍA
// ============================================

/**
 * Búsquedas realistas de joyería artesanal
 * Utilizadas para probar búsqueda semántica con Ollama
 */
export const SEARCH_QUERIES = [
  'collar de plata',
  'anillo de oro rosa',
  'aretes de perla',
  'pulsera artesanal',
  'joyería minimalista',
  'accesorios elegantes',
];

// ============================================
// SELECTORES DATA-TESTID (REFERENCIA)
// ============================================

/**
 * @type {Object}
 * Selectores comunes para tests
 * Usar en locator() del page object
 */
export const SELECTORS = {
  // Navegación
  cartIcon: '[data-testid="cart-icon"]',
  cartBadge: '[data-testid="cart-badge"]',
  cartCount: '[data-testid="cart-count"]',
  cartButton: '[data-testid="cart-button"]',

  // Productos
  productCard: '[data-testid="product-card"]',
  productName: '[data-testid="product-name"]',
  productPrice: '[data-testid="product-price"]',
  productImage: '[data-testid="product-image"]',
  productDescription: '[data-testid="product-description"]',
  addToCartBtn: '[data-testid="add-to-cart"]',
  quantitySelector: '[data-testid="quantity-selector"]',
  productRating: '[data-testid="product-rating"]',

  // Carrito
  cartContent: '[data-testid="cart-content"]',
  cartItem: '[data-testid="cart-item"]',
  cartTotal: '[data-testid="cart-total"]',
  cartItemQuantity: '[data-testid="cart-item-quantity"]',
  removeFromCart: '[data-testid="remove-from-cart"]',
  checkoutBtn: '[data-testid="checkout-button"]',

  // Búsqueda
  searchInput: '[data-testid="search-input"]',
  searchButton: '[data-testid="search-button"]',
  searchResults: '[data-testid="search-results"]',

  // Checkout
  checkoutForm: '[data-testid="checkout-form"]',
  submitOrder: '[data-testid="submit-order"]',
  formError: '[data-testid="error-message"]',
  formSuccess: '[data-testid="success-message"]',

  // Formularios
  nameInput: 'input[name="name"]',
  emailInput: 'input[type="email"]',
  phoneInput: 'input[name="phone"]',
  addressInput: 'input[name="address"]',
  municipalitySelect: 'select[name="municipality"]',

  // Otros
  loadingSpinner: '[data-testid="loading"]',
  emptyCart: '[data-testid="empty-cart"]',
  orderSummary: '[data-testid="order-summary"]',
  itemsTotal: '[data-testid="items-total"]',
};

// ============================================
// HELPERS DE PRUEBA
// ============================================

/**
 * Genera un email único para cada test
 * @returns {string} Email con timestamp
 */
export function generateTestEmail() {
  const timestamp = Date.now();
  return `test.${timestamp}@modaorganica.com`;
}

/**
 * Genera un usuario válido con email único
 * @returns {Object} Usuario con email único
 */
export function generateTestUser() {
  return {
    ...MOCK_USER,
    email: generateTestEmail(),
  };
}

/**
 * Espera a que un elemento sea visible en el DOM
 * Útil para sincronización
 * @param {Page} page - Objeto page de Playwright
 * @param {string} selector - Selector del elemento
 * @param {number} timeout - Timeout en ms (default: TIMEOUTS.MEDIUM)
 */
export async function waitForVisible(page, selector, timeout = TIMEOUTS.MEDIUM) {
  return page.waitForSelector(selector, { timeout });
}

/**
 * Obtiene el texto de un elemento
 * @param {Page} page - Objeto page de Playwright
 * @param {string} selector - Selector del elemento
 * @returns {Promise<string>} Texto del elemento
 */
export async function getText(page, selector) {
  return page.locator(selector).textContent();
}

/**
 * Obtiene el precio de un elemento y lo convierte a número
 * @param {Page} page - Objeto page de Playwright
 * @param {string} selector - Selector del elemento con precio
 * @returns {Promise<number>} Precio como número
 */
export async function getPrice(page, selector) {
  const text = await getText(page, selector);
  // Extrae números: "Q 1,234.56" -> 1234.56
  const numbers = text.match(/[\d,]+\.?\d*/);
  return parseFloat(numbers[0].replace(/,/g, ''));
}

/**
 * Limpia el carrito borrando localStorage
 * @param {Page} page - Objeto page de Playwright
 */
export async function clearCart(page) {
  await page.evaluate(() => {
    localStorage.removeItem('cart');
    localStorage.removeItem('moda-organica-cart');
  });
}

/**
 * Obtiene la cantidad de items en el carrito desde el contador
 * @param {Page} page - Objeto page de Playwright
 * @returns {Promise<number>} Cantidad de items
 */
export async function getCartCount(page) {
  try {
    const text = await getText(page, SELECTORS.cartCount);
    return parseInt(text, 10);
  } catch {
    return 0;
  }
}

// ============================================
// STRIPE TEST DATA
// ============================================
/**
 * Constantes para tests del flujo de pago con Stripe.
 * Incluye session IDs de prueba, URLs y datos de tarjetas test.
 */
export const STRIPE_TEST_DATA = {
  /**
   * Session IDs mock para tests
   */
  sessionIds: {
    success: 'cs_test_mock_success_123456789',
    cancel: 'cs_test_mock_cancel_987654321',
    expired: 'cs_test_mock_expired_111111111',
  },

  /**
   * URLs de Stripe para validaciones
   */
  urls: {
    checkoutBase: 'https://checkout.stripe.com',
    successPath: '/checkout/success',
    cancelPath: '/checkout/cancel',
  },

  /**
   * Mock de respuesta del backend para create-checkout-session
   */
  mockCheckoutSession: {
    checkout_url: 'https://checkout.stripe.com/c/pay/cs_test_mock123',
    session_id: 'cs_test_mock123',
    order_id: 1
  },

  /**
   * Tarjeta de prueba de Stripe (para tests manuales)
   *
   * NOTA: Esta tarjeta NO se usa en tests E2E automatizados
   * porque no podemos completar el pago en Stripe durante CI/CD.
   *
   * Usar solo para validación manual.
   */
  testCard: {
    number: '4242424242424242',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
    description: 'Tarjeta de prueba de Stripe (always succeeds)'
  },

  /**
   * Tarjetas de prueba adicionales (para casos edge)
   */
  testCardsEdgeCases: {
    declined: {
      number: '4000000000000002',
      description: 'Card declined'
    },
    insufficientFunds: {
      number: '4000000000009995',
      description: 'Insufficient funds'
    },
    requiresAuthentication: {
      number: '4000002500003155',
      description: 'Requires 3D Secure authentication'
    }
  },

  /**
   * Patterns regex para validaciones
   */
  patterns: {
    sessionId: /^cs_test_[a-zA-Z0-9]+$/,
    checkoutUrl: /^https:\/\/checkout\.stripe\.com/,
  }
};
