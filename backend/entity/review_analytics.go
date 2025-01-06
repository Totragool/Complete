package entity

import "gorm.io/gorm"

type ReviewAnalytics struct {
    gorm.Model
    ProductID           uint    `json:"product_id"`
    AverageRating      float64 `json:"average_rating"`
    TotalReviews       int     `json:"total_reviews"`
    RatingDistribution map[int]int `json:"rating_distribution" gorm:"-"`
    HelpfulVotes       int     `json:"helpful_votes"`
    ResponseRate       float64 `json:"response_rate"`
    VerifiedPurchaseRate float64 `json:"verified_purchase_rate"`
}