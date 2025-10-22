# 🔴 ANÁLISIS COMPLETO DEL BACKEND (Go + Gin)

## Estructura del Directorio Backend

```
backend/
├── main.go                          # Punto de entrada principal
├── go.mod                           # Definición del módulo
├── go.sum                           # Checksums de dependencias
├── .air.toml                        # Configuración de hot reload (Air)
├── Dockerfile                       # Para producción
├── Dockerfile.dev                   # Para desarrollo (con hot reload)
├── cmd/
│   └── backfill_embeddings/
│       └── main.go                  # Herramienta para generar embeddings
├── controllers/
│   └── product_controller.go        # Lógica de endpoints de productos
├── db/
│   └── supabase.go                  # Inicialización y configuración de conexión
├── models/
│   ├── product.go                   # Estructura de datos Product
│   └── order.go                     # Estructura de datos Order
├── services/
│   ├── embedding_service.go         # Integración con Ollama para embeddings
│   └── shipping-calculator.go       # Cálculo de costos de envío
└── tmp/                             # Artefactos compilados (air genera)
    └── main                         # Binario compilado
```

---

## Flujo de Ejecución (main.go)

```
main.go
  ├─ godotenv.Load() → Cargar variables de entorno desde .env
  ├─ db.InitSupabase() → Inicializar cliente de Supabase
  │   └─ supabase.NewClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  ├─ gin.Default() → Crear router HTTP
  ├─ cors.New(config) → Configurar CORS
  │   └─ AllowOrigins: ["http://localhost:5173", "http://localhost:4173"]
  ├─ ProductController → Instanciar controlador
  ├─ api/v1/products/ → Registrar rutas
  │   ├─ GET /    → GetProducts
  │   ├─ GET /:id → GetProductByID
  │   ├─ POST /search → SemanticSearchProducts
  │   ├─ POST /   → CreateProduct
  │   └─ PUT /:id → UpdateProduct
  └─ router.Run(":8080") → Escuchar en puerto 8080
```

---

## Dependencias Go (go.mod)

| Módulo | Versión | Propósito |
|--------|---------|----------|
| `github.com/gin-gonic/gin` | 1.11.0 | Framework web HTTP |
| `github.com/gin-contrib/cors` | 1.7.6 | Middleware CORS |
| `github.com/supabase-community/supabase-go` | 0.0.4 | Cliente de Supabase |
| `github.com/joho/godotenv` | 1.5.1 | Carga de .env |
| `github.com/google/uuid` | 1.6.0 | Generación de UUIDs |
| `golang.org/x/text` | 0.30.0 | Manejo de texto |

**Dependencias indirectas (via supabase-go):**
- `gotrue-go` → Autenticación de Supabase
- `postgrest-go` → API SQL de Supabase
- `storage-go` → Storage de Supabase
- `functions-go` → Edge Functions de Supabase

---

## Modelos de Datos

### Product Model (models/product.go)

```go
type Product struct {
    ID          int       `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Price       float64   `json:"price"`
    Stock       int       `json:"stock"`
    ImageURL    string    `json:"image_url"`
    CategoryID  *int      `json:"category_id"`
    Embedding   []float32 `json:"embedding"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

**Mapeo a Supabase:**
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price FLOAT8 NOT NULL,
  stock INTEGER NOT NULL,
  image_url TEXT,
  category_id INTEGER REFERENCES categories(id),
  embedding vector(1024),  -- pgvector para embeddings
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Order Model (models/order.go)

```go
type Order struct {
    ID           int       `json:"id"`
    UserID       string    `json:"user_id"`
    TotalPrice   float64   `json:"total_price"`
    ShippingCost float64   `json:"shipping_cost"`
    Status       string    `json:"status"`
    Items        []OrderItem `json:"items"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}

type OrderItem struct {
    ProductID  int     `json:"product_id"`
    Quantity   int     `json:"quantity"`
    UnitPrice  float64 `json:"unit_price"`
    TotalPrice float64 `json:"total_price"`
}
```

---

## Controllers (controllers/product_controller.go)

### ProductController Struct
```go
type ProductController struct{}

func NewProductController() *ProductController {
    return &ProductController{}
}
```

### Métodos Principales

#### 1. GetProducts
```go
func (pc *ProductController) GetProducts(c *gin.Context) {
    var products []models.Product
    // SELECT * FROM products
    data, _, err := db.Client.From("products").Select("*", "", false).Execute()
    // Unmarshal a JSON
    json.Unmarshal(data, &products)
    c.JSON(http.StatusOK, products)
}
```
- **Ruta:** `GET /api/v1/products/`
- **Response:** Array de todos los productos
- **Status:** 200 OK o 500 si error

#### 2. GetProductByID
```go
func (pc *ProductController) GetProductByID(c *gin.Context) {
    id := c.Param("id")
    var product models.Product
    // SELECT * FROM products WHERE id = :id
    data, _, err := db.Client.From("products").Select("*", "", false).Eq("id", id).Single().Execute()
    c.JSON(http.StatusOK, product)
}
```
- **Ruta:** `GET /api/v1/products/:id`
- **Params:** `id` (integer)
- **Response:** Objeto producto individual
- **Status:** 200 OK o 404 Not Found

#### 3. SemanticSearchProducts
```go
func (pc *ProductController) SemanticSearchProducts(c *gin.Context) {
    var req SearchRequest
    c.ShouldBindJSON(&req)
    
    // 1. Generar embedding de la query
    embedding, _ := services.GetEmbedding(req.Query)
    
    // 2. Buscar productos similares usando pgvector
    // SELECT * FROM products 
    // ORDER BY embedding <=> :embedding
    // LIMIT 10
    
    c.JSON(http.StatusOK, results)
}
```
- **Ruta:** `POST /api/v1/products/search`
- **Body:** `{"query": "oro brillo", "limit": 10, "offset": 0}`
- **Response:** Array de productos ordenados por similitud
- **Flujo:**
  1. Recibe texto de búsqueda
  2. Genera embedding usando Ollama
  3. Compara embeddings con pgvector
  4. Retorna productos más similares

#### 4. CreateProduct
```go
func (pc *ProductController) CreateProduct(c *gin.Context) {
    var input ProductInput
    c.ShouldBindJSON(&input)
    
    // 1. Insertar en Supabase
    // INSERT INTO products (name, description, price, stock, image_url, category_id)
    // VALUES (...) RETURNING *
    
    // 2. Generar embedding del producto
    embedding, _ := services.GetEmbedding(productName + ": " + description)
    
    // 3. Actualizar producto con embedding
    // UPDATE products SET embedding = :embedding WHERE id = :id
    
    c.JSON(http.StatusCreated, createdProduct)
}
```
- **Ruta:** `POST /api/v1/products/`
- **Body:** Objeto ProductInput
- **Response:** Producto creado con ID
- **Status:** 201 Created

#### 5. UpdateProduct
```go
func (pc *ProductController) UpdateProduct(c *gin.Context) {
    id := c.Param("id")
    var input ProductInput
    c.ShouldBindJSON(&input)
    
    // UPDATE products SET ... WHERE id = :id
    c.JSON(http.StatusOK, updatedProduct)
}
```
- **Ruta:** `PUT /api/v1/products/:id`
- **Body:** Objeto ProductInput (parcial)
- **Response:** Producto actualizado

---

## Database Connection (db/supabase.go)

```go
package db

import (
    "github.com/supabase-community/supabase-go"
)

var Client *supabase.Client

func InitSupabase() {
    supabaseURL := os.Getenv("SUPABASE_URL")
    supabaseKey := os.Getenv("SUPABASE_SERVICE_KEY")
    
    if supabaseURL == "" || supabaseKey == "" {
        log.Fatal("SUPABASE_URL y SUPABASE_SERVICE_KEY requeridas")
    }
    
    client, err := supabase.NewClient(supabaseURL, supabaseKey, nil)
    if err != nil {
        log.Fatalf("Error: %v", err)
    }
    
    Client = client
    log.Println("✅ Conexión con Supabase establecida exitosamente")
}
```

**API Supabase-Go:**
```go
// SELECT
db.Client.From("products").Select("*", "", false).Execute()

// WHERE
db.Client.From("products").Select("*", "", false).Eq("id", 1).Single().Execute()

// INSERT
db.Client.From("products").Insert(newProductData, false, "representation", "", "").Single().Execute()

// UPDATE
db.Client.From("products").Update(updateData, "", "").Eq("id", 1).Execute()

// DELETE
db.Client.From("products").Delete("", "").Eq("id", 1).Execute()
```

---

## Services

### Embedding Service (services/embedding_service.go)

```go
func GetEmbedding(text string) ([]float32, error) {
    // Conectar a Ollama
    ollamaURL := os.Getenv("OLLAMA_URL")
    
    // POST /api/embeddings
    // Con modelo (ej: "all-minilm")
    // Devuelve vector de embeddings
    
    return embeddingVector, nil
}
```

**Flujo:**
1. Recibe texto (producto o query de búsqueda)
2. Llama a Ollama en `http://ollama:11434/api/embeddings`
3. Ollama genera embedding (vector de 384-1024 dimensiones)
4. Retorna vector para guardar en pgvector

**Uso en Backend:**
```go
// Cuando creas un producto
embedding, _ := services.GetEmbedding("Anillo Lunar: Anillo artesanal...")
// Guarda en: UPDATE products SET embedding = :embedding

// Cuando buscas
embedding, _ := services.GetEmbedding("oro brillo")
// Usa para: SELECT * FROM products ORDER BY embedding <=> :embedding
```

### Shipping Calculator (services/shipping-calculator.go)

```go
func CalculateShippingCost(zipCode string, weight float64) (float64, error) {
    // Lógica para calcular costo de envío
    // Basado en:
    // - Código postal
    // - Peso del paquete
    // - Zona de envío
    
    return shippingCost, nil
}
```

---

## Configuración CORS (main.go)

```go
config := cors.Config{
    AllowOrigins:     []string{"http://localhost:5173", "http://localhost:4173"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
    AllowCredentials: true,
    MaxAge:           12 * time.Hour,
}
router.Use(cors.New(config))
```

**Permite:**
- ✅ Requests desde el frontend (localhost:5173)
- ✅ Todos los métodos HTTP
- ✅ Headers necesarios
- ✅ Cookies/credenciales

---

## Variables de Entorno Requeridas

```bash
# .env file en backend/
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# Opcionales pero recomendados
GIN_MODE=debug          # debug|release
MEILI_HOST=http://meilisearch:7700
MEILI_MASTER_KEY=unaclavesupersecreta123
OLLAMA_URL=http://ollama:11434
```

---

## Desarrollo Local

### Hot Reload con Air

```bash
# .air.toml
root = "."
tmp_dir = "tmp"

[build]
cmd = "go build -o ./tmp/main ."
bin = "tmp/main"
full_bin = "GIN_MODE=debug ./tmp/main"
include_ext = ["go", "tpl"]
exclude_dir = ["node_modules", "vendor"]
```

**Cómo funciona:**
1. `air` monitorea cambios en `.go`
2. Recompila automáticamente
3. Reinicia el servidor
4. No necesitas hacer `go run main.go` manualmente

**Comando:**
```bash
go install github.com/air-verse/air@latest
air
```

---

## Estructura de Respuestas API

### Success Response (200/201)
```json
{
  "id": 1,
  "name": "Anillo Lunar",
  "description": "Anillo artesanal...",
  "price": 45.99,
  "stock": 10,
  "image_url": "https://...",
  "category_id": 1,
  "embedding": [...],
  "created_at": "2025-10-19T10:30:00Z",
  "updated_at": "2025-10-19T10:30:00Z"
}
```

### Error Response (4xx/5xx)
```json
{
  "error": "Descripción del error",
  "status": 400
}
```

### List Response
```json
[
  { ...product1... },
  { ...product2... },
  { ...product3... }
]
```

### Search Response
```json
[
  {
    "similarity_score": 0.95,
    "id": 1,
    "name": "Anillo Oro",
    ...
  },
  {
    "similarity_score": 0.87,
    "id": 2,
    "name": "Brazalete Brillo",
    ...
  }
]
```

---

## Flujos de Datos

### 1. Listar Productos (Frontend)
```
Frontend:
  fetch('/api/v1/products/')
    ↓ (Vite proxy redirige a backend:8080)
    
Backend:
  GET /api/v1/products/
    ├─ ProductController.GetProducts()
    ├─ Query: SELECT * FROM products
    ├─ Supabase (via supabase-go client)
    └─ Return JSON array
    
Response back to Frontend:
  [{ id, name, price, ... }]
```

### 2. Búsqueda Semántica (Frontend)
```
Frontend:
  POST /api/v1/products/search
  Body: { "query": "oro brillo" }
    ↓
Backend:
  POST /api/v1/products/search
    ├─ Recibir query string
    ├─ Call services.GetEmbedding("oro brillo")
    │   ├─ HTTP POST a Ollama
    │   └─ Recibir vector embedding
    ├─ Query Supabase con pgvector
    │   SELECT * FROM products
    │   ORDER BY embedding <=> :embedding
    │   LIMIT 10
    └─ Return results sorted by similarity
```

### 3. Crear Producto (Frontend → Backend → Supabase)
```
Frontend:
  POST /api/v1/products/
  Body: { "name": "...", "description": "...", "price": 50 }
    ↓
Backend:
  POST /api/v1/products/
    ├─ Validar input
    ├─ INSERT INTO products
    ├─ Generar embedding del nuevo producto
    │   Text = name + description
    │   Call Ollama
    ├─ UPDATE products SET embedding WHERE id
    └─ Return created product with ID
    
Response:
  { "id": 123, "name": "...", "price": 50, "embedding": [...] }
```

---

## Errores Comunes y Soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| CORS error en frontend | Rutas hardcodeadas | Usar rutas relativas `/api/v1/...` |
| 500 "Error al consultar productos" | SUPABASE_KEY no válida | Verificar SUPABASE_SERVICE_KEY en .env |
| Connection refused ollama | Ollama no corriendo | `docker-compose up ollama` |
| Timeout en búsqueda | Ollama lento generando embeddings | Usar modelo más pequeño |
| pgvector extension error | Extension no habilitada en Supabase | Habilitar "vector" en extensions |

---

## Comandos Útiles

```bash
# Construir binario
go build -o ./tmp/main .

# Ejecutar en desarrollo (hot reload)
air

# Ejecutar en producción
GIN_MODE=release go run main.go

# Verificar dependencias
go mod tidy

# Descargar dependencias
go mod download

# Tests (si existen)
go test ./...

# Ver port 8080 en uso
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows
```

---

## Próximos Pasos a Implementar (Backlog Backend)

- [ ] Endpoints de órdenes (GET, POST, PUT, DELETE)
- [ ] Autenticación con Supabase Auth
- [ ] Cálculo de envíos automático
- [ ] Validación de datos más robusta
- [ ] Rate limiting
- [ ] Logging estructurado
- [ ] Métricas/observabilidad
- [ ] Tests unitarios
- [ ] Documentación OpenAPI/Swagger

---

Este es el corazón del proyecto. Todo fluye a través de aquí. 🔴🚀
