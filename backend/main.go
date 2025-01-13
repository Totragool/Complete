package main

import (
    "log"
    "time"
    "os"

    "Cart/controller"
    "Cart/config"
    
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

func main() {
    // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
    if _, err := os.Stat("uploads"); os.IsNotExist(err) {
        os.Mkdir("uploads", 0755)
    }

    // Setup database
    db, err := config.SetupDB()
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
    if err := config.SeedSampleData(db); err != nil {
        log.Printf("Warning: Failed to seed database: %v", err)
    }

    // Start server
    if err := r.Run(":8000"); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}