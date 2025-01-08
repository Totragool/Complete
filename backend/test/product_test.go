package tests

import (
    "testing"
    "Cart/entity"
    "github.com/asaskevich/govalidator"
    . "github.com/onsi/gomega"
)

func TestProduct(t *testing.T) {
    g := NewGomegaWithT(t)

    t.Run("name is required", func(t *testing.T) {
        product := entity.Product{
            Name: "",
            Price: 100,
            Description: "Test product",
        }
        ok, err := govalidator.ValidateStruct(product)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("name is required"))
    })

    t.Run("price must be positive", func(t *testing.T) {
        product := entity.Product{
            Name: "Test Product",
            Price: -100,
            Description: "Test product",
        }
        ok, err := govalidator.ValidateStruct(product)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("price must be positive"))
    })

    t.Run("description is required", func(t *testing.T) {
        product := entity.Product{
            Name: "Test Product",
            Price: 100,
            Description: "",
        }
        ok, err := govalidator.ValidateStruct(product)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(ContainSubstring("description is required"))
    })
}