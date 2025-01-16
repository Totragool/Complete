package main

import (
    "log"
    "time"
    "os"

    "Cart/config"
    "Cart/controller"
    "Cart/middlewares"
    
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

func main() {
    // Setup the database
    config.SetupDatabase()

    // Create uploads directory if it doesn't exist
    if _, err := os.Stat("uploads"); os.IsNotExist(err) {
        if err := os.MkdirAll("uploads", 0755); err != nil {
            log.Fatal("Failed to create uploads directory:", err)
        }
    }

    // Initialize Gin
    r := gin.Default()

    // Setup CORS
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5174", "http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    // Middleware to inject database connection
    r.Use(func(c *gin.Context) {
        c.Set("db", config.ConnectionDB())
        c.Next()
    })

    // Static file serving
    r.Static("/uploads", "./uploads")

    // Public routes
    public := r.Group("/api")
    {
        // Authentication routes
        public.POST("/register", controller.Register)
        public.POST("/login", controller.Login)
        
        // Public product routes
        public.GET("/products", controller.GetProducts)
        public.GET("/products/:id", controller.GetProductDetails)
        public.GET("/products/:id/reviews", controller.GetProductReviews)
        public.GET("/products/:id/reviews/analytics", controller.GetReviewAnalytics)
    }

    // Protected routes
    protected := r.Group("/api")
    protected.Use(middlewares.Authorizes())
    {
        // Cart routes
        protected.POST("/cart", controller.AddToCart)
        protected.GET("/cart", controller.GetCart)
        protected.PUT("/cart/:id", controller.UpdateCartItem)

        // Order routes
        protected.POST("/orders", controller.CreateOrder)
        protected.GET("/orders", controller.GetOrders)

        // Review routes
        protected.POST("/reviews", controller.CreateReview)
        protected.POST("/reviews/:id/vote", controller.VoteHelpful)
        protected.POST("/reviews/upload", controller.UploadImage)

        // Stock management (might need additional admin middleware)
        protected.PUT("/stock/:id", controller.UpdateStock)
        protected.GET("/products/:id/stock", controller.GetProductStock)
    }

    // Start server
    if err := r.Run(":8000"); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}