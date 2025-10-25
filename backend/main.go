package main

import (
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"moda-organica/backend/controllers"
	"moda-organica/backend/db"
	"moda-organica/backend/middleware"
	"moda-organica/backend/models"
)

func main() {
	// Carga variables de entorno desde .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Advertencia: No se pudo cargar el archivo .env.")
	}

	// Inicializa la conexión con Supabase
	db.InitSupabase()

	// Obtener la conexión GORM
	gormDB := db.GetGormDB()

	// Migrar los modelos
	if gormDB != nil {
		gormDB.AutoMigrate(&models.Product{}, &models.Order{}, &models.OrderItem{})
		log.Println("Modelos migrados exitosamente")
	}

	// Crea una instancia del router Gin
	router := gin.Default()

	// Configuración CORS
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	router.Use(cors.New(config))

	// Health check - endpoint público para verificar que el backend está corriendo
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Backend is running",
			"version": "1.0",
		})
	})

	// Instancia el controlador de productos
	pc := controllers.NewProductController()

	// Instancia el controlador de pedidos
	var orderController *controllers.OrderController
	if gormDB != nil {
		orderController = controllers.NewOrderController(gormDB)
		log.Println("OrderController inicializado exitosamente")
	} else {
		log.Println("Advertencia: GORM no está disponible, OrderController no inicializado")
	}

	// Instancia el controlador de pagos con inyección de dependencias
	paymentController := controllers.NewPaymentController()

	// Define las rutas de la API v1
	apiV1 := router.Group("/api/v1")
	{
		// Rutas para productos
		products := apiV1.Group("/products")
		{
			products.GET("/", pc.GetProducts)
			products.GET("/:id", pc.GetProductByID)
			products.POST("/search", pc.SemanticSearchProducts)
			products.POST("/", pc.CreateProduct)
			products.PUT("/:id", pc.UpdateProduct)
		}

		// Rutas para pedidos
		if orderController != nil {
			apiV1.POST("/orders", orderController.CreateOrder)
			log.Println("Endpoint POST /api/v1/orders registrado exitosamente")
		}

		// Rutas para pagos con Stripe
		payments := apiV1.Group("/payments")
		{
			payments.POST("/create-checkout-session", paymentController.CreateCheckoutSession)
			log.Println("Endpoint POST /api/v1/payments/create-checkout-session registrado exitosamente")
		}
	}

	// ===== RUTAS DE ADMINISTRACIÓN (PROTEGIDAS) =====
	admin := apiV1.Group("/admin")
	admin.Use(middleware.AdminAuthMiddleware())
	{
		// Gestión de Órdenes
		admin.GET("/orders", orderController.AdminGetOrders)
		admin.GET("/orders/:id", orderController.AdminGetOrderByID)
		admin.GET("/orders/stats", orderController.AdminGetOrdersStats)
		admin.GET("/orders/map", orderController.AdminGetOrdersMap)
		log.Println("Rutas de administración de órdenes registradas exitosamente")
	}

	// Inicia el servidor
	log.Println("Iniciando servidor en el puerto 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Error al iniciar el servidor Gin: %v", err)
	}
}
