package entity

import "gorm.io/gorm"

// CartItem represents the cart item model
type CartItem struct {
	gorm.Model
	ProductID uint    `json:"product_id"`
	Product   Product `gorm:"foreignkey:ProductID" json:"product"`
	Quantity  int     `json:"quantity" valid:"required~quantity cannot be negative or zero"` 
	UserID    string  `json:"user_id"`
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