package entity

import "gorm.io/gorm"

type Stock struct {
    gorm.Model
    ProductID   uint    `json:"product_id"`
    Quantity    int     `json:"quantity"`
    MinQuantity int     `json:"min_quantity" gorm:"default:10"` // Alert threshold
    Status      string  `json:"status"` // In Stock, Low Stock, Out of Stock
}