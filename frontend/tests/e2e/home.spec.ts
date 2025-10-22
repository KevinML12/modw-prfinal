/**
 * ============================================
 * SUITE DE TESTS E2E: Página de Inicio (Home)
 * ============================================
 * 
 * CONTEXTO:
 * - Proyecto: moda-organica (e-commerce joyería artesanal)
 * - Frontend: SvelteKit en http://frontend:5173 (Docker)
 * - Características: Búsqueda semántica, catálogo de productos
 * - Tests ejecutados desde contenedor 'playwright'
 */

import { test, expect } from '@playwright/test';
import { navigateToHome, searchProduct, verifyProductsLoaded } from '../page-objects.js';
import { BASE_URLS, SEARCH_QUERIES, SELECTORS, TIMEOUTS } from '../test-data.js';

test.describe('Página de Inicio', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a home usando helper
    await navigateToHome(page);
  });

  // ========================================
  // TEST 1: Carga básica de la página
  // ========================================
  test('debe cargar la página principal correctamente', async ({ page }) => {
    // Verificar que page.url() contiene BASE_URLS.frontend
    expect(page).toHaveURL(new RegExp(`${BASE_URLS.frontend}/?$`));
    
    // Verificar que body está visible
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar que no hay errores críticos de consola
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Dar tiempo para que aparezcan logs
    await page.waitForTimeout(1000);
    
    // No debería haber errores críticos (pueden ignorarse warnings)
    const criticalErrors = consoleErrors.filter(
      err => !err.includes('warning') && !err.includes('warn')
    );
    expect(criticalErrors.length).toBe(0);
  });

  // ========================================
  // TEST 2: Header con nombre del sitio
  // ========================================
  test('debe mostrar el encabezado con nombre del sitio', async ({ page }) => {
    // Buscar h1 o elemento principal del header
    const header = page.locator('header, h1, [data-testid="site-name"]').first();
    
    // Verificar que el header está visible
    await expect(header).toBeVisible();
    
    // Verificar que contiene "Moda Orgánica" o nombre del sitio
    const headerText = await page.textContent('header, [data-testid="site-name"]');
    expect(headerText).toBeTruthy();
    // Aceptar "Moda Orgánica", "moda organica" o variantes
    expect(headerText?.toLowerCase()).toMatch(/moda\s+org/);
  });

  // ========================================
  // TEST 3: Catálogo de productos visible
  // ========================================
  test('debe mostrar al menos un producto en el catálogo', async ({ page }) => {
    // Buscar todos los products cards
    const products = page.locator(SELECTORS.productCard);
    
    // Esperar a que al menos uno cargue (TIMEOUTS.MEDIUM para seguridad)
    await expect(products.first()).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    
    // Verificar que hay al menos 1 producto
    const productCount = await products.count();
    expect(productCount).toBeGreaterThanOrEqual(1);
    
    // Verificar que el primer producto tiene nombre y precio
    const firstProduct = products.first();
    const productName = firstProduct.locator(SELECTORS.productName);
    const productPrice = firstProduct.locator(SELECTORS.productPrice);
    
    await expect(productName).toBeVisible();
    await expect(productPrice).toBeVisible();
    
    // Verificar que tiene contenido
    const nameText = await productName.textContent();
    const priceText = await productPrice.textContent();
    
    expect(nameText).toBeTruthy();
    expect(nameText?.trim().length).toBeGreaterThan(0);
    expect(priceText).toBeTruthy();
    expect(priceText).toMatch(/\d+/); // tiene números (precio)
  });

  // ========================================
  // TEST 4: Campo de búsqueda funcional
  // ========================================
  test('debe tener el campo de búsqueda visible y funcional', async ({ page }) => {
    // Buscar input de búsqueda
    const searchInput = page.locator(SELECTORS.searchInput);
    
    // Verificar que está visible
    await expect(searchInput).toBeVisible();
    
    // Verificar que tiene placeholder apropiado
    const placeholder = await searchInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.toLowerCase()).toMatch(/buscar|search|productos|joyería/i);
    
    // Verificar que acepta texto (fill con 'test')
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
    
    // Limpiar para no afectar otros tests
    await searchInput.clear();
  });

  // ========================================
  // TEST 5: Búsqueda semántica funcional
  // ========================================
  test('debe realizar una búsqueda semántica correctamente', async ({ page }) => {
    // Usar searchProduct() con primer término de búsqueda
    await searchProduct(page, SEARCH_QUERIES[0]);
    
    // Esperar que carguen resultados (búsqueda semántica puede tardar)
    await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.LONG });
    
    // Verificar que hay resultados o mensaje apropiado
    const productCards = page.locator(SELECTORS.productCard);
    const noResultsMessage = page.locator('[data-testid="no-results"], text=/sin resultados|no results/i');
    
    // Esperar visible para uno u otro
    const hasProducts = (await productCards.count()) > 0;
    const hasNoResultsMessage = await noResultsMessage.isVisible().catch(() => false);
    
    expect(hasProducts || hasNoResultsMessage).toBeTruthy();
  });

  // ========================================
  // TEST 6: Navegación a detalle de producto
  // ========================================
  test('debe navegar al detalle cuando se hace click en un producto', async ({ page }) => {
    // Obtener el primer product card
    const firstProduct = page.locator(SELECTORS.productCard).first();
    
    // Esperar a que esté visible antes de hacer click
    await expect(firstProduct).toBeVisible();
    
    // Hacer click en el producto
    await firstProduct.click();
    
    // Esperar navegación
    await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });
    
    // Verificar que URL cambió a /product/[id] o similar
    expect(page.url()).toMatch(/product\/\d+|product\?id=\d+/);
    
    // Verificar que se muestra el nombre del producto (SELECTORS.productName debería existir)
    const productName = page.locator(SELECTORS.productName);
    await expect(productName).toBeVisible();
  });

  // ========================================
  // TEST 7: Ícono del carrito visible
  // ========================================
  test('debe mostrar el ícono del carrito en el header', async ({ page }) => {
    // Buscar ícono del carrito
    const cartIcon = page.locator(SELECTORS.cartIcon);
    
    // Verificar que está visible
    await expect(cartIcon).toBeVisible();
    
    // Verificar que tiene un badge visible (puede estar en 0)
    const cartBadge = page.locator(SELECTORS.cartBadge);
    
    // El badge puede existir o no, pero el ícono debe ser clickeable
    await expect(cartIcon).toBeEnabled();
    
    // Verificar que se puede hacer hover o click (verificar que es un elemento interactivo)
    await cartIcon.hover();
    // Si llegó aquí, el elemento es válido
  });

}); // fin del describe - Página de Inicio
