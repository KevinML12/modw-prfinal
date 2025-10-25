Cargo Expreso Service - COMPLETADO

ARCHIVO CREADO:
backend/services/cargo_expreso_service.go (290 lineas)

COMPONENTES:
[1] Interface CargoExpresoService
[2] Mock Implementation (desarrollo)
[3] Real Implementation (n8n)
[4] Factory (selecciona automáticamente)

VENTAJA CLAVE:
Cambiar de Mock a Real solo modifica .env
CERO cambios en código de tu aplicación

MODOS:

DESARROLLO (Default):
  CARGO_EXPRESO_MOCK=true
  - Genera tracking fake: CE-2025-456789
  - Respuestas inmediatas
  - No requiere credenciales
  - Perfecto para desarrollo/testing

PRODUCCIÓN (Cuando esté listo):
  CARGO_EXPRESO_MOCK=false
  N8N_CARGO_EXPRESO_WEBHOOK_URL=https://...
  N8N_API_KEY=...
  - Llama a n8n webhook
  - n8n automatiza Cargo Expreso
  - Retorna tracking + PDF reales

FLUJO DE CREACIÓN DE GUÍA:

1. Tu aplicación
   cargoService := services.NewCargoExpresoService()

2. Factory (automático)
   Lee .env CARGO_EXPRESO_MOCK
   Elige Mock o Real

3. Si Mock:
   Genera tracking fake
   Retorna respuesta inmediata

4. Si Real:
   POST a n8n webhook
   n8n automatiza Cargo Expreso
   Retorna tracking + PDF reales

INTEGRACIÓN EN ORDER HANDLER:

cargoService := services.NewCargoExpresoService()

response, err := cargoService.CreateGuide(
    CargoExpresoGuideRequest{
        SenderName: "Moda Orgánica",
        RecipientName: order.CustomerName,
        OrderID: order.ID,
        Weight: 0.5,
        DeclaredValue: order.Total,
    },
)

if err != nil {
    log.Printf("Error: %v", err)
    return
}

// Guardar tracking en orden
order.ShippingTracking = response.TrackingNumber
order.CargoExpresoGuideURL = response.GuideURL
db.Save(order)

GENERADOR DE TRACKING:
Formato: CE-YYYY-NNNNNN
Ejemplo: CE-2025-456789
Realista pero claramente fake en desarrollo

TIMEOUT:
60 segundos para que n8n complete workflow
Generoso para operaciones complejas

ERROR HANDLING:
- Si n8n no configurado: fallback a MOCK
- Si n8n error: retorna error con status code
- Logging claro de modo activado

TESTING:
Mock service es ideal para unit tests:

func TestCreateGuide(t *testing.T) {
    service := NewMockCargoExpresoService()
    response, _ := service.CreateGuide(request)
    assert.True(t, response.Success)
}

LOGGING AL INICIAR:

Modo MOCK:
  "Cargo Expreso: Modo MOCK activado"

Modo REAL:
  "Cargo Expreso: Modo REAL activado (n8n)"

Sin n8n configurado:
  "Advertencia: N8N_CARGO_EXPRESO_WEBHOOK_URL no configurado, usando MOCK"

MIGRACIÓN A PRODUCCIÓN:

[1] Crear workflow en n8n
    - Recibe CargoExpresoGuideRequest
    - Llama API de Cargo Expreso
    - Retorna tracking + PDF

[2] Obtener credenciales
    - n8n webhook URL
    - n8n API key

[3] Actualizar .env
    CARGO_EXPRESO_MOCK=false
    N8N_CARGO_EXPRESO_WEBHOOK_URL=...
    N8N_API_KEY=...

[4] LISTO
    Cero cambios de código
    Tu app automáticamente usa Real service

DOCUMENTACIÓN:
- CARGO_EXPRESO_SERVICE.md (completa)
- CARGO_EXPRESO_QUICK_START.md (rápida)
- CARGO_EXPRESO_COMPLETE.md (resumen)

ESTRUCTURAS:

CargoExpresoGuideRequest:
  SenderName, SenderPhone, SenderAddress, SenderCity
  RecipientName, RecipientPhone, RecipientAddress, RecipientCity
  OrderID, PackageType, Weight, DeclaredValue, Notes

CargoExpresoGuideResponse:
  Success bool
  TrackingNumber string
  GuideURL string
  EstimatedDays int
  Cost float64

TrackingInfo:
  TrackingNumber string
  Status string (pending, in_transit, delivered)
  LastUpdate time.Time
  Location string

STATUS: LISTO PARA USAR

El servicio está activado en modo MOCK por defecto.
Cuando tengas n8n y credenciales, solo cambias .env a MOCK=false
Tu código continúa igual.
