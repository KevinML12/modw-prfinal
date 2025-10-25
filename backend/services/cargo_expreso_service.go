// backend/services/cargo_expreso_service.go
package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"time"
)

// ============================================
// STRUCTURES
// ============================================

// CargoExpresoGuideRequest representa los datos necesarios para crear una guía
type CargoExpresoGuideRequest struct {
	// Datos del remitente (tu cliente - Moda Orgánica)
	SenderName    string `json:"sender_name"`
	SenderPhone   string `json:"sender_phone"`
	SenderAddress string `json:"sender_address"`
	SenderCity    string `json:"sender_city"`

	// Datos del destinatario (comprador)
	RecipientName    string `json:"recipient_name"`
	RecipientPhone   string `json:"recipient_phone"`
	RecipientAddress string `json:"recipient_address"` // Vacío si es pickup
	RecipientCity    string `json:"recipient_city"`

	// Datos del envío
	OrderID       string  `json:"order_id"`       // UUID de la orden como string
	PackageType   string  `json:"package_type"`   // "sobre", "caja_pequeña", "caja_mediana"
	Weight        float64 `json:"weight"`         // Peso en libras
	DeclaredValue float64 `json:"declared_value"` // Valor declarado en Q
	Notes         string  `json:"notes"`          // Notas especiales

	// NUEVO: Tipo de entrega (home delivery o pickup)
	DeliveryType string `json:"delivery_type"`           // "home_delivery" | "pickup_at_branch"
	PickupBranch string `json:"pickup_branch,omitempty"` // Sucursal si es pickup
}

// CargoExpresoGuideResponse representa la respuesta al crear una guía
type CargoExpresoGuideResponse struct {
	Success        bool    `json:"success"`
	TrackingNumber string  `json:"tracking_number"`
	GuideURL       string  `json:"guide_url"`      // URL del PDF de la guía
	EstimatedDays  int     `json:"estimated_days"` // Días estimados de entrega
	Cost           float64 `json:"cost"`           // Costo del envío
	ErrorMessage   string  `json:"error_message,omitempty"`
}

// ============================================
// INTERFACE
// ============================================

// CargoExpresoService define el contrato para generar guías
type CargoExpresoService interface {
	CreateGuide(request CargoExpresoGuideRequest) (*CargoExpresoGuideResponse, error)
	GetTrackingInfo(trackingNumber string) (*TrackingInfo, error)
}

// TrackingInfo representa información de rastreo
type TrackingInfo struct {
	TrackingNumber string    `json:"tracking_number"`
	Status         string    `json:"status"` // "pending", "in_transit", "delivered"
	LastUpdate     time.Time `json:"last_update"`
	Location       string    `json:"location"`
}

// ============================================
// MOCK IMPLEMENTATION
// ============================================

type mockCargoExpresoService struct{}

// NewMockCargoExpresoService crea una instancia del servicio mock
func NewMockCargoExpresoService() CargoExpresoService {
	return &mockCargoExpresoService{}
}

// CreateGuide genera una guía simulada (para desarrollo)
func (s *mockCargoExpresoService) CreateGuide(request CargoExpresoGuideRequest) (*CargoExpresoGuideResponse, error) {
	// Simular delay de red (opcional)
	time.Sleep(500 * time.Millisecond)

	// Generar tracking number fake pero realista
	trackingNumber := generateMockTrackingNumber()

	// URL de guía fake (puedes crear un PDF mock o retornar una URL placeholder)
	guideURL := fmt.Sprintf("https://storage.example.com/guides/%s.pdf", trackingNumber)

	return &CargoExpresoGuideResponse{
		Success:        true,
		TrackingNumber: trackingNumber,
		GuideURL:       guideURL,
		EstimatedDays:  3, // 3-5 días típico
		Cost:           36.00,
		ErrorMessage:   "",
	}, nil
}

// GetTrackingInfo retorna información de rastreo simulada
func (s *mockCargoExpresoService) GetTrackingInfo(trackingNumber string) (*TrackingInfo, error) {
	// Simular delay
	time.Sleep(300 * time.Millisecond)

	return &TrackingInfo{
		TrackingNumber: trackingNumber,
		Status:         "in_transit",
		LastUpdate:     time.Now().Add(-2 * time.Hour),
		Location:       "Centro de Distribución Ciudad de Guatemala",
	}, nil
}

// generateMockTrackingNumber genera un tracking number fake pero realista
func generateMockTrackingNumber() string {
	// Formato: CE-YYYY-NNNNNN
	// CE = Cargo Expreso
	// YYYY = Año
	// NNNNNN = Número secuencial
	rand.Seed(time.Now().UnixNano())
	year := time.Now().Year()
	sequence := rand.Intn(999999) + 100000 // 6 dígitos

	return fmt.Sprintf("CE-%d-%06d", year, sequence)
}

// ============================================
// REAL IMPLEMENTATION (n8n)
// ============================================

type realCargoExpresoService struct {
	n8nWebhookURL string
	apiKey        string
}

// NewRealCargoExpresoService crea una instancia del servicio real (n8n)
func NewRealCargoExpresoService(n8nURL, apiKey string) CargoExpresoService {
	return &realCargoExpresoService{
		n8nWebhookURL: n8nURL,
		apiKey:        apiKey,
	}
}

// CreateGuide llama al workflow de n8n que automatiza Cargo Expreso
func (s *realCargoExpresoService) CreateGuide(request CargoExpresoGuideRequest) (*CargoExpresoGuideResponse, error) {
	// Preparar payload para n8n
	payload, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request: %w", err)
	}

	// Crear request HTTP a n8n
	req, err := http.NewRequest("POST", s.n8nWebhookURL, bytes.NewBuffer(payload))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// Headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))

	// Ejecutar request
	client := &http.Client{Timeout: 60 * time.Second} // Timeout generoso para n8n
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error calling n8n webhook: %w", err)
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response: %w", err)
	}

	// Verificar status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("n8n returned error: %s (status %d)", string(body), resp.StatusCode)
	}

	// Parsear respuesta
	var response CargoExpresoGuideResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("error parsing n8n response: %w", err)
	}

	return &response, nil
}

// GetTrackingInfo obtiene info de tracking desde n8n
func (s *realCargoExpresoService) GetTrackingInfo(trackingNumber string) (*TrackingInfo, error) {
	// TODO: Implementar cuando n8n tenga endpoint de tracking
	return nil, fmt.Errorf("tracking info not implemented yet")
}

// ============================================
// FACTORY
// ============================================

// NewCargoExpresoService retorna la implementación correcta según configuración
func NewCargoExpresoService() CargoExpresoService {
	// Leer modo desde variables de entorno
	useMock := os.Getenv("CARGO_EXPRESO_MOCK")

	if useMock == "true" || useMock == "" {
		// Modo mock (default)
		fmt.Println("Cargo Expreso: Modo MOCK activado")
		return NewMockCargoExpresoService()
	}

	// Modo real (requiere credenciales)
	n8nURL := os.Getenv("N8N_CARGO_EXPRESO_WEBHOOK_URL")
	apiKey := os.Getenv("N8N_API_KEY")

	if n8nURL == "" {
		fmt.Println("Advertencia: N8N_CARGO_EXPRESO_WEBHOOK_URL no configurado, usando MOCK")
		return NewMockCargoExpresoService()
	}

	fmt.Println("Cargo Expreso: Modo REAL activado (n8n)")
	return NewRealCargoExpresoService(n8nURL, apiKey)
}
