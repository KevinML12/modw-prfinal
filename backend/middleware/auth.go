package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthRequired middleware para rutas que requieren autenticación
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header requerido",
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Formato de token inválido. Use: Bearer <token>",
			})
			c.Abort()
			return
		}

		// Para desarrollo: simplemente verificar que hay token
		// En producción, validar JWT con la librería correspondiente
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token inválido",
			})
			c.Abort()
			return
		}

		// Guardar el token en contexto para usar después si es necesario
		// En producción, aquí iría la validación y extracción de claims
		c.Set("user_token", tokenString)
		c.Set("user_id", "user-placeholder") // Placeholder hasta implementar validación JWT

		c.Next()
	}
}

// AdminRequired middleware que requiere que el usuario sea admin
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		AuthRequired()(c)

		if c.IsAborted() {
			return
		}

		role, exists := c.Get("user_role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Acceso denegado. Se requieren permisos de administrador.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
