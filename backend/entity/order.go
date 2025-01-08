// entity/order.go
package entity

import (
    "gorm.io/gorm"
    "time"
    "fmt"
)

type Order struct {
    gorm.Model
    UserID     string      `json:"user_id" valid:"required~user_id is required"`
    // Modified validation message to match test expectation
    TotalPrice float64     `json:"total_price" valid:"total price must be positive"` 
    Status     string      `json:"status" gorm:"default:pending" valid:"status must be valid"`
    OrderDate  time.Time   `json:"order_date" `
    OrderItems []OrderItem `json:"order_items" gorm:"foreignKey:OrderID"`
}

// Validate validates the Order struct
func (o *Order) Validate() error {
    if o.TotalPrice <= 0 {
        return fmt.Errorf("total price must be positive")
    }
    if o.UserID == "" {
        return fmt.Errorf("user_id is required")
    }
    return nil
}

// BeforeCreate hook to set order date if not set
func (o *Order) BeforeCreate(tx *gorm.DB) error {
    if o.OrderDate.IsZero() {
        o.OrderDate = time.Now()
    }
    if o.Status == "" {
        o.Status = "Pending"
    }
    return nil
}
