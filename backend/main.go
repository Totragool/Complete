package main

import (
    "log"
    "time"
    "os"

    "Cart/controller"
    "Cart/config"
    "Cart/middlewares"
    
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
        // Public routes
        api.POST("/auth/login", controller.Login)

        // Protected routes
        protected := api.Group("/")
        protected.Use(middleware.AuthRequired())
        {
            protected.GET("/auth/me", controller.GetMe)
            protected.GET("/cart", controller.GetCart)
            protected.POST("/cart", controller.AddToCart)
            protected.GET("/orders", controller.GetOrders)
        }

        // Admin routes
        admin := api.Group("/admin")
        admin.Use(middleware.AuthRequired(), middleware.AdminOnly())
        {
            // จัดการสินค้า
            admin.POST("/products", controller.CreateProduct)
            admin.PUT("/products/:id", controller.UpdateProduct)
            admin.DELETE("/products/:id", controller.DeleteProduct)

            // จัดการสต็อก
            admin.POST("/stock", controller.CreateStock)
            admin.PUT("/stock/:id", controller.UpdateStock)
            admin.DELETE("/stock/:id", controller.DeleteStock)

            // รายงาน
            admin.GET("/reports/sales", controller.GetSalesReport)
            admin.GET("/reports/stock", controller.GetStockReport)
            admin.GET("/reports/orders", controller.GetOrdersReport)
        }
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