package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"Cart/entity"
    "log"
)

// controller/cart.go
func GetCart(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    userID := c.Query("user_id")
    
    if userID == "" {
        c.JSON(400, gin.H{"error": "user_id is required"})
        return
    }
    
    var cartItems []entity.CartItem
    if err := db.Debug().
        Preload("Product").
        Joins("LEFT JOIN products ON cart_items.product_id = products.id").
        Where("cart_items.user_id = ?", userID).
        Find(&cartItems).Error; err != nil {
        c.JSON(500, gin.H{"error": "Failed to fetch cart items"})
        return
    }

    // Load stock for each product
    for i, item := range cartItems {
        var stock entity.Stock
        if err := db.Where("product_id = ?", item.ProductID).First(&stock).Error; err != nil {
            log.Printf("Warning: No stock found for product %d", item.ProductID)
            continue
        }
        cartItems[i].Product.Stock = &stock
    }
    
    log.Printf("Returning cart items: %+v", cartItems)
    c.JSON(200, cartItems)
}


func AddToCart(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    
    var input struct {
        UserID    string `json:"user_id" binding:"required"`
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
        UserID:    input.UserID,
        ProductID: input.ProductID,
        Product:   product,  // Include the product
        Quantity:  input.Quantity,
    }
    
    if err := db.Create(&cartItem).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    // Load the full cart item with product data
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

