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
    "fmt"
    "gorm.io/gorm"
)

type Stock struct {
    gorm.Model
    Price       float64  `json:"price" valid:"required~Price is required"`
    Quantity    int      `json:"quantity" valid:"required~Quantity is required"`
    Color       string   `json:"color" valid:"required~Color is required"`
    ShapeSize   string   `json:"shape_size" valid:"required~Shape/Size is required"`
    Image       string   `json:"image" valid:"required~Image is required"`
    Status      string   `json:"status" valid:"in(in_stock|low_stock|out_of_stock)~invalid status"`
    ProductID   uint     `json:"product_id" valid:"required~Product ID is required"`
    Product     Product  `json:"product" gorm:"foreignKey:ProductID"`
}

func (s *Stock) Validate() error {
    if s.Quantity < 0 {
        return fmt.Errorf("quantity cannot be negative")
    }
    if s.Price < 0 {
        return fmt.Errorf("price cannot be negative")
    }
    if s.Color == "" {
        return fmt.Errorf("color is required")
    }
    if s.ShapeSize == "" {
        return fmt.Errorf("shape/size is required")
    }
    if s.Image == "" {
        return fmt.Errorf("image is required")
    }
    return nil
}

// BeforeCreate hook to set default status
func (s *Stock) BeforeCreate(tx *gorm.DB) error {
    if s.Status == "" {
        if s.Quantity > 0 {
            s.Status = "in_stock"
        } else {
            s.Status = "out_of_stock"
        }
    }
    return nil
}

// BeforeSave hook to update status based on quantity
func (s *Stock) BeforeSave(tx *gorm.DB) error {
    if s.Quantity <= 0 {
        s.Status = "out_of_stock"
    } else if s.Quantity <= 5 { // Using fixed threshold of 5 for low stock
        s.Status = "low_stock"
    } else {
        s.Status = "in_stock"
    }
    return nil
}