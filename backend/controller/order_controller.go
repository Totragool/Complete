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

package controller

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "Cart/entity"
    "time"
)

// CreateOrder สร้าง order จากตะกร้าสินค้า
func CreateOrder(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    userID := c.Query("user_id")
    
    tx := db.Begin()
    
    // ดึงข้อมูลตะกร้า
    var cartItems []entity.CartItem
    if err := tx.Preload("Product").Preload("Stock").
        Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
        return
    }
    
    if len(cartItems) == 0 {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
        return
    }
    
    // สร้าง order
    order := entity.Order{
        UserID:    userID,
        OrderDate: time.Now(),
        Status:    "Pending",
    }
    
    if err := tx.Create(&order).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
        return
    }
    
    // สร้าง order items และอัพเดตสต็อก
    var totalAmount float64
    for _, item := range cartItems {
        // ตรวจสอบสต็อกอีกครั้ง
        var stock entity.Stock
        if err := tx.First(&stock, item.StockID).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
            return
        }
        
        if stock.Quantity < item.Quantity {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "Insufficient stock",
                "product": item.Product.Name,
            })
            return
        }
        
        // สร้าง order item
        orderItem := entity.OrderItem{
            OrderID:    order.ID,
            ProductID:  item.ProductID,
            StockID:    item.StockID,
            Quantity:   item.Quantity,
            UnitPrice:  item.Product.Price,
            TotalPrice: item.Product.Price * float64(item.Quantity),
        }
        
        if err := tx.Create(&orderItem).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order item"})
            return
        }
        
        // อัพเดตสต็อก
        stock.Quantity -= item.Quantity
        stock.UpdateStatus()
        if err := tx.Save(&stock).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
            return
        }
        
        totalAmount += orderItem.TotalPrice
    }
    
    // อัพเดตยอดรวม order
    order.TotalPrice = totalAmount
    if err := tx.Save(&order).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order total"})
        return
    }
    
    // ลบตะกร้า
    if err := tx.Delete(&entity.CartItem{}, "user_id = ?", userID).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
        return
    }
    
    tx.Commit()
    
    // ส่งกลับข้อมูล order ทั้งหมด
    var completeOrder entity.Order
    if err := db.Preload("OrderItems.Product").Preload("OrderItems.Stock").
        First(&completeOrder, order.ID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load complete order"})
        return
    }
    
    c.JSON(http.StatusCreated, completeOrder)
}

// GetOrders ดึงประวัติการสั่งซื้อ
func GetOrders(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    userID := c.Query("user_id")
    
    var orders []entity.Order
    if err := db.Preload("OrderItems.Product").Preload("OrderItems.Stock").
        Where("user_id = ?", userID).
        Order("created_at desc").Find(&orders).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
        return
    }
    c.JSON(http.StatusOK, orders)
}

// GetOrderDetails ดึงรายละเอียดคำสั่งซื้อ
func GetOrderDetails(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    orderID := c.Param("id")
    
    var order entity.Order
    if err := db.Preload("OrderItems.Product").Preload("OrderItems.Stock").
        First(&order, orderID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
        return
    }
    
    c.JSON(http.StatusOK, order)
}

// UpdateOrderStatus อัพเดตสถานะคำสั่งซื้อ
func UpdateOrderStatus(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    orderID := c.Param("id")
    
    var input struct {
        Status string `json:"status" binding:"required"`
    }
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    var order entity.Order
    if err := db.First(&order, orderID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
        return
    }
    
    order.Status = input.Status
    if err := db.Save(&order).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
        return
    }
    
    c.JSON(http.StatusOK, order)
}