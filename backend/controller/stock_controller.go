package controller

import (

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"Cart/entity"
)


func GetProductStock(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    productID := c.Param("id")
    
    var stock entity.Stock
    if err := db.Where("product_id = ?", productID).First(&stock).Error; err != nil {
        c.JSON(404, gin.H{"error": "Stock not found"})
        return
    }
    
    c.JSON(200, &stock)  // Return pointer to match Product.Stock type
}

func UpdateStock(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    var stock entity.Stock
    
    if err := c.BindJSON(&stock); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    if err := db.Save(&stock).Error; err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, &stock)
}