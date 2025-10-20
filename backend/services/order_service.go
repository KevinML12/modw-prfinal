// backend/services/order_service.go
package services

import (
	"fmt"
	"log"

	"moda-organica/backend/models"
	"moda-organica/backend/repositories"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

// OrderItemDTO representa un item de orden en la solicitud de creación.
// Contiene solo la información necesaria del cliente para crear un item.
type OrderItemDTO struct {
	// ProductID: Identificador del producto a comprar.
	ProductID uint `json:"product_id" binding:"required"`

	// Quantity: Cantidad de unidades del producto.
	Quantity int `json:"quantity" binding:"required,min=1"`
}

// CreateOrderDTO representa la solicitud para crear una nueva orden.
// Contiene toda la información necesaria del cliente y los items a comprar.
type CreateOrderDTO struct {
	// UserID: Identificador del usuario (opcional, para clientes registrados).
	UserID *uuid.UUID `json:"user_id"`

	// CustomerEmail: Email del cliente (requerido).
	CustomerEmail string `json:"customer_email" binding:"required,email"`

	// CustomerName: Nombre completo del cliente (requerido).
	CustomerName string `json:"customer_name" binding:"required"`

	// CustomerPhone: Número de teléfono del cliente (requerido).
	CustomerPhone string `json:"customer_phone" binding:"required"`

	// ShippingAddress: Dirección completa de envío (requerida).
	ShippingAddress string `json:"shipping_address" binding:"required"`

	// ShippingMunicipality: Municipio de envío (requerido para calcular costo).
	ShippingMunicipality string `json:"shipping_municipality" binding:"required"`

	// Items: Lista de items a comprar (requerida, mínimo 1).
	Items []OrderItemDTO `json:"items" binding:"required,min=1"`
}

// ============================================================================
// Service Interface
// ============================================================================

// OrderService define la interfaz para la lógica de negocio de órdenes.
// Encapsula las reglas de negocio y la orquestación entre repositorios.
type OrderService interface {
	// CreateOrder crea una nueva orden con todos sus items.
	// Valida productos, stock, calcula costos y crea snapshots.
	// Retorna la orden creada o error si algo falla.
	CreateOrder(dto CreateOrderDTO) (*models.Order, error)

	// GetOrderByID obtiene una orden por su ID.
	// Retorna error si la orden no existe.
	GetOrderByID(id uuid.UUID) (*models.Order, error)

	// GetUserOrders obtiene todas las órdenes de un usuario.
	// Retorna lista de órdenes o error si falla.
	GetUserOrders(userID uuid.UUID) ([]models.Order, error)

	// UpdateOrderStatus actualiza el estado de una orden.
	// Retorna error si la orden no existe o la actualización falla.
	UpdateOrderStatus(orderID uuid.UUID, status models.OrderStatus) error

	// CalculateShippingCost calcula el costo de envío para un municipio.
	// Retorna el costo o error si el municipio es inválido.
	CalculateShippingCost(municipality string) (float64, error)
}

// ============================================================================
// Implementation
// ============================================================================

// orderService implementa la interfaz OrderService.
// Contiene la lógica de negocio y orquesta las operaciones de los repositorios.
type orderService struct {
	orderRepo repositories.OrderRepository
	db        *gorm.DB
}

// NewOrderService crea una nueva instancia del servicio de órdenes.
// Recibe el repositorio de órdenes y la conexión a la base de datos.
func NewOrderService(orderRepo repositories.OrderRepository, db *gorm.DB) OrderService {
	return &orderService{
		orderRepo: orderRepo,
		db:        db,
	}
}

// ============================================================================
// CREATE
// ============================================================================

// CreateOrder crea una nueva orden con todos los datos del DTO.
// Valida productos, reduce stock, calcula costos y crea snapshots.
func (s *orderService) CreateOrder(dto CreateOrderDTO) (*models.Order, error) {
	// Validar que la orden tenga al menos un item
	if len(dto.Items) == 0 {
		return nil, fmt.Errorf("no se puede crear una orden sin items")
	}

	// Crear la orden desde el DTO
	order := &models.Order{
		ID:                   uuid.New(),
		UserID:               dto.UserID,
		Status:               models.StatusPending,
		CustomerEmail:        dto.CustomerEmail,
		CustomerName:         dto.CustomerName,
		CustomerPhone:        dto.CustomerPhone,
		ShippingAddress:      dto.ShippingAddress,
		ShippingMunicipality: dto.ShippingMunicipality,
		OrderItems:           []models.OrderItem{},
	}

	// Usar una transacción para asegurar consistencia
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("Panic en CreateOrder: %v", r)
		}
	}()

	// Procesar cada item del pedido
	subtotal := 0.0
	for _, itemDTO := range dto.Items {
		// Obtener el producto
		var product models.Product
		if err := tx.Where("id = ?", itemDTO.ProductID).First(&product).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				log.Printf("Producto no encontrado: %d", itemDTO.ProductID)
				return nil, fmt.Errorf("producto no encontrado: ID %d", itemDTO.ProductID)
			}
			log.Printf("Error al obtener producto: %v", err)
			return nil, fmt.Errorf("error al obtener producto: %w", err)
		}

		// Validar stock disponible
		if product.Stock < itemDTO.Quantity {
			tx.Rollback()
			log.Printf("Stock insuficiente para producto %d. Disponible: %d, Solicitado: %d",
				itemDTO.ProductID, product.Stock, itemDTO.Quantity)
			return nil, fmt.Errorf("stock insuficiente para %s. Disponible: %d", product.Name, product.Stock)
		}

		// Crear snapshot del item con datos actuales del producto
		orderItem := models.OrderItem{
			ID:          uuid.New(),
			OrderID:     order.ID,
			ProductID:   product.ID,
			ProductName: product.Name,
			Quantity:    itemDTO.Quantity,
			Price:       product.Price,
		}

		// Validar el item
		if err := orderItem.Validate(); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("validación de item fallida: %w", err)
		}

		// Agregar item a la orden
		order.OrderItems = append(order.OrderItems, orderItem)
		subtotal += orderItem.GetSubtotal()

		// Reducir stock del producto
		if err := tx.Model(&models.Product{}).
			Where("id = ?", itemDTO.ProductID).
			Update("stock", gorm.Expr("stock - ?", itemDTO.Quantity)).Error; err != nil {
			tx.Rollback()
			log.Printf("Error al reducir stock: %v", err)
			return nil, fmt.Errorf("error al actualizar stock: %w", err)
		}
	}

	// Calcular costo de envío
	shippingCost := CalculateShippingCost(dto.ShippingMunicipality)

	// Actualizar totales en la orden
	order.Subtotal = subtotal
	order.ShippingCost = shippingCost
	order.CalculateTotal()

	// Crear la orden en la base de datos
	if err := tx.Create(order).Error; err != nil {
		tx.Rollback()
		log.Printf("Error al crear orden: %v", err)
		return nil, fmt.Errorf("error al crear orden: %w", err)
	}

	// Crear los items de la orden
	for _, item := range order.OrderItems {
		item.OrderID = order.ID
		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			log.Printf("Error al crear item de orden: %v", err)
			return nil, fmt.Errorf("error al crear item de orden: %w", err)
		}
	}

	// Confirmar la transacción
	if err := tx.Commit().Error; err != nil {
		log.Printf("Error al confirmar transacción CreateOrder: %v", err)
		return nil, fmt.Errorf("error al confirmar transacción: %w", err)
	}

	// Obtener la orden completa del repositorio para retornarla
	return s.orderRepo.GetByID(order.ID)
}

// ============================================================================
// READ
// ============================================================================

// GetOrderByID obtiene una orden por su ID.
func (s *orderService) GetOrderByID(id uuid.UUID) (*models.Order, error) {
	order, err := s.orderRepo.GetByID(id)
	if err != nil {
		log.Printf("Error al obtener orden %s: %v", id, err)
		return nil, err
	}
	return order, nil
}

// GetUserOrders obtiene todas las órdenes de un usuario.
func (s *orderService) GetUserOrders(userID uuid.UUID) ([]models.Order, error) {
	orders, err := s.orderRepo.GetByUserID(userID)
	if err != nil {
		log.Printf("Error al obtener órdenes del usuario %s: %v", userID, err)
		return nil, err
	}
	return orders, nil
}

// ============================================================================
// UPDATE
// ============================================================================

// UpdateOrderStatus actualiza el estado de una orden.
func (s *orderService) UpdateOrderStatus(orderID uuid.UUID, status models.OrderStatus) error {
	// Validar que el estado sea válido
	validStatuses := map[models.OrderStatus]bool{
		models.StatusPending:   true,
		models.StatusPaid:      true,
		models.StatusShipped:   true,
		models.StatusCancelled: true,
	}

	if !validStatuses[status] {
		log.Printf("Estado de orden inválido: %s", status)
		return fmt.Errorf("estado de orden inválido: %s", status)
	}

	// Actualizar el estado
	if err := s.orderRepo.UpdateStatus(orderID, status); err != nil {
		log.Printf("Error al actualizar estado de orden %s: %v", orderID, err)
		return err
	}

	log.Printf("Estado de orden %s actualizado a %s", orderID, status)
	return nil
}

// ============================================================================
// UTILITIES
// ============================================================================

// CalculateShippingCost calcula el costo de envío para un municipio.
// Utiliza la función del servicio de cálculo de envío.
func (s *orderService) CalculateShippingCost(municipality string) (float64, error) {
	if municipality == "" {
		return 0, fmt.Errorf("municipio no puede estar vacío")
	}

	// Llamar a la función pública de cálculo de envío
	cost := CalculateShippingCost(municipality)
	return cost, nil
}
