import { Product } from '../interfaces/Product';
import { Review } from '../interfaces/Review';
import { Stock } from '../interfaces/Stock';

const baseUrl = 'http://localhost:8000/api';

interface ReviewInput {
  ProductID: number;
  UserID: string;
  Rating: number;
  Comment: string;
}

export const ProductService = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${baseUrl}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProductStock(productId: number): Promise<Stock> {
    const response = await fetch(`${baseUrl}/products/${productId}/stock`);
    if (!response.ok) throw new Error('Failed to fetch stock');
    return response.json();
  },

  async getProductDetails(id: number): Promise<Product> {
    try {
        const response = await fetch(`${baseUrl}/products/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Product not found');
            }
            throw new Error('Failed to fetch product details');
        }
        const data = await response.json();
        console.log('Product details response:', data);
        return data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
},

  async createReview(review: ReviewInput): Promise<Review> {
    const response = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: review.ProductID,
        user_id: review.UserID,
        rating: review.Rating,
        comment: review.Comment
      })
    });
    if (!response.ok) throw new Error('Failed to submit review');
    
    await this.getProductDetails(review.ProductID);
    return response.json();
  },

  async getProductReviews(productId: number): Promise<Review[]> {
    const response = await fetch(`${baseUrl}/products/${productId}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  }
};