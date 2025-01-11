package controller

import (
	"fmt"
	"net/http"

	"Cart/entity"
	"Cart/services"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func getUserFromToken(c *gin.Context) (string, error) {
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        return "", fmt.Errorf("no auth header")
    }

    tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
    
    jwtWrapper := services.JwtWrapper{
        SecretKey: "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
        Issuer:    "AuthService",
    }

    claims, err := jwtWrapper.ValidateToken(tokenString)
    if err != nil {
        return "", err
    }

    return claims.Email, nil
}

func GetCart(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    
    userEmail, err := getUserFromToken(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }
    
    var user entity.Users
    if err := db.Where("email = ?", userEmail).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
        return
    }
    
    var cartItems []entity.CartItem
    if err := db.Debug().
        Preload("Product").
        Joins("LEFT JOIN products ON cart_items.product_id = products.id").
        Where("cart_items.user_id = ?", user.ID).
        Find(&cartItems).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart items"})
        return
    }

    // Load stock for each product
    for i, item := range cartItems {
        var stock entity.Stock
        if err := db.Where("product_id = ?", item.ProductID).First(&stock).Error; err != nil {
            continue
        }
        cartItems[i].Product.Stock = &stock
    }
    
    c.JSON(http.StatusOK, cartItems)
}

func AddToCart(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    
    userEmail, err := getUserFromToken(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }
    
    var user entity.Users
    if err := db.Where("email = ?", userEmail).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
        return
    }
    
    var input struct {
        ProductID uint   `json:"product_id" binding:"required"`
        Quantity  int    `json:"quantity" binding:"required"`
    }
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // Verify product exists
    var product entity.Product
    if err := db.First(&product, input.ProductID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }
    
    cartItem := entity.CartItem{
        UserID:    fmt.Sprintf("%d", user.ID),
        ProductID: input.ProductID,
        Product:   product,
        Quantity:  input.Quantity,
    }
    
    if err := db.Create(&cartItem).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    if err := db.Preload("Product").First(&cartItem, cartItem.ID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load cart item"})
        return
    }
    
    c.JSON(http.StatusOK, cartItem)
}

func UpdateCartItem(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")

	var cartItem entity.CartItem
	if err := db.First(&cartItem, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	var updateData struct {
		Quantity int `json:"quantity"`
	}
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if updateData.Quantity <= 0 {
		db.Delete(&cartItem)
		c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
		return
	}

	cartItem.Quantity = updateData.Quantity
	db.Save(&cartItem)
	c.JSON(http.StatusOK, cartItem)
}

