package db

import (
	"log"
	"os"

	"github.com/supabase-community/supabase-go"
)

// Client es nuestro cliente global de Supabase
// Lo exportamos para que otros paquetes (como controllers) puedan usarlo.
var Client *supabase.Client

// InitSupabase inicializa la conexión con la base de datos Supabase
// Usando las variables de entorno.
func InitSupabase() {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_KEY") // Usamos la SERVICE_KEY en el backend para permisos de admin

	if supabaseURL == "" || supabaseKey == "" {
		log.Fatal("Error: SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar configuradas como variables de entorno.")
	}

	// Inicializamos el cliente
	client, err := supabase.NewClient(supabaseURL, supabaseKey, nil)
	if err != nil {
		log.Fatalf("Error inicializando el cliente de Supabase: %v", err)
	}

	Client = client
	log.Println("Conexión con Supabase establecida exitosamente.")
}