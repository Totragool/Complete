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
    
    var input struct {
        ProductID uint     `json:"product_id" binding:"required"`
        UserID    string   `json:"user_id" binding:"required"`
        Rating    int      `json:"rating" binding:"required,min=1,max=5"`
        Comment   string   `json:"comment" binding:"required"`
        Images    []string `json:"images"`
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

    // Create review
    review := entity.Review{
        ProductID: input.ProductID,
        UserID:    input.UserID,
        Rating:    input.Rating,
        Comment:   input.Comment,
        Images:    input.Images,
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

    db.Model(&product).Update("avg_rating", avgRating)

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

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
    offset := (page - 1) * pageSize

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
        Offset(offset).
        Limit(pageSize).
        Find(&reviews).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
        return
    }

    totalPages := (int(total) + pageSize - 1) / pageSize
    hasNextPage := int64(offset+pageSize) < total

    c.JSON(http.StatusOK, gin.H{
        "items": reviews,
        "total": total,
        "page": page,
        "totalPages": totalPages,
        "hasNextPage": hasNextPage,
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
    // Get file
    file, err := c.FormFile("image")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
        return
    }

    // Validate file size (2MB)
    if file.Size > 2*1024*1024 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds maximum limit (2MB)"})
        return
    }

    // Validate file type
    ext := filepath.Ext(file.Filename)
    allowedExt := map[string]bool{
        ".jpg": true,
        ".jpeg": true,
        ".png": true,
    }
    if !allowedExt[strings.ToLower(ext)] {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Only JPG and PNG files are allowed"})
        return
    }

    // Create uploads directory if it doesn't exist
    if err := os.MkdirAll("uploads", 0755); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
        return
    }

    // Generate unique filename
    filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
    filepath := fmt.Sprintf("uploads/%s", filename)

    // Save file
    if err := c.SaveUploadedFile(file, filepath); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
        return
    }

    // Return file URL
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