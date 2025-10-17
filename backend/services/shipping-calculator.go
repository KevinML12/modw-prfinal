// backend/services/shipping_calculator.go
package services

import (
	"strings"
	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
	"unicode"
)

// ShippingRules define la estructura para las reglas de negocio de envío.
// Esto nos permite encapsular la configuración y pasarla fácilmente al calculador.
type ShippingRules struct {
	LocalZones   []string
	Costs        struct {
		Local    float64
		National float64
	}
}

// shippingCalculator es un servicio para calcular los costos de envío.
// No se exporta (letra inicial minúscula) porque interactuaremos con él
// a través de la función pública CalculateShippingCost.
type shippingCalculator struct {
	rules ShippingRules
}

// newShippingCalculator inicializa el servicio con un conjunto de reglas.
func newShippingCalculator(rules ShippingRules) *shippingCalculator {
	// Normalizamos las zonas locales una sola vez al crear el servicio para optimizar.
	// Esto evita tener que normalizar la lista de zonas en cada cálculo.
	normalizedZones := make([]string, len(rules.LocalZones))
	for i, zone := range rules.LocalZones {
		normalizedZones[i] = normalizeString(zone)
	}
	rules.LocalZones = normalizedZones

	return &shippingCalculator{rules: rules}
}

// normalizeString limpia y estandariza un string para hacer comparaciones fiables.
// Elimina acentos, convierte a minúsculas y quita espacios extra.
// Ej: "  Huehuetenango  " -> "huehuetenango"
// Ej: "  Chiantlá " -> "chiantla"
func normalizeString(s string) string {
	// Transformación para remover diacríticos (acentos).
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	result, _, _ := transform.String(t, s)
	
	// Convierte a minúsculas y elimina espacios al inicio y al final.
	return strings.TrimSpace(strings.ToLower(result))
}

// Calculate determina el costo de envío para un destino dado.
func (sc *shippingCalculator) Calculate(destinationCity string) float64 {
	normalizedDestination := normalizeString(destinationCity)

	// Comprueba si el destino normalizado está en la lista de zonas locales.
	for _, localZone := range sc.rules.LocalZones {
		if normalizedDestination == localZone {
			return sc.rules.Costs.Local
		}
	}

	// Si no se encontró en las zonas locales, se aplica el costo nacional.
	return sc.rules.Costs.National
}

// CalculateShippingCost es la función pública que el resto de la aplicación usará.
// Encapsula la creación y uso del calculador.
func CalculateShippingCost(destinationCity string) float64 {
	// Aquí definimos las reglas de negocio para "Moda Orgánica",
	// reflejando la configuración del frontend.
	modaOrganicaRules := ShippingRules{
		LocalZones: []string{"chiantla", "huehuetenango"},
		Costs: struct {
			Local    float64
			National float64
		}{
			Local:    15.00,
			National: 35.00,
		},
	}

	// Creamos una instancia del calculador con las reglas específicas y calculamos el costo.
	calculator := newShippingCalculator(modaOrganicaRules)
	return calculator.Calculate(destinationCity)
}