# Servicio Cargo Expreso - Arquitectura y Uso

## Visión General

Servicio de integración con Cargo Expreso que soporta dos modos:

- MOCK (Actual): Genera tracking numbers y PDFs simulados
- REAL (Futuro): Llama a workflow de n8n que automatiza Cargo Expreso

Cambiar de modo solo requiere actualizar .env - CERO cambios de código.

---

## Arquitectura

### Interfaz Común

```go
type CargoExpresoService interface {
    CreateGuide(request CargoExpresoGuideRequest) (*CargoExpresoGuideResponse, error)
    GetTrackingInfo(trackingNumber string) (*TrackingInfo, error)
}
```

Ambas implementaciones (Mock y Real) satisfacen esta interfaz.

### Pattern: Factory

```go
func NewCargoExpresoService() CargoExpresoService {
    // Lee .env
    // Retorna Mock o Real según CARGO_EXPRESO_MOCK
}
```

El factory automáticamente elige la implementación correcta.

---

## Modo MOCK (Desarrollo)

### Activación

En `.env`:
```
CARGO_EXPRESO_MOCK=true
```

O simplemente no incluir la variable (true es el default).

### Comportamiento

```go
// Genera: CE-2025-456789
trackingNumber := generateMockTrackingNumber()

// Retorna inmediatamente
return &CargoExpresoGuideResponse{
    Success: true,
    TrackingNumber: "CE-2025-456789",
    GuideURL: "https://storage.example.com/guides/CE-2025-456789.pdf",
    EstimatedDays: 3,
    Cost: 36.00,
}
```

### Ventajas

- No requiere credenciales
- Respuestas inmediatas (+ 500ms simulado)
- Perfecto para desarrollo y testing
- No usa n8n ni Cargo Expreso

### Caso de Uso

```go
service := NewCargoExpresoService() // Retorna Mock

request := CargoExpresoGuideRequest{
    SenderName: "Moda Orgánica",
    RecipientName: "Juan Pérez",
    OrderID: 1,
}

response, err := service.CreateGuide(request)
// response.TrackingNumber = "CE-2025-456789" (mock)
// response.Success = true
```

---

## Modo REAL (Producción)

### Activación

En `.env`:
```
CARGO_EXPRESO_MOCK=false
N8N_CARGO_EXPRESO_WEBHOOK_URL=https://tu-n8n-instance.com/webhook/cargo-expreso
N8N_API_KEY=tu_api_key_secreto
```

### Comportamiento

1. Prepara payload JSON con datos del envío
2. Llama a webhook de n8n
3. n8n automatiza creación en Cargo Expreso
4. n8n retorna tracking number y PDF reales

### Flujo HTTP

```
Tu App
  |
  | POST /webhook/cargo-expreso
  | (CargoExpresoGuideRequest)
  |
  v
n8n Instance
  |
  | [Workflow de n8n]
  | - Valida datos
  | - Llama API de Cargo Expreso
  | - Genera guía
  | - Descarga PDF
  |
  v
Cargo Expreso API
  |
  | Retorna tracking + PDF
  |
  v
n8n
  |
  | Retorna a tu app
  | (CargoExpresoGuideResponse)
  |
  v
Tu App
```

### Timeout

- 60 segundos para que n8n complete el workflow
- Soporta operaciones lentas en Cargo Expreso

---

## Configuración .env

```bash
# ============================================
# CARGO EXPRESO CONFIGURATION
# ============================================

# Modo de operación
CARGO_EXPRESO_MOCK=true

# Datos del remitente (Moda Orgánica)
CARGO_EXPRESO_SENDER_NAME="Moda Orgánica"
CARGO_EXPRESO_SENDER_PHONE="7777-7777"
CARGO_EXPRESO_SENDER_ADDRESS="Dirección exacta del negocio"
CARGO_EXPRESO_SENDER_CITY="Huehuetenango"

# n8n Webhook (cuando cambies a MOCK=false)
# N8N_CARGO_EXPRESO_WEBHOOK_URL=https://tu-n8n.com/webhook/cargo-expreso
# N8N_API_KEY=tu_api_key_de_n8n
```

---

## Uso en Handlers

### Ejemplo: Crear orden con envío

```go
// En backend/handlers/order_handler.go

import (
    "github.com/tuUsuario/moda-organica/services"
)

func CreateOrder(w http.ResponseWriter, r *http.Request) {
    // ... parse request ...
    
    // Crear orden en BD
    order := models.Order{
        CustomerName: "Juan Pérez",
        ShippingCity: "Antigua Guatemala",
        Total: 150.00,
    }
    db.Create(&order)
    
    // Crear guía de envío
    cargoService := services.NewCargoExpresoService()
    
    guideRequest := services.CargoExpresoGuideRequest{
        SenderName: "Moda Orgánica",
        SenderCity: "Huehuetenango",
        RecipientName: order.CustomerName,
        RecipientCity: order.ShippingCity,
        RecipientAddress: order.ShippingAddress,
        OrderID: order.ID,
        Weight: 0.5,
        DeclaredValue: order.Total,
    }
    
    guideResponse, err := cargoService.CreateGuide(guideRequest)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Guardar tracking en orden
    order.ShippingTracking = guideResponse.TrackingNumber
    order.CargoExpresoGuideURL = guideResponse.GuideURL
    order.RequiresCourier = true
    db.Save(&order)
    
    // Responder
    json.NewEncoder(w).Encode(order)
}
```

---

## Testing

### Test Mock

```go
package services

import (
    "testing"
)

func TestMockCargoExpreso(t *testing.T) {
    service := NewMockCargoExpresoService()
    
    request := CargoExpresoGuideRequest{
        SenderName: "Test Sender",
        RecipientName: "Test Recipient",
        OrderID: 123,
    }
    
    response, err := service.CreateGuide(request)
    
    if err != nil {
        t.Fatalf("Expected no error, got %v", err)
    }
    
    if !response.Success {
        t.Error("Expected success to be true")
    }
    
    if response.TrackingNumber == "" {
        t.Error("Expected tracking number")
    }
    
    if response.EstimatedDays != 3 {
        t.Errorf("Expected 3 days, got %d", response.EstimatedDays)
    }
}
```

---

## Migración de Mock a Real

### Paso 1: Obtener credenciales de n8n

Instancia de n8n + API Key + Webhook URL del workflow

### Paso 2: Actualizar .env

```bash
CARGO_EXPRESO_MOCK=false
N8N_CARGO_EXPRESO_WEBHOOK_URL=https://...
N8N_API_KEY=...
```

### Paso 3: Sin cambios de código

Tu aplicación automáticamente:
- Usa RealCargoExpresoService
- Llama a n8n en lugar de mock
- Retorna valores reales de Cargo Expreso

---

## Workflow n8n (Ejemplo)

El workflow en n8n debería:

1. **Recibir request**
   - POST body con CargoExpresoGuideRequest

2. **Validar datos**
   - Verificar campos requeridos
   - Validar formato

3. **Llamar API de Cargo Expreso**
   - Crear guía
   - Obtener tracking number

4. **Descargar PDF**
   - Obtener URL de PDF
   - Guardar en storage (S3, Cloudinary, etc.)

5. **Retornar respuesta**
   - CargoExpresoGuideResponse con datos reales

---

## Estructura de Respuesta

### Mock Response

```json
{
    "success": true,
    "tracking_number": "CE-2025-456789",
    "guide_url": "https://storage.example.com/guides/CE-2025-456789.pdf",
    "estimated_days": 3,
    "cost": 36.00
}
```

### Real Response (desde n8n)

```json
{
    "success": true,
    "tracking_number": "CE-2025-987654",
    "guide_url": "https://tu-storage.com/ce/987654.pdf",
    "estimated_days": 3,
    "cost": 36.00
}
```

Idéntica estructura, solo que con datos reales.

---

## Manejo de Errores

### Ejemplo: n8n no configurado

```go
// Si CARGO_EXPRESO_MOCK=false pero N8N_CARGO_EXPRESO_WEBHOOK_URL vacío
// Automáticamente fallback a MOCK

service := NewCargoExpresoService()
// Retorna: &mockCargoExpresoService{}
// Log: "Advertencia: N8N_CARGO_EXPRESO_WEBHOOK_URL no configurado, usando MOCK"
```

### Ejemplo: n8n retorna error

```go
response, err := service.CreateGuide(request)
if err != nil {
    // err = "n8n returned error: Invalid city (status 400)"
    // Manejar error y notificar al usuario
    log.Printf("Error creating cargo guide: %v", err)
}
```

---

## Checklist de Implementación

- [x] Interfaz CargoExpresoService creada
- [x] Mock service completo y funcional
- [x] Real service con n8n ready
- [x] Factory pattern implementado
- [x] Manejo de errores
- [x] Logging de modo activado
- [x] Tracking number generator realista
- [x] Documentación completa

---

## Próximos Pasos

1. Crear workflow n8n para crear guías
2. Obtener credenciales de Cargo Expreso
3. Testear integración real
4. Actualizar .env a MOCK=false
5. Lanzar a producción

Sin cambios de código en tu app.
