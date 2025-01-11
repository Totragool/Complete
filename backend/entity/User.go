package entity


import (

   "time"

   "gorm.io/gorm"

)

type Users struct {

   gorm.Model

   Email     string    `json:"email" valid:"required~Email is required, email~Email is invalid"`

   FirstName string    `json:"first_name" valid:"required~FirstName is required"`

   LastName  string    `json:"last_name" valid:"required~LastName is required"`

   Password  string    `json:"password" valid:"required~Password is required"`

   PhoneNumber string  `json:"phone_number" valid:"required~PhoneNumber is required, stringlength(10|10)"`

   Role      string     `json:"role" valid:"required~Role is required"`

   BirthDay  time.Time `json:"birthday" valid:"required~BirthDay is required"`

   PointID  uint        `json:"point_id" valid:"required~Point is required"`
   
   // Point    Point       `gorm:"foreignKey:PointID"`

   //Point    *Point  `gorm:"foreignKey: id" json:"point_id"`
   // CodeCollector []CodeCollectors `gorm:"foreignKey:user_id"`

   Orders []Order `gorm:"foreignKey:UserID"`
}
