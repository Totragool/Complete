import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
    Layout,  
    ConfigProvider,
    App as AntApp,
    message
} from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';

// Pages
import { HomePage } from './page/HomePage';
import { CartPage } from './page/CartPage';
import { OrdersPage } from './page/OrdersPage';
import { ProductDetailPage } from './page/ProductDetailPage';
import { ProfilePage } from './page/ProfilePage';
import { SettingsPage } from './page/SettingsPage';
import { StockManagementPage } from './page/StockManagementPage';
import { AdminDashboard} from './page/AdminDashboard';
import { AdminReports } from './page/AdminReports';

// Components
import { AppHeader } from './Components/AppHeader';
import { AppFooter } from './Components/AppFooter';

// Services
import { CartService } from './services/CartService';
import { AuthService } from './services/AuthService'; // สำหรับตรวจสอบ admin role

// Theme and Styles
import { theme } from './theme/theme';
// import './styles/global.css';

// Guards
import { AdminGuard } from './guards/AdminGuard';
import { AuthGuard } from './guards/AuthGuard';

// Create react-query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

const App: React.FC = () => {
    const [cartCount, setCartCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const userId = "user123"; // ควรมาจาก auth context

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const isAdminUser = await AuthService.checkAdminRole(userId);
                setIsAdmin(isAdminUser);
            } catch (error) {
                console.error('Error checking admin status:', error);
                message.error('Failed to verify user role');
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminStatus();
    }, [userId]);

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

    if (isLoading) {
        return null; // หรือแสดง loading spinner
    }

    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider theme={theme}>
                <AntApp>
                    <BrowserRouter>
                        <Layout className="min-h-screen">
                            <AppHeader 
                                cartCount={cartCount} 
                                isAdmin={isAdmin}
                            />
                            
                            <Layout.Content className="py-16 px-4 sm:px-6 lg:px-8">
                                <div className="max-w-7xl mx-auto">
                                    <Routes>
                                        {/* Public Routes */}
                                        <Route 
                                            path="/" 
                                            element={
                                                <HomePage 
                                                    onCartUpdate={updateCartCount} 
                                                />
                                            } 
                                        />
                                        <Route 
                                            path="/products/:id" 
                                            element={
                                                <ProductDetailPage 
                                                    onCartUpdate={updateCartCount} 
                                                />
                                            } 
                                        />

                                        {/* Protected Routes */}
                                        <Route element={<AuthGuard />}>
                                            <Route 
                                                path="/cart" 
                                                element={
                                                    <CartPage 
                                                        onCartUpdate={updateCartCount} 
                                                    />
                                                } 
                                            />
                                            <Route 
                                                path="/orders" 
                                                element={<OrdersPage />} 
                                            />
                                            <Route 
                                                path="/profile" 
                                                element={<ProfilePage />} 
                                            />
                                            <Route 
                                                path="/settings" 
                                                element={<SettingsPage />} 
                                            />
                                        </Route>

                                        {/* Admin Routes */}
                                        <Route element={<AdminGuard />}>
                                            <Route 
                                                path="/stock-management" 
                                                element={<StockManagementPage />} 
                                            />
                                        </Route>

                                        <Route path="/admin" element={<AdminGuard />}>
                                            <Route index element={<AdminDashboard />} />
                                            <Route path="stock" element={<StockManagementPage />} />
                                            {/* <Route path="orders" element={<AdminOrders />} /> */}
                                            <Route path="reports" element={<AdminReports />} />
                                            {/* <Route path="settings" element={<AdminSettings />} /> */}
                                        </Route>

                                        {/* 404 and Redirects */}
                                        <Route 
                                            path="*" 
                                            element={<Navigate to="/" replace />} 
                                        />
                                    </Routes>
                                </div>
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