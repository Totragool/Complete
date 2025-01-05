import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Badge, Button, Space, Typography, message, ConfigProvider } from 'antd';
import { ShoppingOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { HomePage } from './page/HomePage';
import { CartPage } from './page/CartPage';
import { OrdersPage } from './page/OrdersPage';
import { ProductDetailPage } from './Components/ProductDetail';
import { CartService } from './services/CartService';
import { theme } from './theme/theme';
import './page/shopping-cart.css';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = ({ cartCount }: { cartCount: number }) => (
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
      <Badge count={cartCount} offset={[-8, 0]}>
        <Button
          type="text"
          icon={<ShoppingCartOutlined style={{ fontSize: '24px', color: 'white' }} />}
          href="/cart"
        />
      </Badge>
    </div>
  </Header>
);

const App = () => {
  const [cartCount, setCartCount] = useState(0);
  const userId = "user123";

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
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <Layout className="app-layout">
          <AppHeader cartCount={cartCount} />
          <Layout.Content className="app-content">
            <Routes>
              <Route path="/" element={<HomePage onCartUpdate={updateCartCount} />} />
              <Route path="/cart" element={<CartPage onCartUpdate={updateCartCount} />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout.Content>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;