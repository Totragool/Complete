// entity/user.go
package entity

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    gorm.Model
    Email       string    `json:"email" gorm:"uniqueIndex"`
    FirstName   string    `json:"first_name"`
    LastName    string    `json:"last_name"`
    Password    string    `json:"-"` // ไม่ส่งกลับใน JSON
    Role        string    `json:"role" gorm:"default:user"` // 'admin' or 'user'
    LastLogin   time.Time `json:"last_login"`
}