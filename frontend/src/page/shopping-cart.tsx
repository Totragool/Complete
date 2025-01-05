import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Badge, Input, Alert, Spin, Typography, Space, Row, Col, Drawer } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined, ShoppingOutlined } from '@ant-design/icons';
import './shopping-cart.css';

const { Header, Content } = Layout;
const { Meta } = Card;
const { Title, Text } = Typography;



// Types
interface Product {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface CartItem {
  ID: number;
  ProductID: number;
  Product: Product;
  Quantity: number;
  UserID: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

// API client
const api = {
  baseUrl: 'http://localhost:8000/api',
  
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getCart(userId: string): Promise<CartItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cart?user_id=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format');
      }
      return data;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      return [];
    }
  },

  async addToCart(userId: string, productId: number): Promise<CartItem> {
    const response = await fetch(`${this.baseUrl}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity: 1, user_id: userId }),
    });
    if (!response.ok) throw new Error('Failed to add to cart');
    return response.json();
  },

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    const response = await fetch(`${this.baseUrl}/cart/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error('Failed to update cart item');
    return response.json();
  },
};

// Header Component
const AppHeader = ({ onCartClick, cartCount }: { onCartClick: () => void; cartCount: number }) => (
  <Header className="app-header">
    <div className="header-content">
      <Space>
        <ShoppingOutlined className="logo-icon" />
        <Title level={3} style={{ margin: 0, color: 'white' }}>Apple Store</Title>
      </Space>
      <Badge count={cartCount} offset={[-8, 0]}>
        <Button 
          type="text" 
          icon={<ShoppingCartOutlined style={{ fontSize: '24px', color: 'white' }} />} 
          onClick={onCartClick}
        />
      </Badge>
    </div>
  </Header>
);


// Product Card Component
const ProductCard = ({ product, onAddToCart, loading }: { 
  product: Product; 
  onAddToCart: () => void;
  loading: boolean;
}) => (
  <Card
    hoverable
    cover={<img alt={product.name} src={product.image} className="product-image" />}
    actions={[
      <Button 
        type="primary" 
        onClick={onAddToCart} 
        loading={loading}
        block
      >
        Add to Cart
      </Button>
    ]}
  >
    <Meta
      title={<Space className="product-header">
        <Text>{product.name}</Text>
        <Text type="success">${product.price.toFixed(2)}</Text>
      </Space>}
      description={product.description}
    />
  </Card>
);

// Cart Item Component
const CartItem = ({ 
  item, 
  onUpdateQuantity,
  loading
}: { 
  item: CartItem; 
  onUpdateQuantity: (quantity: number) => void;
  loading: boolean;
}) => {
  if (!item?.Product) {
    return <Card className="cart-item"><Alert message="Product information unavailable" type="error" /></Card>;
  }

  return (
    <Card className="cart-item">
      <Space size="large" align="start">
        <img src={item.Product.image} alt={item.Product.name} className="cart-item-image" />
        <div className="cart-item-details">
          <Title level={5}>{item.Product.name}</Title>
          <Text type="secondary">${item.Product.price.toFixed(2)} each</Text>
        </div>
        <Space>
          <Button 
            icon={<MinusOutlined />} 
            onClick={() => onUpdateQuantity(item.Quantity - 1)}
            disabled={loading || item.Quantity <= 1}
          />
          <Text>{item.Quantity}</Text>
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => onUpdateQuantity(item.Quantity + 1)}
            disabled={loading}
          />
        </Space>
        <Text strong>${(item.Product.price * item.Quantity).toFixed(2)}</Text>
      </Space>
    </Card>
  );
};

// Home Page
const HomePage = ({ onCartUpdate }: { onCartUpdate: () => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const userId = "user123";

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch(error => {
        console.error('Failed to fetch products:', error);
        setError('Failed to load products');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-container"><Spin size="large" /></div>;
  }

  return (
    <div className="page-container">
      {error && <Alert message={error} type="error" className="error-alert" />}
      <Row gutter={[24, 24]}>
        {products.map(product => (
          <Col xs={24} sm={12} lg={8} key={product.ID}>
            <ProductCard
              product={product}
              onAddToCart={async () => {
                setAddingToCart(product.ID);
                try {
                  await api.addToCart(userId, product.ID);
                  onCartUpdate();
                } catch (error) {
                  setError('Failed to add to cart');
                } finally {
                  setAddingToCart(null);
                }
              }}
              loading={addingToCart === product.ID}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

// Cart Page
const CartPage = ({ onCartUpdate }: { onCartUpdate: () => void }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const userId = "user123";

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const data = await api.getCart(userId);
        if (data.length === 0) {
          setError('No items found in cart');
        }
        setCartItems(data);
      } catch (error) {
        setError('Failed to load cart data');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const total = cartItems.reduce((sum, item) => {
    if (!item?.Product?.price || !item?.Quantity) return sum;
    return sum + item.Product.price * item.Quantity;
  }, 0);

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Title level={2}>Shopping Cart</Title>
      
      {error && <Alert message={error} type="error" className="error-alert" />}

      {cartItems.length === 0 ? (
        <Card className="empty-cart">
          <ShoppingCartOutlined style={{ fontSize: 48 }} />
          <Text>Your cart is empty</Text>
          <Button type="primary" onClick={() => window.location.href = '/'}>
            Continue Shopping
          </Button>
        </Card>
      ) : (
        <>
          {cartItems.map(item => (
            <CartItem
              key={item.ID}
              item={item}
              onUpdateQuantity={async (quantity) => {
                if (quantity < 1) return;
                setUpdating(item.ID);
                try {
                  await api.updateCartItem(item.ID, quantity);
                  const updatedCart = await api.getCart(userId);
                  setCartItems(updatedCart);
                  onCartUpdate();
                } catch (error) {
                  setError('Failed to update cart');
                } finally {
                  setUpdating(null);
                }
              }}
              loading={updating === item.ID}
            />
          ))}
          
          <Card className="cart-summary">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div className="total-section">
                <Title level={3}>Total</Title>
                <Title level={3}>${total.toFixed(2)}</Title>
              </div>
              <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => window.location.href = '/'}>
                  Continue Shopping
                </Button>
                <Button type="primary">
                  Checkout
                </Button>
              </Space>
            </Space>
          </Card>
        </>
      )}
    </div>
  );
};

// Main App Component
const ShoppingCartSystem = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'cart'>('home');
  const [cartCount, setCartCount] = useState(0);
  const userId = "user123";

  const updateCartCount = () => {
    api.getCart(userId)
      .then(items => setCartCount(items.length))
      .catch(console.error);
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <Layout className="app-layout">
      <AppHeader 
        onCartClick={() => setCurrentPage('cart')} 
        cartCount={cartCount}
      />
      <Content className="app-content">
        {currentPage === 'home' ? (
          <HomePage onCartUpdate={updateCartCount} />
        ) : (
          <CartPage onCartUpdate={updateCartCount} />
        )}
      </Content>
    </Layout>
  );
};

export default ShoppingCartSystem;

