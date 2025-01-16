// package controller

// import (

// 	"github.com/gin-gonic/gin"
// 	"gorm.io/gorm"
// 	"Cart/entity"
// )


// func GetProductStock(c *gin.Context) {
//     db := c.MustGet("db").(*gorm.DB)
//     productID := c.Param("id")
    
//     var stock entity.Stock
//     if err := db.Where("product_id = ?", productID).First(&stock).Error; err != nil {
//         c.JSON(404, gin.H{"error": "Stock not found"})
//         return
//     }
    
//     c.JSON(200, &stock)  // Return pointer to match Product.Stock type
// }

// func UpdateStock(c *gin.Context) {
//     db := c.MustGet("db").(*gorm.DB)
//     var stock entity.Stock
    
//     if err := c.BindJSON(&stock); err != nil {
//         c.JSON(400, gin.H{"error": err.Error()})
//         return
//     }
    
//     if err := db.Save(&stock).Error; err != nil {
//         c.JSON(500, gin.H{"error": err.Error()})
//         return
//     }
    
//     c.JSON(200, &stock)
// }

package controller

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "Cart/entity"
)

// GetProductStocks ดึงข้อมูล stocks ทั้งหมดของสินค้า
func GetProductStocks(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    productID := c.Param("id")
    
    var stocks []entity.Stock
    if err := db.Where("product_id = ?", productID).
        Order("CASE status " +
            "WHEN 'In Stock' THEN 1 " +
            "WHEN 'Low Stock' THEN 2 " +
            "WHEN 'Out of Stock' THEN 3 END").
        Find(&stocks).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stocks"})
        return
    }

    // รวมข้อมูลสำหรับ frontend
    var response []gin.H
    for _, stock := range stocks {
        response = append(response, gin.H{
            "id": stock.ID,
            "color": stock.Color,
            "size": stock.Size,
            "quantity": stock.Quantity,
            "status": stock.Status,
            "canAddToCart": stock.Quantity > 0,
            "lowStock": stock.Quantity <= stock.MinQuantity && stock.Quantity > 0,
        })
    }
    
    c.JSON(http.StatusOK, response)
}

// UpdateStock อัพเดตข้อมูล stock
func UpdateStock(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    stockID := c.Param("id")
    
    var stock entity.Stock
    if err := db.First(&stock, stockID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
        return
    }
    
    var input struct {
        Quantity int `json:"quantity" binding:"required,min=0"`
    }
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // อัพเดตจำนวนและสถานะ
    stock.Quantity = input.Quantity
    stock.UpdateStatus()
    
    if err := db.Save(&stock).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
        return
    }
    
    c.JSON(http.StatusOK, stock)
}

// CreateStock สร้าง stock ใหม่
func CreateStock(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    var input struct {
        ProductID   uint   `json:"product_id" binding:"required"`
        Color       string `json:"color" binding:"required"`
        Size        string `json:"size" binding:"required"`
        Quantity    int    `json:"quantity" binding:"required,min=0"`
        MinQuantity int    `json:"min_quantity" binding:"required,min=1"`
    }
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    stock := entity.Stock{
        ProductID: input.ProductID,
        Color: input.Color,
        Size: input.Size,
        Quantity: input.Quantity,
        MinQuantity: input.MinQuantity,
    }
    
    stock.UpdateStatus()
    
    if err := db.Create(&stock).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stock"})
        return
    }
    
    c.JSON(http.StatusCreated, stock)
}

// DeleteStock ลบ stock
func DeleteStock(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    stockID := c.Param("id")
    
    if err := db.Delete(&entity.Stock{}, stockID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stock"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "Stock deleted successfully"})
}