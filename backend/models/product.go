// backend/models/product.go
package models

import "time"

// Product representa la estructura de un producto en la base de datos y en la API.
// Esta es la entidad central de nuestro E-commerce.
// Los 'struct tags' (`json:"..."`, `gorm:"..."`) definen cómo se mapea este struct
// a JSON para las respuestas de la API y a las columnas de la base de datos para GORM (un popular ORM).
type Product struct {
	// ID único del producto, clave primaria.
	ID uint `json:"id" gorm:"primaryKey"`

	// SKU (Stock Keeping Unit) es un identificador único para el manejo de inventario.
	SKU string `json:"sku" gorm:"unique"`

	// Nombre del producto que se mostrará al cliente.
	Name string `json:"name"`

	// Descripción detallada, puede incluir materiales, dimensiones, etc.
	Description string `json:"description"`

	// Precio del producto. Usamos float64 para la precisión requerida en valores monetarios.
	Price float64 `json:"price"`

	// Cantidad de unidades disponibles en inventario.
	Stock int `json:"stock"`

	// URL de la imagen principal del producto alojada en Supabase Storage o similar.
	ImageURL string `json:"image_url"`

	// --- Campo Clave para Búsqueda por IA ---
	// Embedding es el vector numérico que representa las características semánticas
	// de la imagen y/o descripción del producto, generado por un modelo como CLIP.
	// Será utilizado por la extensión pgvector de Supabase para realizar búsquedas de similitud.
	//
	// - El tag `json:"-"` es CRUCIAL: evita que este campo (que puede ser muy grande)
	//   se envíe en las respuestas JSON estándar de la API, optimizando el rendimiento.
	// - El tag `gorm:"type:vector(512)"` le indica a GORM cómo mapear este campo
	//   al tipo de dato 'vector' de pgvector en la base de datos. La dimensión (ej. 512)
	//   depende del modelo de IA que se utilice.
	Embedding []float32 `json:"-" gorm:"type:vector(512)"`

	// Timestamps estándar para el seguimiento de registros, gestionados automáticamente.
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}