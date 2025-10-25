# Testing Checkout API - curl Commands

## Endpoint

```
POST http://localhost:8080/api/v1/payments/create-checkout-session
Content-Type: application/json
```

---

## Test 1: Envío Local (Huehuetenango - Gratuito)

```bash
curl -X POST http://localhost:8080/api/v1/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "usuario@test.com",
    "customer_name": "Juan Pérez",
    "customer_phone": "7777-7777",
    "shipping_address": {
      "department": "Huehuetenango",
      "municipality": "Huehuetenango",
      "address": "Calle Principal 123, Apto 5"
    },
    "delivery_type": "home_delivery",
    "delivery_notes": "Entregar después de las 3pm",
    "items": [
      {
        "product_id": 1,
        "name": "Anillo de Plata",
        "price": 150.00,
        "quantity": 1,
        "image_url": ""
      }
    ],
    "subtotal": 150.00,
    "shipping_cost": 0.00,
    "total": 150.00
  }'
```

**Esperado:**
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_...",
  "order_id": "...",
  "requires_courier": false,
  "shipping_method": "local_delivery",
  "shipping_cost": 0
}
```

---

## Test 2: Envío Nacional - Entrega a Domicilio

```bash
curl -X POST http://localhost:8080/api/v1/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "usuario@test.com",
    "customer_name": "María García",
    "customer_phone": "3333-3333",
    "shipping_address": {
      "department": "Alta Verapaz",
      "municipality": "Cobán",
      "address": "Avenida Central 456, Zona 2, Cobán"
    },
    "delivery_type": "home_delivery",
    "delivery_notes": "Frágil - favor con cuidado",
    "items": [
      {
        "product_id": 2,
        "name": "Collar de Cristal",
        "price": 250.00,
        "quantity": 1,
        "image_url": ""
      }
    ],
    "subtotal": 250.00,
    "shipping_cost": 36.00,
    "total": 286.00
  }'
```

**Esperado:**
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_...",
  "order_id": "...",
  "requires_courier": true,
  "shipping_method": "cargo_expreso",
  "shipping_cost": 36
}
```

**Backend logs:**
```
Guia generada: CE-2025-456789 para orden numero [UUID]
```

---

## Test 3: Envío Nacional - Recoger en Sucursal

```bash
curl -X POST http://localhost:8080/api/v1/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "cliente@example.com",
    "customer_name": "Carlos López",
    "customer_phone": "5555-5555",
    "shipping_address": {
      "department": "Sacatepéquez",
      "municipality": "Antigua Guatemala",
      "address": "N/A"
    },
    "delivery_type": "pickup_at_branch",
    "pickup_branch": "antigua",
    "delivery_notes": "Recoger viernes",
    "items": [
      {
        "product_id": 3,
        "name": "Pulsera Artesanal",
        "price": 180.00,
        "quantity": 2,
        "image_url": ""
      }
    ],
    "subtotal": 360.00,
    "shipping_cost": 36.00,
    "total": 396.00
  }'
```

**Esperado:**
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_...",
  "order_id": "...",
  "requires_courier": true,
  "shipping_method": "cargo_expreso",
  "shipping_cost": 36
}
```

---

## Test 4: Validación - Sin teléfono

```bash
curl -X POST http://localhost:8080/api/v1/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "usuario@test.com",
    "customer_name": "Juan",
    "customer_phone": "",
    "shipping_address": {
      "department": "Huehuetenango",
      "municipality": "Huehuetenango",
      "address": "Calle Test 123"
    },
    "delivery_type": "home_delivery",
    "items": [{"product_id": 1, "name": "Test", "price": 100, "quantity": 1}],
    "subtotal": 100,
    "shipping_cost": 0,
    "total": 100
  }'
```

**Esperado:**
```json
{
  "error": "Datos inválidos: Key: 'CreateCheckoutSessionInput.customer_phone' Error:Field validation for 'customer_phone' failed on the 'required' tag"
}
```

---

## Test 5: Validación - Pickup sin sucursal

```bash
curl -X POST http://localhost:8080/api/v1/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "usuario@test.com",
    "customer_name": "Juan",
    "customer_phone": "7777-7777",
    "shipping_address": {
      "department": "Alta Verapaz",
      "municipality": "Cobán",
      "address": ""
    },
    "delivery_type": "pickup_at_branch",
    "pickup_branch": "",
    "items": [{"product_id": 1, "name": "Test", "price": 100, "quantity": 1}],
    "subtotal": 100,
    "shipping_cost": 36,
    "total": 136
  }'
```

**Esperado:**
```json
{
  "error": "Sucursal de recogida es requerida para entrega en sucursal"
}
```

---

## Test 6: Validación - Home delivery sin dirección

```bash
curl -X POST http://localhost:8080/api/v1/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "usuario@test.com",
    "customer_name": "Juan",
    "customer_phone": "7777-7777",
    "shipping_address": {
      "department": "Alta Verapaz",
      "municipality": "Cobán",
      "address": "Short"
    },
    "delivery_type": "home_delivery",
    "items": [{"product_id": 1, "name": "Test", "price": 100, "quantity": 1}],
    "subtotal": 100,
    "shipping_cost": 36,
    "total": 136
  }'
```

**Esperado:**
```json
{
  "error": "Dirección completa es requerida para entrega a domicilio (mínimo 10 caracteres)"
}
```

---

## Verificar en Database

```bash
# Conectar a Supabase (reemplazar credenciales)
psql postgresql://postgres:PASSWORD@HOST:5432/postgres

# Ver últimas órdenes creadas
SELECT id, customer_email, customer_phone, delivery_type, 
       pickup_branch, delivery_notes, shipping_cost, requires_courier
FROM orders
ORDER BY created_at DESC
LIMIT 5;

# Ver una orden específica
SELECT * FROM orders WHERE id = 'YOUR-ORDER-UUID';
```

---

## Respuesta Exitosa - Desglose

```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  // ↑ URL para redirigir al cliente a Stripe
  
  "session_id": "cs_test_abcd1234...",
  // ↑ ID de sesión de Stripe (útil para referencias)
  
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  // ↑ UUID de la orden creada en DB
  
  "requires_courier": true,
  // ↑ Si necesita Cargo Expreso (true/false)
  
  "shipping_method": "cargo_expreso",
  // ↑ Método: "cargo_expreso" | "local_delivery"
  
  "shipping_cost": 36
  // ↑ Costo de envío Q36 o Q0
}
```

---

## Flow Automatizado (Script Bash)

```bash
#!/bin/bash

# Variables
API_URL="http://localhost:8080/api/v1/payments/create-checkout-session"
TIMESTAMP=$(date +%s)
CUSTOMER_EMAIL="test-${TIMESTAMP}@example.com"

# Test 1: Local Delivery
echo "=== Test 1: Local Delivery ==="
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "'$CUSTOMER_EMAIL'",
    "customer_name": "Test User Local",
    "customer_phone": "7777-7777",
    "shipping_address": {
      "department": "Huehuetenango",
      "municipality": "Huehuetenango",
      "address": "Test Address 123"
    },
    "delivery_type": "home_delivery",
    "items": [{"product_id": 1, "name": "Test", "price": 100, "quantity": 1}],
    "subtotal": 100,
    "shipping_cost": 0,
    "total": 100
  }' | jq .

echo ""
echo "=== Test 2: National - Home Delivery ==="
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "'$CUSTOMER_EMAIL'",
    "customer_name": "Test User National",
    "customer_phone": "3333-3333",
    "shipping_address": {
      "department": "Alta Verapaz",
      "municipality": "Cobán",
      "address": "Test National Address 456"
    },
    "delivery_type": "home_delivery",
    "items": [{"product_id": 2, "name": "Test", "price": 200, "quantity": 1}],
    "subtotal": 200,
    "shipping_cost": 36,
    "total": 236
  }' | jq .

echo ""
echo "=== Test 3: National - Pickup ==="
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "'$CUSTOMER_EMAIL'",
    "customer_name": "Test User Pickup",
    "customer_phone": "5555-5555",
    "shipping_address": {
      "department": "Alta Verapaz",
      "municipality": "Cobán",
      "address": "N/A"
    },
    "delivery_type": "pickup_at_branch",
    "pickup_branch": "coban",
    "items": [{"product_id": 3, "name": "Test", "price": 150, "quantity": 1}],
    "subtotal": 150,
    "shipping_cost": 36,
    "total": 186
  }' | jq .
```

**Guardar como**: `test-checkout.sh`
```bash
chmod +x test-checkout.sh
./test-checkout.sh
```

---

## Sucursales Disponibles

```
gt-zona10            → Zona 10, Ciudad de Guatemala
gt-pradera           → Centro Comercial Pradera Concepción
xela-centro          → Centro, Quetzaltenango
antigua              → Antigua Guatemala
escuintla            → Escuintla Centro
coban                → Cobán, Alta Verapaz
peten                → Santa Elena, Petén
```

---

## Notas Importantes

1. **Mock Mode**: `CARGO_EXPRESO_MOCK=true`
   - Genera tracking fake: `CE-2025-NNNNNN`
   - Respuesta inmediata
   - NO llama a API externa

2. **Real Mode**: `CARGO_EXPRESO_MOCK=false`
   - Llama a n8n webhook
   - Retorna tracking real
   - PDF de guía disponible

3. **Phone Format**: Acepta cualquier formato
   - `7777-7777` ✅
   - `77777777` ✅
   - `+502 7777-7777` ✅

4. **Validaciones**:
   - Email: formato válido
   - Phone: 8+ dígitos
   - Address (home_delivery): 10+ caracteres
   - Branch (pickup): must-select from list

---

## Debugging

### Ver logs del backend
```
POST /api/v1/payments/create-checkout-session
Input: {...}
Order created: [UUID]
Stripe session: cs_test_...
Guia generada: CE-2025-123456 para orden numero [UUID]
[200] POST /api/v1/payments/create-checkout-session (234.5ms)
```

### Ver en browser console
```javascript
// Abrir F12 → Console
// Cuando hagas submit en checkout:
📦 Enviando pedido: {objeto completo}
✅ Sesión creada: {respuesta del backend}
```

### Ver en database
```sql
SELECT customer_phone, delivery_type, pickup_branch, delivery_notes 
FROM orders 
WHERE id = 'TU-ORDER-UUID';
```

---

## ¡Todo Listo!

Ejecuta los tests y verifica que:
- ✅ Órdenes se crean correctamente
- ✅ Nuevos campos se guardan
- ✅ Validaciones funcionan
- ✅ Cargo Expreso integrado
