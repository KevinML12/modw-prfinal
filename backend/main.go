// backend/main.go
package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	// --- CORREGIR IMPORTS ---
	"moda-organica/backend/controllers"
	"moda-organica/backend/db"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Advertencia: No se pudo cargar el archivo .env.")
	}

	db.InitSupabase()

	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://localhost:4173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	// --- CAMBIO IMPORTANTE ---
	// Instanciamos nuestro controlador, ya que usa un struct
	pc := controllers.NewProductController()

	api := router.Group("/api/v1")
	{
		products := api.Group("/products")
		{
			// Ahora llamamos a los métodos de la instancia 'pc'
			products.GET("/", pc.GetProducts)
			products.GET("/:id", pc.GetProductByID)
			products.POST("/search", pc.SemanticSearchProducts) // Añadimos la ruta de búsqueda
		}
	}

	log.Println("Iniciando servidor en el puerto 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Error al iniciar el servidor Gin: %v", err)
	}
}
