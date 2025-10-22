# Authentication System - Quick Start Guide

## 🚀 Iniciando el Sistema

### 1. Instalar Dependencias (si no lo has hecho)

```bash
# Frontend
cd frontend
pnpm install

# Backend (optional, si está separado)
cd ../backend
go mod download
```

### 2. Iniciar Servidor de Desarrollo

```bash
# Terminal 1: Frontend (puerto 5173)
cd frontend
pnpm run dev

# Terminal 2: Backend (puerto 3000, si necesario)
cd backend
go run main.go
```

**Acceso Local:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/v1

### 3. Con Docker

```bash
# Desde la raíz del proyecto
docker-compose up

# Frontend: http://localhost:5173
# Backend: http://localhost:3000/api
```

---

## ✅ Testing del Sistema

### 1. Verificación Inicial

**Abre la consola del navegador** (F12) y busca:
```
✅ "Supabase client inicializado correctamente"
✅ "URL: https://zsyhuqvoypolkktgngwk.supabase.co"
```

Si ves estos mensajes, el cliente Supabase está configurado correctamente.

### 2. Test Manual: Registro de Usuario

1. Navega a: http://localhost:5173/register
2. Rellena el formulario:
   - **Nombre:** Tu nombre (mínimo 3 caracteres)
   - **Email:** tu-email@test.com
   - **Contraseña:** Test@12345 (debe incluir mayúscula, número, caracteres especiales)
   - **Confirmar:** Test@12345 (debe coincidir)
3. Haz clic en "Crear Cuenta"
4. **Resultado esperado:**
   - Spinner de carga visible
   - Redirección a página de inicio o /orders
   - Mensaje de éxito

### 3. Test Manual: Login

1. Navega a: http://localhost:5173/login
2. Rellena el formulario:
   - **Email:** El que registraste
   - **Contraseña:** Tu contraseña
3. Haz clic en "Iniciar Sesión"
4. **Resultado esperado:**
   - Spinner de carga visible
   - Redirección a página de inicio
   - Banner "¡Bienvenido!" (si está implementado)

### 4. Test Manual: Ruta Protegida

1. **Sin autenticación:**
   - Navega a: http://localhost:5173/orders
   - **Resultado esperado:** Redirección a /login

2. **Con autenticación:**
   - Primero, inicia sesión
   - Navega a: http://localhost:5173/orders
   - **Resultado esperado:** Se carga la lista de órdenes del usuario

### 5. Test Manual: Persistencia de Sesión

1. Inicia sesión en http://localhost:5173/login
2. Abre la consola del navegador → Application → Local Storage
3. Verifica que exista una clave con prefijo `supabase`
4. Recarga la página (F5 o Cmd+R)
5. **Resultado esperado:** Sigues autenticado, no necesita volver a entrar

### 6. Test Manual: Logout

1. **Si hay menú de usuario en header:**
   - Haz clic en tu nombre/perfil
   - Busca botón "Cerrar Sesión"
   - Haz clic
   - **Resultado esperado:** 
     - Redirección a home o login
     - Local Storage limpiado
     - Botón "Iniciar Sesión" visible en header

---

## 🧪 Tests Automatizados (Playwright)

### Ejecutar Todos los Tests

```bash
# Frontend directory
cd frontend

# Run all tests
pnpm exec playwright test

# Run specific test file
pnpm exec playwright test tests/e2e/auth-system.spec.ts

# Run in UI mode (ver ejecución en tiempo real)
pnpm exec playwright test --ui

# Run en debug mode
pnpm exec playwright test --debug
```

### Tests Disponibles

El archivo `tests/e2e/auth-system.spec.ts` incluye:

| Test | Descripción |
|------|-------------|
| 1.1 - 1.6 | LoginForm: validación, toggle contraseña, estados |
| 2.1 - 2.6 | RegisterForm: validación, confirmación, toggle |
| 3.1 - 3.3 | Login Page: redirecciones, banners |
| 4.1 - 4.2 | Register Page: banners, links |
| 5.1 - 5.3 | Protected Routes: redirecciones, autenticación |
| 6.1 - 6.4 | Session Management: persistencia, logout |
| 7.1 - 7.2 | Supabase Client: inicialización, variables |
| 8.1 - 8.2 | Guest Checkout: sin autenticación |
| 9.1 - 9.2 | Dark Mode: soporte en formularios |
| 10.1 - 10.3 | Accessibility: labels, ARIA |

### Ejemplo: Ejecutar Solo Tests de Login

```bash
pnpm exec playwright test --grep "Login Form"
```

### Generar Reporte HTML

```bash
pnpm exec playwright test
pnpm exec playwright show-report
```

---

## 🔍 Debugging

### Ver Logs del Cliente Supabase

**En el navegador (Browser Console):**

```javascript
// Verificar variables de entorno
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)

// Verificar cliente
import { supabase } from '$lib/supabaseClient.js'
console.log(supabase)

// Verificar sesión
supabase.auth.getSession().then(data => console.log(data))
```

### Ver Logs del Backend

**En la terminal del backend:**

```bash
# Si ves errores JWT:
# -> Significa que el token no está siendo validado correctamente
# -> Verifica que SUPABASE_JWT_SECRET esté en .env

# Si ves errores de conexión:
# -> Verifica que el backend está corriendo
# -> Verifica que la dirección es correcta (http://localhost:3000)
```

### Inspeccionar Network

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Intenta hacer login
4. Busca la solicitud `POST /api/v1/auth/login` (o similar)
5. Verifica:
   - Status: 200 (éxito) o 401 (error de credenciales)
   - Headers: Authorization header con JWT
   - Response: Token y datos de usuario

---

## 🐛 Solución de Problemas

### Problema: "VITE_SUPABASE_URL is undefined"

**Causa:** Las variables de entorno no se están cargando

**Solución:**
```bash
# 1. Verifica que .env existe en raíz:
cat .env | grep VITE_SUPABASE

# 2. Reinicia el servidor:
# Ctrl+C en terminal del frontend
pnpm run dev

# 3. Si sigue sin funcionar, limpia caché:
rm -rf .svelte-kit node_modules/.vite
pnpm run dev
```

### Problema: "Cannot connect to backend: ENOTFOUND backend"

**Causa:** El backend no está corriendo (en desarrollo sin Docker)

**Solución:**
```bash
# 1. Sin Docker (desarrollo local):
# Abre otra terminal y corre el backend
cd backend
go run main.go

# 2. Con Docker:
docker-compose up
```

### Problema: "Login funciona pero no puedo acceder a /orders"

**Causa:** El token JWT no se está enviando correctamente

**Solución:**
1. Abre DevTools → Network
2. Haz clic en un endpoint del backend (GET /api/v1/orders)
3. Verifica en Headers: `Authorization: Bearer <token>`
4. Si no está, revisa `api.js` - debe usar authenticatedFetch

### Problema: "Sesión se pierde al recargar"

**Causa:** localStorage está deshabilitado o hay error al persistir

**Solución:**
```javascript
// En browser console:
// 1. Verificar localStorage
console.log(localStorage.getItem('supabase.auth.token'))

// 2. Si está vacío, verifica user.store.js initialize()
// 3. Si ves errores, abre DevTools → Console para más detalles
```

### Problema: "Dark mode no funciona en formularios"

**Causa:** Las clases Tailwind `dark:` no están aplicadas

**Solución:**
1. Verifica `tailwind.config.js` incluya `darkMode: 'class'`
2. Verifica que el elemento `<html>` tenga clase `dark` cuando es necesario
3. Reconstruye: `pnpm run build`

---

## 📊 Verificación Rápida (Checklist)

- [ ] Supabase client inicializado (mensaje en console)
- [ ] Email validation funciona en formularios
- [ ] Password toggle muestra/oculta contraseña
- [ ] Validación confirmar contraseña funciona
- [ ] Login exitoso con usuario existente
- [ ] Registro exitoso con usuario nuevo
- [ ] /orders redirige a login sin autenticación
- [ ] /orders muestra órdenes cuando autenticado
- [ ] Sesión persiste después de reload
- [ ] Logout limpia localStorage
- [ ] Dark mode funciona (si está implementado)
- [ ] Guest checkout funciona sin login

---

## 🔐 Variables de Entorno Requeridas

Verifica que `.env` (raíz) contiene:

```properties
# Backend - Service Role (Secret)
SUPABASE_URL="https://zsyhuqvoypolkktgngwk.supabase.co"
SUPABASE_SERVICE_KEY="eyJ..." # Service role token

# Frontend - Anon Key (Safe to expose)
VITE_SUPABASE_URL="https://zsyhuqvoypolkktgngwk.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ..." # Anon key

# Backend - JWT Secret
SUPABASE_JWT_SECRET="WcixqD5g..." # JWT secret for validation
```

**IMPORTANTE:** No incluyas `.env` en git. Usa `.env.example` para documento de referencia.

---

## 📚 Recursos Relacionados

- `AUTH_SYSTEM_STATUS.md` - Estado completo del sistema
- `SUPABASE_CLIENT_SETUP.md` - Guía de instalación detallada
- `BLOQUE_3_ARCHITECTURE.md` - Arquitectura de autenticación
- `BLOQUE_3_INTEGRATION_GUIDE.md` - Guía de integración paso a paso

---

## 💡 Tips

### Usar Test User de Supabase

En desarrollo, crea usuarios de prueba en el dashboard de Supabase:
1. Abre: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a: Authentication → Users
4. Crea usuario de prueba con email y contraseña
5. Úsalo para testear login

### Limpiar Local Storage

```javascript
// En browser console:
localStorage.clear()
sessionStorage.clear()
// Recarga: F5
```

### Ver Detalles del JWT

```javascript
// En browser console:
const token = localStorage.getItem('supabase.auth.token')
const decoded = JSON.parse(atob(token.split('.')[1]))
console.log(decoded)
```

### Registrar Nuevo Usuario Manualmente

```bash
# Via Supabase SDK (en terminal con Node.js)
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://zsyhuqvoypolkktgngwk.supabase.co',
  'eyJ...' // service key
);

supabase.auth.admin.createUser({
  email: 'test@example.com',
  password: 'Test@12345',
  email_confirm: true
}).then(console.log)
"
```

---

## ✨ Siguiente Paso

Después de verificar que el sistema funciona:

1. **Implementar Header con User Menu** (si no existe)
   - Mostrar nombre de usuario
   - Link a /orders
   - Botón de logout

2. **Implementar Guest Checkout** (si no existe)
   - Permitir compra sin autenticación
   - Guardar user_id=null en orders

3. **Setup de Email Verification** (opcional)
   - Verificar email después de registro
   - Enviar link de confirmación

4. **Setup de Password Reset** (opcional)
   - Formulario de "¿Olvidaste tu contraseña?"
   - Email con link de reset

5. **Integración con Admin Panel** (opcional)
   - Ver todas las órdenes
   - Cambiar estado de órdenes
   - Gestionar usuarios

