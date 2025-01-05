package main

import (
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"Cart/controller"
	"Cart/entity"
)

// Sample data
var sampleProducts = []entity.Product{
	{Name: "Modern Sofa", Price: 999.99, Description: "Comfortable 3-seater sofa with premium fabric", Image: "/images/ModernSofa.jpg"},
    {Name: "Leather Couch", Price: 1299.99, Description: "Genuine leather couch with recliner", Image: "/images/Leather Couch.jpg"},
    {Name: "Corner Sofa", Price: 1499.99, Description: "L-shaped corner sofa with storage", Image: "/images/Corner Sofa.jpg"},
    {Name: "Sofa Bed", Price: 799.99, Description: "Convertible sofa bed for guests", Image: "/images/Sofa Bed.jpg"},
    {Name: "Lounge Chair", Price: 499.99, Description: "Comfortable accent chair with ottoman", Image: "/images/Lounge Chair.jpg"},
    {Name: "Ottoman", Price: 199.99, Description: "Matching ottoman with storage", Image: "/images/Ottoman.jpg"},
}

var sampleStocks = []entity.Stock{
    {ProductID: 1, Quantity: 50, MinQuantity: 10, Status: "In Stock"},
    {ProductID: 2, Quantity: 5, MinQuantity: 10, Status: "Low Stock"},
    {ProductID: 3, Quantity: 0, MinQuantity: 10, Status: "Out of Stock"},
    {ProductID: 4, Quantity: 25, MinQuantity: 10, Status: "In Stock"},
    {ProductID: 5, Quantity: 8, MinQuantity: 10, Status: "Low Stock"},
    {ProductID: 6, Quantity: 100, MinQuantity: 10, Status: "In Stock"},
}



// Database connection
func setupDB() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open("ecommerce.db"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto migrate schemas
	err = db.AutoMigrate(&entity.Product{}, &entity.CartItem{}, &entity.Stock{},&entity.Order{}, &entity.OrderItem{}, &entity.Review{})
	if err != nil {
		return nil, err
	}

	return db, nil
}


func seedSampleData(db *gorm.DB) error {
    db.Exec("DELETE FROM cart_items")
    db.Exec("DELETE FROM stocks")
    db.Exec("DELETE FROM products")

    // Create products with stock
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

func getStockStatus(quantity, minQuantity int) string {
    if quantity <= 0 {
        return "Out of Stock"
    }
    if quantity <= minQuantity {
        return "Low Stock"
    }
    return "In Stock"
}

func main() {
	// Setup database
	db, err := setupDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Seed database
	if err := seedSampleData(db); err != nil {
		log.Fatal("Failed to seed database:", err)
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

	// Middleware to inject db into context
	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// API Routes
	api := r.Group("/api")
	{
		api.GET("/products", controller.GetProducts)
		api.GET("/products/:id", controller.GetProductDetails)
		api.GET("/products/:id/stock", controller.GetProductStock)
		api.POST("/cart", controller.AddToCart)
        api.GET("/cart", controller.GetCart)
		api.PUT("/cart/:id", controller.UpdateCartItem)
		api.PUT("/stock/:id", controller.UpdateStock)
		api.POST("/orders", controller.CreateOrder)
		api.GET("/orders", controller.GetOrders)
		api.GET("/products/:id/reviews", controller.GetProductReviews)
		api.POST("/reviews", controller.CreateReview)
	}

	if err := seedSampleData(db); err != nil {
		log.Printf("Warning: Failed to seed database: %v", err)
		// อาจจะไม่ต้อง Fatal เพื่อให้แอพยังทำงานต่อได้
	}

	// Start server
	r.Run(":8000")
}
