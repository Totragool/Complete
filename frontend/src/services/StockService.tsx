import { Stock } from '../interfaces/Stock';

const baseUrl = 'http://localhost:8000/api';

export const StockService = {
    async getStocks(productId: number): Promise<Stock[]> {
        try {
            const response = await fetch(`${baseUrl}/products/${productId}/stock`);
            if (!response.ok) {
                throw new Error('Failed to fetch stocks');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching stocks:', error);
            throw error;
        }
    },

    async updateStock(stock: Partial<Stock> & { id: number }): Promise<Stock> {
        try {
            const response = await fetch(`${baseUrl}/stock/${stock.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stock),
            });

            if (!response.ok) {
                throw new Error('Failed to update stock');
            }

            return response.json();
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    },

    async createStock(stock: Omit<Stock, 'ID'>): Promise<Stock> {
        try {
            const response = await fetch(`${baseUrl}/stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stock),
            });

            if (!response.ok) {
                throw new Error('Failed to create stock');
            }

            return response.json();
        } catch (error) {
            console.error('Error creating stock:', error);
            throw error;
        }
    },

    async deleteStock(stockId: number): Promise<void> {
        try {
            const response = await fetch(`${baseUrl}/stock/${stockId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete stock');
            }
        } catch (error) {
            console.error('Error deleting stock:', error);
            throw error;
        }
    },

    async checkStockAvailability(stockId: number, quantity: number): Promise<boolean> {
        try {
            const response = await fetch(`${baseUrl}/stock/${stockId}`);
            if (!response.ok) {
                throw new Error('Failed to check stock');
            }
            const stock: Stock = await response.json();
            return stock.Quantity >= quantity;
        } catch (error) {
            console.error('Error checking stock:', error);
            throw error;
        }
    },
};