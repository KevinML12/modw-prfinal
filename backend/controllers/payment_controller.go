package controllers

import (
	"fmt"
	"net/http"
	"os"

	"moda-organica/backend/db"
	"moda-organica/backend/models"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/checkout/session"
)

// PaymentController maneja las operaciones de pago con Stripe
type PaymentController struct{}

/**
 * CreateCheckoutSessionInput - Estructura de entrada para crear sesión de checkout
 */
type CreateCheckoutSessionInput struct {
	// Datos del cliente (para guest checkout)
	CustomerEmail string `json:"customer_email" binding:"required,email"`
	CustomerName  string `json:"customer_name" binding:"required"`
	CustomerPhone string `json:"customer_phone" binding:"required"`

	// Dirección de envío
	ShippingAddress struct {
		Department   string `json:"department" binding:"required"`
		Municipality string `json:"municipality" binding:"required"`
		Address      string `json:"address" binding:"required"`
	} `json:"shipping_address" binding:"required"`

	// Items del carrito
	Items []struct {
		ProductID uint    `json:"product_id" binding:"required"`
		Name      string  `json:"name" binding:"required"`
		Price     float64 `json:"price" binding:"required,gt=0"`
		Quantity  int     `json:"quantity" binding:"required,gt=0"`
		ImageURL  string  `json:"image_url"`
	} `json:"items" binding:"required,min=1"`

	// Costos
	Subtotal     float64 `json:"subtotal" binding:"required,gt=0"`
	ShippingCost float64 `json:"shipping_cost" binding:"gte=0"`
	Total        float64 `json:"total" binding:"required,gt=0"`
}

/**
 * CreateCheckoutSession - Crea una Stripe Checkout Session
 *
 * POST /api/v1/payments/create-checkout-session
 *
 * Flow:
 * 1. Validar input
 * 2. Crear orden pendiente en DB (status: 'pending')
 * 3. Crear line items para Stripe
 * 4. Crear Checkout Session con metadata de la orden
 * 5. Retornar URL de checkout y order_id
 */
func (ctrl *PaymentController) CreateCheckoutSession(c *gin.Context) {
	var input CreateCheckoutSessionInput

	// 1. Validar input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Datos inválidos: " + err.Error(),
		})
		return
	}

	// 2. Crear orden pendiente en DB
	order := models.Order{
		// Guest checkout (user_id = null)
		UserID: nil,

		// Datos del cliente
		CustomerEmail: input.CustomerEmail,
		CustomerName:  input.CustomerName,
		CustomerPhone: input.CustomerPhone,

		// Dirección de envío
		ShippingDepartment:   input.ShippingAddress.Department,
		ShippingMunicipality: input.ShippingAddress.Municipality,
		ShippingAddress:      input.ShippingAddress.Address,

		// Totales
		Subtotal:     input.Subtotal,
		ShippingCost: input.ShippingCost,
		Total:        input.Total,

		// Estado inicial
		Status: "pending", // Cambiará a 'paid' cuando Stripe confirme
	}

	// Crear orden en DB
	if err := db.GormDB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error creando orden en base de datos",
		})
		return
	}

	// Crear OrderItems
	for _, item := range input.Items {
		orderItem := models.OrderItem{
			OrderID:   order.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		}
		if err := db.GormDB.Create(&orderItem).Error; err != nil {
			// Rollback de orden si falla
			db.GormDB.Delete(&order)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error creando items de orden",
			})
			return
		}
	}

	// 3. Configurar Stripe API Key
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// 4. Crear line items para Stripe
	var lineItems []*stripe.CheckoutSessionLineItemParams
	for _, item := range input.Items {
		// Stripe maneja precios en centavos (multiply by 100)
		priceInCents := int64(item.Price * 100)

		lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: stripe.String("gtq"), // Quetzales guatemaltecos
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name:        stripe.String(item.Name),
					Description: stripe.String(fmt.Sprintf("Producto ID: %d", item.ProductID)),
					Images:      []*string{stripe.String(item.ImageURL)},
				},
				UnitAmount: stripe.Int64(priceInCents),
			},
			Quantity: stripe.Int64(int64(item.Quantity)),
		})
	}

	// Agregar shipping como line item si es mayor a 0
	if input.ShippingCost > 0 {
		shippingInCents := int64(input.ShippingCost * 100)
		lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: stripe.String("gtq"),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name:        stripe.String("Envío a " + input.ShippingAddress.Municipality),
					Description: stripe.String("Costo de envío"),
				},
				UnitAmount: stripe.Int64(shippingInCents),
			},
			Quantity: stripe.Int64(1),
		})
	}

	// 5. URLs de éxito y cancelación
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173" // Default para desarrollo
	}

	successURL := fmt.Sprintf("%s/checkout/success?session_id={CHECKOUT_SESSION_ID}", frontendURL)
	cancelURL := fmt.Sprintf("%s/checkout/cancel", frontendURL)

	// 6. Crear Checkout Session
	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card", // Tarjetas de crédito/débito
		}),
		LineItems:  lineItems,
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),

		// Metadata para vincular con nuestra orden
		Metadata: map[string]string{
			"order_id":       fmt.Sprintf("%d", order.ID),
			"customer_email": input.CustomerEmail,
			"customer_name":  input.CustomerName,
		},

		// Información del cliente
		CustomerEmail: stripe.String(input.CustomerEmail),

		// Permitir códigos promocionales (opcional)
		AllowPromotionCodes: stripe.Bool(false),

		// Configuración de facturación
		BillingAddressCollection: stripe.String("auto"),
	}

	sess, err := session.New(params)
	if err != nil {
		// Si falla Stripe, no eliminar la orden (queda como pending)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error creando sesión de pago con Stripe: " + err.Error(),
		})
		return
	}

	// 7. Actualizar orden con Stripe Session ID
	order.PaymentIntentID = sess.ID
	db.GormDB.Save(&order)

	// 8. Retornar URL de checkout
	c.JSON(http.StatusOK, gin.H{
		"checkout_url": sess.URL,
		"session_id":   sess.ID,
		"order_id":     order.ID,
	})
}
