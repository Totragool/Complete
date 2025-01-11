import { CartItem } from '../interfaces/Cart';

const baseUrl = 'http://localhost:8000/api';

export const CartService = {
  async getCart(): Promise<CartItem[]> {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');

    if (!token || !userId) {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`${baseUrl}/cart?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch cart');
      }

      return response.json();
    } catch (error) {
      console.error('Cart fetch error:', error);
      throw error;
    }
  },

  async addToCart(productId: number): Promise<CartItem> {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');

    if (!token || !userId) {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`${baseUrl}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
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
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${baseUrl}/cart/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
      throw new Error('Failed to update cart item');
    }
    
    return response.json();
  }
};