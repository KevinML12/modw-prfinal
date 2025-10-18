package main

import (
	"encoding/json"
	"fmt"
	"log"

	// Ajusta las rutas de importación según tu módulo
	"moda-organica/backend/db"
	"moda-organica/backend/models"
	"moda-organica/backend/services"

	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("Iniciando backfill de embeddings...")

	// 1. Cargar variables de entorno (necesarias para Supabase y Ollama)
	// Asegúrate que el .env esté accesible o las variables estén seteadas
	if err := godotenv.Load("../../.env"); err != nil { // Sube dos niveles para encontrar el .env raíz
		log.Println("Advertencia: No se pudo cargar el archivo .env principal.")
	}

	// 2. Conectar a Supabase
	db.InitSupabase()
	if db.Client == nil {
		log.Fatal("Error: No se pudo inicializar el cliente de Supabase.")
	}

	// 3. Obtener todos los productos SIN embedding
	var productsToUpdate []models.Product
	selectQuery := "embedding.is.null" // Sintaxis PostgREST para filtrar nulos
	data, _, err := db.Client.From("products").Select("*", "", false).Filter("embedding", "is", "null").Execute()
	if err != nil {
		log.Fatalf("Error al obtener productos sin embedding: %v\nQuery: %s", err, selectQuery)
	}

	if err := json.Unmarshal(data, &productsToUpdate); err != nil {
		log.Fatalf("Error al decodificar productos: %v", err)
	}

	if len(productsToUpdate) == 0 {
		fmt.Println("¡Todos los productos ya tienen embeddings!")
		return
	}

	fmt.Printf("Se encontraron %d productos para generar embeddings.\n", len(productsToUpdate))

	// 4. Iterar y generar embeddings
	updatedCount := 0
	for _, product := range productsToUpdate {
		// Usamos nombre + descripción para el embedding
		textToEmbed := fmt.Sprintf("%s: %s", product.Name, product.Description)

		fmt.Printf("Generando embedding para ID %d: %s...\n", product.ID, product.Name)
		embedding, err := services.GetEmbedding(textToEmbed)
		if err != nil {
			log.Printf("Error al generar embedding para producto ID %d: %v. Omitiendo.", product.ID, err)
			continue // Salta al siguiente producto si Ollama falla
		}

		// Prepara los datos para la actualización
		updateData := map[string]interface{}{
			"embedding": embedding,
		}

		// Actualiza el producto en Supabase
		// Usamos Patch() para no sobreescribir otros campos
		_, _, err = db.Client.From("products").Update(updateData, "", "").Eq("id", fmt.Sprintf("%d", product.ID)).Execute()
		if err != nil {
			log.Printf("Error al actualizar embedding para producto ID %d: %v. Omitiendo.", product.ID, err)
			continue
		}
		updatedCount++
		fmt.Printf("Embedding actualizado para ID %d.\n", product.ID)
	}

	fmt.Printf("¡Backfill completado! Se actualizaron %d productos.\n", updatedCount)
}
