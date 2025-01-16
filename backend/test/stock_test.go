package tests

import (
    "testing"
    "Cart/entity"
    "github.com/asaskevich/govalidator"
    . "github.com/onsi/gomega"
)

func TestStock(t *testing.T) {
    g := NewGomegaWithT(t)

    t.Run("quantity cannot be negative", func(t *testing.T) {
        stock := entity.Stock{
            ProductID: 1,
            Quantity: -1,
        }
        ok, err := govalidator.ValidateStruct(stock)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("quantity cannot be negative"))
    })

    t.Run("quantity cannot be negative", func(t *testing.T) {
        stock := entity.Stock{
            ProductID: 1,
            Quantity: 100,
        }
        ok, err := govalidator.ValidateStruct(stock)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("quantity cannot be negative"))
    })

    t.Run("product_id is required", func(t *testing.T) {
        stock := entity.Stock{
            ProductID: 0,
            Quantity: 100,
        }
        ok, err := govalidator.ValidateStruct(stock)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("product_id is required"))
    })
}