package controller

import (
    "Cart/entity"
    "fmt"
    "net/http"
    "path/filepath"
    "strconv"
    "strings"
    "time"
    "os"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func CreateReview(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    
    tx := db.Begin()

    var input struct {
        ProductID uint     `json:"product_id" binding:"required"`
        UserID    string   `json:"user_id" binding:"required"`
        Rating    int      `json:"rating" binding:"required,min=1,max=5"`
        Comment   string   `json:"comment" binding:"required"`
        Images    []string `json:"images"`
    }

    // ลบ GetRawData() ออกและใช้ ShouldBindJSON โดยตรง
    if err := c.ShouldBindJSON(&input); err != nil {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{
            "error": fmt.Sprintf("Invalid input: %v", err),
        })
        return
    }

    fmt.Printf("Received review data: %+v\n", input) // เพิ่ม log

    var product entity.Product
    if err := tx.First(&product, input.ProductID).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusNotFound, gin.H{
            "error": "Product not found",
        })
        return
    }

    review := entity.Review{
        ProductID: input.ProductID,
        UserID:    input.UserID,
        Rating:    input.Rating,
        Comment:   input.Comment,
        Images:    input.Images,
    }

    if err := tx.Create(&review).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to create review: %v", err),
        })
        return
    }

    var avgRating float64
    if err := tx.Model(&entity.Review{}).
        Where("product_id = ?", input.ProductID).
        Select("COALESCE(AVG(rating), 0)").
        Scan(&avgRating).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to calculate average rating",
        })
        return
    }

    if err := tx.Model(&product).Update("AvgRating", avgRating).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to update product rating",
        })
        return
    }

    if err := tx.Commit().Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to commit transaction",
        })
        return
    }

    // Return complete review data
    c.JSON(http.StatusCreated, gin.H{
        "status": "success",
        "data": review,
        "message": "Review created successfully",
    })
}

func GetProductReviews(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    productID := c.Param("id")

    pID, err := strconv.ParseUint(productID, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    // ตรวจสอบว่ามีสินค้าอยู่จริง
    var product entity.Product
    if err := db.First(&product, pID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    var reviews []entity.Review
    var total int64

    // Get total count
    if err := db.Model(&entity.Review{}).
        Where("product_id = ?", pID).
        Count(&total).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count reviews"})
        return
    }

    // Get paginated reviews
    if err := db.Where("product_id = ?", pID).
        Order("created_at desc").
        Find(&reviews).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "items": reviews,
        "total": total,
        "page": 1,
        "totalPages": 1,
        "hasNextPage": false,
    })
}

func VoteHelpful(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    reviewID := c.Param("id")

    rID, err := strconv.ParseUint(reviewID, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review ID"})
        return
    }

    if err := db.Model(&entity.Review{}).
        Where("id = ?", rID).
        UpdateColumn("helpful_votes", gorm.Expr("helpful_votes + ?", 1)).
        Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update helpful votes"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Vote recorded successfully"})
}

func UploadImage(c *gin.Context) {
    // Create uploads directory if not exists
    if err := os.MkdirAll("uploads", 0755); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
        return
    }

    // Get file
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
        return
    }

    // Validate file type
    ext := strings.ToLower(filepath.Ext(file.Filename))
    if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Only JPG and PNG files are allowed"})
        return
    }

    // Generate unique filename
    filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
    filepath := fmt.Sprintf("uploads/%s", filename)

    if err := c.SaveUploadedFile(file, filepath); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "imageUrl": "/uploads/" + filename,
    })
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
        AverageRating float64  `json:"average_rating"`
    }

    if err := db.Model(&entity.Review{}).
        Where("product_id = ?", pID).
        Count(&analytics.TotalReviews).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get review count"})
        return
    }

    if err := db.Model(&entity.Review{}).
        Where("product_id = ?", pID).
        Select("COALESCE(AVG(rating), 0)").
        Scan(&analytics.AverageRating).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate average rating"})
        return
    }

    c.JSON(http.StatusOK, analytics)
}