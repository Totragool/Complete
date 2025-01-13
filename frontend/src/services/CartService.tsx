import { CartItem } from '../interfaces/Cart';

const baseUrl = 'http://localhost:8000/api';

interface CartResponse {
  data: CartItem[];
  error?: string;
}

export const CartService = {
  async getCart(userId: string): Promise<CartItem[]> {
    try {
      const response = await fetch(`${baseUrl}/cart?user_id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      return response.json();
    } catch (error) {
      console.error('Cart fetch error:', error);
      throw error;
    }
  },

  async addToCart(userId: string, productId: number): Promise<CartItem> {
    try {
      const response = await fetch(`${baseUrl}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to cart');
      }

      return response.json();
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    const response = await fetch(`${baseUrl}/cart/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error('Failed to update cart item');
    return response.json();
  },
};