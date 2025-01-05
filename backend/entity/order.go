// entity/order.go
package entity

import (
    "gorm.io/gorm"
    "time"
    "fmt"
)

type Order struct {
    gorm.Model
    UserID     string      `json:"user_id"`
    TotalPrice float64     `json:"total_price"`
    Status     string      `json:"status" gorm:"default:Pending"` // Pending, Completed, Cancelled
    OrderDate  time.Time   `json:"order_date"`
    OrderItems []OrderItem `json:"order_items" gorm:"foreignKey:OrderID"`
}

// Validate validates the Order struct
func (o *Order) Validate() error {
    if o.UserID == "" {
        return fmt.Errorf("UserID is required")
    }
    if o.TotalPrice < 0 {
        return fmt.Errorf("Total price cannot be negative")
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
