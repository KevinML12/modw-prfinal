// backend/repositories/order_repository.go
package repositories

import (
	"fmt"
	"log"

	"moda-organica/backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OrderRepository define la interfaz para operaciones de Orders en la base de datos.
// Esta interfaz permite inyectar diferentes implementaciones y facilita las pruebas unitarias.
type OrderRepository interface {
	// Create inserta una nueva orden en la base de datos.
	// Retorna error si la creación falla.
	Create(order *models.Order) error

	// GetByID obtiene una orden por su ID (UUID).
	// Incluye el preload automático de OrderItems.
	// Retorna error si la orden no existe o la consulta falla.
	GetByID(id uuid.UUID) (*models.Order, error)

	// GetByUserID obtiene todas las órdenes de un usuario específico.
	// Retorna una lista de órdenes y error si la consulta falla.
	GetByUserID(userID uuid.UUID) ([]models.Order, error)

	// GetAll obtiene todas las órdenes con paginación.
	// Retorna lista de órdenes, total de registros y error si falla.
	GetAll(page, pageSize int) ([]models.Order, int64, error)

	// Update actualiza una orden existente.
	// Retorna error si la actualización falla.
	Update(order *models.Order) error

	// UpdateStatus actualiza solo el estado de una orden.
	// Esto es más eficiente que actualizar toda la orden solo por el estado.
	UpdateStatus(orderID uuid.UUID, status models.OrderStatus) error

	// Delete elimina una orden por su ID.
	// Retorna error si la eliminación falla.
	Delete(id uuid.UUID) error
}

// orderRepository es la implementación concreta de OrderRepository.
// Utiliza GORM como ORM para las operaciones de base de datos.
type orderRepository struct {
	db *gorm.DB
}

// NewOrderRepository crea una nueva instancia del repositorio de órdenes.
// Recibe una conexión GORM como parámetro.
func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

// ============================================================================
// CREATE
// ============================================================================

// Create inserta una nueva orden en la base de datos.
// Valida que la orden tenga items antes de crearla.
func (r *orderRepository) Create(order *models.Order) error {
	// Validar que la orden tenga items
	if len(order.OrderItems) == 0 {
		return fmt.Errorf("no se puede crear una orden sin items")
	}

	// Validar los datos de la orden
	if err := order.Validate(); err != nil {
		return fmt.Errorf("validación de orden fallida: %w", err)
	}

	// Usar una transacción para asegurar la integridad de los datos
	tx := r.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("Panic en Create Order: %v", r)
		}
	}()

	// Crear la orden
	if err := tx.Create(order).Error; err != nil {
		tx.Rollback()
		log.Printf("Error al crear orden: %v", err)
		return fmt.Errorf("error al crear orden: %w", err)
	}

	// Crear los items de la orden
	for _, item := range order.OrderItems {
		if err := item.Validate(); err != nil {
			tx.Rollback()
			return fmt.Errorf("validación de item fallida: %w", err)
		}

		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			log.Printf("Error al crear item de orden: %v", err)
			return fmt.Errorf("error al crear item de orden: %w", err)
		}
	}

	// Confirmar la transacción
	if err := tx.Commit().Error; err != nil {
		log.Printf("Error al confirmar transacción Create Order: %v", err)
		return fmt.Errorf("error al confirmar transacción: %w", err)
	}

	return nil
}

// ============================================================================
// READ
// ============================================================================

// GetByID obtiene una orden por su ID.
// Carga automáticamente los OrderItems asociados (preload).
func (r *orderRepository) GetByID(id uuid.UUID) (*models.Order, error) {
	var order models.Order

	if err := r.db.
		Preload("OrderItems").
		Where("id = ?", id).
		First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("Orden no encontrada: %s", id)
			return nil, fmt.Errorf("orden no encontrada: %s", id)
		}
		log.Printf("Error al obtener orden por ID: %v", err)
		return nil, fmt.Errorf("error al obtener orden: %w", err)
	}

	return &order, nil
}

// GetByUserID obtiene todas las órdenes de un usuario específico.
// Ordena por CreatedAt en orden descendente (más recientes primero).
func (r *orderRepository) GetByUserID(userID uuid.UUID) ([]models.Order, error) {
	var orders []models.Order

	if err := r.db.
		Preload("OrderItems").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		log.Printf("Error al obtener órdenes por UserID: %v", err)
		return nil, fmt.Errorf("error al obtener órdenes del usuario: %w", err)
	}

	return orders, nil
}

// GetAll obtiene todas las órdenes con paginación.
// Ordena por CreatedAt en orden descendente.
// Retorna lista de órdenes, total de registros y error si falla.
func (r *orderRepository) GetAll(page, pageSize int) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	// Validar parámetros de paginación
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	// Calcular offset
	offset := (page - 1) * pageSize

	// Contar total de registros
	if err := r.db.Model(&models.Order{}).Count(&total).Error; err != nil {
		log.Printf("Error al contar órdenes: %v", err)
		return nil, 0, fmt.Errorf("error al contar órdenes: %w", err)
	}

	// Obtener órdenes paginadas
	if err := r.db.
		Preload("OrderItems").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&orders).Error; err != nil {
		log.Printf("Error al obtener órdenes: %v", err)
		return nil, 0, fmt.Errorf("error al obtener órdenes: %w", err)
	}

	return orders, total, nil
}

// ============================================================================
// UPDATE
// ============================================================================

// Update actualiza una orden existente.
// Valida que la orden exista antes de actualizar.
func (r *orderRepository) Update(order *models.Order) error {
	// Validar los datos de la orden
	if err := order.Validate(); err != nil {
		return fmt.Errorf("validación de orden fallida: %w", err)
	}

	// Verificar que la orden existe
	var existing models.Order
	if err := r.db.Select("id").Where("id = ?", order.ID).First(&existing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("Orden no encontrada para actualizar: %s", order.ID)
			return fmt.Errorf("orden no encontrada: %s", order.ID)
		}
		log.Printf("Error al verificar existencia de orden: %v", err)
		return fmt.Errorf("error al verificar orden: %w", err)
	}

	// Usar una transacción para actualizar
	tx := r.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("Panic en Update Order: %v", r)
		}
	}()

	// Actualizar la orden (excluir campos de timestamp para que GORM los maneje)
	if err := tx.Model(order).
		Omit("created_at").
		Updates(order).Error; err != nil {
		tx.Rollback()
		log.Printf("Error al actualizar orden: %v", err)
		return fmt.Errorf("error al actualizar orden: %w", err)
	}

	// Confirmar la transacción
	if err := tx.Commit().Error; err != nil {
		log.Printf("Error al confirmar transacción Update Order: %v", err)
		return fmt.Errorf("error al confirmar transacción: %w", err)
	}

	return nil
}

// UpdateStatus actualiza solo el estado de una orden.
// Esta función es más eficiente que Update cuando solo necesitas cambiar el estado.
func (r *orderRepository) UpdateStatus(orderID uuid.UUID, status models.OrderStatus) error {
	// Validar que la orden existe
	var order models.Order
	if err := r.db.Select("id").Where("id = ?", orderID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("Orden no encontrada para actualizar estado: %s", orderID)
			return fmt.Errorf("orden no encontrada: %s", orderID)
		}
		log.Printf("Error al verificar orden para actualizar estado: %v", err)
		return fmt.Errorf("error al verificar orden: %w", err)
	}

	// Actualizar solo el estado
	if err := r.db.Model(&models.Order{}).
		Where("id = ?", orderID).
		Update("status", status).Error; err != nil {
		log.Printf("Error al actualizar estado de orden: %v", err)
		return fmt.Errorf("error al actualizar estado: %w", err)
	}

	return nil
}

// ============================================================================
// DELETE
// ============================================================================

// Delete elimina una orden por su ID.
// Nota: Los OrderItems se eliminan automáticamente por la restricción
// OnDelete:CASCADE definida en el modelo Order.
func (r *orderRepository) Delete(id uuid.UUID) error {
	// Verificar que la orden existe
	var order models.Order
	if err := r.db.Where("id = ?", id).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("Orden no encontrada para eliminar: %s", id)
			return fmt.Errorf("orden no encontrada: %s", id)
		}
		log.Printf("Error al verificar orden para eliminar: %v", err)
		return fmt.Errorf("error al verificar orden: %w", err)
	}

	// Usar una transacción para eliminar
	tx := r.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("Panic en Delete Order: %v", r)
		}
	}()

	// Eliminar la orden
	if err := tx.Delete(&order).Error; err != nil {
		tx.Rollback()
		log.Printf("Error al eliminar orden: %v", err)
		return fmt.Errorf("error al eliminar orden: %w", err)
	}

	// Confirmar la transacción
	if err := tx.Commit().Error; err != nil {
		log.Printf("Error al confirmar transacción Delete Order: %v", err)
		return fmt.Errorf("error al confirmar transacción: %w", err)
	}

	return nil
}
