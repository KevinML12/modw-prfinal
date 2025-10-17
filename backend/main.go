// backend/main.go
package main

import (
	"phoenix/controllers" // Importamos nuestro paquete de controladores

	"github.com/gin-contrib/cors" // Middleware para manejar CORS
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Inicializar el router de Gin.
	// gin.Default() viene con middleware útil pre-cargado: logger y recovery.
	router := gin.Default()

	// 2. Configurar el middleware de CORS.
	// Esto es CRÍTICO para el desarrollo local, ya que el frontend (SvelteKit en puerto 5173)
	// y el backend (Go en puerto 8080) se ejecutan en orígenes diferentes.
	// Sin esta configuración, el navegador bloquearía las peticiones del frontend al backend.
	config := cors.DefaultConfig()
	// Permitimos que el frontend que corre en localhost:5173 acceda a la API.
	config.AllowOrigins = []string{"http://localhost:5173"} 
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	router.Use(cors.New(config))

	// 3. Instanciar nuestros controladores.
	// A medida que la aplicación crezca, aquí se pasarían dependencias como la conexión a la BD.
	productController := controllers.NewProductController()
	// (Aquí se instanciarían otros controladores como OrderController, AuthController, etc.)

	// 4. Definir las rutas de la API.
	// Agrupamos las rutas bajo un prefijo '/api/v1' para tener una API versionada y organizada.
	apiV1 := router.Group("/api/v1")
	{
		// Agrupamos las rutas específicas de productos.
		products := apiV1.Group("/products")
		{
			// GET /api/v1/products -> Llama a GetProducts para listar todos los productos.
			products.GET("/", productController.GetProducts)

			// GET /api/v1/products/:id -> Llama a GetProductByID para obtener un producto específico.
			products.GET("/:id", productController.GetProductByID)

			// POST /api/v1/products/search -> Llama a SemanticSearchProducts para la búsqueda por IA.
			products.POST("/search", productController.SemanticSearchProducts)

			// (Aquí irían las rutas para crear, actualizar y eliminar productos: POST, PUT, DELETE)
		}

		// (Aquí irían las rutas para otros recursos como /orders, /users, etc.)
	}

	// 5. Iniciar el servidor.
	// El servidor escuchará en el puerto 8080, que es el que exponemos en Docker.
	// Si ocurre un error al iniciar, el programa terminará con un 'panic'.
	err := router.Run(":8080")
	if err != nil {
		panic(err)
	}
}