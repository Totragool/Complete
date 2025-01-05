import { Order } from '../interfaces/Order';

const baseUrl = 'http://localhost:8000/api';

export const OrderService = {
  async createOrder(userId: string): Promise<Order> {
    try {
      console.log('Making create order request...');
      const response = await fetch(`${baseUrl}/orders?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      console.log('Order creation successful:', data);
      return data;
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  },

  async getOrders(userId: string): Promise<Order[]> {
    try {
      const response = await fetch(`${baseUrl}/orders?user_id=${userId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch orders');
      }
      return response.json();
    } catch (error) {
      console.error('Order fetch error:', error);
      throw error;
    }
  },
};