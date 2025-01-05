package entity

import (
	"gorm.io/gorm"
	"fmt"
)

type Product struct {
	gorm.Model
    Name        string      `json:"name"`
    Price       float64     `json:"price"`
    Description string      `json:"description"`
    Image       string      `json:"image"`
    Stock       *Stock      `json:"stock,omitempty" gorm:"foreignKey:ProductID"`
    CartItems   []CartItem  `json:"-" gorm:"foreignKey:ProductID"`
    OrderItems  []OrderItem `json:"-" gorm:"foreignKey:ProductID"`
	Reviews     []Review  `json:"reviews" gorm:"foreignKey:ProductID"`
    AvgRating   float64   `json:"avg_rating" gorm:"-"`
}

// Validate validates the Product struct using custom validation
func (p *Product) Validate() error {
	if p.Name == "" {
		return fmt.Errorf("Name is required")
	}
	if p.Price < 0 {
		return fmt.Errorf("Price cannot be negative")
	}
	return nil
}
