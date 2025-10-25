# 🚀 GUÍA RÁPIDA: Cómo Ejecutar los Tests

## Problema Actual

```
Error: page.goto: net::ERR_NAME_NOT_RESOLVED at http://frontend:5173/
```

**Causa:** Los tests están buscando `http://frontend:5173` pero no hay servidor corriendo.

---

## ✅ Solución: 3 opciones

### OPCIÓN 1: Docker Compose (RECOMENDADO)

**Más simple, todo en un comando:**

```bash
# Terminal 1
cd c:\Users\keyme\proyectos\moda-organica
docker-compose up --build

# Espera hasta ver logs como:
# ✓ frontend ready
# ✓ backend listening on :8080

# Terminal 2 (cuando veas "ready")
docker-compose exec frontend pnpm playwright test tests/e2e/payment.spec.ts --headed
```

**Ventajas:**
- Aislado y limpio
- Reproduce exactamente lo que corre en producción
- No necesitas instalar Go, Node localmente en el sistema

---

### OPCIÓN 2: Local - Frontend + Backend separados

**Si prefieres ver todo en tiempo real:**

```bash
# Terminal 1: Frontend
cd c:\Users\keyme\proyectos\moda-organica\frontend
pnpm dev

# Espera: ✓ Local: http://localhost:5173/

# Terminal 2: Backend (en carpeta backend)
cd c:\Users\keyme\proyectos\moda-organica\backend
go run main.go

# Espera: Listening and serving HTTP on :8080

# Terminal 3: Tests (en carpeta frontend)
cd c:\Users\keyme\proyectos\moda-organica\frontend
pnpm playwright test tests/e2e/payment.spec.ts --headed
```

**Ventajas:**
- Ves errores en tiempo real
- Puedes debuggear rápido

---

### OPCIÓN 3: Docker pero backend local

```bash
# Terminal 1: Backend local
cd backend
go run main.go

# Terminal 2: Frontend en Docker
docker run -p 5173:5173 \
  -e VITE_API_URL=http://localhost:8080 \
  -it moda-organica-frontend

# Terminal 3: Tests
cd frontend
BASE_URL=http://localhost:5173 pnpm playwright test
```

---

## 📊 Resumen Visual

```
┌─────────────────────────────────┐
│  OPCIÓN 1: Docker (MEJOR)       │
├─────────────────────────────────┤
│ Terminal 1:                     │
│  docker-compose up --build      │
│                                 │
│ Terminal 2:                     │
│  docker-compose exec frontend   │
│    pnpm playwright test --headed│
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  OPCIÓN 2: Local (MÁS VISIBLE)  │
├─────────────────────────────────┤
│ Terminal 1: pnpm dev (frontend) │
│ Terminal 2: go run (backend)    │
│ Terminal 3: pnpm test (tests)   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  OPCIÓN 3: Híbrida (LOCAL TEST)│
├─────────────────────────────────┤
│ Terminal 1: go run (backend)    │
│ Terminal 2: docker frontend     │
│ Terminal 3: pnpm test           │
└─────────────────────────────────┘
```

---

## 🎯 Comando Exacto (Opción 1 - Docker)

```powershell
# Copia y pega esto en PowerShell:

cd c:\Users\keyme\proyectos\moda-organica
docker-compose up --build

# (Espera 30-60 segundos a que todo esté ready)

# En OTRA TERMINAL PowerShell:
cd c:\Users\keyme\proyectos\moda-organica
docker-compose exec frontend pnpm playwright test tests/e2e/payment.spec.ts --headed
```

---

## 🎬 Qué Verás

Si todo está bien:

```
Running 7 tests using 1 worker

  ✓ 1) debe crear checkout session al enviar formulario válido (5s)
  ✓ 2) debe redirigir a Stripe Checkout después del submit (4s)
  ✓ 3) debe mostrar confirmación de pago exitoso (5s)
  ✓ 4) debe mostrar página de cancelación (5s)
  ✓ 5) debe limpiar carrito solo en success, no en cancel (6s)
  ✓ 6) debe requerir session_id en la página de éxito (4s)
  ✓ 7) debe crear sesión con múltiples productos (5s)

  7 passed (34s)
```

Y verás un navegador ejecutando los pasos automáticamente con `--headed`.

---

## ✨ Verificaciones Rápidas

Antes de ejecutar tests, verifica que todo funciona:

```bash
# Verificar Frontend
curl http://localhost:5173

# Verificar Backend
curl http://localhost:8080/api/v1/products

# Si usas Docker:
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## 🐛 Si Algo Falla

### Error: "Cannot find docker-compose"
```bash
# Instala Docker Desktop for Windows
# https://www.docker.com/products/docker-desktop
```

### Error: "Cannot find Go"
```bash
# Instala Go
# https://golang.org/dl/
# Luego: go run main.go
```

### Error: "port 5173 already in use"
```bash
# Mata el proceso en ese puerto
netstat -ano | findstr :5173
taskkill /PID <numero> /F
```

### Error: "net::ERR_NAME_NOT_RESOLVED"
```bash
# Significa que Frontend/Backend no están corriendo
# Asegúrate de ejecutar docker-compose up ANTES de los tests
```

---

## 📝 Comando para Otros Tests

```bash
# Todos los tests E2E
cd frontend
pnpm playwright test tests/e2e/

# Solo checkout tests
pnpm playwright test tests/e2e/checkout.spec.ts

# Test específico
pnpm playwright test -g "debe crear checkout session"

# Con debug
pnpm playwright test --debug

# Mostrar reporte
pnpm playwright show-report
```

---

## ✅ Checklist Antes de Ejecutar

- [ ] Docker Desktop instalado (si usas docker-compose)
- [ ] GO instalado (si usas local)
- [ ] Node/pnpm instalado
- [ ] En carpeta `frontend` cuando ejecutas `pnpm test`
- [ ] Frontend corriendo en http://localhost:5173
- [ ] Backend corriendo en http://localhost:8080
- [ ] Puertos no tienen otro proceso
- [ ] Variable PLAYWRIGHT_BROWSERS instalados (`pnpm exec playwright install`)

---

## 🎓 Próximos Pasos Después de Tests

1. **Si tests pasan:** ✅ Perfecto, está todo listo
2. **Si falla el backend:** Revisar `docker-compose logs backend`
3. **Si falla el frontend:** Revisar `docker-compose logs frontend`
4. **Para debugging:** Agregar `.pause()` en el test y ejecutar con `--debug`

---

**¿Lista? ¡Ejecuta el COMANDO EXACTO arriba y verás los tests correr!**
