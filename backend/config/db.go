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

// ProductData struct to hold sample product data
type ProductData struct {
    product entity.Product
    stocks  []entity.Stock
}

// SeedSampleData creates initial sample data in the database
func SeedSampleData(db *gorm.DB) error {
    // Define sample products with their variations
    sampleProducts := []ProductData{
        {
            product: entity.Product{
                Name:        "Modern Sofa",
                Price:      999.99,
                Description: "Comfortable 3-seater sofa with premium fabric",
                Image:      "/images/ModernSofa.jpg",
            },
            stocks: []entity.Stock{
                {
                    Price:     999.99,
                    Quantity:  10,
                    Color:     "Gray",
                    ShapeSize: "3 Seater",
                    Image:     "/images/ModernSofa-Gray.jpg",
                    Status:    "In Stock",
                },
                {
                    Price:     999.99,
                    Quantity:  5,
                    Color:     "Blue",
                    ShapeSize: "3 Seater",
                    Image:     "/images/ModernSofa-Blue.jpg",
                    Status:    "Low Stock",
                },
                {
                    Price:     1199.99,
                    Quantity:  8,
                    Color:     "Beige",
                    ShapeSize: "4 Seater",
                    Image:     "/images/ModernSofa-Beige.jpg",
                    Status:    "In Stock",
                },
            },
        },
        {
            product: entity.Product{
                Name:        "Leather Couch",
                Price:      1299.99,
                Description: "Genuine leather couch with recliner",
                Image:      "/images/LeatherCouch.jpg",
            },
            stocks: []entity.Stock{
                {
                    Price:     1299.99,
                    Quantity:  15,
                    Color:     "Brown",
                    ShapeSize: "Regular",
                    Image:     "/images/LeatherCouch-Brown.jpg",
                    Status:    "In Stock",
                },
                {
                    Price:     1399.99,
                    Quantity:  7,
                    Color:     "Black",
                    ShapeSize: "Large",
                    Image:     "/images/LeatherCouch-Black.jpg",
                    Status:    "In Stock",
                },
            },
        },
        {
            product: entity.Product{
                Name:        "Corner Sofa",
                Price:      1499.99,
                Description: "L-shaped corner sofa with storage",
                Image:      "/images/CornerSofa.jpg",
            },
            stocks: []entity.Stock{
                {
                    Price:     1499.99,
                    Quantity:  12,
                    Color:     "Light Gray",
                    ShapeSize: "Left Corner",
                    Image:     "/images/CornerSofa-LightGray-Left.jpg",
                    Status:    "In Stock",
                },
                {
                    Price:     1499.99,
                    Quantity:  8,
                    Color:     "Dark Gray",
                    ShapeSize: "Right Corner",
                    Image:     "/images/CornerSofa-DarkGray-Right.jpg",
                    Status:    "In Stock",
                },
                {
                    Price:     1599.99,
                    Quantity:  3,
                    Color:     "Navy",
                    ShapeSize: "Left Corner XL",
                    Image:     "/images/CornerSofa-Navy-Left-XL.jpg",
                    Status:    "Low Stock",
                },
            },
        },
        {
            product: entity.Product{
                Name:        "Accent Chair",
                Price:      499.99,
                Description: "Modern accent chair with unique design",
                Image:      "/images/AccentChair.jpg",
            },
            stocks: []entity.Stock{
                {
                    Price:     499.99,
                    Quantity:  20,
                    Color:     "Mustard",
                    ShapeSize: "Standard",
                    Image:     "/images/AccentChair-Mustard.jpg",
                    Status:    "In Stock",
                },
                {
                    Price:     499.99,
                    Quantity:  15,
                    Color:     "Green",
                    ShapeSize: "Standard",
                    Image:     "/images/AccentChair-Green.jpg",
                    Status:    "In Stock",
                },
                {
                    Price:     549.99,
                    Quantity:  10,
                    Color:     "Pink",
                    ShapeSize: "Large",
                    Image:     "/images/AccentChair-Pink.jpg",
                    Status:    "In Stock",
                },
            },
        },
        {
            product: entity.Product{
                Name:        "Ottoman",
                Price:      199.99,
                Description: "Versatile ottoman with storage",
                Image:      "/images/Ottoman.jpg",
            },
            stocks: []entity.Stock{
                {
                    Price:     199.99,
                    Quantity:  25,
                    Color:     "Gray",
                    ShapeSize: "Round",
                    Image:     "/images/Ottoman-Gray-Round.jpg",
                    Status:    "In Stock",
                },
                {
                    Price:     219.99,
                    Quantity:  20,
                    Color:     "Beige",
                    ShapeSize: "Square",
                    Image:     "/images/Ottoman-Beige-Square.jpg",
                    Status:    "In Stock",
                },
                {
                    Price:     229.99,
                    Quantity:  2,
                    Color:     "Blue",
                    ShapeSize: "Rectangle",
                    Image:     "/images/Ottoman-Blue-Rectangle.jpg",
                    Status:    "Low Stock",
                },
            },
        },
    }

    // Create products and their stocks
    for _, productData := range sampleProducts {
        // Create product
        if err := db.Create(&productData.product).Error; err != nil {
            return err
        }

        // Create stocks for the product
        for _, stock := range productData.stocks {
            stock.ProductID = productData.product.ID
            if stock.Quantity <= 5 {
                stock.Status = "Low Stock"
            } else {
                stock.Status = "In Stock"
            }
            if err := db.Create(&stock).Error; err != nil {
                return err
            }
        }
    }

    return nil
}