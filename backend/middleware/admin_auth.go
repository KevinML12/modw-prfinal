package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AdminAuthMiddleware verifica que el usuario sea admin
// Valida JWT de Supabase y verifica rol 'admin' en claims
func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obtener token del header Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token de autenticación requerido",
			})
			c.Abort()
			return
		}

		// Formato: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Formato de token inválido. Usa: Authorization: Bearer <token>",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Validar JWT con el secret de Supabase
		jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
		if jwtSecret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "SUPABASE_JWT_SECRET no configurado",
			})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token inválido o expirado",
			})
			c.Abort()
			return
		}

		// Extraer claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Claims inválidos",
			})
			c.Abort()
			return
		}

		// Verificar que tenga rol 'admin'
		// NOTA: En Supabase, puedes agregar metadata al usuario o en custom claims
		role, _ := claims["role"].(string)
		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Acceso denegado. Se requiere rol de administrador.",
			})
			c.Abort()
			return
		}

		// Guardar user_id en el contexto para uso posterior
		userID, _ := claims["sub"].(string)
		c.Set("user_id", userID)
		c.Set("role", role)

		c.Next()
	}
}
