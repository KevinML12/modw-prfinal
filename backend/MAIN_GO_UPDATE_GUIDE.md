/**
 * ============================================
 * GUÍA: Actualizar main.go con Middleware de Autenticación
 * ============================================
 * 
 * Este archivo es una GUÍA de cómo actualizar el main.go existente
 * para incluir el middleware de autenticación y las nuevas rutas protegidas.
 * 
 * PASO 1: Importar el middleware en main.go
 */

package main

import (
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"moda-organica/backend/controllers"
	"moda-organica/backend/db"
	"moda-organica/backend/middleware"  // NUEVO
	"moda-organica/backend/models"
)

/**
 * ============================================
 * PASO 2: Actualizar la función main()
 * 
 * Buscar en main.go el código donde se definen las rutas y REEMPLAZAR
 * la sección de "Define las rutas de la API v1" con esto:
 * ============================================
 */

func setupRoutes(router *gin.Engine, pc *controllers.ProductController, oc *controllers.OrderController) {
	// Configuración CORS
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:4173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	router.Use(cors.New(config))

	// ===== RUTAS PÚBLICAS (NO requieren autenticación) =====
	apiV1 := router.Group("/api/v1")
	{
		// Rutas para productos (público)
		products := apiV1.Group("/products")
		{
			products.GET("/", pc.GetProducts)
			products.GET("/:id", pc.GetProductByID)
			products.POST("/search", pc.SemanticSearchProducts)
		}

		// Crear pedido como guest (checkout público)
		apiV1.POST("/orders/guest", oc.CreateOrder)
		log.Println("✓ Endpoint POST /api/v1/orders/guest (público) registrado")
	}

	// ===== RUTAS PROTEGIDAS (requieren autenticación) =====
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthRequired())
	{
		// Pedidos del usuario autenticado
		protected.GET("/orders", oc.GetUserOrders)
		protected.GET("/orders/:id", oc.GetOrderByID)
		log.Println("✓ Endpoints protegidos de pedidos registrados")
	}

	// ===== RUTAS DE ADMIN (requieren autenticación + rol admin) =====
	admin := router.Group("/api/v1/admin")
	admin.Use(middleware.AdminRequired())
	{
		// Gestión de productos
		admin.POST("/products", pc.CreateProduct)
		admin.PUT("/products/:id", pc.UpdateProduct)
		log.Println("✓ Endpoints de admin registrados")

		// Gestión de pedidos
		admin.GET("/orders", oc.GetAllOrders)
		admin.PUT("/orders/:id/status", oc.UpdateOrderStatus)
		log.Println("✓ Endpoints de admin para pedidos registrados")
	}
}

/**
 * ============================================
 * PASO 3: Resumen de cambios a hacer
 * ============================================
 * 
 * 1. AGREGAR esta línea a los imports:
 *    "moda-organica/backend/middleware"
 * 
 * 2. CREAR una nueva función setupRoutes() como se muestra arriba
 * 
 * 3. EN la función main(), donde estaba:
 *    // Define las rutas de la API v1
 *    apiV1 := router.Group("/api/v1")
 *    ...
 * 
 *    REEMPLAZAR TODO con:
 *    setupRoutes(router, pc, orderController)
 * 
 * 4. ASEGURARSE que SUPABASE_JWT_SECRET está en el archivo .env
 * 
 * ============================================
 * ESTRUCTURA FINAL DE RUTAS
 * ============================================
 * 
 * PÚBLICAS:
 *   GET    /api/v1/products               (listar productos)
 *   GET    /api/v1/products/:id           (obtener producto)
 *   POST   /api/v1/products/search        (buscar semántico)
 *   POST   /api/v1/orders/guest           (crear pedido sin login)
 * 
 * PROTEGIDAS (requieren JWT):
 *   GET    /api/v1/orders                 (mi historial)
 *   GET    /api/v1/orders/:id             (mi pedido específico)
 * 
 * ADMIN (requieren JWT + role=admin):
 *   POST   /api/v1/admin/products         (crear producto)
 *   PUT    /api/v1/admin/products/:id     (editar producto)
 *   GET    /api/v1/admin/orders           (todos los pedidos)
 *   PUT    /api/v1/admin/orders/:id/status (cambiar estado)
 * 
 * ============================================
 */
