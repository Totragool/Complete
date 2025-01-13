// package entity

// import (
// 	"gorm.io/gorm"
// 	"fmt"
// )

// type Product struct {
//     gorm.Model
//     Name        string      `json:"name" valid:"required~name is required"`
//     // Modified validation message to match test expectation
//     Price       float64     `json:"price" valid:"price must be positive"` 
//     Description string      `json:"description" valid:"required~description is required"`
//     Image       string      `json:"image" valid:"required~image_url is required,url~image must be a valid URL"`
//     Stock       *Stock      `json:"stock,omitempty" gorm:"foreignKey:ProductID"`
//     CartItems   []CartItem  `json:"-" gorm:"foreignKey:ProductID"`
//     OrderItems  []OrderItem `json:"-" gorm:"foreignKey:ProductID"`
//     Reviews     []Review    `json:"reviews" gorm:"foreignKey:ProductID"`
//     AvgRating   float64     `json:"avg_rating" gorm:"default:0" valid:"range(0|5)~average rating must be between 0 and 5"`
// }

// // Validate validates the Product struct using custom validation
// func (p *Product) Validate() error {
// 	if p.Name == "" {
// 		return fmt.Errorf("Name is required")
// 	}
// 	if p.Price < 0 {
// 		return fmt.Errorf("price must be positive")
// 	}
// 	return nil
// }


package entity

import (
    "gorm.io/gorm"
    "fmt"
)

type Product struct {
    gorm.Model
    Name        string      `json:"name" valid:"required~name is required"`
    Price       float64     `json:"price" valid:"price must be positive"` 
    Description string      `json:"description" valid:"required~description is required"`
    Image       string      `json:"image" valid:"required~image_url is required,url~image must be a valid URL"`
    AvgRating   float64     `json:"avg_rating" gorm:"default:0" valid:"range(0|5)~average rating must be between 0 and 5"`
    Stocks      []Stock     `json:"stocks" gorm:"foreignKey:ProductID"` // Changed back to one-to-many relationship
    Reviews     []Review    `json:"reviews" gorm:"foreignKey:ProductID"`
    CartItems   []CartItem  `json:"-" gorm:"foreignKey:ProductID"`
    OrderItems  []OrderItem `json:"-" gorm:"foreignKey:ProductID"`
}

func (p *Product) Validate() error {
    if p.Name == "" {
        return fmt.Errorf("Name is required")
    }
    if p.Price < 0 {
        return fmt.Errorf("price must be positive")
    }
    return nil
}

// GetTotalStock returns the total quantity across all stocks
func (p *Product) GetTotalStock() int {
    total := 0
    for _, stock := range p.Stocks {
        total += stock.Quantity
    }
    return total
}

// GetAvailableStock returns the stock with enough quantity, if any
func (p *Product) GetAvailableStock(requiredQuantity int) *Stock {
    for i := range p.Stocks {
        if p.Stocks[i].Quantity >= requiredQuantity {
            return &p.Stocks[i]
        }
    }
    return nil
}