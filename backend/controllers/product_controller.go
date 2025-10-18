package controllers

import (
	"encoding/json" // <-- 1. IMPORTAR EL PAQUETE JSON
	"log"
	"net/http"

	"moda-organica/backend/db"
	"moda-organica/backend/models"

	"github.com/gin-gonic/gin"
)

// ProductController (vacío por ahora, pero mantiene la estructura)
type ProductController struct{}

// NewProductController es el constructor para nuestro controlador.
func NewProductController() *ProductController {
	return &ProductController{}
}

// --- Handlers de la API ---

// GetProducts maneja la petición GET /products.
// Devuelve una lista de todos los productos desde Supabase.
func (pc *ProductController) GetProducts(c *gin.Context) {
	var products []models.Product // Un slice para almacenar los resultados

	// --- Lógica de Supabase (CORREGIDA) ---
	// 1. Select(columns, count, head) -> count="" y head=false para un select normal
	// 2. Execute() no toma argumentos y devuelve (data, count, error)
	data, _, err := db.Client.From("products").Select("*", "", false).Execute()

	if err != nil {
		log.Printf("Error al consultar productos: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al obtener los productos",
		})
		return
	}

	// 3. Debemos decodificar el JSON (data es []byte) a nuestro slice
	if err := json.Unmarshal(data, &products); err != nil {
		log.Printf("Error al decodificar JSON de productos: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la respuesta de la base de datos"})
		return
	}
	// --- Fin de la lógica de Supabase ---

	c.JSON(http.StatusOK, products)
}

// GetProductByID maneja la petición GET /products/:id.
// Busca y devuelve un único producto por su ID desde Supabase.
func (pc *ProductController) GetProductByID(c *gin.Context) {
	// Obtenemos el 'id' de los parámetros de la URL.
	id := c.Param("id")

	var product models.Product

	// --- Lógica de Supabase (CORREGIDA) ---
	// Usamos .Single() para indicar que esperamos un solo objeto JSON, no un array
	data, _, err := db.Client.From("products").Select("*", "", false).Eq("id", id).Single().Execute()

	if err != nil {
		// Este error ahora sí captura "no rows returned" (PGRST116)
		log.Printf("Error al consultar producto por ID: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}

	// Decodificamos el objeto JSON único
	if err := json.Unmarshal(data, &product); err != nil {
		log.Printf("Error al decodificar JSON de producto: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la respuesta de la base de datos"})
		return
	}
	// --- Fin de la lógica de Supabase ---

	c.JSON(http.StatusOK, product)
}

// SemanticSearchProducts maneja la petición POST /products/search
// (Dejamos la simulación por ahora)
func (pc *ProductController) SemanticSearchProducts(c *gin.Context) {
	var requestBody struct {
		Query string `json:"query"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cuerpo de la petición inválido"})
		return
	}

	mockResult := []models.Product{
		{ID: 1, Name: "Resultado Simulado 1", Price: 100},
		{ID: 3, Name: "Resultado Simulado 2", Price: 200},
	}

	c.JSON(http.StatusOK, mockResult)
}
