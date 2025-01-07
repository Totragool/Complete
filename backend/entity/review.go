package entity

import (
    "database/sql/driver"
    "encoding/json"
    "errors"
    "gorm.io/gorm"
)

type StringArray []string

// Scan implements the sql.Scanner interface
func (sa *StringArray) Scan(value interface{}) error {
    if value == nil {
        *sa = StringArray{}
        return nil
    }
    
    switch v := value.(type) {
    case []byte:
        return json.Unmarshal(v, sa)
    case string:
        return json.Unmarshal([]byte(v), sa)
    default:
        return errors.New("invalid type for StringArray")
    }
}

// Value implements the driver.Valuer interface
func (sa StringArray) Value() (driver.Value, error) {
    if sa == nil {
        return nil, nil
    }
    return json.Marshal(sa)
}

type Review struct {
    gorm.Model
    ProductID        uint      `json:"product_id"`
    Product         Product   `gorm:"-" json:"-"` // ป้องกัน circular reference
    UserID          string    `json:"user_id"`
    Rating          int       `json:"rating"`
    Comment         string    `json:"comment"`
    HelpfulVotes    int       `json:"helpful_votes" gorm:"default:0"`
    Images          StringArray `json:"images" gorm:"type:text"`
    VerifiedPurchase bool     `json:"verified_purchase" gorm:"default:false"`
    Status          string    `json:"status" gorm:"default:'pending'"`
    Reply           string    `json:"reply"`
}