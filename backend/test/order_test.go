package tests

import (
    "testing"
    "Cart/entity"
    "github.com/asaskevich/govalidator"
    . "github.com/onsi/gomega"
)

func TestOrder(t *testing.T) {
    g := NewGomegaWithT(t)

    t.Run("user_id is required", func(t *testing.T) {
        order := entity.Order{
            UserID: "",
            TotalPrice: 100,
            Status: "pending",
        }
        ok, err := govalidator.ValidateStruct(order)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("user_id is required"))
    })

    t.Run("total price must be positive", func(t *testing.T) {
        order := entity.Order{
            UserID: "user1",
            TotalPrice: -100,
            Status: "pending",
        }
        ok, err := govalidator.ValidateStruct(order)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("total price must be positive"))
    })

    t.Run("status must be valid", func(t *testing.T) {
        order := entity.Order{
            UserID: "user1",
            TotalPrice: 100,
            Status: "invalid",
        }
        ok, err := govalidator.ValidateStruct(order)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("status must be valid"))
    })
}