// package controller

// import (
// 	"net/http"
// 	"strconv"

// 	"Cart/entity"

// 	"github.com/gin-gonic/gin"
// 	"gorm.io/gorm"
// )

// func GetProducts(c *gin.Context) {
// 	db := c.MustGet("db").(*gorm.DB)
// 	var products []entity.Product
// 	if err := db.Find(&products).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, products)
// }

// func GetProductDetails(c *gin.Context) {
//     db := c.MustGet("db").(*gorm.DB)
//     id := c.Param("id")

//     pID, err := strconv.ParseUint(id, 10, 64)
//     if err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
//         return
//     }

//     var product entity.Product
//     if err := db.Preload("Stock").
//         Preload("Reviews").
//         First(&product, pID).Error; err != nil {
//         c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
//         return
//     }

//     // Calculate average rating
//     var avgRating float64
//     db.Model(&entity.Review{}).
//         Select("COALESCE(AVG(rating), 0)").
//         Where("product_id = ?", pID).
//         Scan(&avgRating)
//     product.AvgRating = avgRating

//     c.JSON(http.StatusOK, product)
// }

package controller

import (
	"Cart/entity"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetProducts ดึงรายการสินค้าทั้งหมด
func GetProducts(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    var products []entity.Product
    
    if err := db.Preload("Stocks").Find(&products).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
        return
    }
    
    c.JSON(http.StatusOK, products)
}

// GetProductDetails ดึงรายละเอียดสินค้า
func GetProductDetails(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    productID := c.Param("id")
    
    var product entity.Product
    if err := db.Preload("Stocks").Preload("Reviews").
        First(&product, productID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }
    
    c.JSON(http.StatusOK, product)
}

// SearchProducts ค้นหาสินค้า
func SearchProducts(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    query := c.Query("q")
    
    var products []entity.Product
    if err := db.Preload("Stocks").
        Where("name LIKE ? OR description LIKE ?", 
            "%"+query+"%", "%"+query+"%").
        Find(&products).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search products"})
        return
    }
    
    c.JSON(http.StatusOK, products)
}

// FilterProducts กรองสินค้าตามเงื่อนไข
func FilterProducts(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    minPrice := c.Query("min_price")
    maxPrice := c.Query("max_price")
    inStock := c.Query("in_stock")
    
    query := db.Preload("Stocks")
    
    if minPrice != "" {
        query = query.Where("price >= ?", minPrice)
    }
    
    if maxPrice != "" {
        query = query.Where("price <= ?", maxPrice)
    }
    
    if inStock == "true" {
        query = query.Joins("JOIN stocks ON stocks.product_id = products.id").
            Where("stocks.quantity > 0")
    }
    
    var products []entity.Product
    if err := query.Find(&products).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to filter products"})
        return
    }
    
    c.JSON(http.StatusOK, products)
}

func CreateProduct(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    
    var input struct {
        Name        string  `json:"name" binding:"required"`
        Price       float64 `json:"price" binding:"required,gt=0"`
        Description string  `json:"description"`
        Image       string  `json:"image"`
    }
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    product := entity.Product{
        Name:        input.Name,
        Price:       input.Price,
        Description: input.Description,
        Image:       input.Image,
    }
    
    if err := db.Create(&product).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
        return
    }
    
    c.JSON(http.StatusCreated, product)
}

// UpdateProduct updates an existing product
func UpdateProduct(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    productID := c.Param("id")
    
    var product entity.Product
    if err := db.First(&product, productID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }
    
    var input struct {
        Name        string  `json:"name"`
        Price       float64 `json:"price"`
        Description string  `json:"description"`
        Image       string  `json:"image"`
    }
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    updates := map[string]interface{}{}
    if input.Name != "" {
        updates["name"] = input.Name
    }
    if input.Price > 0 {
        updates["price"] = input.Price
    }
    if input.Description != "" {
        updates["description"] = input.Description
    }
    if input.Image != "" {
        updates["image"] = input.Image
    }
    
    if err := db.Model(&product).Updates(updates).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
        return
    }
    
    c.JSON(http.StatusOK, product)
}

// DeleteProduct deletes a product
func DeleteProduct(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    productID := c.Param("id")
    
    if err := db.Delete(&entity.Product{}, productID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// GetOrdersReport generates a report of orders
func GetOrdersReport(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    
    var report struct {
        TotalOrders int64   `json:"total_orders"`
        PendingOrders int64 `json:"pending_orders"`
        CompletedOrders int64 `json:"completed_orders"`
        RecentOrders []struct {
            ID uint `json:"id"`
            UserID string `json:"user_id"`
            TotalPrice float64 `json:"total_price"`
            Status string `json:"status"`
            OrderDate time.Time `json:"order_date"`
        } `json:"recent_orders"`
    }
    
    // Get total orders count
    db.Model(&entity.Order{}).Count(&report.TotalOrders)
    
    // Get pending orders count
    db.Model(&entity.Order{}).Where("status = ?", "Pending").Count(&report.PendingOrders)
    
    // Get completed orders count
    db.Model(&entity.Order{}).Where("status = ?", "Completed").Count(&report.CompletedOrders)
    
    // Get recent orders
    db.Model(&entity.Order{}).
        Order("created_at desc").
        Limit(10).
        Find(&report.RecentOrders)
    
    c.JSON(http.StatusOK, report)
}