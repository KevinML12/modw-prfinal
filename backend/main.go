package main

import (
	"log"
	"time" // <-- 1. AÑADE ESTA LÍNEA

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

	// --- Configuración CORS Explícita ---
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:4173"}, // Permite ambos puertos
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"}, // Añade "Accept"
		AllowCredentials: true,                                                          // Importante si usarás autenticación basada en cookies/sesiones después
		MaxAge:           12 * time.Hour,                                                // Tiempo que el navegador puede cachear la respuesta preflight
	}
	router.Use(cors.New(config)) // Aplicar ANTES de las rutas
	// --- Fin Configuración CORS ---

	// Instancia el controlador de productos
	pc := controllers.NewProductController()

	// Define las rutas de la API v1
	api := router.Group("/api/v1")
	{
		// Rutas para productos
		products := api.Group("/products")
		{
			products.GET("/", pc.GetProducts)
			products.GET("/:id", pc.GetProductByID)
			products.POST("/search", pc.SemanticSearchProducts)
			products.POST("/", pc.CreateProduct)
			products.PUT("/:id", pc.UpdateProduct)
		}
	}

	// Inicia el servidor
	log.Println("Iniciando servidor en el puerto 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Error al iniciar el servidor Gin: %v", err)
	}
}
