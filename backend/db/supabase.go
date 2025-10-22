package db

import (
	"fmt"
	"log"
	"os"

	"github.com/supabase-community/supabase-go"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Client es nuestro cliente global de Supabase
// Lo exportamos para que otros paquetes (como controllers) puedan usarlo.
var Client *supabase.Client

// GormDB es la conexión global de GORM a la base de datos
// Se usa para operaciones con ORM (órdenes, etc.)
var GormDB *gorm.DB

// InitSupabase inicializa la conexión con la base de datos Supabase
// Usando las variables de entorno.
func InitSupabase() {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_KEY") // Usamos la SERVICE_KEY en el backend para permisos de admin

	if supabaseURL == "" || supabaseKey == "" {
		log.Fatal("Error: SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar configuradas como variables de entorno.")
	}

	// Inicializamos el cliente de Supabase
	client, err := supabase.NewClient(supabaseURL, supabaseKey, nil)
	if err != nil {
		log.Fatalf("Error inicializando el cliente de Supabase: %v", err)
	}

	Client = client
	log.Println("Conexión con Supabase (REST API) establecida exitosamente.")

	// Inicializar conexión GORM con Supabase PostgreSQL
	initGormDB()
}

// initGormDB inicializa la conexión GORM con PostgreSQL (Supabase)
func initGormDB() {
	// Obtener credenciales de la BD desde variables de entorno
	dbURL := os.Getenv("DATABASE_URL")

	if dbURL == "" {
		// Si no está DATABASE_URL, construir desde componentes individuales
		dbHost := os.Getenv("DB_HOST")
		dbPort := os.Getenv("DB_PORT")
		dbUser := os.Getenv("DB_USER")
		dbPassword := os.Getenv("DB_PASSWORD")
		dbName := os.Getenv("DB_NAME")

		if dbHost == "" || dbUser == "" || dbName == "" {
			log.Println("⚠️ ADVERTENCIA: Variables de base de datos no configuradas, GORM deshabilitado")
			return
		}

		if dbPort == "" {
			dbPort = "5432"
		}

		// Construir DSN (Data Source Name)
		dbURL = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
			dbHost, dbPort, dbUser, dbPassword, dbName)
	}

	// Conectar con PostgreSQL usando GORM
	var err error
	GormDB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Printf("⚠️ Advertencia: No se pudo conectar a GORM: %v", err)
		return
	}

	log.Println("✓ Conexión GORM con PostgreSQL establecida exitosamente.")
}

// GetGormDB retorna la conexión GORM global
func GetGormDB() *gorm.DB {
	return GormDB
}
