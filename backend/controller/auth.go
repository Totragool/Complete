package controller

import (
    "Cart/config"
    "Cart/entity"
    "Cart/services"
    "net/http"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

type LoginPayload struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

type RegisterPayload struct {
    Email       string `json:"email" binding:"required,email"`
    Password    string `json:"password" binding:"required"`
    FirstName   string `json:"first_name" binding:"required"`
    LastName    string `json:"last_name" binding:"required"`
    PhoneNumber string `json:"phone_number" binding:"required,len=10"`
}

func Login(c *gin.Context) {
    var payload LoginPayload
    var user entity.Users

    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Get DB from context
    db := c.MustGet("db").(*gorm.DB)

    // Find user by email
    if err := db.Where("email = ?", payload.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
        return
    }

    // Verify password
    if !config.CheckPasswordHash([]byte(payload.Password), []byte(user.Password)) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
        return
    }

    // Generate JWT token
    jwtWrapper := services.JwtWrapper{
        SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
        Issuer:         "AuthService",
        ExpirationHours: 24,
    }

    signedToken, err := jwtWrapper.GenerateToken(user.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "token": signedToken,
        "user": gin.H{
            "id":        user.ID,
            "email":     user.Email,
            "firstName": user.FirstName,
            "lastName":  user.LastName,
        },
    })
}

func Register(c *gin.Context) {
    var payload RegisterPayload

    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Get DB from context
    db := c.MustGet("db").(*gorm.DB)

    // Check if user already exists
    var existingUser entity.Users
    if err := db.Where("email = ?", payload.Email).First(&existingUser).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
        return
    }

    // Hash password
    hashedPassword, err := config.HashPassword(payload.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
        return
    }

    // Create user
    user := entity.Users{
        Email:       payload.Email,
        Password:    hashedPassword,
        FirstName:   payload.FirstName,
        LastName:    payload.LastName,
        PhoneNumber: payload.PhoneNumber,
        Role:        "user", // Default role
    }

    if err := db.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "User registered successfully",
        "user": gin.H{
            "id":        user.ID,
            "email":     user.Email,
            "firstName": user.FirstName,
            "lastName":  user.LastName,
        },
    })
}