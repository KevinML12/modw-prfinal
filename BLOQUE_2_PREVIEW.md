# BLOQUE 2 Preview: Stripe Webhook Integration

## Current Status
✅ BLOQUE 1 COMPLETE: Stripe Checkout Sessions + Cargo Expreso Integration
- Orders created automatically with shipping info
- Guides generated (mock or real)
- Ready to accept payments

🔄 BLOQUE 2 STARTING: Webhook Confirmation + Order Fulfillment
- Listen for payment success/failure
- Update order status
- Send emails
- Start fulfillment

---

## What BLOQUE 2 Needs

### 1. Stripe Webhook Endpoint
```go
POST /api/v1/webhooks/stripe
```

### 2. Webhook Handler Components

#### a) Signature Verification
- Verify request came from Stripe (not spoofed)
- Use Stripe signing secret from .env

#### b) Event Types to Handle
```
✅ checkout.session.completed → Order paid, send confirmation
✅ checkout.session.expired → Order cancelled if not paid
✅ payment_intent.succeeded → Final confirmation
✅ payment_intent.payment_failed → Payment failed notification
```

#### c) Database Updates
```
checkout.session.completed:
  - Order.Status: "pending" → "paid"
  - Order.StripePaymentID: (already set, just confirm)
  - Send confirmation email
  - Update inventory
  - Update Cargo Expreso (if needed)

payment_intent.payment_failed:
  - Order.Status: "pending" → "failed"
  - Send error email to customer
  - Keep guide generated (can retry)
```

### 3. Email Notifications
Send customer emails:
- Order confirmed (payment received)
- Shipping guide available (with tracking link)
- Fulfillment started

### 4. Inventory Management
- Decrease product stock when payment confirmed
- Track inventory levels
- Alert when low stock

---

## Estimated Implementation

### Files to Create:
1. `backend/handlers/webhook_handler.go` (80-100 lines)
   - Route: POST /api/v1/webhooks/stripe
   - Verify signature
   - Dispatch events

2. `backend/services/stripe_webhook_service.go` (150-200 lines)
   - Handle checkout.session.completed
   - Handle payment_intent.payment_failed
   - Database updates
   - Event logging

3. `backend/middleware/stripe_verify.go` (40-50 lines)
   - Signature verification logic
   - Error handling

4. `backend/services/email_service.go` (100-150 lines)
   - Send order confirmation
   - Send shipment notification
   - Send failure notification

### Files to Update:
1. `backend/main.go` - Add webhook route
2. `backend/models/order.go` - Add webhook audit fields (optional)

### Total: ~600 lines of code

---

## Environment Variables for BLOQUE 2

```bash
# Stripe Webhook
STRIPE_WEBHOOK_SECRET="whsec_..."  # From Stripe Dashboard
STRIPE_WEBHOOK_TIMEOUT=300         # Seconds to wait for payment

# Email Service
EMAIL_PROVIDER="sendgrid"          # or "resend", "mailgun"
EMAIL_API_KEY="..."
EMAIL_FROM="orders@moda-organica.com"
EMAIL_FROM_NAME="Moda Orgánica"

# Inventory
INVENTORY_TRACK=true               # Track stock levels
INVENTORY_LOW_ALERT=5              # Alert when below 5 units
```

---

## Testing BLOQUE 2

### Local Testing with Stripe CLI
```bash
# Install Stripe CLI
stripe login

# Forward webhook events locally
stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
```

### E2E Tests to Add
```
✅ Payment successful → Order status = "paid"
✅ Payment successful → Email sent
✅ Payment successful → Inventory decremented
✅ Payment failed → Order status = "failed"
✅ Payment failed → Email sent to customer
✅ Webhook signature invalid → Reject
```

---

## Architecture Diagram (BLOQUE 1 + 2)

```
┌─────────────────┐
│   Customer      │
│   (Browser)     │
└────────┬────────┘
         │
    ┌────▼───────────────────────────────┐
    │  Frontend                           │
    │  - Cart                             │
    │  - Checkout Form                    │
    │  - Shipping Calculator              │
    └────┬───────────────────────────────┘
         │
    ┌────▼──────────────────┐
    │  BLOQUE 1 ✅          │
    │  ┌──────────────────┐ │
    │  │ CREATE CHECKOUT  │ │
    │  │ - Stripe Session │ │
    │  │ - Calculate Ship │ │
    │  │ - Generate Guide │ │
    │  └──────────────────┘ │
    └────┬──────────────────┘
         │
    ┌────▼────────────────────┐
    │  Stripe Checkout        │
    │  (Customer pays)        │
    └────┬────────────────────┘
         │
    ┌────▼──────────────────┐
    │  BLOQUE 2 🔄          │
    │  ┌──────────────────┐ │
    │  │ WEBHOOK HANDLER  │ │
    │  │ - Verify Payment │ │
    │  │ - Update Order   │ │
    │  │ - Send Email     │ │
    │  │ - Update Stock   │ │
    │  └──────────────────┘ │
    └────┬──────────────────┘
         │
    ┌────▼──────────────────┐
    │  Order Fulfillment    │
    │  - Pick & Pack        │
    │  - Update Cargo       │
    │  - Send Notification  │
    └───────────────────────┘
```

---

## Quick Reference: What's Done vs What's Next

### ✅ Done (BLOQUE 1)
- [x] Stripe Checkout Sessions created
- [x] Shipping costs calculated (Q0 or Q36)
- [x] Cargo Expreso service (mock + real)
- [x] Order model with tracking fields
- [x] Payment controller with guide generation
- [x] E2E tests (7 payment tests)

### 🔄 Next (BLOQUE 2)
- [ ] Stripe webhook handler
- [ ] Event verification
- [ ] Order status updates
- [ ] Email notifications
- [ ] Inventory management
- [ ] Webhook E2E tests

---

## No Breaking Changes

The BLOQUE 1 implementation is **production-ready** and doesn't need changes for BLOQUE 2.

BLOQUE 2 simply adds:
- A new POST endpoint (`/api/v1/webhooks/stripe`)
- A new service layer (webhook handling)
- Email notifications
- Inventory updates

**The payment flow continues to work the same way.**

---

## Ready?

When you're ready for BLOQUE 2:
1. Say "Start BLOQUE 2: Webhook Integration"
2. I'll create the webhook handler
3. We'll add Stripe CLI testing
4. We'll verify end-to-end

Until then, current system is **✅ Complete and Ready to Test Locally**.
