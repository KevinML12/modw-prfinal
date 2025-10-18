package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"moda-organica/backend/db"
	"moda-organica/backend/models"
	"moda-organica/backend/services"

	"github.com/gin-gonic/gin"
)

// ProductController struct
type ProductController struct{}

// NewProductController constructor
func NewProductController() *ProductController {
	return &ProductController{}
}

// GetProducts maneja GET /api/v1/products
func (pc *ProductController) GetProducts(c *gin.Context) {
	var products []models.Product
	data, _, err := db.Client.From("products").Select("*", "", false).Execute()
	if err != nil {
		log.Printf("Error al consultar productos: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los productos"})
		return
	}
	if err := json.Unmarshal(data, &products); err != nil {
		log.Printf("Error al decodificar JSON de productos: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la respuesta de la base de datos"})
		return
	}
	c.JSON(http.StatusOK, products)
}

// GetProductByID maneja GET /api/v1/products/:id
func (pc *ProductController) GetProductByID(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	data, _, err := db.Client.From("products").Select("*", "", false).Eq("id", id).Single().Execute()
	if err != nil {
		log.Printf("Error al consultar producto por ID %s: %v", id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}
	if err := json.Unmarshal(data, &product); err != nil {
		log.Printf("Error al decodificar JSON de producto ID %s: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la respuesta de la base de datos"})
		return
	}
	c.JSON(http.StatusOK, product)
}

// --- Estructura para Crear/Actualizar Productos ---
type ProductInput struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Price       *float64 `json:"price"`
	Stock       *int     `json:"stock"`
	ImageURL    *string  `json:"image_url"`
	CategoryID  *int     `json:"category_id"`
}

// Helper para obtener valor o string vacío si es nil
func getStringOrDefault(s *string) string {
	if s != nil {
		return *s
	}
	return ""
}

// CreateProduct maneja POST /api/v1/products
func (pc *ProductController) CreateProduct(c *gin.Context) {
	var input ProductInput
	if err := c.ShouldBindJSON(&input); err != nil || input.Name == nil || input.Price == nil || input.Stock == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cuerpo de la petición inválido o faltan campos requeridos (name, price, stock)"})
		return
	}

	newProductData := map[string]interface{}{
		"name":        *input.Name,
		"description": getStringOrDefault(input.Description),
		"price":       *input.Price,
		"stock":       *input.Stock,
		"image_url":   getStringOrDefault(input.ImageURL),
		"category_id": input.CategoryID,
	}
	var createdProduct models.Product

	// --- CORRECCIÓN INSERT: Usar Execute() y Unmarshal ---
	// 1. Insertar datos, pidiendo 'representation' en el segundo argumento
	// El tercer argumento (count) se deja vacío ""
	insertResultBytes, _, err := db.Client.From("products").Insert(newProductData, false, "representation", "", "").Single().Execute()
	if err != nil {
		log.Printf("Error al crear producto en Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar el producto"})
		return
	}
	// 2. Decodificar el resultado
	if err := json.Unmarshal(insertResultBytes, &createdProduct); err != nil {
		log.Printf("Error al decodificar producto creado: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la respuesta de la base de datos"})
		return
	}
	// --- FIN CORRECCIÓN INSERT ---

	// Generar y guardar embedding (sin cambios)
	textToEmbed := fmt.Sprintf("%s: %s", createdProduct.Name, createdProduct.Description)
	embedding, errEmbed := services.GetEmbedding(textToEmbed)
	if errEmbed != nil {
		log.Printf("Error al generar embedding para nuevo producto ID %d: %v. Se guardará sin embedding.", createdProduct.ID, errEmbed)
	} else {
		embeddingUpdate := map[string]interface{}{"embedding": embedding}
		// Usamos Update normal aquí, no necesitamos la representación
		_, _, updateErr := db.Client.From("products").Update(embeddingUpdate, "", "").Eq("id", fmt.Sprintf("%d", createdProduct.ID)).Execute()
		if updateErr != nil {
			log.Printf("Error al guardar embedding para nuevo producto ID %d: %v", createdProduct.ID, updateErr)
		} else {
			log.Printf("Embedding generado y guardado para nuevo producto ID %d.", createdProduct.ID)
		}
	}

	c.JSON(http.StatusCreated, createdProduct)
}

// UpdateProduct maneja PUT /api/v1/products/:id
func (pc *ProductController) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	productID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de producto inválido"})
		return
	}

	var input ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cuerpo de la petición inválido: " + err.Error()})
		return
	}

	updateData := make(map[string]interface{})
	needsEmbeddingUpdate := false
	if input.Name != nil { /* ... */
		updateData["name"] = *input.Name
		needsEmbeddingUpdate = true
	}
	if input.Description != nil { /* ... */
		updateData["description"] = *input.Description
		needsEmbeddingUpdate = true
	}
	if input.Price != nil { /* ... */
		updateData["price"] = *input.Price
	}
	if input.Stock != nil { /* ... */
		updateData["stock"] = *input.Stock
	}
	if input.ImageURL != nil { /* ... */
		updateData["image_url"] = *input.ImageURL
	}
	if input.CategoryID != nil { /* ... */
		updateData["category_id"] = *input.CategoryID
	}

	if len(updateData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No se proporcionaron campos para actualizar"})
		return
	}

	var updatedProduct models.Product

	// --- CORRECCIÓN UPDATE: Arreglar argumentos y usar Execute + Unmarshal ---
	// 1. Llamar a Update con los argumentos correctos: (datos, returning, count)
	//    Pedimos 'representation' en el segundo argumento. Count vacío "".
	updateResultBytes, _, err := db.Client.From("products").Update(updateData, "representation", "").Eq("id", idStr).Single().Execute()
	if err != nil {
		log.Printf("Error al actualizar producto ID %s: %v", idStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar el producto"})
		return
	}
	// 2. Decodificar el resultado
	if err := json.Unmarshal(updateResultBytes, &updatedProduct); err != nil {
		log.Printf("Error al decodificar producto actualizado ID %s: %v", idStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la respuesta de la base de datos"})
		return
	}
	// --- FIN CORRECCIÓN UPDATE ---

	// Regenerar y guardar embedding (sin cambios)
	if needsEmbeddingUpdate {
		log.Printf("Regenerando embedding para producto ID %d debido a cambio en nombre/descripción.", productID)
		textToEmbed := fmt.Sprintf("%s: %s", updatedProduct.Name, updatedProduct.Description)
		embedding, errEmbed := services.GetEmbedding(textToEmbed)
		if errEmbed != nil {
			log.Printf("Error al regenerar embedding para producto ID %d: %v", productID, errEmbed)
		} else {
			embeddingUpdate := map[string]interface{}{"embedding": embedding}
			_, _, updateErr := db.Client.From("products").Update(embeddingUpdate, "", "").Eq("id", idStr).Execute() // Update simple
			if updateErr != nil {
				log.Printf("Error al guardar embedding actualizado para producto ID %d: %v", productID, updateErr)
			} else {
				log.Printf("Embedding actualizado para producto ID %d.", productID)
			}
		}
	}

	c.JSON(http.StatusOK, updatedProduct)
}

// --- Búsqueda Semántica (Usando HTTP Manual) ---
// (Esta función se queda igual que la versión anterior que funcionó)
type SearchRequest struct {
	Query string `json:"query" binding:"required"`
}

// SemanticSearchProducts maneja POST /api/v1/products/search
func (pc *ProductController) SemanticSearchProducts(c *gin.Context) {
	var req SearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cuerpo de la petición inválido: falta el campo 'query' o no es string"})
		return
	}

	// 1. Obtener el embedding (¡Esta variable SÍ la necesitamos!)
	queryEmbedding, err := services.GetEmbedding(req.Query)
	if err != nil {
		log.Printf("Error al obtener embedding para la consulta '%s': %v", req.Query, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la consulta de búsqueda"})
		return
	}

	var searchResults []models.Product

	// 2. Parámetros para la función SQL (¡Aquí usamos queryEmbedding!)
	rpcParams := map[string]interface{}{
		"query_embedding": queryEmbedding, // <-- CORREGIDO: Usar la variable
		"match_threshold": 0.5,
		"match_count":     10,
	}

	// --- Llamada HTTP Manual a PostgREST (Sin cambios en esta parte) ---
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_KEY")
	if supabaseURL == "" || supabaseKey == "" { /* ... manejo error ... */
		return
	}
	rpcURL := fmt.Sprintf("%s/rest/v1/rpc/match_products", supabaseURL)
	payloadBytes, err := json.Marshal(rpcParams)
	if err != nil { /* ... manejo error ... */
		return
	}
	httpRequest, err := http.NewRequest("POST", rpcURL, bytes.NewBuffer(payloadBytes))
	if err != nil { /* ... manejo error ... */
		return
	}
	httpRequest.Header.Set("Content-Type", "application/json")
	httpRequest.Header.Set("apikey", supabaseKey)
	httpRequest.Header.Set("Authorization", "Bearer "+supabaseKey)
	httpClient := &http.Client{}
	httpResponse, err := httpClient.Do(httpRequest)
	if err != nil { /* ... manejo error ... */
		return
	}
	defer httpResponse.Body.Close()
	responseBody, err := io.ReadAll(httpResponse.Body)
	if err != nil { /* ... manejo error ... */
		return
	}
	if httpResponse.StatusCode < 200 || httpResponse.StatusCode >= 300 { /* ... manejo error ... */
		return
	}
	if err := json.Unmarshal(responseBody, &searchResults); err != nil { /* ... manejo error ... */
		return
	}
	// --- FIN Llamada HTTP Manual ---

	c.JSON(http.StatusOK, searchResults)
}
