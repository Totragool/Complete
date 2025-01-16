// entity/orderitem.go
package entity

import (
    "gorm.io/gorm"
    "fmt"
)

// type OrderItem struct {
//     gorm.Model
//     OrderID    uint    `json:"order_id" valid:"required~Order ID is required"`
//     ProductID  uint    `json:"product_id" valid:"required~Product ID is required"`
//     Product    Product `json:"product" gorm:"foreignKey:ProductID"`
//     Quantity   int     `json:"quantity" valid:"required~Quantity is required,range(1|)~Quantity must be positive"`
//     UnitPrice  float64 `json:"unit_price" valid:"required~Unit price is required,float,range(0.01|)~Unit price must be positive"`
//     TotalPrice float64 `json:"total_price" valid:"required~Total price is required,float,range(0.01|)~Total price must be positive"`
// }

// // Validate validates the OrderItem struct
// func (oi *OrderItem) Validate() error {
//     if oi.Quantity <= 0 {
//         return fmt.Errorf("Quantity must be positive")
//     }
//     if oi.UnitPrice < 0 {
//         return fmt.Errorf("Unit price cannot be negative")
//     }
//     if oi.OrderID == 0 {
//         return fmt.Errorf("OrderID is required")
//     }
//     if oi.ProductID == 0 {
//         return fmt.Errorf("ProductID is required")
//     }
//     return nil
// }

// // BeforeCreate hook to calculate total price
// func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
//     oi.TotalPrice = float64(oi.Quantity) * oi.UnitPrice
//     return nil
// }

// // BeforeSave hook to ensure total price is always correct
// func (oi *OrderItem) BeforeSave(tx *gorm.DB) error {
//     oi.TotalPrice = float64(oi.Quantity) * oi.UnitPrice
//     return nil
// }

type OrderItem struct {
    gorm.Model
    OrderID    uint    `json:"order_id"`
    ProductID  uint    `json:"product_id"`
    StockID    uint    `json:"stock_id"`
    Quantity   int     `json:"quantity"`
    UnitPrice  float64 `json:"unit_price"`
    TotalPrice float64 `json:"total_price"`
    Order      Order   `json:"-" gorm:"foreignKey:OrderID"`
    Product    Product `json:"product" gorm:"foreignKey:ProductID"`
    Stock      Stock   `json:"stock" gorm:"foreignKey:StockID"`
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
    if oi.Quantity <= 0 {
        return fmt.Errorf("quantity must be greater than 0")
    }

    var product Product
    if err := tx.First(&product, oi.ProductID).Error; err != nil {
        return fmt.Errorf("product not found")
    }

    oi.UnitPrice = product.Price
    oi.TotalPrice = product.Price * float64(oi.Quantity)
    return nil
}