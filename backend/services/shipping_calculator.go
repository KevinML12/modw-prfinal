package services

import (
	"strings"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

// ShippingRules define las reglas de negocio para cálculo de envío
type ShippingRules struct {
	LocalZones []string // Municipios con entrega local gratuita
	Costs      struct {
		Local        float64 // Entrega local GRATIS (Huehue/Chiantla)
		CargoExpreso float64 // Cargo Expreso (resto del país)
	}
}

type shippingCalculator struct {
	rules ShippingRules
}

func newShippingCalculator(rules ShippingRules) *shippingCalculator {
	return &shippingCalculator{rules: rules}
}

// normalizeString normaliza cadena para comparaciones
func normalizeString(s string) string {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	result, _, _ := transform.String(t, s)
	result = strings.ToLower(result)
	result = strings.TrimSpace(result)
	return result
}

// Calculate determina el costo de envío para un destino dado
func (sc *shippingCalculator) Calculate(destinationCity string) float64 {
	normalized := normalizeString(destinationCity)

	// Verificar si es zona local (Huehue/Chiantla) -> GRATIS
	for _, zone := range sc.rules.LocalZones {
		normalizedZone := normalizeString(zone)
		if strings.Contains(normalized, normalizedZone) {
			return sc.rules.Costs.Local // Q0.00
		}
	}

	// Resto del país: Cargo Expreso
	return sc.rules.Costs.CargoExpreso // Q36.00
}

// CalculateShippingCost - Función pública (usada por controllers)
func CalculateShippingCost(destinationCity string) float64 {
	rules := ShippingRules{
		LocalZones: []string{"chiantla", "huehuetenango"},
		Costs: struct {
			Local        float64
			CargoExpreso float64
		}{
			Local:        0.00,  // GRATIS para Huehue/Chiantla
			CargoExpreso: 36.00, // Cargo Expreso nacional
		},
	}

	calculator := newShippingCalculator(rules)
	return calculator.Calculate(destinationCity)
}

// RequiresCargoExpreso - Determina si un envío necesita Cargo Expreso
func RequiresCargoExpreso(destinationCity string) bool {
	normalized := normalizeString(destinationCity)
	localZones := []string{"chiantla", "huehuetenango"}

	// Si es zona local, NO requiere Cargo Expreso
	for _, zone := range localZones {
		normalizedZone := normalizeString(zone)
		if strings.Contains(normalized, normalizedZone) {
			return false
		}
	}

	// Resto del país SI requiere Cargo Expreso
	return true
}

// IsLocalDelivery - Verifica si el destino es zona local
func IsLocalDelivery(destinationCity string) bool {
	return !RequiresCargoExpreso(destinationCity)
}
