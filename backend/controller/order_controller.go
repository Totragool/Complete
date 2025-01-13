// // controller/order.go
// package controller

// import (
// 	"net/http"

// 	"github.com/gin-gonic/gin"
// 	"gorm.io/gorm"
// 	"Cart/entity"
//     "time"
// )


// func CreateOrder(c *gin.Context) {
//     db := c.MustGet("db").(*gorm.DB)
//     userID := c.Query("user_id")

//     tx := db.Begin()

//     // Fetch cart items with products and stock
//     var cartItems []entity.CartItem
//     if err := tx.Preload("Product").Preload("Product.Stock").
//         Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
//         tx.Rollback()
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart items"})
//         return
//     }

//     if len(cartItems) == 0 {
//         tx.Rollback()
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
//         return
//     }

//     // Create order
//     order := entity.Order{
//         UserID:     userID,
//         OrderDate:  time.Now(),
//         Status:     "Pending",
//         TotalPrice: 0,
//     }

//     if err := tx.Create(&order).Error; err != nil {
//         tx.Rollback()
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
//         return
//     }

//     // Process each cart item
//     for _, cartItem := range cartItems {
//         // Check stock
//         if cartItem.Product.Stock == nil || cartItem.Product.Stock.Quantity < cartItem.Quantity {
//             tx.Rollback()
//             c.JSON(http.StatusBadRequest, gin.H{
//                 "error": "Insufficient stock",
//                 "product": cartItem.Product.Name,
//             })
//             return
//         }

//         // Create order item
//         orderItem := cartItem.ToOrderItem(order.ID)
//         if err := tx.Create(&orderItem).Error; err != nil {
//             tx.Rollback()
//             c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order item"})
//             return
//         }

//         // Update stock
//         cartItem.Product.Stock.Quantity -= cartItem.Quantity
//         if cartItem.Product.Stock.Quantity <= cartItem.Product.Stock.MinQuantity {
//             cartItem.Product.Stock.Status = "Low Stock"
//         }
//         if cartItem.Product.Stock.Quantity == 0 {
//             cartItem.Product.Stock.Status = "Out of Stock"
//         }

//         if err := tx.Save(cartItem.Product.Stock).Error; err != nil {
//             tx.Rollback()
//             c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
//             return
//         }

//         order.TotalPrice += orderItem.TotalPrice
//     }

//     // Update order total
//     if err := tx.Save(&order).Error; err != nil {
//         tx.Rollback()
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order total"})
//         return
//     }

//     // Clear cart
//     if err := tx.Where("user_id = ?", userID).Delete(&entity.CartItem{}).Error; err != nil {
//         tx.Rollback()
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
//         return
//     }

//     tx.Commit()

//     // Return the complete order with items
//     var completeOrder entity.Order
//     db.Preload("OrderItems").Preload("OrderItems.Product").First(&completeOrder, order.ID)
//     c.JSON(http.StatusOK, completeOrder)
// }

// func GetOrders(c *gin.Context) {
//     db := c.MustGet("db").(*gorm.DB)
//     userID := c.Query("user_id")

//     var orders []entity.Order
//     if err := db.Preload("OrderItems").Preload("OrderItems.Product").
//         Where("user_id = ?", userID).
//         Order("created_at desc").
//         Find(&orders).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
//         return
//     }

//     c.JSON(http.StatusOK, orders)
// }

// package controller

// import (
//     "net/http"
//     "time"
//     "github.com/gin-gonic/gin"
//     "gorm.io/gorm"
//     "Cart/entity"
// )

// func CreateOrder(c *gin.Context) {
//     db := c.MustGet("db").(*gorm.DB)
//     userID := c.Query("user_id")

//     tx := db.Begin()

//     // Fetch cart items with products and stocks
//     var cartItems []entity.CartItem
//     if err := tx.Preload("Product").Preload("Product.Stocks").
//         Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
//         tx.Rollback()
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart items"})
//         return
//     }

//     if len(cartItems) == 0 {
//         tx.Rollback()
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
//         return
//     }

//     // Create order
//     order := entity.Order{
//         UserID:     userID,
//         OrderDate:  time.Now(),
//         Status:     "Pending",
//         TotalPrice: 0,
//     }

//     if err := tx.Create(&order).Error; err != nil {
//         tx.Rollback()
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
//         return
//     }

//     // Process each cart item
//     for _, cartItem := range cartItems {
//         // Check total available stock
//         availableStock := cartItem.Product.GetAvailableStock(cartItem.Quantity)
//         if availableStock == nil {
//             tx.Rollback()
//             c.JSON(http.StatusBadRequest, gin.H{
//                 "error": "Insufficient stock",
//                 "product": cartItem.Product.Name,
//             })
//             return
//         }

//         // Create order item
//         orderItem := cartItem.ToOrderItem(order.ID)
//         if err := tx.Create(&orderItem).Error; err != nil {
//             tx.Rollback()
//             c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order item"})
//             return
//         }

//         // Update stock
//         availableStock.Quantity -= cartItem.Quantity
//         if availableStock.Quantity <= availableStock.MinQuantity {
//             availableStock.Status = "Low Stock"
//         }
//         if availableStock.Quantity == 0 {
//             availableStock.Status = "Out of Stock"
//         }

//         if err := tx.Save(availableStock).Error; err != nil {
//             tx.Rollback()
//             c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
//             return
//         }

//         order.TotalPrice += orderItem.TotalPrice
//     }

//     // Update order total
//     if err := tx.Save(&order).Error; err != nil {
//         tx.Rollback()
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order total"})
//         return
//     }

//     // Clear cart
//     if err := tx.Where("user_id = ?", userID).Delete(&entity.CartItem{}).Error; err != nil {
//         tx.Rollback()
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
//         return
//     }

//     tx.Commit()

//     // Return the complete order with items
//     var completeOrder entity.Order
//     db.Preload("OrderItems").Preload("OrderItems.Product").First(&completeOrder, order.ID)
//     c.JSON(http.StatusOK, completeOrder)
// }

package controller

import (
    "net/http"
    "time"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "Cart/entity"
)

func CreateOrder(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    userID := c.Query("user_id")

    tx := db.Begin()

    // Fetch cart items with products and stocks
    var cartItems []entity.CartItem
    if err := tx.Preload("Product").Preload("Product.Stocks").
        Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart items"})
        return
    }

    if len(cartItems) == 0 {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
        return
    }

    // Create order
    order := entity.Order{
        UserID:     userID,
        OrderDate:  time.Now(),
        Status:     "Pending",
        TotalPrice: 0,
    }

    if err := tx.Create(&order).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
        return
    }

    // Process each cart item
    for _, cartItem := range cartItems {
        // Check total available stock
        availableStock := cartItem.Product.GetAvailableStock(cartItem.Quantity)
        if availableStock == nil {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "Insufficient stock",
                "product": cartItem.Product.Name,
            })
            return
        }

        // Create order item
        orderItem := cartItem.ToOrderItem(order.ID)
        if err := tx.Create(&orderItem).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order item"})
            return
        }

        // Update stock
        availableStock.Quantity -= cartItem.Quantity
        if err := tx.Save(availableStock).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
            return
        }

        order.TotalPrice += orderItem.TotalPrice
    }

    // Update order total
    if err := tx.Save(&order).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order total"})
        return
    }

    // Clear cart
    if err := tx.Where("user_id = ?", userID).Delete(&entity.CartItem{}).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
        return
    }

    tx.Commit()

    // Return the complete order with items
    var completeOrder entity.Order
    db.Preload("OrderItems").Preload("OrderItems.Product").First(&completeOrder, order.ID)
    c.JSON(http.StatusOK, completeOrder)
}

func GetOrders(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    userID := c.Query("user_id")

    var orders []entity.Order
    if err := db.Preload("OrderItems").Preload("OrderItems.Product").
        Where("user_id = ?", userID).
        Order("created_at desc").
        Find(&orders).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
        return
    }

    c.JSON(http.StatusOK, orders)
}