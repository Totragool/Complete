// package entity

// import (
// 	"fmt"

// 	"gorm.io/gorm"
// )

// // CartItem represents the cart item model
// type CartItem struct {
//     gorm.Model
//     ProductID uint    `json:"product_id" valid:"required~product_id is required"`
//     Product   Product `gorm:"foreignkey:ProductID" json:"product"`
//     // Modified validation message to match test expectation
//     Quantity  int     `json:"quantity" valid:"quantity cannot be negative or zero"`
//     UserID    string  `json:"user_id" valid:"required~user_id is required"`
// }


// func (ci *CartItem) ToOrderItem(orderID uint) OrderItem {
//     return OrderItem{
//         OrderID:    orderID,
//         ProductID:  ci.ProductID,
//         Product:    ci.Product,
//         Quantity:   ci.Quantity,
//         UnitPrice:  ci.Product.Price,
//         TotalPrice: ci.Product.Price * float64(ci.Quantity),
//     }
// }

// func (ci *CartItem) Validate() error {
//     if ci.Quantity <= 0 {
//         return fmt.Errorf("quantity cannot be negative or zero")
//     }
//     return nil
// }

package entity

import (
    "gorm.io/gorm"
    "fmt"
)

type CartItem struct {
    gorm.Model
    UserID    string  `json:"user_id"`
    ProductID uint    `json:"product_id"`
    StockID   uint    `json:"stock_id"`
    Quantity  int     `json:"quantity" valid:"required~Quantity is required"`
    Product   Product `json:"product" gorm:"foreignKey:ProductID"`
    Stock     Stock   `json:"stock" gorm:"foreignKey:StockID"`
}

func (ci *CartItem) Validate() error {
    if ci.Quantity <= 0 {
        return fmt.Errorf("quantity must be greater than 0")
    }
    return nil
}

func (ci *CartItem) BeforeCreate(tx *gorm.DB) error {
    if err := ci.Validate(); err != nil {
        return err
    }

    // ตรวจสอบสต็อก
    var stock Stock
    if err := tx.First(&stock, ci.StockID).Error; err != nil {
        return fmt.Errorf("stock not found")
    }
    
    if stock.Quantity < ci.Quantity {
        return fmt.Errorf("insufficient stock")
    }
    
    return nil
}

func (ci *CartItem) ToOrderItem(orderID uint) OrderItem {
    return OrderItem{
        OrderID:   orderID,
        ProductID: ci.ProductID,
        StockID:   ci.StockID,
        Quantity:  ci.Quantity,
    }
}