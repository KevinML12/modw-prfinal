# Test Payment + Cargo Expreso Integration Locally

## Prerequisites

- Go installed (v1.18+)
- Node.js/pnpm installed
- `.env` file configured (see below)
- Stripe account with test API keys

---

## Setup .env File

Create or update `.env` in root directory:

```bash
# === DATABASE ===
DATABASE_URL="postgres://user:password@localhost:5432/moda_organica"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# === STRIPE ===
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# === CARGO EXPRESO (Mock Mode for Development) ===
CARGO_EXPRESO_MOCK=true
CARGO_EXPRESO_SENDER_NAME="Moda Orgánica"
CARGO_EXPRESO_SENDER_PHONE="7777-7777"
CARGO_EXPRESO_SENDER_ADDRESS="Calle Principal 123, Huehuetenango"
CARGO_EXPRESO_SENDER_CITY="Huehuetenango"

# === ENVIRONMENT ===
GIN_MODE=debug
NODE_ENV=development
```

---

## Start Development Environment

### Terminal 1: Frontend Dev Server

```bash
cd frontend
pnpm install  # First time only
pnpm dev
```

Expected output:
```
  VITE v5.0.0  ready in 123 ms
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Terminal 2: Backend Server

```bash
cd backend
go mod tidy  # First time only
go run main.go
```

Expected output:
```
[GIN-debug] Loaded Environment: Development
[GIN-debug] Loaded CORS config
OrderController inicializado exitosamente
Endpoint POST /api/v1/orders registrado exitosamente
Endpoint POST /api/v1/payments/create-checkout-session registrado exitosamente
Iniciando servidor en el puerto 8080...
```

### Terminal 3: Playwright Tests

```bash
cd frontend
pnpm playwright test payment.spec.ts --headed
```

---

## Manual Testing via Browser

### 1. Test Payment Flow

1. Go to http://localhost:5173/
2. Browse products
3. Add items to cart
4. Go to checkout
5. Fill shipping info:
   - **For FREE shipping**: Huehuetenango + Chiantla
   - **For Q36 shipping**: Any other municipality
6. Fill customer info (name, email, phone)
7. Click "Pagar" (pay)
8. You'll be redirected to Stripe test page

### 2. Stripe Test Payment

Use these Stripe test credentials:

| Field | Value |
|-------|-------|
| Card | 4242 4242 4242 4242 |
| Expiry | Any future date (e.g., 12/25) |
| CVC | Any 3 digits (e.g., 123) |
| Zip | Any value (e.g., 12345) |

### 3. Verify Order in Database

After successful payment:

```sql
-- Connect to database
SELECT id, customer_email, status, shipping_method, shipping_tracking, requires_courier
FROM orders
ORDER BY created_at DESC
LIMIT 1;
```

Expected:
- `status`: "processing" (Cargo Expreso guide generated)
- `shipping_method`: "cargo_expreso" or "local_delivery"
- `shipping_tracking`: "CE-2025-XXXXXX" (fake tracking in mock mode)
- `requires_courier`: true/false

### 4. Check Logs for Guide Generation

In Terminal 2 backend, you should see:

```
Guia generada: CE-2025-456789 para orden numero f47ac10b-58cc-4372-a567-0e02b2c3d479
```

---

## Automated E2E Tests

### Run All Payment Tests

```bash
cd frontend
pnpm playwright test payment.spec.ts checkout.spec.ts
```

### Run Specific Test

```bash
pnpm playwright test --grep "should handle valid payment session"
```

### Run with Debug Mode

```bash
pnpm playwright test payment.spec.ts --debug
```

### Run with Video Recording

```bash
pnpm playwright test payment.spec.ts --headed --video=on
```

---

## Test Scenarios

### Scenario 1: Local Delivery (Free)
```
Municipality: Huehuetenango
Expected Shipping: Q0.00
Expected Cargo: No (local_delivery)
Expected Tracking: None
```

### Scenario 2: National Delivery (Cargo Expreso)
```
Municipality: La Antigua Guatemala
Expected Shipping: Q36.00
Expected Cargo: Yes (cargo_expreso)
Expected Tracking: CE-2025-XXXXXX (in mock mode)
```

### Scenario 3: Chiantla Local
```
Municipality: Chiantla
Expected Shipping: Q0.00
Expected Cargo: No (local_delivery)
Expected Tracking: None
```

---

## Debugging

### Check Frontend Communication

Open browser console (F12) and check Network tab when clicking "Pagar":

```
POST /api/v1/payments/create-checkout-session
Status: 200
Response: {
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_...",
  "order_id": "...",
  "requires_courier": true,
  "shipping_method": "cargo_expreso",
  "shipping_cost": 36
}
```

### Check Backend Logs

When order created, backend should show:
```
[GIN] POST /api/v1/payments/create-checkout-session
Cargo Expreso Service started in MOCK MODE
Guia generada: CE-2025-123456 para orden numero ...
[200] POST /api/v1/payments/create-checkout-session (234.5ms)
```

### Check Database

```bash
# Connect to Supabase database
psql postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# View latest orders
SELECT id, customer_email, status, shipping_tracking, requires_courier FROM orders ORDER BY created_at DESC LIMIT 5;
```

---

## Troubleshooting

### Problem: "Error creating Stripe session"

**Solution**: Check that `STRIPE_SECRET_KEY` is set in `.env`

```bash
echo $STRIPE_SECRET_KEY  # Should show sk_test_...
```

### Problem: "Error generando guia de Cargo Expreso"

**Solution**: Check that .env has Cargo Expreso sender info:

```bash
echo $CARGO_EXPRESO_SENDER_NAME      # Should show "Moda Orgánica"
echo $CARGO_EXPRESO_SENDER_PHONE     # Should show phone
echo $CARGO_EXPRESO_SENDER_ADDRESS   # Should show address
echo $CARGO_EXPRESO_SENDER_CITY      # Should show city
```

### Problem: Tests fail with "net::ERR_NAME_NOT_RESOLVED"

**Solution**: Make sure you have 2 terminals running (frontend + backend):

```bash
# Terminal 1
cd frontend && pnpm dev  # Must be running on port 5173

# Terminal 2
cd backend && go run main.go  # Must be running on port 8080
```

### Problem: Orders not appearing in database

**Solution**: Check database connection:

```bash
# In backend logs, look for:
"Modelos migrados exitosamente"  # Should appear on startup

# Check migrations ran:
SELECT * FROM "order";  # If empty, migrations worked, no orders yet
```

---

## Test Checklist

- [ ] Terminal 1 (frontend): `pnpm dev` running, http://localhost:5173 accessible
- [ ] Terminal 2 (backend): `go run main.go` running, port 8080 accessible
- [ ] `.env` file exists with Stripe and Cargo Expreso settings
- [ ] Can add items to cart
- [ ] Shipping calculator shows Q0 for Huehuetenango, Q36 for others
- [ ] Can complete checkout form
- [ ] Stripe test payment succeeds (use card 4242 4242 4242 4242)
- [ ] Backend logs show "Guia generada: CE-..."
- [ ] Database shows new order with shipping_tracking
- [ ] Playwright tests pass: `pnpm playwright test payment.spec.ts`

---

## Next: Stripe Webhook Testing

Once payment works, BLOQUE 2 adds webhook verification:

```bash
# Install Stripe CLI (https://stripe.com/docs/stripe-cli)
brew install stripe/stripe-cli/stripe  # Mac
# or choco install stripe-cli          # Windows

# Authenticate
stripe login

# Forward webhook events to local backend
stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe

# In another terminal, trigger test events
stripe trigger checkout.session.completed
```

---

## Ready?

Run this command to verify everything works:

```bash
cd frontend && pnpm playwright test payment.spec.ts --headed --reporter=verbose
```

If tests pass: ✅ **Payment + Cargo Expreso integration is working!**

---

## Production Checklist (Future)

- [ ] Set `CARGO_EXPRESO_MOCK=false` in production .env
- [ ] Configure n8n webhook URL
- [ ] Set real Stripe keys (not test keys)
- [ ] Enable Stripe webhook signature verification
- [ ] Setup email service (SendGrid, Resend, Mailgun)
- [ ] Configure backups
- [ ] Setup monitoring/alerts
- [ ] Load test with k6 or similar
