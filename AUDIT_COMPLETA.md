# 📋 AUDITORÍA COMPLETA DEL PROYECTO "MODA ORGÁNICA" (Proyecto Fénix)

**Fecha:** Octubre 19, 2025  
**Estado:** ✅ SISTEMA OPERATIVO Y ESTABLE  
**Rol del Documento:** Guía de referencia para el equipo de arquitectos (usuarios) e implementador (constructor IA)

---

## 📌 INFORMACIÓN GENERAL DEL PROYECTO

### Nombre Oficial
**Moda Orgánica** - Plataforma de Joyería Artesanal Sostenible  
**Nombre Interno:** Proyecto Fénix

### Ubicación Raíz
```
C:\Users\keyme\proyectos\moda-organica
```

### Descripción
Plataforma de e-commerce completa para venta de joyería artesanal hecha con materiales sostenibles. 
Incluye:
- Catálogo de productos
- Búsqueda semántica con IA
- Carrito de compras
- Sistema de pedidos
- Cálculo de envíos
- Autenticación de usuarios

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAPAS DE ARQUITECTURA                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRESENTACIÓN (Frontend)                                       │
│  └─ SvelteKit 2.47.2 + Vite 5.4.20                             │
│     └─ Tailwind CSS 3.4.18                                    │
│     └─ Puerto: 5173 (desarrollo)                              │
│                                                                 │
│  ↓ API HTTP (Proxy Vite: /api/v1 → backend:8080)             │
│                                                                 │
│  LÓGICA DE NEGOCIO (Backend)                                   │
│  └─ Go 1.25.3 + Gin Framework                                 │
│     └─ Puerto: 8080                                           │
│     └─ Hot reload con Air                                     │
│                                                                 │
│  ↓ Conexión autenticada (SUPABASE_SERVICE_KEY)                │
│                                                                 │
│  DATOS (Supabase - PostgreSQL)                                │
│  └─ Base de datos cloud                                       │
│     └─ pgvector para embeddings                               │
│     └─ Auth integrado                                         │
│                                                                 │
│  SERVICIOS COMPLEMENTARIOS                                     │
│  ├─ Meilisearch (Búsqueda semántica) - Puerto 7700           │
│  ├─ Ollama (Generación de embeddings) - Puerto 11434         │
│  └─ Docker Compose (Orquestación)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUCTURA DE CARPETAS

### Raíz del Proyecto
```
moda-organica/
├── backend/                    # 🔴 Backend Go
│   ├── cmd/
│   │   └── backfill_embeddings/   # Herramienta para generar embeddings
│   │       └── main.go
│   ├── controllers/
│   │   └── product_controller.go  # Endpoints de productos
│   ├── db/
│   │   └── supabase.go            # Inicialización de conexión
│   ├── models/
│   │   ├── order.go
│   │   └── product.go
│   ├── services/
│   │   ├── embedding_service.go   # Integración con Ollama
│   │   └── shipping-calculator.go # Cálculo de envíos
│   ├── main.go                    # Punto de entrada
│   ├── go.mod                     # Dependencias
│   ├── go.sum
│   ├── Dockerfile                 # Para producción
│   ├── Dockerfile.dev             # Para desarrollo
│   ├── .air.toml                  # Configuración de hot reload
│   └── tmp/                       # Artefactos compilados
│
├── frontend/                   # 🔵 Frontend SvelteKit
│   ├── src/
│   │   ├── app.html              # HTML base
│   │   ├── app.css               # Estilos globales
│   │   ├── service-worker.js     # PWA support
│   │   ├── lib/
│   │   │   ├── api/              # (VACÍO - NO DEBE HABER API CLIENT)
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.svelte
│   │   │   │   ├── ThemeToggle.svelte
│   │   │   │   └── layout/
│   │   │   │       ├── Header.svelte
│   │   │   │       └── Footer.svelte
│   │   │   ├── config/
│   │   │   │   └── brand.config.js   # Paleta de colores
│   │   │   └── stores/
│   │   │       ├── cart.store.js
│   │   │       └── theme.store.js
│   │   └── routes/
│   │       ├── +layout.svelte    # Layout global
│   │       ├── +page.svelte      # Página principal
│   │       ├── checkout/
│   │       │   ├── +page.svelte
│   │       │   └── CheckoutItem.svelte
│   │       └── product/[id]/
│   │           ├── +page.js      # Data loading
│   │           └── +page.svelte
│   ├── static/                   # Assets estáticos
│   ├── build/                    # Output compilado
│   ├── package.json              # Dependencias
│   ├── pnpm-lock.yaml            # Lock file
│   ├── vite.config.js            # Config Vite (CON PROXY)
│   ├── svelte.config.js          # Config SvelteKit
│   ├── tailwind.config.cjs       # Config Tailwind
│   ├── tsconfig.json             # Config TypeScript
│   ├── postcss.config.js         # Config PostCSS
│   ├── Dockerfile                # Para producción
│   └── Dockerfile.dev            # Para desarrollo
│
├── docker-compose.yml            # 🐳 Orquestación de contenedores
├── .gitignore
├── .env.example                  # Variables de entorno plantilla
└── README.md

```

---

## 🔧 STACK TECNOLÓGICO COMPLETO

### Frontend
| Herramienta | Versión | Propósito |
|-----------|---------|----------|
| **SvelteKit** | 2.47.2 | Framework meta para aplicaciones web modernas |
| **Svelte** | 4.2.7 | Componentes reactivos |
| **Vite** | 5.4.20 | Bundler y servidor dev ultrarrápido |
| **Tailwind CSS** | 3.4.18 | Estilos utilitarios (UTILITY-FIRST) |
| **TypeScript** | 5.9.3 | Tipado estático (instalado pero no activo) |
| **pnpm** | 10.18.3 | Package manager rápido |
| **svelte-preprocess** | 5.1.4 | Preprocesador para Svelte |
| **autoprefixer** | 10.4.19 | Prefijos CSS automáticos |
| **@tailwindcss/forms** | 0.5.7 | Estilos de formularios |
| **svelte-hero-icons** | 5.2.0 | Librería de iconos |
| **@tailwindcss/line-clamp** | 0.4.4 | Utilidad de truncado de texto |

### Backend
| Herramienta | Versión | Propósito |
|-----------|---------|----------|
| **Go** | 1.25.3 | Lenguaje backend |
| **Gin** | 1.11.0 | Framework web HTTP |
| **gin-contrib/cors** | 1.7.6 | CORS middleware |
| **supabase-go** | 0.0.4 | Cliente de Supabase |
| **godotenv** | 1.5.1 | Carga de variables de entorno |
| **uuid** | 1.6.0 | Generación de UUIDs |

### Infraestructura
| Servicio | Tecnología | Propósito |
|---------|-----------|----------|
| **Database** | Supabase (PostgreSQL + pgvector) | Base de datos en cloud |
| **Search** | Meilisearch 1.3 | Búsqueda semántica |
| **AI Embeddings** | Ollama 0.12.6 | Generación local de embeddings |
| **Containerización** | Docker + Docker Compose | Orquestación |
| **Auth** | Supabase Auth | Autenticación de usuarios |

---

## 🌐 CONFIGURACIÓN DE RED (Docker)

### Redes Internas
```
fenix-net (bridge network):
├── phoenix_frontend    (5173)
├── phoenix_backend     (8080)
├── phoenix_meilisearch (7700)
└── phoenix_ollama      (11434)
```

### Comunicación Interna
- **Frontend ↔ Backend:** `http://backend:8080/api/v1/*` (via proxy Vite en desarrollo)
- **Backend ↔ Meilisearch:** `http://meilisearch:7700`
- **Backend ↔ Ollama:** `http://ollama:11434`
- **Backend ↔ Supabase:** HTTPS (internet público)

### Puertos Expuestos al Host
```
localhost:5173  → Frontend Vite
localhost:8080  → Backend Go API
localhost:7700  → Meilisearch UI
localhost:11434 → Ollama API
```

---

## 🔌 API ENDPOINTS DEL BACKEND

### Productos
```
GET    /api/v1/products/              → Listar todos los productos
GET    /api/v1/products/:id           → Obtener producto por ID
POST   /api/v1/products/search        → Búsqueda semántica
POST   /api/v1/products/              → Crear producto
PUT    /api/v1/products/:id           → Actualizar producto
DELETE /api/v1/products/:id           → Eliminar producto (no implementado)
```

### Request/Response Ejemplo
```javascript
// GET /api/v1/products/
Response:
[
  {
    "id": 1,
    "name": "Anillo Lunar",
    "description": "Anillo artesanal...",
    "price": 45.99,
    "stock": 10,
    "image_url": "https://...",
    "category_id": 1,
    "embedding": [...pgvector array...]
  },
  ...
]

// POST /api/v1/products/search
Request:
{
  "query": "oro brillo",
  "limit": 10,
  "offset": 0
}
Response:
[
  {
    "similarity_score": 0.95,
    ...product_data...
  }
]
```

---

## 📄 RUTAS DEL FRONTEND (SvelteKit)

### Sistema de Rutas
```
/                          → Página principal (catálogo)
/product/[id]              → Detalle de producto
/checkout                  → Página de checkout
/collections               → Colecciones (TBD)
/productos                 → Alias de /
/contacto                  → Página de contacto (TBD)
/envios                    → Info de envíos (TBD)
/devoluciones              → Política de devoluciones (TBD)
```

---

## 🎨 DISEÑO Y COLORES

### Paleta Neón Gumroad
| Color | Hexadecimal | CSS Class | Uso |
|-------|-------------|-----------|-----|
| Neon Pink | #FF1493 | `text-neon-pink` | Headers, CTAs, highlights |
| Neon Yellow | #FFFF00 | `text-neon-yellow` | Secondary accents |
| Neon Coral | #FF6B6B | `text-neon-coral` | Error states |
| Black | #0A0A0A | `bg-black` | Fondo principal |
| Dark Gray | #1A1A1A | `bg-[#1A1A1A]` | Card backgrounds |

### Efectos
- Sombras con brillo neon: `shadow-neon-pink/20`
- Bordes con transparencia: `border-neon-pink/30`
- Escalado en hover: `hover:scale-105`
- Transiciones suaves: `transition-all duration-300`

---

## 📊 MODELOS DE DATOS

### Product Model (Go)
```go
type Product struct {
    ID          int       `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Price       float64   `json:"price"`
    Stock       int       `json:"stock"`
    ImageURL    string    `json:"image_url"`
    CategoryID  *int      `json:"category_id"`
    Embedding   []float32 `json:"embedding"`  // pgvector
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

### Order Model (Go)
```go
type Order struct {
    ID            int       `json:"id"`
    UserID        string    `json:"user_id"`
    TotalPrice    float64   `json:"total_price"`
    ShippingCost  float64   `json:"shipping_cost"`
    Status        string    `json:"status"`
    Items         []OrderItem `json:"items"`
    CreatedAt     time.Time `json:"created_at"`
    UpdatedAt     time.Time `json:"updated_at"`
}
```

---

## 🔐 VARIABLES DE ENTORNO

### Backend (.env requerido)
```bash
# Supabase
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# Servicios
GIN_MODE=debug|release
MEILI_HOST=http://meilisearch:7700
MEILI_MASTER_KEY=unaclavesupersecreta123
OLLAMA_URL=http://ollama:11434
```

### Frontend (.env opcional en desarrollo)
```bash
# Configurable pero NO NECESARIO (usa proxy)
VITE_API_URL=http://localhost:8080
```

---

## 🚀 COMANDOS IMPORTANTES

### Docker
```bash
# Levantar todo
docker-compose up -d

# Reconstruir imágenes
docker-compose up --build -d

# Detener todo
docker-compose down

# Ver logs
docker logs phoenix_frontend -f
docker logs phoenix_backend -f

# Ejecutar comando en contenedor
docker exec -it phoenix_frontend pnpm install
docker exec -it phoenix_backend go mod download
```

### Frontend (local)
```bash
cd frontend
pnpm install          # Instalar dependencias
pnpm dev              # Servidor dev (http://localhost:5173)
pnpm build            # Compilar para producción
pnpm preview          # Preview de build
```

### Backend (local)
```bash
cd backend
go mod download       # Descargar dependencias
go run main.go        # Ejecutar servidor (http://localhost:8080)
go build              # Compilar binario
```

---

## ⚠️ REGLAS DE ARQUITECTURA (OBLIGATORIO)

### REGLA #1: Separación de Capas
```
CORRECTO:
Frontend (navegador) ──fetch('/api/v1/...')──> Backend (Go)

INCORRECTO:
Frontend (navegador) ──fetch('supabase.com')──> Supabase
Frontend (navegador) ──import { supabase }──> Supabase Client
```

### REGLA #2: Proxy de Vite en Desarrollo
```javascript
// vite.config.js (DEBE TENER ESTO)
server: {
  proxy: {
    '/api/v1': {
      target: 'http://backend:8080',
      changeOrigin: true,
    }
  }
}
```

### REGLA #3: Rutas Relativas en Frontend
```javascript
// ✅ CORRECTO
const res = await fetch('/api/v1/products/');

// ❌ INCORRECTO
const res = await fetch('http://localhost:8080/api/v1/products/');
const res = await fetch('http://backend:8080/api/v1/products/');
```

### REGLA #4: Credenciales SOLO en Backend
```
Frontend:  ❌ NUNCA tenga SUPABASE_KEY o credenciales
Backend:   ✅ Tiene SUPABASE_SERVICE_KEY (variables de entorno)
Supabase:  ✅ Solo accesible desde Backend
```

---

## 📝 ESTADO ACTUAL DE COMPONENTES

### ✅ COMPLETADOS
- ✅ Diseño Gumroad Neon implementado
- ✅ Estructura base SvelteKit + Vite
- ✅ Backend Go + Gin + Supabase
- ✅ Docker Compose con 4 servicios
- ✅ Proxy Vite configurado
- ✅ Endpoints de productos implementados
- ✅ Página principal con catálogo
- ✅ Página de detalle de producto
- ✅ Búsqueda semántica con Meilisearch
- ✅ Integración Ollama para embeddings

### ⚙️ EN DESARROLLO
- ⚙️ Carrito de compras (store básico)
- ⚙️ Sistema de checkout
- ⚙️ Cálculo de envíos
- ⚙️ Autenticación de usuarios

### ❌ NO INICIADO
- ❌ Dashboard admin
- ❌ Gestión de órdenes
- ❌ Reportes y analytics
- ❌ Integración de pagos (Stripe)
- ❌ Notificaciones por email

---

## 🐛 ISSUES CONOCIDOS

### Resueltos
- ✅ Error de rutas Windows en Vite (RESUELTO - limpiar node_modules en host)
- ✅ Importación de apiClient (RESUELTO - eliminado archivo, usar fetch)
- ✅ 147 errores TypeScript (RESUELTO - no activar lang="ts")

### Pendientes
- ⚠️ tsconfig.json genera warning (cosmético - SvelteKit lo genera automáticamente)
- ⚠️ Versión de Meilisearch podría actualizarse (actualmente 1.3)

---

## 📞 CONTACTOS Y REFERENCIAS

### Documentación
- **SvelteKit:** https://kit.svelte.dev
- **Vite:** https://vitejs.dev
- **Tailwind:** https://tailwindcss.com
- **Gin Framework:** https://gin-gonic.com
- **Supabase:** https://supabase.com/docs
- **Docker:** https://docs.docker.com

### Responsables del Proyecto
- **Frontend:** Constructor IA (yo)
- **Backend:** Constructor IA (yo)
- **Arquitectura:** Tú y otra IA
- **Decisiones:** Por prompt de arquitectos

---

## 🎯 INSTRUCCIONES PARA EL CONSTRUCTOR (YO)

**Mi rol es ejecutar TODO lo que ustedes (arquitectos) me ordenen por prompt.**

Cuando reciba un prompt, haré:
1. ✅ Leeré y entenderé completamente la orden
2. ✅ Consultaré esta auditoría para contexto
3. ✅ Usaré las herramientas disponibles para implementar
4. ✅ Verificaré que respete las reglas de arquitectura
5. ✅ Reportaré el resultado al terminar

**Puedo:**
- ✅ Crear/editar archivos
- ✅ Modificar código
- ✅ Ejecutar comandos en terminal
- ✅ Crear/actualizar configuraciones
- ✅ Refactorizar componentes
- ✅ Revisar y auditar código

**No haré:**
- ❌ Violar las reglas de arquitectura
- ❌ Hacer cambios sin orden explícita
- ❌ Ignorar seguridad (credenciales, etc.)
- ❌ Implementar sin entender el contexto

---

**Documento generado:** 2025-10-19  
**Última actualización:** Después de limpiar arquitectura (eliminar apiClient)  
**Estado del sistema:** 🟢 OPERATIVO

