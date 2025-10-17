// backend/models/order.go
package models

import (
	"time"

	"github.com/google/uuid" // Usaremos UUIDs para un identificador de orden público y seguro.
)

// OrderStatus define los posibles estados de un pedido.
// El uso de un tipo personalizado (enum) mejora la legibilidad y previene errores.
type OrderStatus string

const (
	StatusPending   OrderStatus = "pending"   // El pedido ha sido recibido, pendiente de pago/procesamiento.
	StatusPaid      OrderStatus = "paid"      // El pago ha sido confirmado.
	StatusShipped   OrderStatus = "shipped"   // El pedido ha sido enviado.
	StatusDelivered OrderStatus = "delivered" // El pedido ha sido entregado.
	StatusCancelled OrderStatus = "cancelled" // El pedido ha sido cancelado.
)

// Order representa la cabecera de un pedido de un cliente.
type Order struct {
	// ID interno, clave primaria auto-incremental para uso de la base de datos.
	ID uint `json:"-" gorm:"primaryKey"`

	// PublicID es un identificador único y no secuencial (UUID) que se puede mostrar
	// de forma segura a los clientes o usar en URLs.
	PublicID uuid.UUID `json:"id" gorm:"type:uuid;unique;not null"`

	// UserID (opcional) para vincular el pedido a un usuario registrado en Supabase.
	UserID *uuid.UUID `json:"user_id" gorm:"type:uuid"`

	// --- Información del Cliente ---
	CustomerName  string `json:"customer_name"`
	CustomerEmail string `json:"customer_email"`

	// --- Información de Envío ---
	ShippingAddress string `json:"shipping_address"`
	ShippingCity    string `json:"shipping_city"`
	ShippingPhone   string `json:"shipping_phone"`
	ShippingCost    float64 `json:"shipping_cost"`

	// --- Totales ---
	Subtotal   float64 `json:"subtotal"` // Suma de los precios de los OrderItems.
	Total      float64 `json:"total"`    // Subtotal + Costo de Envío.

	// Estado actual del pedido (Pendiente, Pagado, Enviado, etc.).
	Status OrderStatus `json:"status" gorm:"type:varchar(20);default:'pending'"`

	// Relación: Un pedido tiene muchos artículos (OrderItems).
	// GORM manejará esta relación para cargar los artículos asociados a un pedido.
	Items []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
	
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// OrderItem representa un único producto dentro de un pedido.
type OrderItem struct {
	ID        uint    `json:"id" gorm:"primaryKey"`
	OrderID   uint    `json:"-" gorm:"not null"` // Clave foránea que lo vincula a un Order.
	ProductID uint    `json:"product_id" gorm:"not null"` // Clave foránea que lo vincula a un Product.
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"` // Precio del producto en el momento de la compra.

	// Relación: Un OrderItem pertenece a un Product.
	// Esto permite cargar los detalles completos del producto si es necesario.
	Product Product `json:"product" gorm:"foreignKey:ProductID"`
}