package entity

import (
    "gorm.io/gorm"
)

type Review struct {
    gorm.Model
    ProductID        uint      `json:"product_id"`
    Product         Product   `gorm:"-" json:"-"` // Prevent circular reference
    UserID          string    `json:"user_id"`
    Rating          int       `json:"rating"`
    Comment         string    `json:"comment"`
    HelpfulVotes    int       `json:"helpful_votes" gorm:"default:0"`
    Images          []string  `json:"images" gorm:"type:text[]"`
    VerifiedPurchase bool     `json:"verified_purchase" gorm:"default:false"`
    Status          string    `json:"status" gorm:"default:'pending'"`
    Reply           string    `json:"reply"`
}

// BeforeCreate hook จะทำงานก่อนการสร้าง record
func (r *Review) BeforeCreate(tx *gorm.DB) error {
    // ตรวจสอบว่า user ได้ซื้อสินค้าจริงหรือไม่
    var order Order
    result := tx.Where("user_id = ?", r.UserID).
        Joins("JOIN order_items ON orders.id = order_items.order_id").
        Where("order_items.product_id = ?", r.ProductID).
        First(&order)

    if result.Error == nil {
        r.VerifiedPurchase = true
    }

    return nil
}

// AfterCreate hook จะทำงานหลังการสร้าง record
func (r *Review) AfterCreate(tx *gorm.DB) error {
    // อัพเดทคะแนนเฉลี่ยของสินค้า
    var avgRating float64
    tx.Model(&Review{}).
        Where("product_id = ?", r.ProductID).
        Select("COALESCE(AVG(rating), 0)").
        Scan(&avgRating)

    tx.Model(&Product{}).
        Where("id = ?", r.ProductID).
        Update("avg_rating", avgRating)

    return nil
}

// BeforeSave hook จะทำงานก่อนการบันทึกทุกครั้ง
func (r *Review) BeforeSave(tx *gorm.DB) error {
    // ตรวจสอบความถูกต้องของข้อมูล
    if r.Rating < 1 || r.Rating > 5 {
        return gorm.ErrRecordNotFound
    }
    if len(r.Comment) < 10 {
        return gorm.ErrRecordNotFound
    }
    return nil
}