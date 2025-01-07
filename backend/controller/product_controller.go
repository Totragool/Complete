package controller

import (
	"net/http"
	"strconv"

	"Cart/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetProducts(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	var products []entity.Product
	if err := db.Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	c.JSON(http.StatusOK, products)
}

func GetProductDetails(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    id := c.Param("id")

    pID, err := strconv.ParseUint(id, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    var product entity.Product
    if err := db.Preload("Stock").
        Preload("Reviews").
        First(&product, pID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    // Calculate average rating
    var avgRating float64
    db.Model(&entity.Review{}).
        Select("COALESCE(AVG(rating), 0)").
        Where("product_id = ?", pID).
        Scan(&avgRating)
    product.AvgRating = avgRating

    c.JSON(http.StatusOK, product)
}

