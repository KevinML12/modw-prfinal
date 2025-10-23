# 🚀 Guía de Ejecución: Tests E2E de Stripe

## 📌 Prerequisitos

Los tests E2E requieren que el stack completo esté corriendo:

1. **Frontend** (SvelteKit) en http://localhost:5173
2. **Backend** (Go/Gin) en http://localhost:8080
3. **Base de datos** (Supabase) configurada

---

## 🐳 Opción 1: Con Docker Compose (RECOMENDADO)

### Setup

```bash
# Desde root del proyecto
cd /c/Users/keyme/proyectos/moda-organica

# Inicia todos los servicios
docker-compose up --build

# En otra terminal, espera logs como:
# ✓ frontend ready
# ✓ backend running on :8080
```

### Ejecutar tests

```bash
# Opción A: Desde otra terminal (sin entrar a contenedor)
docker-compose exec frontend pnpm playwright test tests/e2e/payment.spec.ts

# Opción B: Desde dentro del contenedor frontend
docker-compose exec frontend bash
cd /app/frontend
pnpm playwright test tests/e2e/payment.spec.ts
```

---

## 💻 Opción 2: En Local (Windows/Mac/Linux)

### 1. Inicia Frontend

```bash
cd frontend
npm run dev
# o
pnpm dev

# Espera: ✓ Local: http://localhost:5173
```

### 2. Inicia Backend (otra terminal)

```bash
cd backend

# Opción A: Con Go instalado
go run main.go

# Opción B: Con Docker
docker run -p 8080:8080 \
  -e SUPABASE_URL=... \
  -e SUPABASE_API_KEY=... \
  -e STRIPE_SECRET_KEY=... \
  moda-organica-backend

# Espera: backend listening on :8080
```

### 3. Ejecuta tests (tercera terminal)

```bash
cd frontend

# Todos los tests de payment
pnpm playwright test tests/e2e/payment.spec.ts

# Test específico
pnpm playwright test tests/e2e/payment.spec.ts -g "debe crear checkout session"

# Con navegador visible
pnpm playwright test tests/e2e/payment.spec.ts --headed

# Debug interactivo
pnpm playwright test tests/e2e/payment.spec.ts --debug
```

---

## ✅ Verificación de Setup

Antes de ejecutar tests, verifica que todo está corriendo:

```bash
# Terminal 1: Verifica Frontend
curl http://localhost:5173

# Terminal 2: Verifica Backend
curl http://localhost:8080/api/v1/health

# Terminal 3: Verifica que test-data.js usa URLs correctas
# Debe ser http://localhost:5173, NO http://frontend:5173
```

---

## 📊 Ejecutar Tests Completos

### Suite de Payment (7 tests)

```bash
pnpm playwright test tests/e2e/payment.spec.ts
```

**Tests incluidos:**
- ✅ Crear checkout session
- ✅ Redirigir a Stripe
- ✅ Página de éxito
- ✅ Página de cancelación
- ✅ Limpieza de carrito
- ✅ Session ID requerido
- ✅ Múltiples productos

### Suite de Checkout (13+ tests, incluyendo TEST 6 modificado)

```bash
pnpm playwright test tests/e2e/checkout.spec.ts
```

### Todos los tests E2E

```bash
pnpm playwright test tests/e2e/
```

---

## 🎯 Modos de Ejecución

### 1. Modo Headless (Defecto)

```bash
pnpm playwright test tests/e2e/payment.spec.ts

# Resultado: Tests sin GUI del navegador
# Rápido (ideal para CI/CD)
# Genera: test-results/, playwright-report/
```

### 2. Modo Headed (Ver navegador)

```bash
pnpm playwright test tests/e2e/payment.spec.ts --headed

# Resultado: Abre navegador real, ves cada paso
# Más lento pero visualmente verificable
# Ideal para debugging local
```

### 3. Modo Debug (Inspector)

```bash
pnpm playwright test tests/e2e/payment.spec.ts --debug

# Resultado: Abre Playwright Inspector
# Puedes pausar, pasar línea por línea
# Time Travel Debugging para analizar qué pasó
```

### 4. Test Específico

```bash
# Por nombre exacto
pnpm playwright test -g "debe crear checkout session"

# Por patrón
pnpm playwright test -g "carrito"

# Invert (todos menos este)
pnpm playwright test -g "carrito" --invert
```

### 5. Stop en primer fallo

```bash
pnpm playwright test -x

# Útil para CI/CD o debugging rápido
```

---

## 📈 Reportes

### HTML Report

```bash
pnpm playwright test tests/e2e/payment.spec.ts
pnpm playwright show-report

# Abre: test-results/index.html en navegador
# Incluye: screenshots, videos, traces
```

### JSON Report

```bash
pnpm playwright test --reporter=json > results.json
```

### JUnit Report (para CI)

```bash
pnpm playwright test --reporter=junit
```

---

## 🔧 Variables de Entorno

### frontend/playwright.config.ts

```typescript
use: {
  baseURL: 'http://localhost:5173',  // URL local, NO http://frontend:5173
  actionTimeout: 10000,
  navigationTimeout: 30000,
},
```

### frontend/tests/test-data.js

```javascript
export const BASE_URLS = {
  frontend: process.env.BASE_URL || 'http://localhost:5173',
  backend: process.env.API_URL || 'http://localhost:8080',
};
```

**Sobrescribir en tests:**

```bash
BASE_URL=http://localhost:5173 pnpm playwright test
API_URL=http://localhost:8080 pnpm playwright test
```

---

## ⚠️ Troubleshooting

### Error: `net::ERR_NAME_NOT_RESOLVED at http://frontend:5173/`

**Causa:** Frontend no está corriendo en http://localhost:5173

**Solución:**
```bash
# Terminal 1: Inicia frontend
cd frontend
pnpm dev

# Espera: ✓ Local: http://localhost:5173

# Terminal 2: Ejecuta tests
pnpm playwright test
```

### Error: `SecurityError: Failed to read the 'localStorage' property`

**Causa:** Página no cargó o está en origen diferente

**Solución:**
```bash
# Verifica que BASE_URL es correcto
echo "BASE_URL=$BASE_URL"

# Limpia cache
rm -rf test-results/ playwright-report/

# Reinicia desde cero
pnpm playwright test --no-cache
```

### Error: `TimeoutError: page.goto`

**Causa:** Frontend o backend lento para responder

**Solución:**
```bash
# Aumenta timeouts en playwright.config.ts
use: {
  navigationTimeout: 60000,  // 60 segundos
  actionTimeout: 20000,
}

# O ejecuta con timeout específico
pnpm playwright test --timeout=60000
```

### Tests pasan en local pero fallan en CI/CD

**Causa:** URLs diferentes (docker vs local)

**Solución:**
```bash
# En CI/CD, configura:
export BASE_URL=http://frontend:5173
export API_URL=http://backend:8080

pnpm playwright test
```

---

## 🎬 Quick Start

**Opción más rápida para empezar:**

```bash
# Terminal 1
cd c:\Users\keyme\proyectos\moda-organica
docker-compose up --build

# Terminal 2 (cuando todo esté ready)
cd frontend
pnpm playwright test tests/e2e/payment.spec.ts --headed

# Verás navegador haciendo el flujo de pago
```

---

## 📊 Matriz de Compatibilidad

| Entorno | Frontend | Backend | Tests | Resultado |
|---------|----------|---------|-------|-----------|
| Docker | ✅ | ✅ | ✅ | Perfecto, URLs: http://frontend:5173 |
| Local | ✅ | ✅ | ✅ | Perfecto, URLs: http://localhost:5173 |
| Local | ✅ | ❌ | ❌ | Falla en primer request al backend |
| CI/CD | ✅ | ✅ | ✅ | Configura env vars correctamente |

---

## 💡 Tips

1. **Ejecutar solo Stripe tests:**
   ```bash
   pnpm playwright test payment.spec.ts
   ```

2. **Ejecutar con reporter simple:**
   ```bash
   pnpm playwright test --reporter=dot
   ```

3. **Pausar en línea específica:**
   - Usa `await page.pause()` en el código del test
   - Ejecuta con `--debug`

4. **Ver qué está pasando:**
   ```bash
   pnpm playwright test --headed -x  # Headed + stop en 1er fallo
   ```

5. **Reproducir fallo específico:**
   ```bash
   # Usa el archivo trace guardado en test-results/
   pnpm exec playwright show-trace test-results/[timestamp]/trace.zip
   ```

---

## ✨ Próximos Pasos

Una vez que los tests pasen:

1. **Webhook implementation** (BLOQUE 2)
   - Escuchar checkout.session.completed
   - Actualizar order status a 'paid'

2. **Email confirmations**
   - Enviar resumen del pedido
   - Confirmación de pago

3. **Admin dashboard**
   - Ver órdenes con estado
   - Tracking de pagos

---

**Último update:** Octubre 23, 2025
**Status:** ✅ Tests listos, necesitan stack corriendo
