// import React, { useState, useEffect } from 'react';
// import { Card, Button, Alert, Spin, Typography, Space} from 'antd';
// import { ShoppingCartOutlined } from '@ant-design/icons';
// import { useNavigate } from 'react-router-dom';
// import { CartService } from '../services/CartService';
// import { ProductService } from '../services/ProductService';
// import { OrderService } from '../services/OrderService';
// import { CartItem as CartItemType } from '../interfaces/Cart';
// import { CartItem } from '../Components/CartItem';
// import { App } from 'antd';

// const { Title, Text } = Typography;

// interface CartPageProps {
//   onCartUpdate: () => void;
// }

// export const CartPage: React.FC<CartPageProps> = ({ onCartUpdate }) => {
//   const navigate = useNavigate();
//   const { message } = App.useApp();
//   const [cartItems, setCartItems] = useState<CartItemType[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [updating, setUpdating] = useState<number | null>(null);
//   const userId = "user123";
//   const [checkoutLoading, setCheckoutLoading] = useState(false);

//   const handleCheckout = async () => {
//     setCheckoutLoading(true);
//     try {
//       console.log('Starting checkout process...');
//       const order = await OrderService.createOrder(userId);
//       console.log('Order created:', order);
      
//       message.success('Order placed successfully!');
      
//       // Refresh cart and navigate
//       await fetchCart();
//       onCartUpdate();
//       console.log('Navigating to orders page...');
//       navigate('/orders');
//     } catch (error) {
//       console.error('Checkout error:', error);
//       if (error instanceof Error) {
//         message.error(error.message);
//       } else {
//         message.error('Failed to create order');
//       }
//     } finally {
//       setCheckoutLoading(false);
//     }
//   };
//   const fetchCart = async () => {
//     setLoading(true);
//     try {
//       console.log('Fetching cart...');
//       const data = await CartService.getCart(userId);
//       console.log('Raw cart data:', JSON.stringify(data, null, 2));
  
//       const itemsWithStock = await Promise.all(
//         data.map(async (item) => {
//           try {
//             // Debug logging
//             console.log('Processing cart item:', {
//               itemId: item.ID,
//               productId: item.ProductID,
//               product: item.Product  // Changed from Product to product
//             });
  
//             // Check if product exists
//             if (!item.Product) {  // Changed from Product to product
//               console.warn(`Missing product data for cart item ${item.ID}`);
//               return item;
//             }
  
//             // Stock is already included in the response, no need to fetch it again
//             return {
//               ...item,
//               Product: item.Product // Normalize to uppercase for frontend consistency
//             };
//           } catch (error) {
//             console.error(`Failed to process cart item ${item.ID}:`, error);
//             return item;
//           }
//         })
//       );
      
//       console.log('Processed cart items:', itemsWithStock);
//       setCartItems(itemsWithStock);
//       setError(null);
//     } catch (error) {
//       console.error('Cart fetch error:', error);
//       setError('Failed to load cart data');
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const handleUpdateQuantity = async (itemId: number, quantity: number) => {
//     if (quantity < 1) return;
    
//     const item = cartItems.find(i => i.ID === itemId);
//     if (!item) return;

//     const stock = await ProductService.getProductStock(item.ProductID);
//     if (quantity > stock.Quantity) {
//       setError(`Only ${stock.Quantity} items available`);
//       return;
//     }

//     setUpdating(itemId);
//     try {
//       await CartService.updateCartItem(itemId, quantity);
//       await fetchCart();
//       onCartUpdate();
//     } catch (error) {
//       setError('Failed to update cart');
//     } finally {
//       setUpdating(null);
//     }
//   };

//   const total = cartItems.reduce((sum, item) => {
//     if (!item?.Product?.price || !item?.quantity) return sum;
//     return sum + item.Product.price * item.quantity;
//   }, 0);

//   if (loading) {
//     return <div className="loading-container"><Spin size="large" /></div>;
//   }

//   return (
//     <div className="page-container">
//       <Title level={2}>Shopping Cart</Title>
      
//       {error && <Alert message={error} type="error" className="error-alert" closable />}

//       {cartItems.length === 0 ? (
//         <Card className="empty-cart">
//           <ShoppingCartOutlined style={{ fontSize: 48 }} />
//           <Text>Your cart is empty</Text>
//           <Button type="primary" onClick={() => window.location.href = '/'}>
//             Continue Shopping
//           </Button>
//         </Card>
//       ) : (
//         <>
//           {cartItems.map((item: CartItemType) => (
//               <CartItem
//                 key={item.ID}
//                 item={item}
//                 onUpdateQuantity={(quantity) => handleUpdateQuantity(item.ID, quantity)}
//                 loading={updating === item.ID}
//               />
//             ))}
          
//           <Card className="cart-summary">
//             <Space direction="vertical" size="large" style={{ width: '100%' }}>
//               <div className="total-section">
//                 <Title level={3}>Total</Title>
//                 <Title level={3}>${total.toFixed(2)}</Title>
//               </div>
//               <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
//                 <Button onClick={() => window.location.href = '/'}>
//                   Continue Shopping
//                 </Button>
//                 <Button 
//                   type="primary" 
//                   onClick={handleCheckout}
//                   loading={checkoutLoading}
//                   disabled={cartItems.length === 0}
//                 >
//                   Checkout ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
//                 </Button>
//               </Space>
//             </Space>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { Typography, Button, Alert, Spin, Space, Empty, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShoppingOutlined } from '@ant-design/icons';
import { CartItem } from '../Components/CartItem';
import { CartService } from '../services/CartService';
import { OrderService } from '../services/OrderService';
import { CartItem as CartItemType } from '../interfaces/Cart';

const { Title, Text } = Typography;

interface CartPageProps {
    onCartUpdate: () => Promise<void>;
}

export const CartPage: React.FC<CartPageProps> = ({ onCartUpdate }) => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<number | null>(null);
    const [checkingOut, setCheckingOut] = useState(false);
    const userId = "user123"; // Should come from auth context
    
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await CartService.getCart(userId);
            setCartItems(data);
        } catch (error) {
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId: number, quantity: number) => {
        if (quantity < 1) return;

        try {
            setUpdating(itemId);
            await CartService.updateCartItem(itemId, quantity);
            await fetchCart();
            await onCartUpdate();
        } catch (error) {
            message.error('Failed to update cart');
        } finally {
            setUpdating(null);
        }
    };

    const handleCheckout = async () => {
        try {
            setCheckingOut(true);
            await OrderService.createOrder(userId);
            message.success('Order placed successfully!');
            await onCartUpdate();
            navigate('/orders');
        } catch (error) {
            message.error('Failed to place order');
        } finally {
            setCheckingOut(false);
        }
    };

    const total = cartItems.reduce((sum, item) => {
        return sum + (item.Product?.price || 0) * item.quantity;
    }, 0);

    if (loading) {
        return <div className="flex justify-center p-8"><Spin size="large" /></div>;
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Your cart is empty"
                >
                    <Button type="primary" onClick={() => navigate('/')}>
                        Continue Shopping
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Space direction="vertical" size="large" className="w-full">
                <Title level={2}>Shopping Cart</Title>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        closable
                        onClose={() => setError(null)}
                    />
                )}

                {cartItems.map(item => (
                    <CartItem
                        key={item.ID}
                        item={item}
                        onUpdateQuantity={(quantity) => handleUpdateQuantity(item.ID, quantity)}
                        loading={updating === item.ID}
                    />
                ))}

                <div className="flex justify-between items-center border-t pt-4">
                    <Text strong className="text-xl">
                        Total: ${total.toFixed(2)}
                    </Text>
                    <Space>
                        <Button onClick={() => navigate('/')}>
                            Continue Shopping
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleCheckout}
                            loading={checkingOut}
                            disabled={cartItems.length === 0}
                            icon={<ShoppingOutlined />}
                        >
                            {checkingOut ? 'Processing...' : 'Checkout'}
                        </Button>
                    </Space>
                </div>
            </Space>
        </div>
    );
};