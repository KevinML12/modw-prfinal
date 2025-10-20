// backend/models/order.go
package models

import (
	"fmt"
	"net/mail"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OrderStatus define los posibles estados de un pedido.
// El uso de un tipo personalizado (enum) mejora la legibilidad y previene errores.
type OrderStatus string

const (
	StatusPending   OrderStatus = "pending"   // El pedido ha sido recibido, pendiente de pago/procesamiento.
	StatusPaid      OrderStatus = "paid"      // El pago ha sido confirmado.
	StatusShipped   OrderStatus = "shipped"   // El pedido ha sido enviado.
	StatusCancelled OrderStatus = "cancelled" // El pedido ha sido cancelado.
)

// Order representa la cabecera de un pedido de un cliente en el e-commerce de joyería.
type Order struct {
	// ID: Identificador único de la orden (UUID), clave primaria.
	ID uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`

	// UserID: Identificador opcional del usuario registrado (Foreign Key opcional).
	UserID *uuid.UUID `json:"user_id" gorm:"type:uuid;index;omitempty"`

	// Status: Estado actual del pedido (Pendiente, Pagado, Enviado, Cancelado).
	Status OrderStatus `json:"status" gorm:"type:varchar(20);default:'pending'"`

	// --- Información del Cliente ---
	// CustomerEmail: Email del cliente (requerido, validado).
	CustomerEmail string `json:"customer_email" gorm:"not null;index"`

	// CustomerName: Nombre completo del cliente (requerido).
	CustomerName string `json:"customer_name" gorm:"not null"`

	// CustomerPhone: Número de teléfono del cliente (requerido).
	CustomerPhone string `json:"customer_phone" gorm:"not null"`

	// --- Información de Envío ---
	// ShippingAddress: Dirección de envío completa (requerida).
	ShippingAddress string `json:"shipping_address" gorm:"not null"`

	// ShippingMunicipality: Municipio/ciudad de envío (requerido para calcular costo).
	ShippingMunicipality string `json:"shipping_municipality" gorm:"not null"`

	// ShippingCost: Costo de envío calculado según el municipio.
	ShippingCost float64 `json:"shipping_cost" gorm:"type:decimal(10,2);default:0"`

	// --- Totales ---
	// Subtotal: Suma de los precios de todos los OrderItems.
	Subtotal float64 `json:"subtotal" gorm:"type:decimal(10,2);default:0"`

	// Total: Subtotal + ShippingCost (total a pagar).
	Total float64 `json:"total" gorm:"type:decimal(10,2);default:0"`

	// --- Pago ---
	// PaymentIntentID: Identificador del intent de pago de Stripe (opcional).
	PaymentIntentID string `json:"payment_intent_id" gorm:"omitempty"`

	// --- Relaciones ---
	// OrderItems: Artículos del pedido (relación uno-a-muchos).
	OrderItems []OrderItem `json:"order_items" gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE"`

	// --- Timestamps ---
	// CreatedAt: Timestamp automático de creación del registro.
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime:milli"`

	// UpdatedAt: Timestamp automático de última actualización.
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime:milli"`
}

// OrderItem representa un producto individual dentro de un pedido.
// Cada OrderItem mantiene un "snapshot" (fotografía) del estado del producto
// en el momento de la compra, permitiendo mantener un historial exacto incluso
// si el producto o sus precios cambian en la base de datos principal.
type OrderItem struct {
	// ID: Identificador único del item (UUID), clave primaria.
	ID uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`

	// OrderID: Identificador de la orden a la que pertenece este item (Foreign Key).
	// Indexado para optimizar búsquedas por orden.
	OrderID uuid.UUID `json:"order_id" gorm:"type:uuid;not null;index"`

	// ProductID: Identificador del producto original (Foreign Key).
	// Se mantiene como referencia, pero no se usa para obtener datos del producto
	// en OrderItem, ya que usamos ProductName y Price como snapshots.
	ProductID uint `json:"product_id" gorm:"not null;index"`

	// ProductName: Snapshot (fotografía) del nombre del producto en el momento de la compra.
	// Se almacena aquí para mantener un registro histórico exacto, permitiendo
	// que la orden refleje el nombre del producto como estaba cuando se compró,
	// incluso si el producto cambia o se elimina posteriormente.
	ProductName string `json:"product_name" gorm:"not null"`

	// Quantity: Cantidad de unidades compradas de este producto.
	// Debe ser siempre mayor a cero.
	Quantity int `json:"quantity" gorm:"not null"`

	// Price: Snapshot (fotografía) del precio unitario en el momento de la compra.
	// Se almacena aquí para mantener un registro histórico exacto del precio pagado,
	// permitiendo auditoría y reportes precisos incluso si el precio del producto cambia.
	Price float64 `json:"price" gorm:"type:decimal(10,2);not null"`

	// --- Timestamps ---
	// CreatedAt: Timestamp automático de creación del item en la orden.
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime:milli"`

	// UpdatedAt: Timestamp automático de última actualización del item.
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime:milli"`
}

// ============================================================================
// MÉTODOS DE GORM
// ============================================================================

// TableName especifica el nombre de la tabla en la base de datos para el modelo Order.
func (Order) TableName() string {
	return "orders"
}

// BeforeCreate es un hook de GORM que se ejecuta antes de insertar un registro.
// Genera un UUID automático si no existe.
func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

// ============================================================================
// MÉTODOS DE NEGOCIO
// ============================================================================

// CalculateTotal calcula el total del pedido como la suma del subtotal y el costo de envío.
// Este método debe llamarse después de actualizar el subtotal o el costo de envío.
func (o *Order) CalculateTotal() {
	o.Total = o.Subtotal + o.ShippingCost
}

// ============================================================================
// MÉTODOS DE VALIDACIÓN
// ============================================================================

// Validate realiza todas las validaciones necesarias del pedido.
// Retorna un error si alguna validación falla.
func (o *Order) Validate() error {
	// Validar que el nombre del cliente no esté vacío
	if o.CustomerName == "" {
		return fmt.Errorf("customer_name es requerido")
	}

	// Validar que el email del cliente sea válido
	if o.CustomerEmail == "" {
		return fmt.Errorf("customer_email es requerido")
	}
	if _, err := mail.ParseAddress(o.CustomerEmail); err != nil {
		return fmt.Errorf("customer_email no es válido: %w", err)
	}

	// Validar que el teléfono del cliente no esté vacío
	if o.CustomerPhone == "" {
		return fmt.Errorf("customer_phone es requerido")
	}

	// Validar que la dirección de envío no esté vacía
	if o.ShippingAddress == "" {
		return fmt.Errorf("shipping_address es requerido")
	}

	// Validar que el municipio de envío no esté vacío (necesario para calcular envío)
	if o.ShippingMunicipality == "" {
		return fmt.Errorf("shipping_municipality es requerido")
	}

	// Validar que el total sea mayor o igual a cero
	if o.Total < 0 {
		return fmt.Errorf("total no puede ser negativo")
	}

	return nil
}

// ============================================================================
// MÉTODOS DE ORDERITEM
// ============================================================================

// TableName especifica el nombre de la tabla en la base de datos para el modelo OrderItem.
func (OrderItem) TableName() string {
	return "order_items"
}

// BeforeCreate es un hook de GORM que se ejecuta antes de insertar un registro de OrderItem.
// Genera un UUID automático si no existe.
func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ID == uuid.Nil {
		oi.ID = uuid.New()
	}
	return nil
}

// GetSubtotal calcula el subtotal de este item multiplicando el precio unitario
// por la cantidad. Retorna el resultado como float64.
func (oi *OrderItem) GetSubtotal() float64 {
	return oi.Price * float64(oi.Quantity)
}

// Validate realiza todas las validaciones necesarias del item del pedido.
// Retorna un error si alguna validación falla.
func (oi *OrderItem) Validate() error {
	// Validar que la cantidad sea mayor a cero
	if oi.Quantity <= 0 {
		return fmt.Errorf("quantity debe ser mayor a 0, recibido: %d", oi.Quantity)
	}

	// Validar que el precio no sea negativo
	if oi.Price < 0 {
		return fmt.Errorf("price no puede ser negativo, recibido: %.2f", oi.Price)
	}

	// Validar que el ProductName no esté vacío
	if oi.ProductName == "" {
		return fmt.Errorf("product_name es requerido")
	}

	return nil
}
