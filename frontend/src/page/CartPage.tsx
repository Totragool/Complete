import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spin, Typography, Space } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CartService } from '../services/CartService';
import { ProductService } from '../services/ProductService';
import { OrderService } from '../services/OrderService';
import { CartItem as CartItemType } from '../interfaces/Cart';
import { CartItem } from '../Components/CartItem';
import { App } from 'antd';
import './shopping-cart.css';

const { Title, Text } = Typography;

interface CartPageProps {
  onCartUpdate: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onCartUpdate }) => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const userId = "user123";  // TODO: Get from auth context
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Fetch cart items when component mounts
  useEffect(() => {
    fetchCart();
  }, []);

  // Handle checkout process
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const order = await OrderService.createOrder(userId);
      message.success('Order placed successfully!');
      await fetchCart();
      onCartUpdate();
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to create order');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Fetch cart items with their stocks
  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await CartService.getCart(userId);
      
      const itemsWithStock = await Promise.all(
        data.map(async (item) => {
          try {
            if (!item.product) {
              console.warn(`Missing product data for cart item ${item.ID}`);
              return item;
            }
            
            // Fetch stocks for the product
            const stocks = await ProductService.getProductStocks(item.product_id);
            return {
              ...item,
              Product: {
                ...item.product,
                stocks: stocks,
                Stock: stocks.find(s => s.ID === item.stock_id)
              }
            };
          } catch (error) {
            console.error(`Failed to process cart item ${item.ID}:`, error);
            return item;
          }
        })
      );
      
      setCartItems(itemsWithStock);
      setError(null);
    } catch (error) {
      console.error('Cart fetch error:', error);
      setError('Failed to load cart data');
    } finally {
      setLoading(false);
    }
  };

  // Handle quantity updates
  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    const item = cartItems.find(i => i.ID === itemId);
    if (!item) return;

    const stocks = await ProductService.getProductStocks(item.product_id);
    const selectedStock = stocks.find(s => s.ID === item.stock_id);
    
    if (!selectedStock || quantity > selectedStock.quantity) {
      setError(`Only ${selectedStock?.quantity || 0} items available`);
      return;
    }

    setUpdating(itemId);
    try {
      await CartService.updateCartItem(itemId, {
        quantity,
        stock_id: item.stock_id
      });
      await fetchCart();
      onCartUpdate();
    } catch (error) {
      setError('Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  // Calculate total price
  const total = cartItems.reduce((sum, item) => {
    const selectedStock = item.Product?.stocks?.find(s => s.ID === item.stock_id);
    const price = selectedStock?.price || item.Product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Title level={2}>Shopping Cart</Title>
      
      {error && (
        <Alert 
          message={error} 
          type="error" 
          className="mb-4" 
          showIcon 
          closable 
          onClose={() => setError(null)} 
        />
      )}

      {cartItems.length === 0 ? (
        <Card className="empty-cart text-center p-8">
          <Space direction="vertical" size="large" align="center">
            <ShoppingCartOutlined style={{ fontSize: 48 }} />
            <Text className="text-lg">Your cart is empty</Text>
            <Button type="primary" onClick={() => navigate('/')} size="large">
              Continue Shopping
            </Button>
          </Space>
        </Card>
      ) : (
        <>
          <div className="cart-items-container mb-6">
            {cartItems.map((item: CartItemType) => (
              <CartItem
                key={item.ID}
                item={item}
                onUpdateQuantity={(quantity) => handleUpdateQuantity(item.ID, quantity)}
                loading={updating === item.ID}
              />
            ))}
          </div>
          
          <Card className="cart-summary">
            <Space direction="vertical" size="large" className="w-full">
              <div className="total-section flex justify-between items-center">
                <Title level={3} className="m-0">Total</Title>
                <Title level={3} className="m-0 text-primary">${total.toFixed(2)}</Title>
              </div>
              
              <Space size="middle" className="w-full justify-end">
                <Button onClick={() => navigate('/')}>
                  Continue Shopping
                </Button>
                <Button 
                  type="primary"
                  onClick={handleCheckout}
                  loading={checkoutLoading}
                  disabled={cartItems.length === 0}
                  size="large"
                >
                  Checkout ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </Button>
              </Space>
            </Space>
          </Card>
        </>
      )}
    </div>
  );
};