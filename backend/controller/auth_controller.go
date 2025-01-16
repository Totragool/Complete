// auth_controller.go
package controller

import (
    "net/http"
    "golang.org/x/crypto/bcrypt"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "Cart/entity"
    "Cart/services"
)

// LoginInput defines the structure for login requests
type LoginInput struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

// RegisterInput defines the structure for registration requests
type RegisterInput struct {
    Email     string `json:"email" binding:"required,email"`
    Password  string `json:"password" binding:"required,min=6"`
    FirstName string `json:"first_name" binding:"required"`
    LastName  string `json:"last_name" binding:"required"`
}

var (
    jwtService = &services.JwtWrapper{
        SecretKey:       "your-secret-key",
        Issuer:          "your-app-name",
        ExpirationHours: 24,
    }
)

// CheckPasswordHash compares password with hash
func CheckPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

// CreateToken generates a new JWT token
func CreateToken(user *entity.User) (string, error) {
    return jwtService.GenerateToken(user.Email)
}

// Login handles user authentication
func Login(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    var input LoginInput
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var user entity.User
    if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    if !CheckPasswordHash(input.Password, user.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    token, err := jwtService.GenerateToken(user.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "token": token,
        "user": user,
    })
}

// Register handles user registration
func Register(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    var input RegisterInput

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check if user already exists
    var existingUser entity.User
    if err := db.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
        return
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    user := entity.User{
        Email:     input.Email,
        Password:  string(hashedPassword),
        FirstName: input.FirstName,
        LastName:  input.LastName,
        Role:      "user", // Default role
    }

    if err := db.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "Registration successful",
        "user": map[string]interface{}{
            "id":         user.ID,
            "email":      user.Email,
            "first_name": user.FirstName,
            "last_name":  user.LastName,
        },
    })
}

// GetMe returns the current user's information
func GetMe(c *gin.Context) {
    user, exists := c.Get("user")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
        return
    }
    c.JSON(http.StatusOK, user)
}