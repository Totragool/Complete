package entity

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Review struct {
    gorm.Model
    ProductID        uint    `json:"product_id"`
    Product         Product `gorm:"-" json:"-"` // ป้องกัน circular reference
    UserID          string  `json:"user_id"`
    Rating          int     `json:"rating"`
    Comment         string  `json:"comment"`
    HelpfulVotes    int     `json:"helpful_votes" gorm:"default:0"`
    Images          pq.StringArray `json:"images" gorm:"type:text[]"`
    VerifiedPurchase bool   `json:"verified_purchase"`
    Status          string  `json:"status" gorm:"default:'pending'"` // pending, approved, rejected
    Reply           string  `json:"reply"`
}