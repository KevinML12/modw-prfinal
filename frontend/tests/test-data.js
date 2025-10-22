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
 * ⚠️  IMPORTANTE: ACTUALIZAR ESTOS IDS CON PRODUCTOS REALES
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
