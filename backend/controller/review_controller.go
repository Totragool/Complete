// controller/review.go
package controller

import (
    "net/http"
    "Cart/entity"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func CreateReview(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    
    var input struct {
        ProductID uint   `json:"product_id" binding:"required"`
        UserID    string `json:"user_id" binding:"required"`
        Rating    int    `json:"rating" binding:"required,min=1,max=5"`
        Comment   string `json:"comment" binding:"required"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check if product exists
    var product entity.Product
    if err := db.First(&product, input.ProductID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    review := entity.Review{
        ProductID: input.ProductID,
        UserID:    input.UserID,
        Rating:    input.Rating,
        Comment:   input.Comment,
    }

    if err := db.Create(&review).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // Load created review with product data
    db.Preload("Product").First(&review, review.ID)

    c.JSON(http.StatusCreated, review)
}

func GetProductReviews(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    productID := c.Param("id")

    var reviews []entity.Review
    if err := db.Where("product_id = ?", productID).
        Preload("Product").
        Order("created_at desc").
        Find(&reviews).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, reviews)
}


func GetProductDetails(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    id := c.Param("id")

    var product entity.Product
    if err := db.Preload("Stock").
        Preload("Reviews").  // Add this line
        First(&product, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    // Calculate average rating
    var avgRating float64
    db.Model(&entity.Review{}).
        Select("COALESCE(AVG(rating), 0)").
        Where("product_id = ?", id).
        Scan(&avgRating)
    product.AvgRating = avgRating

    c.JSON(http.StatusOK, product)
}