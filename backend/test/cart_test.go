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
			ProductID: 0,
			Quantity:  0,
			UserID:    "",
		}
		ok,err := govalidator.ValidateStruct(cartItem)
		g.Expect(ok).NotTo(BeTrue()) // Validate should fail
		g.Expect(err).NotTo(BeNil()) // There should be an error
		g.Expect(err.Error()).To(ContainSubstring("quantity cannot be negative or zero"))
	})
}
