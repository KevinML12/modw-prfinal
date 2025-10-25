# ⚡ QUICK START - Panel de Administración

## 5 Minutos para Activar Admin Panel

### 1. Compilar Backend ✅ (HECHO)
```bash
$ cd backend
$ go build
# ✅ SUCCESS
```

### 2. Asignar Rol Admin en Supabase (2 min)

**En tu Dashboard de Supabase:**

1. Ve a **Authentication** → **Users**
2. Busca el usuario que será admin
3. Haz click en el usuario
4. Baja hasta **User Metadata**
5. Edita el JSON y agrega:

```json
{
  "role": "admin"
}
```

6. Click en **Update user**

✅ Listo. Ese usuario ahora es admin.

---

### 3. Acceder al Panel (1 min)

**En tu navegador:**

```
http://localhost:5173/admin
```

**Primera vez:**
- Te pedirá login
- Login con la cuenta que configuraste como admin (Paso 2)
- Automáticamente verifica role = "admin"
- ✅ Acceso concedido

---

## 🎯 Funcionalidades Disponibles

### Dashboard (`/admin`)
```
📊 Métricas en tiempo real:
  • Total de órdenes
  • Órdenes pendientes
  • Órdenes en tránsito
  • Ingresos totales
  
📈 Gráficos de distribución:
  • % Pendientes
  • % Enviadas
  • % Entregadas
  
🚀 Acceso rápido:
  • Ver todas las órdenes
  • Gestionar inventario
```

### Órdenes (`/admin/orders`)
```
📋 Lista completa de órdenes:
  • Filtrar por status
  • Ver detalles con mapa
  • Trazar ruta en Google Maps
  • Cambiar status inline
  • Paginación

🗺️ Google Maps:
  • Modal con ubicación del cliente
  • Botón para Google Maps Directions
  • Coordenadas precisas (lat/lng)
```

### Inventario (`/admin/inventory`)
```
📦 Gestión de productos:
  • Grid de productos con imagen
  • Buscar por nombre o SKU
  • Estadísticas de stock
  • Editar producto
  • Eliminar producto
  • Indicadores visuales de stock
```

---

## 🔧 Arquitectura

### Backend
```
middleware/admin_auth.go
  └─ Valida JWT + verifica rol 'admin'

controllers/order_controller.go
  ├─ AdminGetOrders()
  ├─ AdminGetOrderByID()
  ├─ AdminGetOrdersStats()
  └─ AdminGetOrdersMap()

main.go
  └─ Rutas protegidas /api/v1/admin/*
```

### Frontend
```
frontend/src/routes/admin/
  ├─ +layout.svelte (sidebar + auth check)
  ├─ +page.svelte (dashboard)
  ├─ orders/+page.svelte (gestión órdenes)
  └─ inventory/+page.svelte (gestión productos)
```

---

## 🔐 Flujo de Autenticación

```
1. Usuario accede a /admin
   ↓
2. Layout revisa:
   - localStorage.supabase_token
   - localStorage.user_role
   ↓
3. Si no existe o role ≠ 'admin':
   Redirige a /login?redirect=/admin
   ↓
4. Usuario hace login con cuenta admin
   ↓
5. Token se guarda en localStorage
   ↓
6. Layout recarga y verifica role = 'admin'
   ↓
7. ✅ Panel de admin visible
```

---

## 📡 API Endpoints

### Todos protegidos con Middleware

```
GET /api/v1/admin/orders
  Header: Authorization: Bearer <TOKEN>
  Response: { orders: [...], count, total }

GET /api/v1/admin/orders/:id
  Header: Authorization: Bearer <TOKEN>
  Response: Order object

GET /api/v1/admin/orders/stats
  Header: Authorization: Bearer <TOKEN>
  Response: { total_orders, pending_orders, ... }

GET /api/v1/admin/orders/map
  Header: Authorization: Bearer <TOKEN>
  Response: { orders: [...], count }
```

---

## 🗺️ Google Maps en Admin

### Cómo funciona:

1. **En tabla de órdenes:**
   - Click en 🗺️ para ver ubicación
   - Abre modal con Google Maps embebido
   - Muestra coordenadas (lat/lng)

2. **Trazar ruta:**
   - Click en 🚗 en tabla o modal
   - Abre Google Maps Directions
   - Origen: Tu negocio (Huehuetenango)
   - Destino: Ubicación del cliente

**Requiere:** VITE_GOOGLE_MAPS_API_KEY en .env
(Ya debe estar configurada de MapLocationPicker)

---

## 🎨 Diseño

### Tema Oscuro Automático
- Detecta preferencia del navegador
- Clases `dark:*` en Tailwind
- Toggle en settings (futuro)

### Responsive
```
📱 Mobile: Sidebar colapsable
📱 Tablet: Grid 2 columnas
💻 Desktop: Grid 4 columnas
```

### Gradiente Signature
```
Magenta → Purple
#e91e63 → #9c27b0
```

---

## 📊 Estadísticas Disponibles

```
Dashboard muestra:
  ✅ Total de órdenes
  ✅ Órdenes pendientes (%)
  ✅ Órdenes enviadas (%)
  ✅ Órdenes entregadas (%)
  ✅ Ingresos totales (GTQ)
  ✅ Gráficos de distribución
  ✅ Alertas de órdenes pendientes
```

---

## ❓ Troubleshooting

### "¿Por qué no me sale el panel?"
```
1. ¿Hiciste login? 
   → Ir a /login y entrar con cuenta admin

2. ¿Verificaste el rol en Supabase?
   → Authentication → Users → Metadata: "role": "admin"

3. ¿Borraste cookies/cache?
   → F12 → Application → Clear all

4. ¿Token expirado?
   → Logout y login nuevamente
```

### "Órdenes no cargan"
```
1. Verifica token en DevTools:
   F12 → Application → localStorage
   → Debe existir supabase_token

2. Abre Console (F12) y busca errores rojos

3. Si dice "401 Unauthorized":
   → Token inválido, logout y login

4. Si dice "403 Forbidden":
   → No tienes rol de admin en Supabase
```

### "Mapa no aparece"
```
1. Verifica VITE_GOOGLE_MAPS_API_KEY en .env

2. Abre Console (F12):
   - Buscar errores de Google Maps API
   - Si dice "Invalid API key" → Reemplazar clave

3. Reinicia servidor frontend:
   Ctrl+C en terminal + npm run dev
```

---

## ✅ Checklist de Verificación

- [ ] Backend compilado: `go build`
- [ ] Token JWT guardado en localStorage
- [ ] Role = "admin" en Supabase metadata
- [ ] Puedes acceder a /admin
- [ ] Ves el dashboard con stats
- [ ] Puedes ver lista de órdenes
- [ ] Mapa aparece al hacer click en 🗺️
- [ ] Google Maps Directions abre correctamente
- [ ] Inventario carga productos
- [ ] Modo oscuro funciona

---

## 🚀 Ya está 100% Listo

El panel de administración está completamente implementado y compilado.

**Solo necesitas:**
1. ✅ Asignar rol admin en Supabase (2 min)
2. ✅ Acceder a /admin en tu navegador
3. ✅ ¡Usar el panel!

---

**¿Preguntas?** Revisa `ADMIN_PANEL_COMPLETE.md` para documentación técnica completa.

**Estado:** 🟢 PRODUCCIÓN LISTA
**Último update:** Octubre 24, 2025
