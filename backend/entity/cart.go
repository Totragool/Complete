package entity

import (
	"fmt"

	"gorm.io/gorm"
)

// CartItem represents the cart item model
type CartItem struct {
    gorm.Model
    ProductID uint    `json:"product_id" valid:"required~product_id is required"`
    Product   Product `gorm:"foreignkey:ProductID" json:"product"`
    // Modified validation message to match test expectation
    Quantity  int     `json:"quantity" valid:"quantity cannot be negative or zero"`
    UserID    string  `json:"user_id" valid:"required~user_id is required"`
}


func (ci *CartItem) ToOrderItem(orderID uint) OrderItem {
    return OrderItem{
        OrderID:    orderID,
        ProductID:  ci.ProductID,
        Product:    ci.Product,
        Quantity:   ci.Quantity,
        UnitPrice:  ci.Product.Price,
        TotalPrice: ci.Product.Price * float64(ci.Quantity),
    }
}

func (ci *CartItem) Validate() error {
    if ci.Quantity <= 0 {
        return fmt.Errorf("quantity cannot be negative or zero")
    }
    return nil
}