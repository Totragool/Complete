package entity

import "gorm.io/gorm"

type Review struct {
    gorm.Model
    ProductID uint    `json:"product_id"`
    Product   Product `gorm:"foreignKey:ProductID" json:"product" json:"-"`
    UserID    string  `json:"user_id"`
    Rating    int     `json:"rating"`
    Comment   string  `json:"comment"`
}
