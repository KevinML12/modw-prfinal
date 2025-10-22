# Guía de Playwright E2E Tests

## Descripción del Servicio

El servicio `playwright` es un contenedor separado en Docker que ejecuta tests E2E (End-to-End) contra la aplicación. Se comunica con el frontend y backend a través de la red Docker interna.

## Configuración

### Servicio: `playwright`
- **Imagen:** `mcr.microsoft.com/playwright:v1.40.0-focal`
- **Profile:** `test` (no se levanta automáticamente)
- **URLs internas:**
  - Frontend: `http://frontend:5173`
  - Backend: `http://backend:8080`

### Volúmenes
- `./frontend:/app` - Monta el código del frontend
- `playwright-report` - Almacena reportes HTML
- `playwright-results` - Almacena screenshots y videos

### Variables de Entorno
```bash
BASE_URL=http://frontend:5173          # URL del frontend en Docker
API_URL=http://backend:8080            # URL del backend en Docker
NODE_ENV=test                          # Modo de prueba
PLAYWRIGHT_HTML_REPORT=./playwright-report
PLAYWRIGHT_JSON_REPORT=./test-results/results.json
```

## Uso

### 1. Levantar servicios con el perfil test

```bash
# Levanta frontend, backend, meilisearch, ollama y playwright
docker-compose --profile test up -d

# O solo levantar playwright (asumiendo que los otros ya están corriendo)
docker-compose --profile test up -d playwright
```

### 2. Ejecutar tests E2E

```bash
# Ejecutar todos los tests
docker-compose exec playwright pnpm test:e2e

# Ejecutar tests de un archivo específico
docker-compose exec playwright pnpm test:e2e tests/checkout.spec.ts

# Ejecutar tests con modo headed (ver navegador)
docker-compose exec playwright pnpm test:e2e --headed

# Ejecutar tests en un navegador específico
docker-compose exec playwright pnpm test:e2e --project=chromium
docker-compose exec playwright pnpm test:e2e --project=firefox
docker-compose exec playwright pnpm test:e2e --project=webkit
```

### 3. Ver reportes

```bash
# Abrir reporte HTML
docker-compose exec playwright pnpm exec playwright show-report

# O acceder directamente a los volúmenes desde el host
# Los reportes están en: ./frontend/playwright-report
# Los resultados están en: ./frontend/test-results
```

### 4. Detener el servicio

```bash
# Detener solo playwright
docker-compose stop playwright

# Detener todos los servicios
docker-compose down

# Detener todo incluyendo volúmenes (cuidado: borra reportes)
docker-compose down -v
```

## Estructura de Tests

El proyecto debería tener tests en `frontend/tests/`:

```
frontend/tests/
├── e2e/
│   ├── products.spec.ts         # Tests de lista de productos
│   ├── product-detail.spec.ts   # Tests de detalle de producto
│   ├── cart.spec.ts             # Tests del carrito
│   ├── checkout.spec.ts         # Tests del checkout
│   └── order.spec.ts            # Tests de órdenes
└── fixtures/
    └── auth.ts                  # Fixtures para autenticación
```

## Configuración en `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: false,
  },
});
```

## Flujo de Desarrollo

### Desarrollo Local
```bash
# Terminal 1: Levanta los servicios
docker-compose up -d

# Terminal 2: Ejecutar tests en modo watch
docker-compose exec playwright pnpm test:e2e --watch

# Ver cambios en tiempo real
# El hot-reload del frontend funcionará automáticamente
```

### CI/CD
```bash
# En tu pipeline (GitHub Actions, GitLab CI, etc.)
docker-compose --profile test up -d
docker-compose exec -T playwright pnpm test:e2e
docker-compose cp playwright:/app/playwright-report ./reports
```

## Troubleshooting

### El navegador no inicia
```bash
# Reinstalar dependencias de Playwright
docker-compose exec playwright pnpm playwright install
```

### Tests fallan con "connection refused"
```bash
# Verificar que frontend y backend estén corriendo
docker-compose ps

# Verificar conectividad dentro del contenedor
docker-compose exec playwright sh -c "curl http://frontend:5173"
docker-compose exec playwright sh -c "curl http://backend:8080/api/v1/products"
```

### Volúmenes no se montan correctamente
```bash
# Verificar volúmenes
docker volume ls | grep playwright

# Limpiar volúmenes y recrear
docker-compose down -v
docker-compose --profile test up -d playwright
```

## Scripts recomendados en `package.json`

```json
{
  "scripts": {
    "test": "playwright test",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:e2e:firefox": "playwright test --project=firefox",
    "test:e2e:webkit": "playwright test --project=webkit"
  }
}
```

## Ejemplo de Test

```typescript
// tests/e2e/products.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Productos', () => {
  test('debería cargar la lista de productos', async ({ page }) => {
    await page.goto('/');
    
    // Esperar a que carguen los productos
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Verificar que hay al menos un producto
    const products = await page.locator('[data-testid="product-card"]').count();
    expect(products).toBeGreaterThan(0);
  });

  test('debería poder agregar un producto al carrito', async ({ page }) => {
    await page.goto('/');
    
    // Esperar y hacer clic en el primer botón "Agregar al carrito"
    await page.locator('[data-testid="add-to-cart"]').first().click();
    
    // Verificar que el carrito se actualiza
    const cartCount = await page.locator('[data-testid="cart-count"]').textContent();
    expect(cartCount).toBe('1');
  });
});
```

## Notas Importantes

- El servicio `playwright` **no se levanta automáticamente** con `docker-compose up`. Necesitas usar `--profile test`.
- Los reportes se persisten en volúmenes Docker, así que no se pierden al detener el contenedor.
- El comando `sleep infinity` mantiene el contenedor vivo para ejecutar tests múltiples veces sin reiniciar.
- Los tests pueden acceder a `http://frontend:5173` y `http://backend:8080` dentro de Docker.

