# ARQUITECTURA - STRIPE PAYMENT INTEGRATION BLOQUE 1

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MODA ORGÁNICA                                │
│                   E-Commerce Joyería Artesanal                       │
└─────────────────────────────────────────────────────────────────────┘

                            CHECKOUT FLOW
                            
┌──────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (SvelteKit)                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  /checkout Route                                                     │
│  ├─ TextInput (Email, Name, Phone)                                   │
│  ├─ LocationSelector (Department, Municipality, Address)             │
│  ├─ Cart Summary (Items, Subtotal, Shipping)                        │
│  └─ Button: "Pagar Ahora" → handleSubmit()                          │
│                                                                       │
│  handleSubmit()                                                      │
│  ├─ Validar formulario                                               │
│  ├─ Construir payload                                                │
│  ├─ POST /api/v1/payments/create-checkout-session                   │
│  └─ window.location.href = data.checkout_url                        │
│                                                                       │
│  Success Page (/checkout/success?session_id=...)                     │
│  ├─ Obtener session_id de URL                                        │
│  ├─ Limpiar carrito con cart.clear()                                │
│  ├─ Mostrar confirmación ✓                                           │
│  └─ Botón: Volver a tienda                                           │
│                                                                       │
│  Cancel Page (/checkout/cancel)                                      │
│  ├─ Mostrar aviso de cancelación                                     │
│  ├─ Mantener carrito intacto                                         │
│  └─ Botones: Volver a checkout o Seguir comprando                   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌──────────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Go + Gin)                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  POST /api/v1/payments/create-checkout-session                       │
│  │                                                                    │
│  ├─ PaymentController.CreateCheckoutSession()                        │
│  │                                                                    │
│  ├─ 1. Validar Input ────────────────────────────────────────────    │
│  │   └─ Bind JSON & Validate                                         │
│  │                                                                    │
│  ├─ 2. Crear Orden ─────────────────────────────────────────────     │
│  │   ├─ Instantiate models.Order                                     │
│  │   ├─ Llenar CustomerEmail, CustomerName, CustomerPhone           │
│  │   ├─ Llenar ShippingDepartment, Municipality, Address             │
│  │   ├─ Llenar Subtotal, ShippingCost, Total                        │
│  │   ├─ Status = "pending"                                           │
│  │   └─ db.GormDB.Create(&order)                                    │
│  │                                                                    │
│  ├─ 3. Crear Order Items ─────────────────────────────────────────   │
│  │   ├─ Loop items[]                                                 │
│  │   ├─ Instantiate models.OrderItem                                 │
│  │   ├─ ProductID, Quantity, Price                                   │
│  │   └─ db.GormDB.Create(&orderItem)                               │
│  │                                                                    │
│  ├─ 4. Configurar Stripe ─────────────────────────────────────────   │
│  │   └─ stripe.Key = os.Getenv("STRIPE_SECRET_KEY")                │
│  │                                                                    │
│  ├─ 5. Crear Line Items ──────────────────────────────────────────   │
│  │   ├─ Loop items[] → stripe.CheckoutSessionLineItemParams         │
│  │   ├─ Convertir precios a centavos (* 100)                         │
│  │   ├─ Agregar shipping como line item                              │
│  │   └─ Retorna []*stripe.CheckoutSessionLineItemParams             │
│  │                                                                    │
│  ├─ 6. Construir URLs ────────────────────────────────────────────   │
│  │   ├─ successURL = FRONTEND_URL/checkout/success?session_id={...} │
│  │   └─ cancelURL = FRONTEND_URL/checkout/cancel                    │
│  │                                                                    │
│  ├─ 7. Crear Session ────────────────────────────────────────────    │
│  │   ├─ stripe.CheckoutSessionParams                                 │
│  │   ├─ PaymentMethodTypes: "card"                                   │
│  │   ├─ Mode: "payment"                                              │
│  │   ├─ Metadata: order_id, customer_email, customer_name            │
│  │   ├─ CustomerEmail                                                │
│  │   ├─ BillingAddressCollection: "auto"                            │
│  │   ├─ AllowPromotionCodes: false                                   │
│  │   └─ session.New(params)                                          │
│  │                                                                    │
│  ├─ 8. Actualizar Orden ──────────────────────────────────────────   │
│  │   ├─ order.PaymentIntentID = sess.ID                              │
│  │   └─ db.GormDB.Save(&order)                                      │
│  │                                                                    │
│  └─ 9. Retornar Response ────────────────────────────────────────    │
│      ├─ checkout_url: sess.URL                                       │
│      ├─ session_id: sess.ID                                          │
│      └─ order_id: order.ID                                           │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌──────────────────────────────────────────────────────────────────────┐
│                   STRIPE CHECKOUT (Hosted)                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Checkout Form                                                       │
│  ├─ Email: test@example.com                                          │
│  ├─ Card: 4242 4242 4242 4242                                       │
│  ├─ Exp: 12/25                                                       │
│  ├─ CVC: 123                                                         │
│  └─ Button: "Pay"                                                    │
│                                                                       │
│  Success → Redirige a successURL                                     │
│  Cancel  → Redirige a cancelURL                                      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌──────────────────────────────────────────────────────────────────────┐
│                      DATABASE (Supabase)                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Orders Table                                                        │
│  ├─ id: INT (PK)                                                     │
│  ├─ user_id: INT (FK) - NULL para guest checkout                     │
│  ├─ customer_email: VARCHAR                                          │
│  ├─ customer_name: VARCHAR                                           │
│  ├─ customer_phone: VARCHAR                                          │
│  ├─ shipping_department: VARCHAR                                     │
│  ├─ shipping_municipality: VARCHAR                                   │
│  ├─ shipping_address: VARCHAR                                        │
│  ├─ subtotal: DECIMAL                                                │
│  ├─ shipping_cost: DECIMAL                                           │
│  ├─ total: DECIMAL                                                   │
│  ├─ status: VARCHAR ('pending', 'paid', 'shipped', etc.)            │
│  ├─ payment_intent_id: VARCHAR (Stripe session ID)                  │
│  └─ created_at: TIMESTAMP                                            │
│                                                                       │
│  Order Items Table                                                   │
│  ├─ id: INT (PK)                                                     │
│  ├─ order_id: INT (FK)                                               │
│  ├─ product_id: INT (FK)                                             │
│  ├─ quantity: INT                                                    │
│  ├─ price: DECIMAL                                                   │
│  └─ created_at: TIMESTAMP                                            │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW DIAGRAM

```
┌────────────┐
│   User     │
│  Browser   │
└────┬───────┘
     │
     │ 1. Fill checkout form
     ↓
┌────────────────────┐
│  Checkout Page     │
│  handleSubmit()    │
│  Validate          │
└────┬───────────────┘
     │
     │ 2. POST JSON payload
     ↓
┌─────────────────────────────────────────┐
│  Backend API                             │
│  /api/v1/payments/create-checkout-session│
└────┬────────────────────────────────────┘
     │
     │ 3. Validate & Create DB records
     ↓
┌─────────────────────────────────────────┐
│  Supabase Database                       │
│  - Create Order (pending)                │
│  - Create OrderItems                     │
└────┬────────────────────────────────────┘
     │
     │ 4. Create Stripe Session
     ↓
┌─────────────────────────────────────────┐
│  Stripe API                              │
│  /v1/checkout/sessions                   │
│  Returns: session.URL, session.ID        │
└────┬────────────────────────────────────┘
     │
     │ 5. Return checkout_url to frontend
     ↓
┌────────────────────┐
│  Frontend          │
│  Redirect to       │
│  Stripe Checkout   │
└────┬───────────────┘
     │
     │ 6. window.location.href = checkout_url
     ↓
┌────────────────────────────────────────┐
│  Stripe Checkout (Hosted)               │
│  User pays with card                    │
└────┬───────────────────────────────────┘
     │
     │ 7a. Success OR 7b. Cancel
     ↓
┌──────────────────────────┬──────────────────────────┐
│  7a. Redirect to         │  7b. Redirect to         │
│  /checkout/success       │  /checkout/cancel        │
│  ?session_id={ID}        │                          │
└──────┬───────────────────┴──────┬───────────────────┘
       │                          │
       │                          │ Keep cart
       │ Clear cart               │
       │                          │
       ↓                          ↓
     Success                    Cancel
     Page                       Page
```

---

## 🔄 State Changes

```
Order Status Transitions:

pending ──[Payment Success]──> paid
    ↑         (Webhook)           │
    │                              │
    │                              ↓
    │                         shipped
    │                              │
    └──[Refund/Cancel]─────────────┘
```

---

## 📦 ENVIRONMENT VARIABLES

```
STRIPE_SECRET_KEY        → Backend authentication with Stripe API
STRIPE_PUBLISHABLE_KEY   → Frontend (for future use with Stripe.js)
STRIPE_WEBHOOK_SECRET    → Webhook verification (BLOQUE 2)
FRONTEND_URL             → For success/cancel redirects
```

---

## 🎯 KEY FEATURES

- ✅ Guest Checkout (sin requerimiento de login)
- ✅ Guest Validation (email, phone, address)
- ✅ Real-time Shipping Cost Calculation
- ✅ Order & OrderItems Creation
- ✅ Stripe Integration (Checkout Sessions)
- ✅ Success & Cancel Pages
- ✅ Cart Cleanup on Success
- ✅ Metadata Tracking (order_id in Stripe)

---

## 🔐 SECURITY MEASURES

- ✅ Secret key never exposed to frontend
- ✅ All validation on backend
- ✅ Stripe PCI compliance handled
- ✅ HTTPS enforced in production
- ✅ CORS configured appropriately
- ✅ Environment variables for secrets

---

**ARCHITECTURE COMPLETE** - Ready for webhook integration (BLOQUE 2)
