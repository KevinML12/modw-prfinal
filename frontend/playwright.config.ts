import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright optimizada para Docker y Local
 * 
 * Auto-detecta el entorno:
 * - Docker: http://frontend:5173 (cuando BASE_URL env var está set)
 * - Local: http://localhost:5173 (por defecto)
 * 
 * Para usar con Docker:
 *   docker-compose exec frontend pnpm playwright test
 * 
 * Para usar local:
 *   cd frontend
 *   pnpm dev  # en otra terminal
 *   pnpm playwright test
 */

// Detectar si se ejecuta en Docker o local
const isDocker = process.env.DOCKER_ENV === 'true' || process.env.BASE_URL === 'http://frontend:5173';
const baseURL = process.env.BASE_URL || (isDocker ? 'http://frontend:5173' : 'http://localhost:5173');

console.log(`🎭 Playwright configuration loaded:`);
console.log(`   Environment: ${isDocker ? 'Docker' : 'Local'}`);
console.log(`   Base URL: ${baseURL}`);

export default defineConfig({
  // Directorio donde están los tests E2E
  testDir: './tests/e2e',

  // Estructura de reportes
  fullyParallel: false, // Secuencial por conflictos de localStorage en carrito
  forbidOnly: !!process.env.CI, // Prevenir test.only en CI
  retries: process.env.CI ? 2 : 1, // 1 reintento en local, 2 en Docker
  workers: 1, // 1 solo worker - tests secuenciales
  maxFailures: 5, // Detener después de 5 fallos para ahorrar tiempo

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'], // Output en consola para ver progreso
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  // Configuración de uso compartida entre todos los tests
  use: {
    // Base URL - auto-detecta Docker o Local
    baseURL: baseURL,

    // Timeouts ajustados para Docker (más margen)
    actionTimeout: 10000, // Tiempo para clicks, fills, etc
    navigationTimeout: 30000, // SvelteKit client-side routing

    // Screenshots y videos solo en fallos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Capturar página completa en screenshots
    viewport: { width: 1280, height: 720 },
  },

  // Timeout global por test
  timeout: 45000, // 45 segundos - margen para contenedor Docker

  // Expect timeout
  expect: {
    timeout: 10000, // Aumentado para operaciones en Docker
  },

  // Configuración de proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
    },

    // Firefox - opcional, comentado por ahora
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // WebKit - opcional, comentado por ahora
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // NO configurar webServer - el frontend ya corre en su contenedor
  // Los servicios deben estar arriba antes de ejecutar tests (depends_on en compose)

  // Configuración de carpetas de output
  outputDir: 'test-results',
});
