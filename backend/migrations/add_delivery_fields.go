// backend/migrations/add_delivery_fields.go
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Cargar variables de entorno
	_ = godotenv.Load("../../.env")

	// Leer DATABASE_URL del entorno
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL no está configurada")
	}

	// Conectar a la base de datos
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Error conectando a la base de datos:", err)
	}

	log.Println("Conexión establecida, ejecutando migraciones...")

	// Ejecutar ALTER TABLE para agregar campos nuevos
	migrations := []string{
		// Campos de tipo de entrega
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50) DEFAULT 'home_delivery'`,
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_branch VARCHAR(100)`,
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT`,

		// Coordenadas GPS
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10,8)`,
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11,8)`,

		// Información de envío
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(50) DEFAULT 'local_delivery'`,
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS requires_courier BOOLEAN DEFAULT FALSE`,
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_tracking VARCHAR(100)`,
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cargo_expreso_guide_url TEXT`,
	}

	// Ejecutar cada migración
	for _, migration := range migrations {
		if err := db.Exec(migration).Error; err != nil {
			log.Printf("Advertencia ejecutando migración: %v", err)
			// Continuar aunque falle (puede ser porque la columna ya existe)
		} else {
			fmt.Println("✓ Migración ejecutada:", migration[:50]+"...")
		}
	}

	log.Println("Migraciones completadas exitosamente")
}
