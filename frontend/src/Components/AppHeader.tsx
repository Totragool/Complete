// src/components/AppHeader.tsx
import React from 'react';
import { Layout, Badge, Button, Space, Typography } from 'antd';
import { 
    ShoppingOutlined, 
    ShoppingCartOutlined,
    OrderedListOutlined 
} from '@ant-design/icons';
import { UserMenu } from './UserMenu';

const { Header } = Layout;
const { Title } = Typography;

interface AppHeaderProps {
    cartCount: number;
    isAdmin?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ cartCount, isAdmin }) => {
    return (
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
                        <span style={{ color: 'white' }}>ประวัติการสั่งซื้อ</span>
                    </Button>
                    
                    <Badge count={cartCount} offset={[-8, 0]}>
                        <Button
                            type="text"
                            icon={<ShoppingCartOutlined style={{ fontSize: '24px', color: 'white' }} />}
                            href="/cart"
                            className="cart-button"
                        />
                    </Badge>

                    <UserMenu isAdmin={isAdmin} />
                </Space>
            </div>
        </Header>
    );
};