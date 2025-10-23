# GUÍA DE TESTING - STRIPE CHECKOUT SESSION

## PRERREQUISITOS

### 1. Obtener Stripe Test Keys
1. Ir a: https://dashboard.stripe.com/test/apikeys
2. Copiar:
   - **Secret Key**: `sk_test_...` 
   - **Publishable Key**: `pk_test_...`
3. Guardar en `.env`:
   ```properties
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   FRONTEND_URL=http://localhost:5173
   ```

### 2. Verificar Dependencias
```bash
cd backend
go get github.com/stripe/stripe-go/v78
go build -o tmp/main  # Verificar que compila
```

### 3. Base de Datos
- Verificar que Supabase está disponible
- Tablas `orders` y `order_items` existen
- GORM migraciones funcionan

---

## TESTING MANUAL - PASO A PASO

### FASE 1: Setup Local

#### Paso 1.1: Iniciar Docker
```bash
# Terminal 1
cd c:\Users\keyme\proyectos\moda-organica
docker-compose down
docker-compose up --build
```

Esperar logs:
```
moda-organica-frontend-1 | VITE v5.x.x  ready in xxx ms
moda-organica-backend-1 | Iniciando servidor en el puerto 8080...
```

#### Paso 1.2: Verificar Endpoints
```bash
# Terminal 2
curl http://localhost:8080/api/v1/products
# Debe retornar: []
```

---

### FASE 2: Agregar Productos

#### Paso 2.1: Crear Productos Test
```bash
curl -X POST http://localhost:8080/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Collar Artesanal",
    "price": 150.00,
    "description": "Collar de plata pura",
    "image_url": "https://example.com/collar.jpg",
    "quantity": 10
  }'
```

#### Paso 2.2: Verificar en Tienda
- Ir a: http://localhost:5173
- Deberías ver el producto

---

### FASE 3: Flujo de Checkout

#### Paso 3.1: Agregar al Carrito
1. Click en producto
2. Seleccionar cantidad
3. Click "Agregar al Carrito"
4. Verificar carrito tiene item

#### Paso 3.2: Ir a Checkout
1. Click en carrito (ícono)
2. Click "Ir a Checkout"
3. URL debe ser: http://localhost:5173/checkout

#### Paso 3.3: Llenar Formulario
```
Email:         test@ejemplo.com
Nombre:        Test Usuario
Teléfono:      12345678

Departamento:  Huehuetenango
Municipio:     Chiantla
Dirección:     Calle Principal 123
```

#### Paso 3.4: Verificar Cálculos
- Subtotal: Debe mostrar precio correcto
- Envío: Debe mostrar Q25.00 o Q50.00
- Total: Debe ser Subtotal + Envío

---

### FASE 4: Procesar Pago con Stripe

#### Paso 4.1: Click "Pagar Ahora"
1. Click botón "Pagar Ahora"
2. Verificar en console que no hay errores
3. Debe redirigir a Stripe Checkout

#### Paso 4.2: Llenar Datos de Pago
En Stripe Checkout:
```
Email:             test@ejemplo.com
Nombre:            Test User
País:              Guatemala

Card Number:       4242 4242 4242 4242
Exp Date:          12/25
CVC:               123
```

#### Paso 4.3: Click "Pay"
1. El pago se procesa
2. Esperar 2-3 segundos
3. Debes ser redirigido a success page

---

### FASE 5: Verificar Resultados

#### Paso 5.1: Página Success
Deberías ver:
- ✅ Checkmark verde
- Título: "¡Pago Exitoso!"
- Mensaje: "Tu pedido ha sido confirmado..."
- Session ID mostrado

#### Paso 5.2: Verificar Carrito
- Carrito debe estar VACÍO
- No debe haber items en localStorage

#### Paso 5.3: Verificar Base de Datos
```bash
# Conectar a Supabase o usar psql

SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
# Debe haber una orden nueva con status='pending'

SELECT * FROM order_items WHERE order_id = (SELECT MAX(id) FROM orders);
# Debe haber 1 o más items
```

#### Paso 5.4: Verificar en Stripe Dashboard
1. Ir a: https://dashboard.stripe.com/test/payments
2. Filtrar por últimos pagos
3. Debe haber un pago de $1.75 (150 + 25 quetzales)
4. Status: Succeeded

---

## TESTING SCENARIOS

### Scenario A: Pago Exitoso (Happy Path)
**Entrada**: Formulario válido + Tarjeta válida  
**Salida Esperada**: 
- ✅ Redirige a `/checkout/success`
- ✅ Carrito vacío
- ✅ Orden creada en BD (status=pending)
- ✅ Payment en Stripe (succeeded)

**Verificar**:
```bash
# En logs del backend:
# "Endpoint POST /api/v1/payments/create-checkout-session registrado exitosamente"

# En BD:
SELECT COUNT(*) FROM orders WHERE status='pending';
# Debe ser > 0
```

### Scenario B: Cancelación de Pago
**Entrada**: Click "back" en Stripe Checkout  
**Salida Esperada**:
- ✅ Redirige a `/checkout/cancel`
- ✅ Carrito INTACTO
- ✅ Orden en BD queda status=pending

**Verificar**:
- Carrito sigue teniendo items
- Orden no actualizada a 'paid'

### Scenario C: Validación Falsa (Email inválido)
**Entrada**: Email = "invalido"  
**Salida Esperada**:
- ✅ Alert: "Email inválido"
- ✅ No redirige a Stripe
- ✅ Formulario permanece

**Verificar**:
```javascript
// En console del navegador
// No debe haber POST a /api/v1/payments/create-checkout-session
```

### Scenario D: Carrito Vacío
**Entrada**: Checkout con carrito vacío  
**Salida Esperada**:
- ✅ Alert: "El carrito está vacío"
- ✅ No llama al backend

**Verificar**:
- console: No debe haber petición HTTP

### Scenario E: Ubicación Inválida
**Entrada**: Ubicación vacía  
**Salida Esperada**:
- ✅ Alert: "Por favor completa la ubicación..."
- ✅ No redirige a Stripe

---

## DEBUGGING

### Error: "Error creando sesión de pago con Stripe"
**Causas**:
1. STRIPE_SECRET_KEY inválida
2. Key de publicación en lugar de secret
3. Red sin conexión a Stripe

**Solución**:
```bash
# Verificar .env
echo $STRIPE_SECRET_KEY
# Debe empezar con: sk_test_

# Verificar en logs
docker logs moda-organica-backend-1 | grep -i stripe
```

### Error: "ReferenceError: window is not defined"
**Causa**: Ejecutándose en SSR  
**Solución**: Verificar que código de Stripe solo corre en navegador
```javascript
// CORRECTO
if (typeof window !== 'undefined') {
  window.location.href = data.checkout_url;
}
```

### Error: "checkout_url es undefined"
**Causa**: Backend no retornó URL  
**Solución**:
```javascript
// En console:
console.log('Response:', await response.json());
// Debe tener: { checkout_url: "https://checkout.stripe.com/..." }
```

### Orden se crea pero no redirige
**Causa**: Error en window.location.href  
**Solución**:
```javascript
// Verificar en console
console.log('checkout_url:', data.checkout_url);
console.log('Type:', typeof data.checkout_url);
// Debe ser string válida de Stripe
```

---

## PERFORMANCE & MONITORING

### Métricas a Seguir
- Tiempo request a backend: < 1s
- Tiempo creación orden: < 500ms
- Redirección a Stripe: < 100ms

### Logs Importantes
```
Backend:
[INFO] Endpoint POST /api/v1/payments/create-checkout-session registrado

Frontend:
"Creando sesión de checkout: ..."
"Sesión creada: ..."
"Redirigiendo a Stripe Checkout..."
```

---

## CHECKLIST FINAL

### Backend
- [ ] Go compila sin errores
- [ ] Stripe SDK instalado (stripe-go/v78)
- [ ] payment_controller.go creado
- [ ] Ruta /api/v1/payments/create-checkout-session registrada
- [ ] Variables .env configuradas
- [ ] Docker inicia sin errores

### Frontend
- [ ] Checkout.svelte handleSubmit() actualizado
- [ ] Success page redirige y limpia carrito
- [ ] Cancel page muestra mensaje
- [ ] No hay errores TypeScript/Svelte

### Database
- [ ] Órdenes se crean con status='pending'
- [ ] OrderItems se crean correctamente
- [ ] PaymentIntentID (Stripe session ID) se guarda

### Stripe
- [ ] Test keys configuradas
- [ ] Checkout Session se crea exitosamente
- [ ] Redirección a success/cancel funciona
- [ ] Pago prueba se registra en dashboard

---

## CONCLUSIÓN

Si todos los pasos se ejecutan correctamente y las verificaciones pasan, **BLOQUE 1 está listo para producción**.

**Siguiente**: Implementar webhook (BLOQUE 2) para actualizar orden a 'paid' cuando Stripe confirme el pago.

---

**Última actualización**: 22 de Octubre de 2025  
**Status**: ✅ TESTING READY
