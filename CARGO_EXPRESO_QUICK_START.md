# Guía Rápida - Cargo Expreso Service

## Archivo Creado

`backend/services/cargo_expreso_service.go` - 290 líneas

## Características

- Interface común para Mock y Real
- Mock service (desarrollo)
- Real service (producción con n8n)
- Factory pattern (selecciona automáticamente)
- Cero cambios de código al cambiar modo

---

## Uso Mínimo

### 1. Importar en tu handler

```go
import "github.com/tuUsuario/moda-organica/services"
```

### 2. Crear servicio

```go
cargoService := services.NewCargoExpresoService()
```

### 3. Crear guía

```go
response, err := cargoService.CreateGuide(
    services.CargoExpresoGuideRequest{
        SenderName: "Moda Orgánica",
        RecipientName: "Cliente",
        OrderID: 123,
        Weight: 0.5,
        DeclaredValue: 150.00,
    },
)

if err != nil {
    log.Printf("Error: %v", err)
    return
}

// response.TrackingNumber = "CE-2025-456789"
// response.GuideURL = "https://..."
```

---

## Configuración .env

```bash
# Desarrollo (MOCK)
CARGO_EXPRESO_MOCK=true

# Producción (Real con n8n)
CARGO_EXPRESO_MOCK=false
N8N_CARGO_EXPRESO_WEBHOOK_URL=https://...
N8N_API_KEY=...
```

---

## Modo Actual

Mock activado (por defecto)
- Genera tracking numbers fake
- Retorna respuestas inmediatas
- No requiere credenciales
- Perfecto para desarrollo

## Migración a Real

Solo cambiar .env:
```bash
CARGO_EXPRESO_MOCK=false
```

Sin cambios en código.

---

## Estructuras

### Request

```go
CargoExpresoGuideRequest{
    SenderName string
    RecipientName string
    RecipientAddress string
    RecipientCity string
    OrderID uint
    Weight float64
    DeclaredValue float64
    Notes string
}
```

### Response

```go
CargoExpresoGuideResponse{
    Success bool
    TrackingNumber string      // "CE-2025-456789"
    GuideURL string            // "https://..."
    EstimatedDays int          // 3-5
    Cost float64               // 36.00
}
```

---

## Generador de Tracking

Genera tracking realista: `CE-YYYY-NNNNNN`

Ejemplo:
- CE-2025-456789 (formato correcto)
- Año real
- 6 dígitos secuenciales

---

## Logging

Al iniciar:
- Modo MOCK: "Cargo Expreso: Modo MOCK activado"
- Modo REAL: "Cargo Expreso: Modo REAL activado (n8n)"
- Sin n8n configurado: "Advertencia: ... usando MOCK"

---

## Testing

Mock service listo para unit tests:

```go
func TestCargoExpreso(t *testing.T) {
    service := services.NewMockCargoExpresoService()
    response, _ := service.CreateGuide(request)
    
    assert.True(t, response.Success)
    assert.NotEmpty(t, response.TrackingNumber)
}
```

---

## Siguientes Pasos

1. Integrar en order_handler.go
2. Crear workflow n8n
3. Obtener credenciales
4. Testear modo real
5. Lanzar a producción

Ver: CARGO_EXPRESO_SERVICE.md para documentación completa.
