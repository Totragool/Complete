package controller

import (
    "Cart/entity"
    "net/http"
    "strconv"
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

    // Update product average rating
    var avgRating float64
    db.Model(&entity.Review{}).
        Where("product_id = ?", input.ProductID).
        Select("COALESCE(AVG(rating), 0)").
        Scan(&avgRating)

    db.Model(&entity.Product{}).
        Where("id = ?", input.ProductID).
        Update("avg_rating", avgRating)

    c.JSON(http.StatusCreated, review)
}

func GetProductReviews(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    productID := c.Param("id")

    pID, err := strconv.ParseUint(productID, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    var reviews []entity.Review
    if err := db.Where("product_id = ?", pID).
        Order("created_at desc").
        Find(&reviews).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, reviews)
}

func GetReviewAnalytics(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    productID := c.Param("id")

    pID, err := strconv.ParseUint(productID, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    var analytics struct {
        TotalReviews  int64    `json:"total_reviews"`
        AverageRating float64 `json:"average_rating"`
    }

    // Get total reviews and average rating
    db.Model(&entity.Review{}).
        Where("product_id = ?", pID).
        Count(&analytics.TotalReviews)

    db.Model(&entity.Review{}).
        Where("product_id = ?", pID).
        Select("COALESCE(AVG(rating), 0)").
        Scan(&analytics.AverageRating)

    c.JSON(http.StatusOK, analytics)
}

func VoteHelpful(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    reviewID := c.Param("id")

    rID, err := strconv.ParseUint(reviewID, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review ID"})
        return
    }

    var review entity.Review
    if err := db.First(&review, rID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
        return
    }

    if err := db.Model(&review).
        UpdateColumn("helpful_votes", gorm.Expr("helpful_votes + ?", 1)).
        Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Vote recorded"})
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