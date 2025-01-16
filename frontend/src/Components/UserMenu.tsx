// src/components/UserMenu.tsx
import React from 'react';
import { Menu, Dropdown, Avatar } from 'antd';
import { 
    UserOutlined, 
    SettingOutlined, 
    ShopOutlined,
    LogoutOutlined,
    InboxOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
    isAdmin?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isAdmin = false }) => {
    const navigate = useNavigate();

    const handleMenuClick = (key: string) => {
        switch (key) {
            case 'profile':
                navigate('/profile');
                break;
            case 'stock':
                navigate('/stock-management');
                break;
            case 'orders':
                navigate('/orders');
                break;
            case 'settings':
                navigate('/settings');
                break;
            case 'logout':
                // ทำการ Logout
                break;
        }
    };

    const menu = (
        <Menu onClick={({ key }) => handleMenuClick(key.toString())}>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                โปรไฟล์
            </Menu.Item>
            
            <Menu.Item key="orders" icon={<InboxOutlined />}>
                ประวัติการสั่งซื้อ
            </Menu.Item>

            {isAdmin && (
                <Menu.ItemGroup title="การจัดการ">
                    <Menu.Item key="stock" icon={<ShopOutlined />}>
                        จัดการสต็อกสินค้า
                    </Menu.Item>
                </Menu.ItemGroup>
            )}

            <Menu.Divider />
            
            <Menu.Item key="settings" icon={<SettingOutlined />}>
                ตั้งค่า
            </Menu.Item>
            
            <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
                ออกจากระบบ
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Avatar 
                icon={<UserOutlined />} 
                className="cursor-pointer hover:opacity-80"
            />
        </Dropdown>
    );
};