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
    ProductID        uint        `json:"product_id" valid:"required~product_id is required"`
    Product         Product     `gorm:"-" json:"-"`
    UserID          string      `json:"user_id" valid:"required~user_id is required"`
    Rating          int         `json:"rating" valid:"required,range(1|5)~rating must be between 1 and 5"`
    // Modified validation message to match test expectation
    Comment         string      `json:"comment" valid:"required,stringlength(10|500)~comment must be at least 10 characters"`
    HelpfulVotes    int         `json:"helpful_votes" gorm:"default:0" valid:"range(0|)~helpful votes cannot be negative"`
    Images          StringArray `json:"images" gorm:"type:text" valid:"optional"`
    VerifiedPurchase bool       `json:"verified_purchase" gorm:"default:false"`
    Status          string      `json:"status" gorm:"default:'pending'" valid:"in(pending|approved|rejected)~invalid status"`
    Reply           string      `json:"reply" valid:"optional"`
}