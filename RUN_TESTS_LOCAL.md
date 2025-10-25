# 🚀 Ejecutar Tests E2E Localmente

## ⚠️ IMPORTANTE: Necesitas 2 Servidores Corriendo

Los tests E2E necesitan que **AMBOS servidores** estén ejecutándose en `localhost`:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080

---

## 📋 Pasos (Abre 2 Terminales)

### Terminal 1: Frontend Dev Server

```bash
cd c:\Users\keyme\proyectos\moda-organica\frontend
pnpm install  # Si es la primera vez
pnpm dev
```

**Espera a ver algo como:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Una vez que veas esto, el frontend está listo.

---

### Terminal 2: Backend Go Server

```bash
cd c:\Users\keyme\proyectos\moda-organica\backend
go run main.go
```

**Espera a ver algo como:**
```
🚀 Server running on :8080
📊 Database connected
```

✅ Una vez que veas esto, el backend está listo.

---

### Terminal 3: Ejecutar Tests

Una vez que AMBOS servidores estén corriendo, en una tercera terminal:

```bash
cd c:\Users\keyme\proyectos\moda-organica\frontend

# Opción A: Tests E2E de Pagos (7 tests)
pnpm playwright test tests/e2e/payment.spec.ts --headed

# Opción B: Tests E2E de Checkout (13 tests)
pnpm playwright test tests/e2e/checkout.spec.ts --headed

# Opción C: Todos los tests E2E
pnpm playwright test --headed

# Opción D: Tests específicos con patrón
pnpm playwright test -g "debe crear checkout session"
```

---

## ✅ Señales de Éxito

### Terminal 1 (Frontend)
```
✓ Vite dev server ejecutándose
✓ HMR (Hot Module Reload) conectado
✓ No hay errores en console
```

### Terminal 2 (Backend)
```
✓ Go server en puerto 8080
✓ Database conectada (Supabase)
✓ No hay errores en logs
```

### Terminal 3 (Tests)
```
✓ Playwright inicia el navegador (--headed = visible)
✓ Tests comienzan a ejecutarse
✓ Ves el navegador automatizado interactuando con la página
```

---

## 🐛 Troubleshooting

### Error: `net::ERR_CONNECTION_REFUSED at http://localhost:5173/`
- **Problema**: Frontend no está corriendo
- **Solución**: Ejecuta `pnpm dev` en Terminal 1

### Error: `page.evaluate: SecurityError: Failed to read the 'localStorage'`
- **Problema**: La página no cargó completamente (timeout)
- **Solución**: Asegúrate de que ambos servidores estén corriendo
- **Alternativa**: Aumenta timeout en `playwright.config.ts` si es muy lento

### Tests se quedan esperando indefinidamente
- **Problema**: Backend no responde (no está en puerto 8080)
- **Solución**: Ejecuta `go run main.go` en Terminal 2
- **Verifica**: `curl http://localhost:8080/health` debe responder

### Vite HMR desconectado
- **Problema**: Frontend y tests compiten por conexiones
- **Solución**: Normal - los tests usan navegador headless por defecto
- **Alternativa**: Usa `--headed=false` para modo headless (sin ventana)

---

## 📊 Ejemplo: Sesión Completa

**Terminal 1:**
```
PS C:\...\frontend> pnpm dev

  VITE v5.4.20  ready in 782 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
[1023 20:45:23] [info] connected ← Servidor listo
```

**Terminal 2:**
```
PS C:\...\backend> go run main.go

🚀 Server running on :8080
📊 Database connected to Supabase
[GIN-debug] Loaded 45 routes
```

**Terminal 3:**
```
PS C:\...\frontend> pnpm playwright test payment.spec.ts --headed

🎭 Playwright configuration loaded:
   Environment: Local
   Base URL: http://localhost:5173

Running 7 tests using 1 worker

✓ TEST 1: debe crear checkout session... (8.2s)
✓ TEST 2: debe redirigir a Stripe... (7.5s)
✓ TEST 3: página de éxito... (6.8s)
✓ TEST 4: página de cancelación... (7.1s)
✓ TEST 5: limpieza diferencial... (6.9s)
✓ TEST 6: session ID requerido... (5.2s)
✓ TEST 7: múltiples productos... (7.3s)

✅ 7 passed (57.3s)
```

---

## 🎥 Opciones de Ejecución

| Opción | Comando | Resultado |
|--------|---------|-----------|
| **Normal** | `pnpm playwright test` | Headless (sin ventana visible) |
| **Con Video** | `pnpm playwright test --headed` | Ventana visible, grabación automática |
| **Debug** | `pnpm playwright test --debug` | Modo interactivo con Inspector de Playwright |
| **Archivo específico** | `pnpm playwright test payment.spec.ts` | Solo ese archivo |
| **Patrón** | `pnpm playwright test -g "debe crear"` | Tests que coinciden con el patrón |
| **Report** | `pnpm playwright show-report` | Abre reporte HTML de última ejecución |

---

## 📝 Notas

- Los tests se ejecutan **secuencialmente** (no en paralelo) para evitar conflictos en localStorage
- El carrito se limpia entre tests via `clearSvelteStores(page)`
- Los screenshots y videos se guardan en `test-results/` cuando hay fallos
- Los traces de Playwright se guardan para debugging: `pnpm exec playwright show-trace test-results/.../trace.zip`

---

## ✨ Siguiente Paso

Una vez que todos los tests pasen:

```bash
# Commit a git
cd c:\Users\keyme\proyectos\moda-organica
git add -A
git commit -m "test(e2e): Complete Stripe payment flow test suite with localhost support"
```

Luego procede a **BLOQUE 2: Webhooks** para escuchar eventos de Stripe.
