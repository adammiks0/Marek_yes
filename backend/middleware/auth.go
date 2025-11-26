package middleware

import (
	config "backend/init"
	"backend/jwt"
	"backend/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware - middleware do weryfikacji JWT
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Sprawdź format "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		token := parts[1]

		// Weryfikuj token i pobierz userID
		userID, err := jwt.VerifyToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Zapisz userID w kontekście
		c.Set("userID", int(userID))
		c.Next()
	}
}

// AdminMiddleware - middleware do weryfikacji admina
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		// Jeśli ID = 0, traktujemy jako konto admina
		if userID == 0 {
			c.Next()
			return
		}

		// Pobierz użytkownika z bazy danych
		var user models.User
		if err := config.DB.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// Sprawdź czy użytkownik to admin (name, lastname i email muszą być "admin")
		if user.Name != "admin" || user.Lastname != "admin" || user.Email != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}
