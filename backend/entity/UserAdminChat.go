package entity

import (
	"gorm.io/gorm"
)

type UserAdminChat struct {
	gorm.Model
	Quantity 	uint 	`json:"quantity"`
	
	
	UserID		uint 	`json:"UserID"`
	User   		*Users 	`gorm:"foreignKey:UserID"`

	// ChatID	 	uint 	`json:"ChatID"`
	// Chat   	Chat 	`gorm:"foreignKey:ChatID"`
}