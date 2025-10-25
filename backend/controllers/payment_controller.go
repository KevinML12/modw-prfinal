package controllers

import (
	"fmt"
	"net/http"
	"os"

	"moda-organica/backend/db"
	"moda-organica/backend/models"
	"moda-organica/backend/services"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/checkout/session"
)

// PaymentController maneja las operaciones de pago con Stripe
// y genera guías de envío con Cargo Expreso cuando aplica
type PaymentController struct {
	cargoExpresoService services.CargoExpresoService
}

// NewPaymentController crea una instancia con dependencias inyectadas
func NewPaymentController() *PaymentController {
	return &PaymentController{
		cargoExpresoService: services.NewCargoExpresoService(),
	}
}

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
		Address      string `json:"address"` // No required si es pickup
	} `json:"shipping_address" binding:"required"`

	// NUEVO: Tipo de entrega y opciones
	DeliveryType  string `json:"delivery_type" binding:"required,oneof=home_delivery pickup_at_branch"`
	PickupBranch  string `json:"pickup_branch"` // Required si delivery_type=pickup_at_branch
	DeliveryNotes string `json:"delivery_notes"`

	// NUEVO: Coordenadas de geolocalización (para entrega local con mapa)
	DeliveryLat *float64 `json:"delivery_lat"` // Latitud
	DeliveryLng *float64 `json:"delivery_lng"` // Longitud

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

	// 1.1 Validación adicional: si es pickup, no requiere dirección pero sí sucursal
	if input.DeliveryType == "pickup_at_branch" {
		if input.PickupBranch == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Sucursal de recogida es requerida para entrega en sucursal",
			})
			return
		}
	} else {
		// Si es home delivery, requiere dirección completa
		if input.ShippingAddress.Address == "" || len(input.ShippingAddress.Address) < 10 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Dirección completa es requerida para entrega a domicilio (mínimo 10 caracteres)",
			})
			return
		}
	}

	// 2. Crear orden pendiente en DB
	// Calcular costo de envío
	shippingCost := services.CalculateShippingCost(input.ShippingAddress.Municipality)
	requiresCourier := services.RequiresCargoExpreso(input.ShippingAddress.Municipality)
	shippingMethod := getShippingMethod(requiresCourier)

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

		// NUEVO: Tipo de entrega y opciones
		DeliveryType:  input.DeliveryType,
		PickupBranch:  input.PickupBranch,
		DeliveryNotes: input.DeliveryNotes,

		// NUEVO: Coordenadas de geolocalización (para entrega local)
		DeliveryLat: input.DeliveryLat,
		DeliveryLng: input.DeliveryLng,

		// Totales
		Subtotal:     input.Subtotal,
		ShippingCost: shippingCost,
		Total:        input.Subtotal + shippingCost,

		// Información de envío
		ShippingMethod:  shippingMethod,
		RequiresCourier: requiresCourier,

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

	// 8. SI REQUIERE CARGO EXPRESO: Generar guía de envío
	// NOTA: En producción con webhook, esto se ejecutará después del pago
	// Por ahora se genera inmediatamente (en modo mock)
	if requiresCourier {
		go func() {
			// Goroutine para no bloquear la respuesta HTTP
			ctrl.generateCargoExpresoGuide(&order)
		}()
	}

	// 9. Retornar URL de checkout
	c.JSON(http.StatusOK, gin.H{
		"checkout_url":     sess.URL,
		"session_id":       sess.ID,
		"order_id":         order.ID,
		"requires_courier": requiresCourier,
		"shipping_method":  shippingMethod,
		"shipping_cost":    shippingCost,
	})
}

// generateCargoExpresoGuide genera una guía de envío con Cargo Expreso
// Se ejecuta en una goroutine para no bloquear la respuesta HTTP
func (ctrl *PaymentController) generateCargoExpresoGuide(order *models.Order) {
	// Datos del remitente (Moda Orgánica) desde .env
	senderName := os.Getenv("CARGO_EXPRESO_SENDER_NAME")
	senderPhone := os.Getenv("CARGO_EXPRESO_SENDER_PHONE")
	senderAddress := os.Getenv("CARGO_EXPRESO_SENDER_ADDRESS")
	senderCity := os.Getenv("CARGO_EXPRESO_SENDER_CITY")

	// Validar que tenemos datos del remitente
	if senderName == "" || senderPhone == "" || senderAddress == "" {
		fmt.Printf("Advertencia: Datos del remitente de Cargo Expreso incompletos en .env\n")
		return
	}

	// Preparar request para Cargo Expreso
	request := services.CargoExpresoGuideRequest{
		// Remitente (Moda Orgánica)
		SenderName:    senderName,
		SenderPhone:   senderPhone,
		SenderAddress: senderAddress,
		SenderCity:    senderCity,

		// Destinatario (Cliente)
		RecipientName:    order.CustomerName,
		RecipientPhone:   order.CustomerPhone,
		RecipientAddress: order.ShippingAddress, // Vacío si es pickup
		RecipientCity:    order.ShippingMunicipality,

		// Datos del envío
		OrderID:       order.ID.String(), // Convertir UUID a string
		PackageType:   "caja_pequena",
		Weight:        1.0, // Default 1 libra (ajustar según productos)
		DeclaredValue: order.Total,
		Notes:         fmt.Sprintf("Orden numero %s - Moda Organica", order.ID.String()),

		// NUEVO: Tipo de entrega
		DeliveryType: order.DeliveryType,
		PickupBranch: order.PickupBranch,
	}

	// Llamar servicio de Cargo Expreso (mock o real según .env)
	response, err := ctrl.cargoExpresoService.CreateGuide(request)
	if err != nil {
		fmt.Printf("Error generando guia de Cargo Expreso: %v\n", err)
		return
	}

	if !response.Success {
		fmt.Printf("Cargo Expreso fallo: %s\n", response.ErrorMessage)
		return
	}

	// Actualizar orden con tracking number
	order.ShippingTracking = response.TrackingNumber
	order.CargoExpresoGuideURL = response.GuideURL
	order.Status = "processing" // Cambiar de pending a processing

	if err := db.GormDB.Save(order).Error; err != nil {
		fmt.Printf("Error actualizando orden con tracking: %v\n", err)
		return
	}

	fmt.Printf("Guia generada: %s para orden numero %d\n", response.TrackingNumber, order.ID)
}

// getShippingMethod determina el método de envío según si requiere courier
func getShippingMethod(requiresCourier bool) string {
	if requiresCourier {
		return "cargo_expreso"
	}
	return "local_delivery"
}
