// package controller

// import (
// 	"net/http"

// 	"github.com/gin-gonic/gin"
// 	"gorm.io/gorm"
// 	"Cart/entity"
//     "log"
// )

// // controller/cart.go
// func GetCart(c *gin.Context) {
//     db := c.MustGet("db").(*gorm.DB)
//     userID := c.Query("user_id")
    
//     if userID == "" {
//         c.JSON(400, gin.H{"error": "user_id is required"})
//         return
//     }
    
//     var cartItems []entity.CartItem
//     if err := db.Debug().
//         Preload("Product").
//         Joins("LEFT JOIN products ON cart_items.product_id = products.id").
//         Where("cart_items.user_id = ?", userID).
//         Find(&cartItems).Error; err != nil {
//         c.JSON(500, gin.H{"error": "Failed to fetch cart items"})
//         return
//     }

//     // Load stock for each product
//     for i, item := range cartItems {
//         var stock entity.Stock
//         if err := db.Where("product_id = ?", item.ProductID).First(&stock).Error; err != nil {
//             log.Printf("Warning: No stock found for product %d", item.ProductID)
//             continue
//         }
//         cartItems[i].Product.Stock = &stock
//     }
    
//     log.Printf("Returning cart items: %+v", cartItems)
//     c.JSON(200, cartItems)
// }


// func AddToCart(c *gin.Context) {
//     db := c.MustGet("db").(*gorm.DB)
    
//     var input struct {
//         UserID    string `json:"user_id" binding:"required"`
//         ProductID uint   `json:"product_id" binding:"required"`
//         Quantity  int    `json:"quantity" binding:"required"`
//     }
    
//     if err := c.ShouldBindJSON(&input); err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
//         return
//     }
    
//     // Verify product exists
//     var product entity.Product
//     if err := db.First(&product, input.ProductID).Error; err != nil {
//         c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
//         return
//     }
    
//     cartItem := entity.CartItem{
//         UserID:    input.UserID,
//         ProductID: input.ProductID,
//         Product:   product,  // Include the product
//         Quantity:  input.Quantity,
//     }
    
//     if err := db.Create(&cartItem).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
//         return
//     }
    
//     // Load the full cart item with product data
//     if err := db.Preload("Product").First(&cartItem, cartItem.ID).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load cart item"})
//         return
//     }
    
//     c.JSON(http.StatusOK, cartItem)
// }

// func UpdateCartItem(c *gin.Context) {
// 	db := c.MustGet("db").(*gorm.DB)
// 	id := c.Param("id")

// 	var cartItem entity.CartItem
// 	if err := db.First(&cartItem, id).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
// 		return
// 	}

// 	var updateData struct {
// 		Quantity int `json:"quantity"`
// 	}
// 	if err := c.BindJSON(&updateData); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
// 		return
// 	}

// 	if updateData.Quantity <= 0 {
// 		db.Delete(&cartItem)
// 		c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
// 		return
// 	}

// 	cartItem.Quantity = updateData.Quantity
// 	db.Save(&cartItem)
// 	c.JSON(http.StatusOK, cartItem)
// }

package controller

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "Cart/entity"
)

// GetCart ดึงข้อมูลตะกร้าสินค้า
func GetCart(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    userID := c.Query("user_id")
    
    var cartItems []entity.CartItem
    if err := db.Preload("Product").Preload("Stock").
        Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
        return
    }
    
    c.JSON(http.StatusOK, cartItems)
}

// AddToCart เพิ่มสินค้าลงตะกร้า
func AddToCart(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    var input struct {
        UserID    string `json:"user_id" binding:"required"`
        ProductID uint   `json:"product_id" binding:"required"`
        StockID   uint   `json:"stock_id" binding:"required"`
        Quantity  int    `json:"quantity" binding:"required,min=1"`
    }
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // เริ่ม transaction
    tx := db.Begin()
    
    // ตรวจสอบสต็อก
    var stock entity.Stock
    if err := tx.First(&stock, input.StockID).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
        return
    }
    
    if stock.Quantity < input.Quantity {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
        return
    }
    
    // สร้าง cart item
    cartItem := entity.CartItem{
        UserID:    input.UserID,
        ProductID: input.ProductID,
        StockID:   input.StockID,
        Quantity:  input.Quantity,
    }
    
    if err := tx.Create(&cartItem).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to cart"})
        return
    }
    
    tx.Commit()
    
    // ส่งกลับข้อมูลพร้อม product และ stock
    if err := db.Preload("Product").Preload("Stock").First(&cartItem, cartItem.ID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load cart item"})
        return
    }
    
    c.JSON(http.StatusCreated, cartItem)
}

// UpdateCartItem อัพเดตจำนวนสินค้าในตะกร้า
func UpdateCartItem(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    itemID := c.Param("id")
    
    var input struct {
        Quantity int `json:"quantity" binding:"required,min=0"`
    }
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    tx := db.Begin()
    
    var cartItem entity.CartItem
    if err := tx.First(&cartItem, itemID).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
        return
    }
    
    if input.Quantity == 0 {
        if err := tx.Delete(&cartItem).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item"})
            return
        }
        tx.Commit()
        c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
        return
    }
    
    var stock entity.Stock
    if err := tx.First(&stock, cartItem.StockID).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
        return
    }
    
    if stock.Quantity < input.Quantity {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
        return
    }
    
    cartItem.Quantity = input.Quantity
    if err := tx.Save(&cartItem).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
        return
    }
    
    tx.Commit()
    
    // ส่งกลับข้อมูลพร้อม product และ stock
    if err := db.Preload("Product").Preload("Stock").First(&cartItem, cartItem.ID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load cart item"})
        return
    }
    
    c.JSON(http.StatusOK, cartItem)
}

// DeleteCartItem ลบสินค้าออกจากตะกร้า
func DeleteCartItem(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    itemID := c.Param("id")

    // เริ่ม transaction
    tx := db.Begin()
    
    // ค้นหา cart item
    var cartItem entity.CartItem
    if err := tx.First(&cartItem, itemID).Error; err != nil {
        tx.Rollback()
        if err == gorm.ErrRecordNotFound {
            c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find cart item"})
        }
        return
    }
    
    // ลบ cart item
    if err := tx.Delete(&cartItem).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cart item"})
        return
    }

    // Commit transaction
    tx.Commit()
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Cart item deleted successfully",
        "deleted_item": cartItem,
    })
}