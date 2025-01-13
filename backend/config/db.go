package config

import (
    "Cart/entity"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

// SetupDB initializes and returns a database connection
func SetupDB() (*gorm.DB, error) {
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

// SeedSampleData creates initial sample data in the database
func SeedSampleData(db *gorm.DB) error {
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