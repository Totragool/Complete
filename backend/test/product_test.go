package tests

import (
	"testing"
	"Cart/entity"
	. "github.com/onsi/gomega"
)

func TestProductName(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Name is required", func(t *testing.T) {
		product := entity.Product{
			Name:        "",
			Price:       999,
			Description: "",
			Image:       "invalid-url",
		}

		err := product.Validate() // Using the custom validation function
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(ContainSubstring("Name is required"))
	})
}

func TestProductPrice(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Price cannot be negative", func(t *testing.T) {
		product := entity.Product{
			Name:        "Dog",
			Price:       -999,
			Description: "",
			Image:       "invalid-url",
		}

		err := product.Validate() // Using the custom validation function
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(ContainSubstring("Price cannot be negative"))
	})
}
