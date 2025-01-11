package config

import (
    "fmt"
    "log"
    "time"
    "Cart/entity"

    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

var db *gorm.DB

func ConnectionDB() *gorm.DB {
    return db
}

func SetupDatabase() {
    database, err := gorm.Open(sqlite.Open("ecommerce.db"), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    })

    if err != nil {
        log.Fatal(fmt.Sprintf("Failed to connect to database: %v", err))
    }

    database.AutoMigrate(
        &entity.Users{},
        &entity.Product{},
        &entity.CartItem{},
        &entity.Stock{},
        &entity.Order{},
        &entity.OrderItem{},
        &entity.Review{},
        &entity.ReviewAnalytics{},
    )

    db = database

    // Seed initial data
    seedData(db)
}

func seedData(db *gorm.DB) {
    // Seed users if none exist
    var userCount int64
    db.Model(&entity.Users{}).Count(&userCount)
    if userCount == 0 {
        // Hash passwords for sample users
        adminPass, _ := HashPassword("admin123")
        customerPass, _ := HashPassword("customer123")
        staffPass, _ := HashPassword("staff123")

        // Sample users
        users := []entity.Users{
            {
                Email:       "admin@example.com",
                FirstName:   "Admin",
                LastName:    "User",
                Password:    adminPass,
                PhoneNumber: "0812345678",
                Role:        "admin",
                BirthDay:    time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC),
                PointID:     1, // Assuming Point system is set up
            },
            {
                Email:       "john.doe@example.com",
                FirstName:   "John",
                LastName:    "Doe",
                Password:    customerPass,
                PhoneNumber: "0823456789",
                Role:        "customer",
                BirthDay:    time.Date(1995, 5, 15, 0, 0, 0, 0, time.UTC),
                PointID:     1,
            },
            {
                Email:       "jane.smith@example.com",
                FirstName:   "Jane",
                LastName:    "Smith",
                Password:    customerPass,
                PhoneNumber: "0834567890",
                Role:        "customer",
                BirthDay:    time.Date(1992, 8, 20, 0, 0, 0, 0, time.UTC),
                PointID:     1,
            },
            {
                Email:       "staff@example.com",
                FirstName:   "Staff",
                LastName:    "Member",
                Password:    staffPass,
                PhoneNumber: "0845678901",
                Role:        "staff",
                BirthDay:    time.Date(1988, 12, 10, 0, 0, 0, 0, time.UTC),
                PointID:     1,
            },
            {
                Email:       "sarah.wilson@example.com",
                FirstName:   "Sarah",
                LastName:    "Wilson",
                Password:    customerPass,
                PhoneNumber: "0856789012",
                Role:        "customer",
                BirthDay:    time.Date(1998, 3, 25, 0, 0, 0, 0, time.UTC),
                PointID:     1,
            },
        }

        for _, user := range users {
            if err := db.Create(&user).Error; err != nil {
                log.Printf("Error seeding user %s: %v", user.Email, err)
            } else {
                log.Printf("Created user: %s with role: %s", user.Email, user.Role)
            }
        }
    }

    // Check if products already exist
    var productCount int64
    db.Model(&entity.Product{}).Count(&productCount)
    if productCount == 0 {
        // Sample products data
        products := []entity.Product{
            {
                Name:        "Modern Sofa",
                Price:       999.99,
                Description: "Comfortable 3-seater sofa with premium fabric",
                Image:       "/images/ModernSofa.jpg",
            },
            {
                Name:        "Leather Couch",
                Price:       1299.99,
                Description: "Genuine leather couch with recliner",
                Image:       "/images/LeatherCouch.jpg",
            },
            {
                Name:        "Corner Sofa",
                Price:       1499.99,
                Description: "L-shaped corner sofa with storage",
                Image:       "/images/CornerSofa.jpg",
            },
            {
                Name:        "Sofa Bed",
                Price:       799.99,
                Description: "Convertible sofa bed for guests",
                Image:       "/images/SofaBed.jpg",
            },
            {
                Name:        "Lounge Chair",
                Price:       499.99,
                Description: "Comfortable accent chair with ottoman",
                Image:       "/images/LoungeChair.jpg",
            },
            {
                Name:        "Ottoman",
                Price:       199.99,
                Description: "Matching ottoman with storage",
                Image:       "/images/Ottoman.jpg",
            },
        }

        for _, product := range products {
            // Create product
            result := db.Create(&product)
            if result.Error != nil {
                log.Printf("Error seeding product %s: %v", product.Name, result.Error)
                continue
            }

            // Create corresponding stock
            stock := entity.Stock{
                ProductID:   product.ID,
                Quantity:    50,
                MinQuantity: 10,
                Status:      "In Stock",
            }

            if err := db.Create(&stock).Error; err != nil {
                log.Printf("Error creating stock for product %s: %v", product.Name, err)
            }
        }
    }
}