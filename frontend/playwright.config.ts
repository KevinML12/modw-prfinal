import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright optimizada para Docker
 * 
 * Ejecutar dentro del contenedor 'playwright' de docker-compose
 * Los tests se comunican con frontend y backend a través de la red Docker interna
 */
export default defineConfig({
  // Directorio donde están los tests E2E
  testDir: './tests/e2e',

  // Estructura de reportes
  fullyParallel: false, // Secuencial por conflictos de localStorage en carrito
  forbidOnly: !!process.env.CI, // Prevenir test.only en CI
  retries: process.env.CI ? 2 : 2, // 2 reintentos (variabilidad en Docker)
  workers: 1, // 1 solo worker - tests secuenciales
  maxFailures: 5, // Detener después de 5 fallos para ahorrar tiempo

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'], // Output en consola para ver progreso en Docker logs
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  // Configuración de uso compartida entre todos los tests
  use: {
    // Base URL - usar nombre del servicio Docker, no localhost
    baseURL: process.env.BASE_URL || 'http://frontend:5173',

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
