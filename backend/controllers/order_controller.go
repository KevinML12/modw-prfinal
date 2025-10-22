// backend/controllers/order_controller.go
package controllers

import (
	"log"
	"net/http"

	"moda-organica/backend/models"
	"moda-organica/backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OrderController maneja las operaciones relacionadas con órdenes
type OrderController struct {
	DB *gorm.DB
}

// NewOrderController crea una nueva instancia del controlador de órdenes
func NewOrderController(db *gorm.DB) *OrderController {
	return &OrderController{
		DB: db,
	}
}

// CreateOrderInput estructura para el binding del JSON del frontend
// Representa los datos que envía el cliente para crear una orden
type CreateOrderInput struct {
	// CustomerEmail: Email del cliente (requerido)
	CustomerEmail string `json:"customer_email" binding:"required,email"`

	// CustomerName: Nombre completo del cliente (requerido)
	CustomerName string `json:"customer_name" binding:"required"`

	// CustomerPhone: Teléfono del cliente (requerido)
	CustomerPhone string `json:"customer_phone" binding:"required"`

	// ShippingAddress: Dirección de envío (requerida)
	ShippingAddress string `json:"shipping_address" binding:"required"`

	// ShippingMunicipality: Municipio de envío para calcular el costo (requerido)
	ShippingMunicipality string `json:"shipping_municipality" binding:"required"`

	// Items: Carrito del cliente - slice de items a comprar
	Items []models.CartItem `json:"items" binding:"required,min=1"`
}

// CreateOrder maneja POST /api/orders
// Crea una nueva orden a partir de los datos del cliente
func (oc *OrderController) CreateOrder(c *gin.Context) {
	log.Printf("POST /api/orders - Crear nueva orden")

	// Parsear y validar el input JSON
	var input CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Error al parsear CreateOrderInput: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Datos inválidos: " + err.Error(),
		})
		return
	}

	// Inicializar subtotal y slice de items de la orden
	subtotal := 0.0
	orderItems := []models.OrderItem{}

	// Iterar sobre los items del carrito del cliente
	for _, item := range input.Items {
		// Consultar el producto en la BD para obtener el precio actual
		var product models.Product
		if err := oc.DB.First(&product, "id = ?", item.ProductID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				log.Printf("Producto no encontrado: %d", item.ProductID)
				c.JSON(http.StatusNotFound, gin.H{
					"error":   "Not Found",
					"message": "Producto no encontrado: ID " + string(rune(item.ProductID)),
				})
				return
			}
			log.Printf("Error al consultar producto: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Error al consultar el producto",
			})
			return
		}

		// Validar que haya stock disponible
		if product.Stock < item.Quantity {
			log.Printf("Stock insuficiente para producto %d. Disponible: %d, Solicitado: %d",
				item.ProductID, product.Stock, item.Quantity)
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Conflict",
				"message": "Stock insuficiente para " + product.Name,
			})
			return
		}

		// Usar el precio de la BD (no del frontend) para mayor seguridad
		itemSubtotal := product.Price * float64(item.Quantity)
		subtotal += itemSubtotal

		// Crear el OrderItem con datos del producto de la BD
		orderItem := models.OrderItem{
			ID:          uuid.New(),
			ProductID:   product.ID,
			ProductName: product.Name, // Snapshot del nombre
			Quantity:    item.Quantity,
			Price:       product.Price, // Snapshot del precio
		}

		orderItems = append(orderItems, orderItem)
	}

	// Calcular costo de envío según municipio
	shippingCost := services.CalculateShippingCost(input.ShippingMunicipality)

	// Calcular total
	total := subtotal + shippingCost

	// Crear la orden principal
	order := models.Order{
		ID:                   uuid.New(),
		Status:               models.StatusPending,
		CustomerEmail:        input.CustomerEmail,
		CustomerName:         input.CustomerName,
		CustomerPhone:        input.CustomerPhone,
		ShippingAddress:      input.ShippingAddress,
		ShippingMunicipality: input.ShippingMunicipality,
		Subtotal:             subtotal,
		ShippingCost:         shippingCost,
		Total:                total,
		OrderItems:           orderItems,
	}

	// Usar transacción para garantizar integridad de datos
	err := oc.DB.Transaction(func(tx *gorm.DB) error {
		// Crear la orden
		if err := tx.Create(&order).Error; err != nil {
			log.Printf("Error al crear orden: %v", err)
			return err
		}

		// Asignar el ID de la orden a cada item
		for i := range orderItems {
			orderItems[i].OrderID = order.ID
		}

		// Crear los items de la orden
		if err := tx.Create(&orderItems).Error; err != nil {
			log.Printf("Error al crear items de orden: %v", err)
			return err
		}

		// Reducir stock de los productos
		for _, item := range orderItems {
			if err := tx.Model(&models.Product{}).
				Where("id = ?", item.ProductID).
				Update("stock", gorm.Expr("stock - ?", item.Quantity)).Error; err != nil {
				log.Printf("Error al reducir stock: %v", err)
				return err
			}
		}

		return nil
	})

	if err != nil {
		log.Printf("Error en transacción de creación de orden: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": "Error al crear la orden",
		})
		return
	}

	// Respuesta exitosa: 201 Created con la orden completa
	log.Printf("Orden creada exitosamente: %s", order.ID)
	c.JSON(http.StatusCreated, gin.H{
		"data": order,
	})
}

// GetUserOrders - Obtener pedidos del usuario autenticado
func (oc *OrderController) GetUserOrders(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	var orders []models.Order
	if err := oc.DB.Where("user_id = ?", userID).
		Preload("OrderItems").
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		log.Printf("Error obteniendo pedidos: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo pedidos"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// GetOrderByID - Obtener un pedido específico
func (oc *OrderController) GetOrderByID(c *gin.Context) {
	orderID := c.Param("id")
	userID, exists := c.Get("user_id")

	var order models.Order

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	if err := oc.DB.Where("id = ? AND user_id = ?", orderID, userID).
		Preload("OrderItems").
		First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pedido no encontrado"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// GetAllOrders - ADMIN: Obtener todos los pedidos
func (oc *OrderController) GetAllOrders(c *gin.Context) {
	var orders []models.Order
	if err := oc.DB.
		Preload("OrderItems").
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		log.Printf("Error obteniendo todos los pedidos: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo pedidos"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// UpdateOrderStatus - ADMIN: Actualizar estado de un pedido
func (oc *OrderController) UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")

	var input struct {
		Status string `json:"status" binding:"required,oneof=pending paid shipped delivered cancelled"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var order models.Order
	if err := oc.DB.First(&order, orderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pedido no encontrado"})
		return
	}

	order.Status = models.OrderStatus(input.Status)

	if err := oc.DB.Save(&order).Error; err != nil {
		log.Printf("Error actualizando estado del pedido: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando pedido"})
		return
	}

	log.Printf("Estado del pedido %s actualizado a %s", orderID, input.Status)
	c.JSON(http.StatusOK, gin.H{
		"message": "Estado actualizado",
		"order":   order,
	})
}
