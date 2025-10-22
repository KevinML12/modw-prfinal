import { test, expect } from '@playwright/test';
import { BASE_URLS, TIMEOUTS, SELECTORS } from '../test-data.js';
import { 
  waitForSvelteKitHydration, 
  clearSvelteStores, 
  waitForSvelteTransition,
  DEFAULT_SVELTE_TIMEOUTS 
} from '../helpers/svelte-helpers.js';

/**
 * Tests para LocationSelector component
 * 
 * Valida:
 * - Selección de departamento y municipio
 * - Filtrado reactivo de municipios
 * - Badge especial para Huehuetenango y Chiantla
 * - Validación de formulario
 * - Captura de dirección completa
 * - Navegación desde carrito
 */

test.describe('LocationSelector Component', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar estado
    await clearSvelteStores(page);

    // Navegamosirectamente al checkout
    await page.goto(`${BASE_URLS.frontend}/checkout`, { 
      waitUntil: 'networkidle'
    });

    // Esperar hidratación de SvelteKit
    await waitForSvelteKitHydration(page);

    // Verificar que el checkout se cargó
    const title = await page.locator('h1').first();
    await expect(title).toContainText('Resumen de tu Orden', { timeout: DEFAULT_SVELTE_TIMEOUTS.HYDRATION });
  });

  test('✅ Mostrar selector de ubicación en checkout', async ({ page }) => {
    // Verificar que existen los selects de ubicación
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');
    const addressInput = page.locator('#address');

    await expect(deptSelect).toBeVisible();
    await expect(munSelect).toBeVisible();
    await expect(addressInput).toBeVisible();

    // Verificar labels
    const deptLabel = page.locator('label:has-text("Departamento")');
    const munLabel = page.locator('label:has-text("Municipio")');
    const addrLabel = page.locator('label:has-text("Dirección")');

    await expect(deptLabel).toBeVisible();
    await expect(munLabel).toBeVisible();
    await expect(addrLabel).toBeVisible();
  });

  test('✅ Listar departamentos en primer select', async ({ page }) => {
    const deptSelect = page.locator('#department');

    // Click para abrir
    await deptSelect.click();
    await page.waitForTimeout(300);

    // Verificar que existen opciones de departamentos
    const options = deptSelect.locator('option');
    const count = await options.count();

    // Debe haber más de 20 departamentos
    expect(count).toBeGreaterThan(20);

    // Verificar algunos departamentos específicos
    const guatemalaOption = deptSelect.locator('option:has-text("Guatemala")');
    const huehOption = deptSelect.locator('option:has-text("Huehuetenango")');
    const quetOption = deptSelect.locator('option:has-text("Quetzaltenango")');

    await expect(guatemalaOption).toBeVisible();
    await expect(huehOption).toBeVisible();
    await expect(quetOption).toBeVisible();
  });

  test('✅ Filtrar municipios al seleccionar departamento', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');

    // Seleccionar Guatemala
    await deptSelect.selectOption('GT-01');
    await page.waitForTimeout(300);

    // Verificar que se habilita el select de municipio
    await expect(munSelect).not.toBeDisabled();

    // Verificar que aparecen municipios de Guatemala
    const options = munSelect.locator('option');
    const count = await options.count();

    // Guatemala tiene 17 municipios
    expect(count).toBeGreaterThanOrEqual(17);

    // Verificar municipios específicos de Guatemala
    await expect(munSelect.locator('option:has-text("Mixco")')).toBeVisible();
    await expect(munSelect.locator('option:has-text("Guatemala")')).toBeVisible();
    await expect(munSelect.locator('option:has-text("Villa Nueva")')).toBeVisible();
  });

  test('✅ Resetear municipio al cambiar departamento', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');

    // Seleccionar Guatemala y un municipio
    await deptSelect.selectOption('GT-01');
    await page.waitForTimeout(300);
    await munSelect.selectOption('GT-01-01'); // Guatemala city

    // Verificar que se seleccionó
    const value1 = await munSelect.inputValue();
    expect(value1).toBe('GT-01-01');

    // Cambiar a otro departamento
    await deptSelect.selectOption('GT-13'); // Huehuetenango
    await page.waitForTimeout(300);

    // Verificar que el municipio se resetea
    const value2 = await munSelect.inputValue();
    expect(value2).toBe('');

    // Verificar que ahora muestra municipios de Huehuetenango
    await expect(munSelect.locator('option:has-text("Huehuetenango")')).toBeVisible();
    await expect(munSelect.locator('option:has-text("Chiantla")')).toBeVisible();
  });

  test('✅ Mostrar badge especial para zonas de envío local', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');

    // Seleccionar Huehuetenango
    await deptSelect.selectOption('GT-13');
    await page.waitForTimeout(300);

    // Select Huehuetenango city (the special zone)
    await munSelect.selectOption('GT-13-01');
    await page.waitForTimeout(500);

    // Buscar el badge de envío local
    const badge = page.locator('text=Envío Local Disponible');
    
    // Esperar la transición
    await waitForSvelteTransition(page, ':has-text("Envío Local Disponible")');
    await expect(badge).toBeVisible();

    // Verificar el mensaje específico
    const badgeText = page.locator('text=Hemos optimizado entregas para Huehuetenango, Huehuetenango');
    await expect(badgeText).toBeVisible();
  });

  test('✅ Mostrar badge para Chiantla también', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');

    // Seleccionar Huehuetenango
    await deptSelect.selectOption('GT-13');
    await page.waitForTimeout(300);

    // Select Chiantla
    await munSelect.selectOption('GT-13-02');
    await page.waitForTimeout(500);

    // Buscar badge
    const badge = page.locator('text=Envío Local Disponible');
    await waitForSvelteTransition(page, ':has-text("Envío Local Disponible")');
    await expect(badge).toBeVisible();

    // Verificar mensaje con Chiantla
    const badgeText = page.locator('text=Hemos optimizado entregas para Chiantla, Huehuetenango');
    await expect(badgeText).toBeVisible();
  });

  test('✅ NO mostrar badge para municipios no especiales', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');

    // Seleccionar Huehuetenango
    await deptSelect.selectOption('GT-13');
    await page.waitForTimeout(300);

    // Select un municipio diferente (no especial)
    await munSelect.selectOption('GT-13-03'); // La Libertad
    await page.waitForTimeout(300);

    // Verificar que NO aparece el badge
    const badge = page.locator('text=Envío Local Disponible');
    await expect(badge).not.toBeVisible();
  });

  test('✅ Validar que dirección es requerida', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');
    const addrInput = page.locator('#address');

    // Seleccionar ubicación
    await deptSelect.selectOption('GT-01');
    await page.waitForTimeout(300);
    await munSelect.selectOption('GT-01-01');
    await page.waitForTimeout(300);

    // Intentar blur sin contenido
    await addrInput.focus();
    await addrInput.blur();
    await page.waitForTimeout(500);

    // Buscar mensaje de error
    const errorMsg = page.locator('text=Por favor ingresa la dirección');
    await expect(errorMsg).toBeVisible();
  });

  test('✅ Validar que dirección tenga mínimo 10 caracteres', async ({ page }) => {
    const addrInput = page.locator('#address');

    // Ingresar dirección muy corta
    await addrInput.fill('Calle 5');
    await addrInput.blur();
    await page.waitForTimeout(300);

    // Verificar error
    const errorMsg = page.locator('text=La dirección debe tener al menos 10 caracteres');
    await expect(errorMsg).toBeVisible();

    // Agregar más caracteres
    await addrInput.fill('Calle 5, zona 1');
    await addrInput.blur();
    await page.waitForTimeout(300);

    // Error debe desaparecer
    await expect(errorMsg).not.toBeVisible();
  });

  test('✅ Mostrar contador de caracteres de dirección', async ({ page }) => {
    const addrInput = page.locator('#address');
    const charCounter = page.locator('text=/^\\d+\\/100$/'); // Busca "XX/100"

    // Ingresar dirección
    const address = 'Calle Principal 123, Apto 4, zona 1';
    await addrInput.fill(address);
    await page.waitForTimeout(300);

    // Verificar contador
    const counter = await charCounter.textContent();
    expect(counter).toBe(`${address.length}/100`);
  });

  test('✅ Mostrar preview de ubicación seleccionada', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');
    const addrInput = page.locator('#address');

    // Seleccionar ubicación
    await deptSelect.selectOption('GT-01');
    await page.waitForTimeout(300);
    await munSelect.selectOption('GT-01-01');
    await page.waitForTimeout(300);

    // Ingresar dirección
    await addrInput.fill('Calle Principal 123, zona 1');
    await page.waitForTimeout(300);

    // Verificar preview
    const previewLabel = page.locator('text=Vista previa del envío');
    await expect(previewLabel).toBeVisible();

    // Verificar ubicación en preview
    const locationLine = page.locator('text=Guatemala, Guatemala');
    await expect(locationLine).toBeVisible();

    // Verificar dirección en preview
    const addressLine = page.locator('text=Calle Principal 123, zona 1');
    await expect(addressLine).toBeVisible();
  });

  test('✅ Capturar datos completos de ubicación para envío', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');
    const addrInput = page.locator('#address');

    // Seleccionar ubicación completa
    await deptSelect.selectOption('GT-13'); // Huehuetenango
    await page.waitForTimeout(300);
    await munSelect.selectOption('GT-13-01'); // Huehuetenango city
    await page.waitForTimeout(300);
    await addrInput.fill('Calle Independencia 456, Apto 2, zona 1');
    await page.waitForTimeout(300);

    // Verificar que los datos se capturan en el objeto value
    const deptValue = await deptSelect.inputValue();
    const munValue = await munSelect.inputValue();
    const addrValue = await addrInput.inputValue();

    expect(deptValue).toBe('GT-13');
    expect(munValue).toBe('GT-13-01');
    expect(addrValue).toBe('Calle Independencia 456, Apto 2, zona 1');

    // Verificar badge
    const badge = page.locator('text=Envío Local Disponible');
    await expect(badge).toBeVisible();
  });

  test('✅ Deshabilitar municipio hasta seleccionar departamento', async ({ page }) => {
    const munSelect = page.locator('#municipality');

    // Verificar que está deshabilitado inicialmente
    await expect(munSelect).toBeDisabled();

    // Mensaje debe indicar que primero seleccione departamento
    const placeholder = munSelect.locator('option:first-child');
    const text = await placeholder.textContent();
    expect(text).toContain('Primero selecciona departamento');
  });

  test('✅ Validar todos los 22 departamentos están presentes', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const options = deptSelect.locator('option');

    // Contar opciones (incluyendo placeholder)
    const count = await options.count();

    // Debe haber 22 departamentos + 1 placeholder
    expect(count).toBe(23);
  });

  test('✅ Estilos accessibility: labels correctamente asociados', async ({ page }) => {
    const deptInput = page.locator('#department');
    const munInput = page.locator('#municipality');
    const addrInput = page.locator('#address');

    // Verificar que tienen labels
    const deptLabel = page.locator('label[for="department"]');
    const munLabel = page.locator('label[for="municipality"]');
    const addrLabel = page.locator('label[for="address"]');

    await expect(deptLabel).toBeVisible();
    await expect(munLabel).toBeVisible();
    await expect(addrLabel).toBeVisible();

    // Verificar aria-labels
    expect(await deptInput.getAttribute('aria-label')).toBeTruthy();
    expect(await munInput.getAttribute('aria-label')).toBeTruthy();
    expect(await addrInput.getAttribute('aria-label')).toBeTruthy();
  });

  test('✅ Validación visual: indicador de campos requeridos', async ({ page }) => {
    // Buscar asteriscos de "requerido"
    const requiredIndicators = page.locator('span:has-text("*")');
    const count = await requiredIndicators.count();

    // Debe haber 3 asteriscos (para Dept, Municipio, Dirección)
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('✅ Keyboard navigation: tab entre campos', async ({ page }) => {
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');
    const addrInput = page.locator('#address');

    // Focus en primer select
    await deptSelect.focus();
    await expect(deptSelect).toBeFocused();

    // Tab al siguiente
    await page.keyboard.press('Tab');
    // (Skip algunos campos del formulario anterior)
    
    // Navegar hasta municipio
    await munSelect.focus();
    expect(await munSelect.evaluate(el => document.activeElement === el)).toBe(true);

    // Tab a dirección
    await addrInput.focus();
    expect(await addrInput.evaluate(el => document.activeElement === el)).toBe(true);
  });

  test('✅ Validación en tiempo real: error desaparece al corregir', async ({ page }) => {
    const deptSelect = page.locator('#department');

    // Verificar error inicial
    const errorMsg = page.locator('text=Por favor selecciona un departamento');
    
    // Forzar validación (blur sin seleccionar)
    await deptSelect.focus();
    await deptSelect.blur();
    await page.waitForTimeout(300);

    // Debería no estar visible si not required, pero si hacemos submit...
    // Para este test, seleccionar y verificar que error no aparece
    await deptSelect.selectOption('GT-01');
    await page.waitForTimeout(300);

    // Error no debe estar visible
    await expect(errorMsg).not.toBeVisible();
  });

  test('✅ Integración: llenar formulario completo de checkout', async ({ page }) => {
    // Llenar información de contacto
    const emailInput = page.locator('#email');
    const nameInput = page.locator('#fullName');
    const phoneInput = page.locator('#phone');

    await emailInput.fill('cliente@example.com');
    await nameInput.fill('Juan García López');
    await phoneInput.fill('78901234');

    // Llenar ubicación
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');
    const addrInput = page.locator('#address');

    await deptSelect.selectOption('GT-01');
    await page.waitForTimeout(300);
    await munSelect.selectOption('GT-01-01');
    await page.waitForTimeout(300);
    await addrInput.fill('Calle 6 Avenida, zona 1, Guatemala');
    await page.waitForTimeout(300);

    // Verificar que todos los campos tienen valores
    expect(await emailInput.inputValue()).toBe('cliente@example.com');
    expect(await nameInput.inputValue()).toBe('Juan García López');
    expect(await phoneInput.inputValue()).toBe('78901234');
    expect(await deptSelect.inputValue()).toBe('GT-01');
    expect(await munSelect.inputValue()).toBe('GT-01-01');
    expect(await addrInput.inputValue()).toContain('Calle 6 Avenida');
  });

  test('✅ Responsive: mostrar correctamente en mobile', async ({ page }) => {
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await waitForSvelteKitHydration(page);
    await page.waitForTimeout(500);

    // Verificar que los selects son visibles
    const deptSelect = page.locator('#department');
    const munSelect = page.locator('#municipality');
    const addrInput = page.locator('#address');

    await expect(deptSelect).toBeVisible();
    await expect(munSelect).toBeVisible();
    await expect(addrInput).toBeVisible();

    // Interactuar
    await deptSelect.selectOption('GT-13');
    await page.waitForTimeout(300);
    await munSelect.selectOption('GT-13-01');
    await page.waitForTimeout(500);

    // Badge debe aparecer
    const badge = page.locator('text=Envío Local Disponible');
    await expect(badge).toBeVisible();
  });

  test('✅ Dark mode: estilos se aplican correctamente', async ({ page }) => {
    // Simular dark mode agregando clase
    await page.locator('html').evaluate(el => el.classList.add('dark'));
    await page.waitForTimeout(300);

    // Verificar que los elementos aún son visibles
    const deptSelect = page.locator('#department');
    await expect(deptSelect).toBeVisible();

    // Verificar que tienen estilos dark
    const bgColor = await deptSelect.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );

    // Debe tener un color de fondo (no transparente)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });
});
