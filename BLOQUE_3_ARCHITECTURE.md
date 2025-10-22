FASE-IV-002 BLOQUE 3: ARQUITECTURA COMPLETA DE AUTENTICACIÓN

DIAGRAMA DE FLUJOS:

┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO ANÓNIMO (GUEST)                      │
└─────────────────────────────────────────────────────────────────┘

HOME (/) → CATÁLOGO (sin login)
  ↓
AÑADIR AL CARRITO (carrito.store)
  ↓
CHECKOUT (/checkout) - SIN GUARD
  ↓
RELLENAR DATOS:
  - Email (guest_email)
  - Nombre (guest_name)
  - Teléfono (guest_phone)
  - Ubicación (shipping)
  ↓
POST /api/v1/orders/guest (PÚBLICO)
  Body: { email, full_name, phone, shipping_*, items, total }
  No requiere: Authorization header
  ↓
201 Created Order (sin user_id)
  ↓
EMAIL DE CONFIRMACIÓN al guest_email
  Número de pedido para tracking

┌─────────────────────────────────────────────────────────────────┐
│              USUARIO REGISTRADO (AUTHENTICATED)                 │
└─────────────────────────────────────────────────────────────────┘

REGISTER (/register)
  ↓
LLENAR FORMULARIO:
  - Nombre completo
  - Email
  - Contraseña
  ↓
POST userStore.register(email, password, metadata)
  → Llama a supabase.auth.signUp()
  → Supabase retorna JWT + refresh token
  ↓
Navigate a / (home)
  ↓
userStore guarda:
  - user (objeto del usuario)
  - session (con access_token)
  ↓
Header muestra: User Menu (avatar + dropdown)
  ↓
COMPRAR:
  Checkbox "crear cuenta" O ya está logueado
  ↓
POST /api/v1/orders (PÚBLICO, pero puede autenticarse)
  Body: { email, full_name, phone, shipping_*, items, total, user_id? }
  Resultado: Order con user_id = JWT.sub
  ↓
Ver historial en /orders
  ↓
GET /api/v1/orders
  Header: Authorization: Bearer <access_token>
  Middleware AuthRequired():
    - Valida JWT
    - Extrae user_id
    - Solo retorna pedidos WHERE user_id = ?
  ↓
Muestra: Lista de pedidos con estado

┌─────────────────────────────────────────────────────────────────┐
│         USUARIO ADMIN (AUTHENTICATED + ADMIN ROLE)              │
└─────────────────────────────────────────────────────────────────┘

LOGIN (/login) con credenciales ADMIN
  ↓
POST userStore.login(email, password)
  → Supabase retorna JWT CON role: "admin"
  ↓
Acceso a /admin/*
  ↓
GET /api/v1/admin/orders
  Header: Authorization: Bearer <admin_token>
  Middleware AdminRequired():
    - Valida JWT (AuthRequired)
    - Verifica claims.role == "admin"
    - Si no, retorna 403 Forbidden
  ↓
Muestra: TODOS los pedidos (no filtrados)
  ↓
PUT /api/v1/admin/orders/:id/status
  Body: { status: "paid" | "shipped" | "delivered" }
  ↓
Actualiza estado + envía email al cliente

ARCHIVOS DE CÓDIGO GENERADOS:

FRONTEND:

1. frontend/src/routes/login/+page.svelte
   - Página de login opcional
   - Redirige si ya está autenticado
   - Banner "comprar sin login"
   - Beneficios de crear cuenta

2. frontend/src/routes/register/+page.svelte
   - Página de registro opcional
   - Redirige si ya está autenticado
   - Formulario con validación

3. frontend/src/routes/orders/+page.svelte (PROTEGIDA)
   - Guard: redirige a /login si no autenticado
   - Carga pedidos del usuario
   - Lista con estado, items, total
   - Información de envío

4. frontend/src/lib/stores/user.store.js
   - Estado reactivo: user, session, loading, error
   - Métodos: login(), register(), logout(), updateProfile()
   - Inicialización automática
   - Listener de cambios de auth

5. frontend/src/lib/utils/api.js
   - authenticatedFetch(url, options)
   - Agrega JWT automáticamente
   - apiPost, apiGet, apiPut, apiDelete

6. frontend/src/lib/utils/validation.js
   - isValidEmail()
   - validatePassword()
   - passwordsMatch()
   - isValidName()
   - sanitizeInput()

7. frontend/src/lib/components/auth/LoginForm.svelte
   - Formulario reactivo
   - Toggle show/hide password
   - Validación en tiempo real
   - Loading state

8. frontend/src/lib/components/auth/RegisterForm.svelte
   - Formulario con 4 campos
   - Validación de confirmación de contraseña
   - Validación en tiempo real
   - Loading state

BACKEND:

1. backend/middleware/auth.go (nuevo)
   - AuthRequired(): middleware para proteger rutas
   - AdminRequired(): middleware para rutas admin
   - Valida JWT de Supabase
   - Extrae user_id, user_email, user_role

2. backend/controllers/order_controller.go (métodos añadidos)
   - GetUserOrders(): GET /api/v1/orders (autenticado)
   - GetOrderByID(): GET /api/v1/orders/:id (autenticado)
   - GetAllOrders(): GET /api/v1/admin/orders (admin)
   - UpdateOrderStatus(): PUT /api/v1/admin/orders/:id/status (admin)

GUARDIANES (GUARDS):

Frontend:
  /orders → Redirige a /login si no autenticado
  /login → Redirige a / si ya autenticado
  /register → Redirige a / si ya autenticado

Backend:
  GET /api/v1/orders → AuthRequired()
  GET /api/v1/admin/* → AdminRequired()

FLUJO DE TOKENS JWT:

1. Usuario hace POST /register o POST /login
   ↓
2. Supabase valida credenciales
   ↓
3. Supabase genera JWT:
   {
     sub: "uuid-del-usuario",
     email: "user@example.com",
     role: "authenticated" | "admin",
     aud: "authenticated",
     iat: 1234567890,
     exp: 1234571490
   }
   ↓
4. Frontend guarda JWT en: session.access_token
   ↓
5. Frontend envía en requests:
   Authorization: Bearer <access_token>
   ↓
6. Backend (middleware) valida JWT
   ↓
7. Si válido: c.Set("user_id", claims["sub"])
   ↓
8. Controller accede con c.Get("user_id")

VARIABLES DE ENTORNO REQUERIDAS:

Backend .env:
  DATABASE_URL=postgresql://...
  SUPABASE_JWT_SECRET=eyJ... (de Supabase)
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_KEY=eyJ...

Frontend .env.local:
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...

TESTING CHECKLIST:

Frontend:
  [ ] Ir a /login - muestra formulario
  [ ] Ir a /register - muestra formulario
  [ ] Registrarse - crea cuenta
  [ ] LoginForm - valida email/password
  [ ] RegisterForm - valida confirmación
  [ ] Usuario logueado - muestra en header
  [ ] Logout - limpia estado
  [ ] /orders protegida - redirige si no login
  [ ] /orders muestra pedidos del usuario
  [ ] Dark mode funcional

Backend:
  [ ] POST /api/v1/orders/guest - crea pedido sin auth
  [ ] GET /api/v1/orders sin header - 401
  [ ] GET /api/v1/orders con JWT válido - retorna pedidos
  [ ] GET /api/v1/admin/orders sin role admin - 403
  [ ] GET /api/v1/admin/orders con role admin - retorna todos
  [ ] PUT /api/v1/admin/orders/:id/status - actualiza estado

E2E Tests (Playwright):
  [ ] Flujo: registro → login → comprar → ver historial
  [ ] Flujo: guest → checkout → comprar sin login
  [ ] Guard: intento acceso /orders sin login → redirige

NOTAS DE SEGURIDAD:

1. JWT se valida EN BACKEND (no en frontend)
2. SUPABASE_JWT_SECRET nunca va en frontend (variable privada)
3. Checkout es PÚBLICO pero puede capturar user_id si autenticado
4. Contraseñas se envían SOLO a Supabase (nunca al backend propio)
5. Rate limiting RECOMENDADO en login/register (futuro)
6. HTTPS OBLIGATORIO en producción

PRÓXIMAS FASES:

Fase IV-003: Admin Panel
  - Crear /admin/dashboard
  - Ver todos los pedidos
  - Cambiar estado de pedidos
  - Gráficos de ventas

Fase IV-004: Email Transaccional
  - Email de confirmación de pedido
  - Email de cambio de estado
  - Email de recuperación de contraseña

Fase IV-005: Seguridad Avanzada
  - Rate limiting
  - 2FA
  - Auditoría de logs
  - Sesiones simultáneas
