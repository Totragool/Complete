import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Layout, 
  Badge, 
  Button, 
  Space, 
  Typography, 
  message, 
  ConfigProvider,
  App as AntApp 
} from 'antd';
import { 
  ShoppingOutlined, 
  ShoppingCartOutlined,
  UserOutlined,
  OrderedListOutlined 
} from '@ant-design/icons';
import { HomePage } from './page/HomePage';
import { CartPage } from './page/CartPage';
import { OrdersPage } from './page/OrdersPage';
import { ProductDetailPage } from './Components/ProductDetail';
import { CartService } from './services/CartService';
import { theme } from './theme/theme';
import { QueryClient, QueryClientProvider } from 'react-query';
import './page/shopping-cart.css';
import './Components/ProductDetail.css';

const { Header, Footer } = Layout;
const { Title, Text } = Typography;

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface AppHeaderProps {
  cartCount: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({ cartCount }) => (
  <Header className="app-header">
    <div className="header-content">
      <Space>
        <Button type="link" href="/" className="logo-link">
          <ShoppingOutlined className="logo-icon" />
          <Title level={3} style={{ margin: 0, color: 'white' }}>
            IGotSofa
          </Title>
        </Button>
      </Space>
      <Space size="large">
        <Button 
          type="link" 
          href="/orders" 
          className="nav-link"
          icon={<OrderedListOutlined style={{ fontSize: '20px', color: 'white' }} />}
        >
          <Text style={{ color: 'white' }}>Orders</Text>
        </Button>
        <Badge count={cartCount} offset={[-8, 0]}>
          <Button
            type="text"
            icon={<ShoppingCartOutlined style={{ fontSize: '24px', color: 'white' }} />}
            href="/cart"
            className="cart-button"
          />
        </Badge>
        <Button
          type="text"
          icon={<UserOutlined style={{ fontSize: '24px', color: 'white' }} />}
          className="user-button"
        />
      </Space>
    </div>
  </Header>
);

const AppFooter: React.FC = () => (
  <Footer className="app-footer">
    <div className="footer-content">
      <div className="footer-section">
        <Title level={4}>About Us</Title>
        <Text>IGotSofa provides quality furniture for your home</Text>
      </div>
      <div className="footer-section">
        <Title level={4}>Contact</Title>
        <Text>Email: support@igotsofa.com</Text>
        <Text>Phone: (555) 123-4567</Text>
      </div>
      <div className="footer-section">
        <Title level={4}>Follow Us</Title>
        <Space>
          <Button type="link">Facebook</Button>
          <Button type="link">Instagram</Button>
          <Button type="link">Twitter</Button>
        </Space>
      </div>
    </div>
    <div className="footer-bottom">
      <Text>© 2024 IGotSofa. All rights reserved.</Text>
    </div>
  </Footer>
);

const App: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const userId = "user123"; // Should come from auth context

  const updateCartCount = async () => {
    try {
      const items = await CartService.getCart(userId);
      setCartCount(items?.length || 0);
    } catch (error) {
      console.error('Failed to update cart count:', error);
      message.error('Failed to update cart');
    }
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <AntApp>
          <BrowserRouter>
            <Layout className="app-layout">
              <AppHeader cartCount={cartCount} />
              <Layout.Content className="app-content">
                <Routes>
                  <Route 
                    path="/" 
                    element={<HomePage onCartUpdate={updateCartCount} />} 
                  />
                  <Route 
                    path="/cart" 
                    element={<CartPage onCartUpdate={updateCartCount} />} 
                  />
                  <Route 
                    path="/orders" 
                    element={<OrdersPage />} 
                  />
                  <Route 
                    path="/products/:id" 
                    element={<ProductDetailPage onCartUpdate={updateCartCount} />} 
                  />
                  <Route 
                    path="*" 
                    element={<Navigate to="/" replace />} 
                  />
                </Routes>
              </Layout.Content>
              <AppFooter />
            </Layout>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;