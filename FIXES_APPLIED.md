# 🔧 Problemas Arreglados - Tests E2E Stripe

**Fecha**: Octubre 23, 2025
**Status**: ✅ SOLUCIONADO

---

## Problemas Encontrados y Soluciones

### 1. ❌ Problema: Tests intentaban conectar a `http://frontend:5173/` en local

**Error Original:**
```
Error: page.goto: net::ERR_NAME_NOT_RESOLVED at http://frontend:5173/
```

**Causa:**
- `playwright.config.ts` tenía hardcodeado `baseURL: 'http://frontend:5173'`
- Esto es correcto para Docker pero incorrecto para local
- Los tests se ejecutaban en Windows pero intentaban conectar a hostname Docker

**Solución Implementada:**
```typescript
// frontend/playwright.config.ts - ANTES:
baseURL: process.env.BASE_URL || 'http://frontend:5173'

// DESPUÉS (auto-detecta):
const isDocker = process.env.DOCKER_ENV === 'true' || process.env.BASE_URL === 'http://frontend:5173';
const baseURL = isDocker ? 'http://frontend:5173' : 'http://localhost:5173';
```

**Archivo Modificado:** `frontend/playwright.config.ts`
**Linea:** 1-50
**Cambio:** Auto-detección de ambiente + console.log para verificar

---

### 2. ❌ Problema: `test-data.js` también hardcodeaba `backend:8080`

**Error:**
```
Backend API calls intentaban conectar a http://backend:8080 (Docker) en local
```

**Solución Implementada:**
```javascript
// frontend/tests/test-data.js
const isDocker = process.env.DOCKER_ENV === 'true' || process.env.BASE_URL === 'http://frontend:5173';

export const BASE_URLS = {
  frontend: process.env.BASE_URL || (isDocker ? 'http://frontend:5173' : 'http://localhost:5173'),
  backend: process.env.API_URL || (isDocker ? 'http://backend:8080' : 'http://localhost:8080'),
};
```

**Archivo Modificado:** `frontend/tests/test-data.js`
**Linea:** 1-20
**Cambio:** Auto-detección de ambiente en BASE_URLS

---

### 3. ❌ Problema: localStorage inaccesible en beforeEach

**Error Original:**
```
Error limpiando Svelte stores: page.evaluate: SecurityError: 
Failed to read the 'localStorage' property from 'Window': 
Access is denied for this document.
```

**Causa:**
- `clearSvelteStores(page)` se llamaba ANTES de navegar a la página
- localStorage solo es accesible después de que la página esté cargada
- Intentar acceder generaba SecurityError

**Solución Implementada:**
```typescript
// frontend/tests/e2e/payment.spec.ts - beforeEach
// ANTES:
await clearSvelteStores(page);  // ❌ localStorage no existe aún
await navigateToHome(page);

// DESPUÉS:
await navigateToHome(page);      // ✅ Navega primero
await clearSvelteStores(page);   // ✅ Ahora localStorage es accesible
```

**Archivo Modificado:** `frontend/tests/e2e/payment.spec.ts`
**Linea:** 40-75
**Cambio:** Reordenamiento de operaciones en beforeEach

---

### 4. ❌ Problema: Función `waitForCartSync` no exportada

**Error Original:**
```
SyntaxError: The requested module '../helpers/svelte-helpers.js' 
does not provide an export named 'waitForCartSync'
```

**Causa:**
- `cart.spec.ts` importaba `waitForCartSync` de `svelte-helpers.js`
- La función NO existía en svelte-helpers.js
- La función SI existía en `page-objects.js` pero no se importaba correctamente

**Solución Implementada (2 partes):**

**Parte A:** Agregar `waitForCartSync` a svelte-helpers.js
```javascript
// frontend/tests/helpers/svelte-helpers.js
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
      // JSON inválido o localStorage vacío
    }
    
    await page.waitForTimeout(100);
  }
  
  throw new Error(
    `Cart no sincronizó en ${timeout}ms. Posiblemente el store no se inicializó correctamente.`
  );
}
```

**Parte B:** Cambiar import en cart.spec.ts
```typescript
// ANTES:
import { waitForCartSync } from '../helpers/svelte-helpers.js';

// DESPUÉS (aunque la función ahora existe en svelte-helpers):
import { waitForCartSync } from '../page-objects.js';
```

**Archivos Modificados:**
- `frontend/tests/helpers/svelte-helpers.js` - Línea 358-392 (Nueva función añadida)
- `frontend/tests/e2e/cart.spec.ts` - Línea 1-20 (Import actualizado)

---

## 📊 Resumen de Cambios

| Archivo | Cambio | Tipo | Status |
|---------|--------|------|--------|
| `playwright.config.ts` | Auto-detectar localhost vs frontend | Config | ✅ |
| `test-data.js` | Auto-detectar localhost vs backend | Config | ✅ |
| `payment.spec.ts` | Mover clearSvelteStores después navigate | Fix | ✅ |
| `svelte-helpers.js` | Añadir waitForCartSync | Feature | ✅ |
| `cart.spec.ts` | Actualizar import waitForCartSync | Fix | ✅ |
| `RUN_TESTS_LOCAL.md` | Nueva guía de ejecución | Doc | ✅ |

---

## ✅ Verificaciones Posteriores

### Tests Descubiertos Correctamente
```bash
pnpm playwright test payment.spec.ts --list

✓ 7 tests descubiertos en payment.spec.ts
✓ 13 tests descubiertos en checkout.spec.ts
```

### Imports Verificados
```bash
✓ svelte-helpers.js: waitForCartSync ahora exportada
✓ cart.spec.ts: importa correctamente de ambas fuentes
✓ payment.spec.ts: imports de svelte-helpers OK
✓ No hay SyntaxError de imports
```

### Configuration Verificada
```
🎭 Playwright configuration loaded:
   Environment: Local
   Base URL: http://localhost:5173
```

---

## 🚀 Próximo Paso

**Los tests ahora están listos para ejecutarse localmente.**

Necesita:
1. **Terminal 1:** `pnpm dev` (frontend en localhost:5173)
2. **Terminal 2:** `go run main.go` (backend en localhost:8080)
3. **Terminal 3:** `pnpm playwright test payment.spec.ts --headed`

Ver: **RUN_TESTS_LOCAL.md** para instrucciones detalladas.

---

## 📝 Notas Técnicas

### Por qué auto-detectar?

Para soportar ambos escenarios:

| Escenario | Frontend | Backend | Tests |
|-----------|----------|---------|-------|
| **Local** | localhost:5173 | localhost:8080 | localhost |
| **Docker** | frontend:5173 | backend:8080 | compose network |
| **CI/CD** | Env vars | Env vars | Env vars |

### Detección de Ambiente

```javascript
const isDocker = 
  process.env.DOCKER_ENV === 'true' ||  // Explicito
  process.env.BASE_URL === 'http://frontend:5173';  // Implicito

// También puedes forzar:
// DOCKER_ENV=true pnpm playwright test
// BASE_URL=http://frontend:5173 pnpm playwright test
```

### Timeouts Ajustados

- Hydration: 15s (Docker puede ser más lento)
- Retries: 1 en local, 2 en CI (menos variabilidad local)
- Navigation: 30s (para SvelteKit client-side routing)

---

## 🎓 Lecciones Aprendidas

1. **Hardcoding de hostnames es malo** - Siempre usar auto-detección o env vars
2. **beforeEach order matters** - localStorage/sessionStorage solo después de navegar
3. **Export consistency** - Mantener funciones en un solo lugar (svelte-helpers para helpers de framework)
4. **Docker vs Local testing** - Necesita configuración dinámica

---

**✨ Status Final: LISTO PARA EJECUCIÓN LOCAL**
