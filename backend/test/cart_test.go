package tests

import (
    "testing"
    "Cart/entity"
    "github.com/asaskevich/govalidator"
    . "github.com/onsi/gomega"
)

func TestCartItem(t *testing.T) {
    g := NewGomegaWithT(t)

    t.Run("quantity cannot be negative or zero", func(t *testing.T) {
        cartItem := entity.CartItem{
            ProductID: 1,
            Quantity: -1,
            UserID: "user1",
        }
        ok, err := govalidator.ValidateStruct(cartItem)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("quantity cannot be negative or zero"))
    })

    t.Run("product_id is required", func(t *testing.T) {
        cartItem := entity.CartItem{
            ProductID: 0,
            Quantity: 1,
            UserID: "user1",
        }
        ok, err := govalidator.ValidateStruct(cartItem)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("product_id is required"))
    })

    t.Run("user_id is required", func(t *testing.T) {
        cartItem := entity.CartItem{
            ProductID: 1,
            Quantity: 1,
            UserID: "",
        }
        ok, err := govalidator.ValidateStruct(cartItem)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("user_id is required"))
    })
}