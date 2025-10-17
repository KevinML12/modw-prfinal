// backend/controllers/product_controller.go
package controllers

import (
	"net/http"
	"strconv"

	"phoenix/models" // Importamos nuestros modelos de datos.

	"github.com/gin-gonic/gin"
)

// --- Simulación de Base de Datos (Mock Data) ---
// En un proyecto real, estos datos vendrían de una consulta a la base de datos (Supabase).
// Usamos esto temporalmente para poder construir y probar el frontend.
var mockProducts = []models.Product{
	{ID: 1, SKU: "MO-J-001", Name: "Collar 'Luna Mística'", Description: "Elegante collar de plata con un colgante de piedra lunar.", Price: 450.00, Stock: 15, ImageURL: "/images/products/collar-luna.jpg"},
	{ID: 2, SKU: "MO-J-002", Name: "Anillo 'Sol de Jade'", Description: "Anillo artesanal con una pieza central de jade guatemalteco.", Price: 680.00, Stock: 8, ImageURL: "/images/products/anillo-jade.jpg"},
	{ID: 3, SKU: "MO-J-003", Name: "Aretes 'Gota de Rocío'", Description: "Delicados aretes de oro laminado con cristales de topacio.", Price: 325.00, Stock: 25, ImageURL: "/images/products/aretes-topacio.jpg"},
	{ID: 4, SKU: "MO-A-001", Name: "Pulsera 'Bosque Encantado'", Description: "Pulsera de cuero con dijes de plata y motivos de la naturaleza.", Price: 250.00, Stock: 30, ImageURL: "/images/products/pulsera-bosque.jpg"},
}

// ProductController es un struct que agrupará los handlers de producto.
// En el futuro, contendrá la conexión a la base de datos (ej: DB *gorm.DB).
type ProductController struct{}

// NewProductController es el constructor para nuestro controlador.
func NewProductController() *ProductController {
	return &ProductController{}
}

// --- Handlers de la API ---

// GetProducts maneja la petición GET /products.
// Devuelve una lista de todos los productos disponibles.
func (pc *ProductController) GetProducts(c *gin.Context) {
	// Por ahora, simplemente devolvemos nuestra lista de productos de prueba.
	c.JSON(http.StatusOK, mockProducts)
}

// GetProductByID maneja la petición GET /products/:id.
// Busca y devuelve un único producto por su ID.
func (pc *ProductController) GetProductByID(c *gin.Context) {
	// Obtenemos el 'id' de los parámetros de la URL.
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Buscamos el producto en nuestra lista de prueba.
	for _, product := range mockProducts {
		if product.ID == uint(id) {
			c.JSON(http.StatusOK, product)
			return
		}
	}

	// Si el bucle termina y no encontramos el producto, devolvemos un error 404.
	c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
}

// SemanticSearchProducts maneja la petición POST /products/search
// Esta es la funcionalidad estrella que usará IA.
func (pc *ProductController) SemanticSearchProducts(c *gin.Context) {
	var requestBody struct {
		Query string `json:"query"`
		// En el futuro, aquí también podríamos recibir una imagen en base64.
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cuerpo de la petición inválido"})
		return
	}
	
	// --- SIMULACIÓN DE LA LÓGICA DE IA ---
	// 1. (FUTURO) Tomar requestBody.Query ("algo elegante para una boda").
	// 2. (FUTURO) Convertir el texto a un vector usando un modelo de IA (ej. CLIP).
	// 3. (FUTURO) Ejecutar una consulta de similitud de cosenos en Supabase con pgvector.
	// 4. (FUTURO) La base de datos devolvería los productos más relevantes.

	// Por ahora, devolvemos un resultado de prueba que "parece" relevante.
	// Simulamos que la búsqueda "elegante" devolvió el collar y los aretes.
	searchResults := []models.Product{mockProducts[0], mockProducts[2]}

	c.JSON(http.StatusOK, searchResults)
}