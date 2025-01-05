// entity/orderitem.go
package entity

import (
    "gorm.io/gorm"
    "fmt"
)

type OrderItem struct {
    gorm.Model
    OrderID    uint    `json:"order_id"`
    Order      Order   `json:"order" gorm:"foreignKey:OrderID"`
    ProductID  uint    `json:"product_id"`
    Product    Product `json:"product" gorm:"foreignKey:ProductID"`
    Quantity   int     `json:"quantity" valid:"required~quantity cannot be negative or zero"`
    UnitPrice  float64 `json:"unit_price"`
    TotalPrice float64 `json:"total_price"`
}

// Validate validates the OrderItem struct
func (oi *OrderItem) Validate() error {
    if oi.Quantity <= 0 {
        return fmt.Errorf("Quantity must be positive")
    }
    if oi.UnitPrice < 0 {
        return fmt.Errorf("Unit price cannot be negative")
    }
    if oi.OrderID == 0 {
        return fmt.Errorf("OrderID is required")
    }
    if oi.ProductID == 0 {
        return fmt.Errorf("ProductID is required")
    }
    return nil
}

// BeforeCreate hook to calculate total price
func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
    oi.TotalPrice = float64(oi.Quantity) * oi.UnitPrice
    return nil
}

// BeforeSave hook to ensure total price is always correct
func (oi *OrderItem) BeforeSave(tx *gorm.DB) error {
    oi.TotalPrice = float64(oi.Quantity) * oi.UnitPrice
    return nil
}
