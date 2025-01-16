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
        &entity.User{},
    )
    if err != nil {
        return nil, err
    }

    return db, nil
}

// SeedSampleData creates initial sample data in the database
func SeedSampleData(db *gorm.DB) error {
    // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
    var count int64
    db.Model(&entity.Product{}).Count(&count)
    if count > 0 {
        return nil
    }

    // สร้างข้อมูลสินค้าตัวอย่าง
    products := []entity.Product{
        {
            Name: "Modern Sofa",
            Price: 999.99,
            Description: "Comfortable 3-seater sofa with premium fabric",
            Image: "/public/images/ModernSofa.jpg",
            AvgRating: 4.5,
        },
        {
            Name: "Leather Couch",
            Price: 1299.99,
            Description: "Genuine leather couch with recliner",
            Image: "/public/images/ModernSofa.jpg",
            AvgRating: 4.2,
        },
        {
            Name: "Corner Sofa",
            Price: 1499.99,
            Description: "L-shaped corner sofa with storage",
            Image: "/public/images/ModernSofa.jpg",
            AvgRating: 4.8,
        },
    }

    for _, product := range products {
        if err := db.Create(&product).Error; err != nil {
            return err
        }

        // สร้าง stocks หลากหลายสีและขนาด
        stocks := []entity.Stock{
            {
                ProductID: product.ID,
                Color: "Black",
                Size: "Large",
                Quantity: 20,
                MinQuantity: 5,
                Status: "In Stock",
            },
            {
                ProductID: product.ID,
                Color: "White",
                Size: "Medium",
                Quantity: 3,
                MinQuantity: 5,
                Status: "Low Stock",
            },
            {
                ProductID: product.ID,
                Color: "Brown",
                Size: "Small",
                Quantity: 0,
                MinQuantity: 5,
                Status: "Out of Stock",
            },
        }

        for _, stock := range stocks {
            if err := db.Create(&stock).Error; err != nil {
                return err
            }
        }

        // สร้างรีวิวตัวอย่าง
        reviews := []entity.Review{
            {
                ProductID: product.ID,
                UserID: "user123",
                Rating: 5,
                Comment: "Excellent quality and comfortable!",
                VerifiedPurchase: true,
                HelpfulVotes: 10,
            },
            {
                ProductID: product.ID,
                UserID: "user456",
                Rating: 4,
                Comment: "Good product but delivery was slow",
                VerifiedPurchase: true,
                HelpfulVotes: 5,
            },
        }

        for _, review := range reviews {
            if err := db.Create(&review).Error; err != nil {
                return err
            }
        }
    }

    return nil
}