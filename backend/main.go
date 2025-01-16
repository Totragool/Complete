package main

import (
    "log"
    "time"
    "os"

    "Cart/controller"
    "Cart/entity"
    
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

func setupDB() (*gorm.DB, error) {
    db, err := gorm.Open(sqlite.Open("ecommerce.db"), &gorm.Config{})
    if err != nil {
        return nil, err
    }

    // Auto migrate schemas
    err = db.AutoMigrate(
        &entity.Product{},
        &entity.CartItem{},
        &entity.Stock{},
        &entity.Order{},
        &entity.OrderItem{},
        &entity.Review{},
        &entity.ReviewAnalytics{},
    )
    if err != nil {
        return nil, err
    }

    return db, nil
}

func seedSampleData(db *gorm.DB) error {
    // สร้างข้อมูลตัวอย่าง
    var sampleProducts = []entity.Product{
		{Name: "Modern Sofa", Price: 999.99, Description: "Comfortable 3-seater sofa with premium fabric", Image: "/images/ModernSofa.jpg"},
		{Name: "Leather Couch", Price: 1299.99, Description: "Genuine leather couch with recliner", Image: "/images/Leather Couch.jpg"},
		{Name: "Corner Sofa", Price: 1499.99, Description: "L-shaped corner sofa with storage", Image: "/images/Corner Sofa.jpg"},
		{Name: "Sofa Bed", Price: 799.99, Description: "Convertible sofa bed for guests", Image: "/images/Sofa Bed.jpg"},
		{Name: "Lounge Chair", Price: 499.99, Description: "Comfortable accent chair with ottoman", Image: "/images/Lounge Chair.jpg"},
		{Name: "Ottoman", Price: 199.99, Description: "Matching ottoman with storage", Image: "/images/Ottoman.jpg"},
	}

    for _, product := range sampleProducts {
        if err := db.Create(&product).Error; err != nil {
            return err
        }
        
        stock := entity.Stock{
            ProductID:   product.ID,
            Quantity:    50,
            MinQuantity: 10,
            Status:      "In Stock",
        }
        if err := db.Create(&stock).Error; err != nil {
            return err
        }
    }
    return nil
}

func main() {
    // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
    if _, err := os.Stat("uploads"); os.IsNotExist(err) {
        os.Mkdir("uploads", 0755)
    }

    // Setup database
    db, err := setupDB()
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    // Initialize Gin
    r := gin.Default()

    // Setup CORS
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    // Middleware
    r.Use(func(c *gin.Context) {
        c.Set("db", db)
        c.Next()
    })

    // Serve static files
    r.Static("/uploads", "./uploads")

	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
        if err := os.MkdirAll("uploads", 0755); err != nil {
            log.Fatal("Failed to create uploads directory:", err)
        }
    }

    // API Routes
    api := r.Group("/api")
    {
        // Product routes
        api.GET("/products", controller.GetProducts)
        api.GET("/products/:id", controller.GetProductDetails)
        api.GET("/products/:id/stock", controller.GetProductStock)

        // Cart routes
        api.POST("/cart", controller.AddToCart)
        api.GET("/cart", controller.GetCart)
        api.PUT("/cart/:id", controller.UpdateCartItem)
        api.PUT("/stock/:id", controller.UpdateStock)

        // Order routes
        api.POST("/orders", controller.CreateOrder)
        api.GET("/orders", controller.GetOrders)

        // Review routes
        api.POST("/reviews", controller.CreateReview)
        api.GET("/products/:id/reviews", controller.GetProductReviews)
        api.GET("/products/:id/reviews/analytics", controller.GetReviewAnalytics)
        api.POST("/reviews/:id/vote", controller.VoteHelpful)
        api.POST("/reviews/upload", controller.UploadImage)
    }

    // Seed data if needed
    if err := seedSampleData(db); err != nil {
        log.Printf("Warning: Failed to seed database: %v", err)
    }

    // Start server
    if err := r.Run(":8000"); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}