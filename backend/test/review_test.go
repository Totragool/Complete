package tests

import (
    "testing"
    "Cart/entity"
    "github.com/asaskevich/govalidator"
    . "github.com/onsi/gomega"
)

func TestReview(t *testing.T) {
    g := NewGomegaWithT(t)

    t.Run("rating must be between 1 and 5", func(t *testing.T) {
        review := entity.Review{
            ProductID: 1,
            UserID: "user1",
            Rating: 6,
            Comment: "Test review",
        }
        ok, err := govalidator.ValidateStruct(review)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("rating must be between 1 and 5"))
    })

    t.Run("comment length must be at least 10 characters", func(t *testing.T) {
        review := entity.Review{
            ProductID: 1,
            UserID: "user1",
            Rating: 5,
            Comment: "Short",
        }
        ok, err := govalidator.ValidateStruct(review)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("comment must be at least 10 characters"))
    })

    t.Run("product_id is required", func(t *testing.T) {
        review := entity.Review{
            ProductID: 0,
            UserID: "user1",
            Rating: 5,
            Comment: "Good product test review",
        }
        ok, err := govalidator.ValidateStruct(review)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("product_id is required"))
    })
}