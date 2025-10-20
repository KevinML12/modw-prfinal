// backend/handlers/order_handler.go
package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"moda-organica/backend/models"
	"moda-organica/backend/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

// OrderHandler maneja todas las solicitudes HTTP relacionadas con órdenes.
type OrderHandler struct {
	orderService services.OrderService
	validator    *validator.Validate
}

// NewOrderHandler crea una nueva instancia del handler de órdenes.
func NewOrderHandler(orderService services.OrderService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
		validator:    validator.New(),
	}
}

// ============================================================================
// Response Helpers
// ============================================================================

// errorResponse estructura para respuestas de error.
type errorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

// successResponse estructura genérica para respuestas exitosas.
type successResponse struct {
	Data interface{} `json:"data"`
}

// paginatedResponse estructura para respuestas paginadas.
type paginatedResponse struct {
	Data  interface{} `json:"data"`
	Total int64       `json:"total"`
	Page  int         `json:"page"`
	Size  int         `json:"size"`
}

// respondWithError responde con un error JSON.
func (h *OrderHandler) respondWithError(c *gin.Context, statusCode int, message string) {
	log.Printf("Error Response: %d - %s", statusCode, message)
	c.JSON(statusCode, errorResponse{
		Error:   http.StatusText(statusCode),
		Message: message,
	})
}

// respondWithSuccess responde con datos JSON exitosos.
func (h *OrderHandler) respondWithSuccess(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, successResponse{Data: data})
}

// respondWithPaginated responde con datos paginados.
func (h *OrderHandler) respondWithPaginated(c *gin.Context, statusCode int, data interface{}, total int64, page int, size int) {
	c.JSON(statusCode, paginatedResponse{
		Data:  data,
		Total: total,
		Page:  page,
		Size:  size,
	})
}

// ============================================================================
// Validators
// ============================================================================

// validateCreateOrderDTO valida el DTO de creación de orden.
func (h *OrderHandler) validateCreateOrderDTO(dto *services.CreateOrderDTO) error {
	return h.validator.Struct(dto)
}

// ============================================================================
// POST /api/orders - Crear orden
// ============================================================================

// CreateOrder maneja POST /api/orders.
// Crea una nueva orden con los items especificados.
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	log.Printf("POST /api/orders - Crear nueva orden")

	var dto services.CreateOrderDTO

	// Parsear JSON del body
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("Error al parsear CreateOrderDTO: %v", err)
		h.respondWithError(c, http.StatusBadRequest, "JSON inválido: "+err.Error())
		return
	}

	// Validar DTO
	if err := h.validateCreateOrderDTO(&dto); err != nil {
		log.Printf("Error en validación de CreateOrderDTO: %v", err)
		h.respondWithError(c, http.StatusBadRequest, "Datos inválidos: "+err.Error())
		return
	}

	// Crear orden a través del servicio
	order, err := h.orderService.CreateOrder(dto)
	if err != nil {
		log.Printf("Error al crear orden: %v", err)
		// Diferenciación de errores usando Contains para mayor flexibilidad
		statusCode := http.StatusInternalServerError
		errMsg := err.Error()

		if strings.Contains(errMsg, "no se puede crear una orden sin items") {
			statusCode = http.StatusBadRequest
		} else if strings.Contains(errMsg, "stock insuficiente") {
			statusCode = http.StatusConflict
		} else if strings.Contains(errMsg, "producto no encontrado") {
			statusCode = http.StatusNotFound
		} else if strings.Contains(errMsg, "validación") {
			statusCode = http.StatusBadRequest
		}
		h.respondWithError(c, statusCode, errMsg)
		return
	}

	log.Printf("Orden creada exitosamente: %s", order.ID)
	h.respondWithSuccess(c, http.StatusCreated, order)
}

// ============================================================================
// GET /api/orders/:id - Obtener orden por ID
// ============================================================================

// GetOrderByID maneja GET /api/orders/:id.
// Obtiene una orden específica por su ID UUID.
func (h *OrderHandler) GetOrderByID(c *gin.Context) {
	idParam := c.Param("id")
	log.Printf("GET /api/orders/:id - Obtener orden: %s", idParam)

	// Parsear UUID
	id, err := uuid.Parse(idParam)
	if err != nil {
		log.Printf("ID UUID inválido: %s", idParam)
		h.respondWithError(c, http.StatusBadRequest, "ID debe ser un UUID válido")
		return
	}

	// Obtener orden del servicio
	order, err := h.orderService.GetOrderByID(id)
	if err != nil {
		log.Printf("Error al obtener orden: %v", err)
		h.respondWithError(c, http.StatusNotFound, err.Error())
		return
	}

	log.Printf("Orden obtenida exitosamente: %s", id)
	h.respondWithSuccess(c, http.StatusOK, order)
}

// ============================================================================
// GET /api/orders/user/:userId - Obtener órdenes de usuario
// ============================================================================

// GetUserOrders maneja GET /api/orders/user/:userId.
// Obtiene todas las órdenes de un usuario específico.
func (h *OrderHandler) GetUserOrders(c *gin.Context) {
	userIDParam := c.Param("userId")
	log.Printf("GET /api/orders/user/:userId - Obtener órdenes del usuario: %s", userIDParam)

	// Parsear UUID del usuario
	userID, err := uuid.Parse(userIDParam)
	if err != nil {
		log.Printf("User ID UUID inválido: %s", userIDParam)
		h.respondWithError(c, http.StatusBadRequest, "User ID debe ser un UUID válido")
		return
	}

	// Obtener órdenes del servicio
	orders, err := h.orderService.GetUserOrders(userID)
	if err != nil {
		log.Printf("Error al obtener órdenes del usuario: %v", err)
		h.respondWithError(c, http.StatusInternalServerError, "Error al obtener órdenes")
		return
	}

	// Si no hay órdenes, retornar lista vacía
	if orders == nil {
		orders = []models.Order{}
	}

	log.Printf("Órdenes del usuario obtenidas exitosamente: %s (%d órdenes)", userID, len(orders))
	h.respondWithSuccess(c, http.StatusOK, orders)
}

// ============================================================================
// GET /api/orders - Listar todas (admin)
// ============================================================================

// GetAllOrders maneja GET /api/orders.
// Obtiene todas las órdenes con paginación.
// Requiere permisos de administrador (middleware).
func (h *OrderHandler) GetAllOrders(c *gin.Context) {
	log.Printf("GET /api/orders - Listar todas las órdenes")

	// Parsear parámetros de paginación con valores por defecto
	page := 1
	pageSize := 10

	if pageParam := c.Query("page"); pageParam != "" {
		if p, err := strconv.Atoi(pageParam); err == nil && p > 0 {
			page = p
		} else {
			log.Printf("Página inválida: %s, usando default: 1", pageParam)
		}
	}

	if sizeParam := c.Query("pageSize"); sizeParam != "" {
		if s, err := strconv.Atoi(sizeParam); err == nil && s > 0 && s <= 100 {
			pageSize = s
		} else {
			log.Printf("Page size inválido: %s, usando default: 10", sizeParam)
		}
	}

	log.Printf("Paginación: page=%d, pageSize=%d", page, pageSize)

	// Obtener órdenes del repositorio a través del servicio
	// Nota: El servicio actual no expone GetAll, pero podríamos agregarlo
	// Por ahora usamos GetUserOrders con lógica adaptada
	// TODO: Agregar método GetAllOrders al servicio

	h.respondWithError(c, http.StatusNotImplemented, "Endpoint no implementado en el servicio")
}

// ============================================================================
// PUT /api/orders/:id/status - Actualizar estado
// ============================================================================

// updateStatusRequest estructura para el body del request de actualización de estado.
type updateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending paid shipped cancelled"`
}

// UpdateOrderStatus maneja PUT /api/orders/:id/status.
// Actualiza el estado de una orden existente.
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	idParam := c.Param("id")
	log.Printf("PUT /api/orders/:id/status - Actualizar estado de orden: %s", idParam)

	// Parsear UUID
	id, err := uuid.Parse(idParam)
	if err != nil {
		log.Printf("ID UUID inválido: %s", idParam)
		h.respondWithError(c, http.StatusBadRequest, "ID debe ser un UUID válido")
		return
	}

	// Parsear body
	var req updateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Error al parsear updateStatusRequest: %v", err)
		h.respondWithError(c, http.StatusBadRequest, "JSON inválido: "+err.Error())
		return
	}

	// Convertir string a OrderStatus
	status := models.OrderStatus(req.Status)

	// Actualizar estado a través del servicio
	if err := h.orderService.UpdateOrderStatus(id, status); err != nil {
		log.Printf("Error al actualizar estado de orden: %v", err)
		statusCode := http.StatusInternalServerError
		if err.Error() == "orden no encontrada" {
			statusCode = http.StatusNotFound
		}
		h.respondWithError(c, statusCode, err.Error())
		return
	}

	// Obtener la orden actualizada para retornarla
	order, err := h.orderService.GetOrderByID(id)
	if err != nil {
		log.Printf("Error al obtener orden actualizada: %v", err)
		h.respondWithError(c, http.StatusInternalServerError, "Error al obtener orden actualizada")
		return
	}

	log.Printf("Estado de orden %s actualizado a %s", id, status)
	h.respondWithSuccess(c, http.StatusOK, order)
}

// ============================================================================
// GET /api/orders/:id/calculate-shipping - Calcular envío (helper)
// ============================================================================

// calculateShippingRequest estructura para el request de cálculo de envío.
type calculateShippingRequest struct {
	Municipality string `json:"municipality" binding:"required"`
}

// CalculateShipping maneja GET /api/orders/calculate-shipping.
// Calcula el costo de envío para un municipio dado.
func (h *OrderHandler) CalculateShipping(c *gin.Context) {
	log.Printf("POST /api/orders/calculate-shipping - Calcular costo de envío")

	var req calculateShippingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Error al parsear calculateShippingRequest: %v", err)
		h.respondWithError(c, http.StatusBadRequest, "JSON inválido: "+err.Error())
		return
	}

	// Calcular envío
	cost, err := h.orderService.CalculateShippingCost(req.Municipality)
	if err != nil {
		log.Printf("Error al calcular envío: %v", err)
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	log.Printf("Costo de envío calculado para %s: %.2f", req.Municipality, cost)

	response := gin.H{
		"municipality": req.Municipality,
		"cost":         cost,
	}
	h.respondWithSuccess(c, http.StatusOK, response)
}

// ============================================================================
// Router Setup
// ============================================================================

// RegisterRoutes registra todas las rutas de órdenes en el router de Gin.
func RegisterOrderRoutes(router *gin.Engine, orderService services.OrderService) {
	handler := NewOrderHandler(orderService)

	// Grupo de rutas de órdenes
	orders := router.Group("/api/orders")
	{
		// POST /api/orders - Crear orden
		orders.POST("", handler.CreateOrder)

		// GET /api/orders/:id - Obtener orden por ID
		orders.GET("/:id", handler.GetOrderByID)

		// GET /api/orders/user/:userId - Obtener órdenes de usuario
		orders.GET("/user/:userId", handler.GetUserOrders)

		// PUT /api/orders/:id/status - Actualizar estado
		orders.PUT("/:id/status", handler.UpdateOrderStatus)

		// POST /api/orders/calculate-shipping - Calcular envío
		orders.POST("/calculate-shipping", handler.CalculateShipping)

		// GET /api/orders - Listar todas (admin)
		// orders.GET("", handler.GetAllOrders) // TODO: Implementar con middleware auth
	}
}
