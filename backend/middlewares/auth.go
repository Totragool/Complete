// middleware/auth.go
// middleware/auth.go

package middleware

import (
    "Cart/entity"
    "Cart/services"
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

var jwtService = &services.JwtWrapper{
    SecretKey:       "your-secret-key",
    Issuer:          "your-app-name",
    ExpirationHours: 24,
}

func AuthRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }

        // Extract token from "Bearer <token>"
        tokenParts := strings.Split(authHeader, " ")
        if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
            c.Abort()
            return
        }

        claims, err := jwtService.ValidateToken(tokenParts[1])
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        // Get user from database
        db := c.MustGet("db").(*gorm.DB)
        var user entity.User
        if err := db.Where("email = ?", claims.Email).First(&user).Error; err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
            c.Abort()
            return
        }

        c.Set("user", &user)
        c.Next()
    }
}

func AdminOnly() gin.HandlerFunc {
    return func(c *gin.Context) {
        user, exists := c.Get("user")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            c.Abort()
            return
        }

        if u, ok := user.(*entity.User); !ok || u.Role != "admin" {
            c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
            c.Abort()
            return
        }

        c.Next()
    }
}