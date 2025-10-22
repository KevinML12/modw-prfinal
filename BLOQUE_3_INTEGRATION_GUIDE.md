FASE-IV-002 / BLOQUE 3: INTEGRACIÓN COMPLETA DE AUTENTICACIÓN

STATUS: IMPLEMENTADO

ARCHIVOS CREADOS/MODIFICADOS:

FRONTEND:
✓ frontend/src/routes/login/+page.svelte (actualizado)
✓ frontend/src/routes/register/+page.svelte (actualizado)
✓ frontend/src/routes/orders/+page.svelte (nuevo)

BACKEND:
✓ backend/middleware/auth.go (nuevo)
✓ backend/controllers/order_controller.go (métodos añadidos)

GUÍAS:
✓ frontend/HEADER_UPDATE_GUIDE.md (cómo actualizar Header)
✓ backend/MAIN_GO_UPDATE_GUIDE.md (cómo actualizar main.go)

ESTRUCTURA DE FLUJOS:

1. USUARIO ANÓNIMO (Guest):
   - Accede a / (home)
   - Navega productos SIN login
   - Va a /checkout
   - POST /api/v1/orders/guest (sin autenticación)
   - Recibe confirmación por email

2. USUARIO REGISTRADO:
   - Accede a /register o /login
   - Se autentica con Supabase
   - userStore guardará JWT automáticamente
   - Puede ver /orders (su historial)
   - GET /api/v1/orders (requiere JWT en header)
   - Vuelve al carrito (checkout público sigue disponible)

3. USUARIO ADMIN:
   - Igual que usuario registrado, pero con role=admin en JWT
   - Accede a /admin/* (FUTURO)
   - PUT /api/v1/admin/orders/:id/status (cambiar estado)
   - GET /api/v1/admin/orders (ver todos)

RUTAS FINALES DEL BACKEND:

PÚBLICAS (sin autenticación):
  GET    /api/v1/products               - Listar productos
  GET    /api/v1/products/:id           - Obtener producto
  POST   /api/v1/products/search        - Buscar semántico
  POST   /api/v1/orders/guest           - Crear pedido (checkout sin login)

PROTEGIDAS (requieren JWT válido):
  GET    /api/v1/orders                 - Mi historial de pedidos
  GET    /api/v1/orders/:id             - Mi pedido específico

ADMIN (requieren JWT + role=admin):
  POST   /api/v1/admin/products         - Crear producto
  PUT    /api/v1/admin/products/:id     - Editar producto
  GET    /api/v1/admin/orders           - Ver todos los pedidos
  PUT    /api/v1/admin/orders/:id/status - Cambiar estado de pedido

CÓMO INTEGRAR:

PASO 1: ACTUALIZAR HEADER
- Leer: frontend/HEADER_UPDATE_GUIDE.md
- Buscar en Header.svelte donde está el carrito
- Agregar el código del user menu después

PASO 2: ACTUALIZAR main.go
- Leer: backend/MAIN_GO_UPDATE_GUIDE.md
- Importar: "moda-organica/backend/middleware"
- Crear función: setupRoutes()
- Reemplazar definición de rutas

PASO 3: VALIDAR VARIABLES DE ENTORNO
Backend (.env):
  - SUPABASE_JWT_SECRET (debe estar configurado)

Frontend (.env):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

PASO 4: TESTING MANUAL

1. Checkout como Guest:
   - ir a localhost:5173/checkout
   - Agregar producto
   - Completar datos (sin login)
   - POST a /api/v1/orders/guest

2. Registrarse:
   - Ir a localhost:5173/register
   - Llenar datos
   - Crear cuenta en Supabase
   - Verificar que se guarda JWT

3. Login:
   - Ir a localhost:5173/login
   - Ingresar credenciales
   - Verificar que aparece en Header
   - Navegación a /orders

4. Ver historial de pedidos:
   - Ir a /orders
   - Debe mostrar lista de pedidos
   - Cada pedido muestra: ID, fecha, estado, items, total

5. Admin endpoints (Postman/curl):
   - GET /api/v1/admin/orders
   - Header: Authorization: Bearer <token_admin>
   - Debe traer todos los pedidos

VALIDACIONES DEL CÓDIGO:

Frontend:
✓ LoginForm.svelte y RegisterForm.svelte importan userStore
✓ Páginas /login y /register manejan redirecciones
✓ Página /orders está protegida con guard
✓ apiGet() y apiPost() incluyen JWT automáticamente
✓ Dark mode funcional en todas las páginas

Backend:
✓ middleware/auth.go valida JWT de Supabase
✓ Métodos en OrderController son tipo receiver (oc *OrderController)
✓ GetUserOrders filtra por user_id del JWT
✓ GetAllOrders y UpdateOrderStatus son para admin
✓ Logging en todas las operaciones

OBSERVACIONES IMPORTANTES:

1. El checkout SIGUE siendo PÚBLICO:
   - No tiene guard de autenticación
   - Aceptamos usuario anónimo (guest)
   - POST /api/v1/orders/guest no requiere autenticación

2. La autenticación es OPCIONAL:
   - Puedes comprar sin cuenta
   - Solo necesitas crear cuenta para ver historial

3. El middleware AuthRequired():
   - Verifica que Authorization header sea válido
   - Extrae user_id, user_email, user_role
   - Los guarda en c.Set() para usar en controllers

4. AdminRequired() llama a AuthRequired() primero:
   - Verifica autenticación
   - Luego verifica que role == "admin"

5. Logging:
   - Todos los endpoints usan log.Printf()
   - Para debugging, revisa la consola del backend

PRÓXIMOS PASOS:

1. Pruebas E2E:
   - Crear tests en Playwright
   - Validar flujo completo de auth
   - Testing de checkout guest

2. Email de confirmación:
   - Implementar envío de confirmación a guest_email
   - Templates de email

3. Admin Panel:
   - Crear /admin/* routes en frontend
   - Dashboard de pedidos
   - Estadísticas

4. Perfil de Usuario:
   - Página para editar datos
   - Historial detallado

5. Seguridad:
   - Rate limiting en login/register
   - CSRF protection
   - Validación de emails
