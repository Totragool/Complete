// package entity

// import (
// 	"fmt"

// 	"gorm.io/gorm"
// )

// type Stock struct {
//     gorm.Model
//     ProductID   uint    `json:"product_id" valid:"required~product_id is required"`
//     // Modified validation message to match test expectation
//     Quantity    int     `json:"quantity" valid:"quantity cannot be negative"` 
//     MinQuantity int     `json:"min_quantity" gorm:"default:10" valid:"quantity cannot be negative"`
//     Status      string  `json:"status" valid:"in(in_stock|low_stock|out_of_stock)~invalid status"`
// }

// func (s *Stock) Validate() error {
//     if s.Quantity < 0 {
//         return fmt.Errorf("quantity cannot be negative")
//     }
//     if s.MinQuantity <= 0 {
//         return fmt.Errorf("quantity cannot be negative")
//     }
//     return nil
// }

package entity

import (
    "gorm.io/gorm"
    "fmt"
)

type Stock struct {
    gorm.Model
    ProductID    uint       `json:"product_id"`
    Color        string     `json:"color"`
    Size         string     `json:"size"`
    Quantity     int        `json:"quantity" valid:"required~Quantity is required"`
    MinQuantity  int        `json:"min_quantity" gorm:"default:5"`
    Status       string     `json:"status" gorm:"default:In Stock"`
    Product      Product    `json:"-" gorm:"foreignKey:ProductID"`
    CartItems    []CartItem `json:"-" gorm:"foreignKey:StockID"`
    OrderItems   []OrderItem`json:"-" gorm:"foreignKey:StockID"`
}

func (s *Stock) UpdateStatus() {
    if s.Quantity <= 0 {
        s.Status = "Out of Stock"
    } else if s.Quantity <= s.MinQuantity {
        s.Status = "Low Stock"
    } else {
        s.Status = "In Stock"
    }
}

func (s *Stock) BeforeSave(tx *gorm.DB) error {
    s.UpdateStatus()
    return nil
}

func (s *Stock) Validate() error {
    if s.Quantity < 0 {
        return fmt.Errorf("quantity cannot be negative")
    }
    if s.MinQuantity < 0 {
        return fmt.Errorf("minimum quantity cannot be negative")
    }
    return nil
}