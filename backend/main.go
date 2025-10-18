package main

import (
	"log"

	"github.com/gin-contrib/cors" // Para manejar CORS
	"github.com/gin-gonic/gin"    // Framework web
	"github.com/joho/godotenv"    // Para cargar .env en desarrollo local

	// Ajusta las rutas según tu módulo
	"moda-organica/backend/controllers" // Importa los controladores
	"moda-organica/backend/db"          // Importa la configuración de la DB
)

func main() {
	// Carga variables de entorno desde .env (útil para desarrollo local)
	err := godotenv.Load()
	if err != nil {
		log.Println("Advertencia: No se pudo cargar el archivo .env.")
	}

	// Inicializa la conexión con Supabase
	db.InitSupabase()

	// Crea una instancia del router Gin
	router := gin.Default()

	// Configura CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://localhost:4173"} // Puertos de SvelteKit dev/preview
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	// Instancia el controlador de productos
	pc := controllers.NewProductController()

	// Define las rutas de la API v1
	api := router.Group("/api/v1")
	{
		// Rutas para productos
		products := api.Group("/products")
		{
			products.GET("/", pc.GetProducts)                   // Obtener todos
			products.GET("/:id", pc.GetProductByID)             // Obtener uno por ID
			products.POST("/search", pc.SemanticSearchProducts) // Búsqueda semántica
			products.POST("/", pc.CreateProduct)                // Crear nuevo producto
			products.PUT("/:id", pc.UpdateProduct)              // Actualizar producto existente
			// Faltaría: products.DELETE("/:id", pc.DeleteProduct)
		}

		// Aquí irían otros grupos (orders, users, etc.)
	}

	// Inicia el servidor
	log.Println("Iniciando servidor en el puerto 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Error al iniciar el servidor Gin: %v", err)
	}
}
