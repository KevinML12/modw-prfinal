# Cargo Expreso Service - Implementación Completa

Fecha: Octubre 23, 2025
Status: COMPLETADO

---

## Archivo Creado

backend/services/cargo_expreso_service.go

- Lineas: 290
- Interfaz: CargoExpresoService
- Implementaciones: 2 (Mock + Real)
- Pattern: Factory

---

## Componentes

### 1. Interfaz Común

```go
type CargoExpresoService interface {
    CreateGuide(request CargoExpresoGuideRequest) (*CargoExpresoGuideResponse, error)
    GetTrackingInfo(trackingNumber string) (*TrackingInfo, error)
}
```

Ambas implementaciones la satisfacen.

### 2. Mock Service

- Genera tracking number realista: CE-YYYY-NNNNNN
- Simula delay de red: 500ms
- Retorna respuesta mock
- No requiere credenciales

### 3. Real Service

- Llama a webhook de n8n
- n8n automatiza Cargo Expreso
- Retorna tracking + PDF reales
- Timeout: 60 segundos

### 4. Factory

Selecciona automáticamente según CARGO_EXPRESO_MOCK en .env

---

## Modos de Operación

### Desarrollo (MOCK - Default)

```
CARGO_EXPRESO_MOCK=true
```

- Mock service activado
- Tracking fake: CE-2025-456789
- Respuesta inmediata + 500ms
- Cero dependencias

### Producción (REAL)

```
CARGO_EXPRESO_MOCK=false
N8N_CARGO_EXPRESO_WEBHOOK_URL=https://...
N8N_API_KEY=...
```

- Real service activado
- Llamadas reales a n8n
- n8n automatiza Cargo Expreso
- Retorna tracking + PDF reales

---

## Característica Clave: Cero Cambios de Código

```go
// Tu código se ve igual en ambos modos:

service := services.NewCargoExpresoService()
response, err := service.CreateGuide(request)

// En .env:
// CARGO_EXPRESO_MOCK=true  -> Mock service
// CARGO_EXPRESO_MOCK=false -> Real service
// Automático, sin tocar código.
```

---

## Integración en Order Handler

```go
// 1. Crear orden
order := &models.Order{...}
db.Create(order)

// 2. Crear guía
cargoService := services.NewCargoExpresoService()
response, err := cargoService.CreateGuide(
    services.CargoExpresoGuideRequest{
        OrderID: order.ID,
        RecipientName: order.CustomerName,
        // ... más campos
    },
)

// 3. Guardar tracking
order.ShippingTracking = response.TrackingNumber
order.CargoExpresoGuideURL = response.GuideURL
order.RequiresCourier = true
db.Save(order)
```

---

## Estructuras de Datos

### CargoExpresoGuideRequest

- SenderName, SenderPhone, SenderAddress, SenderCity
- RecipientName, RecipientPhone, RecipientAddress, RecipientCity
- OrderID, PackageType, Weight, DeclaredValue, Notes

### CargoExpresoGuideResponse

- Success: bool
- TrackingNumber: string (ej: CE-2025-456789)
- GuideURL: string (URL del PDF)
- EstimatedDays: int (3-5)
- Cost: float64 (36.00)
- ErrorMessage: string (si error)

### TrackingInfo

- TrackingNumber: string
- Status: string (pending, in_transit, delivered)
- LastUpdate: time.Time
- Location: string

---

## Variables de Entorno

```bash
# Modo
CARGO_EXPRESO_MOCK=true

# Datos del remitente
CARGO_EXPRESO_SENDER_NAME="Moda Orgánica"
CARGO_EXPRESO_SENDER_PHONE="7777-7777"
CARGO_EXPRESO_SENDER_ADDRESS="Dirección exacta"
CARGO_EXPRESO_SENDER_CITY="Huehuetenango"

# n8n (cuando cambies a MOCK=false)
# N8N_CARGO_EXPRESO_WEBHOOK_URL=https://...
# N8N_API_KEY=...
```

---

## Logging

Al iniciar la aplicación:

Modo Mock:
```
Cargo Expreso: Modo MOCK activado
```

Modo Real:
```
Cargo Expreso: Modo REAL activado (n8n)
```

Sin n8n configurado:
```
Advertencia: N8N_CARGO_EXPRESO_WEBHOOK_URL no configurado, usando MOCK
```

---

## Generador de Tracking

Formato realista: CE-YYYY-NNNNNN

Ejemplo:
- CE (Cargo Expreso)
- 2025 (Año actual)
- 456789 (6 dígitos secuenciales aleatorios)

---

## Testing

Mock service es excelente para testing:

```go
func TestCreateGuide(t *testing.T) {
    service := services.NewMockCargoExpresoService()
    
    response, err := service.CreateGuide(
        services.CargoExpresoGuideRequest{
            OrderID: 1,
            RecipientName: "Test",
        },
    )
    
    assert.NoError(t, err)
    assert.True(t, response.Success)
    assert.NotEmpty(t, response.TrackingNumber)
}
```

---

## Migración a Producción

### Paso 1: Instancia n8n

Tener n8n corriendo con:
- Credenciales de Cargo Expreso
- Webhook URL publicada

### Paso 2: Workflow n8n

Crear workflow que:
1. Reciba CargoExpresoGuideRequest
2. Valide datos
3. Llame API de Cargo Expreso
4. Descargue PDF
5. Retorne CargoExpresoGuideResponse

### Paso 3: Actualizar .env

```bash
CARGO_EXPRESO_MOCK=false
N8N_CARGO_EXPRESO_WEBHOOK_URL=https://tu-n8n/webhook/cargo-expreso
N8N_API_KEY=tu_api_key
```

### Paso 4: Ningún cambio de código

Tu aplicación automáticamente:
- Detecta MOCK=false
- Crea RealCargoExpresoService
- Llama a n8n
- Retorna datos reales

---

## Documentación

- CARGO_EXPRESO_SERVICE.md (detallada)
- CARGO_EXPRESO_QUICK_START.md (rápida)

---

## Checklist

- [x] Interface CargoExpresoService
- [x] Mock service completo
- [x] Real service con n8n
- [x] Factory pattern
- [x] Tracking generator realista
- [x] Error handling
- [x] Logging
- [x] Variables de entorno
- [x] Testing ready
- [x] Documentación completa

---

## Uso Inmediato

En tu order_handler.go:

```go
import "github.com/tuUsuario/moda-organica/services"

// En CreateOrder:
cargoService := services.NewCargoExpresoService()
response, err := cargoService.CreateGuide(request)
```

Listo. El servicio ya está activado en modo MOCK.

---

Status: LISTO PARA USAR Y DOCUMENTADO
