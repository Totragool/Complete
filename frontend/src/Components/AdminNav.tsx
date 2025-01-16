import React from 'react';
import { Menu } from 'antd';
import { 
  DashboardOutlined, 
  ShopOutlined, 
  FileTextOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

export const AdminNav: React.FC = () => {
  return (
    <Menu theme="dark" mode="inline">
      <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
        <Link to="/admin">แดชบอร์ด</Link>
      </Menu.Item>
      <Menu.Item key="stock" icon={<ShopOutlined />}>
        <Link to="/admin/stock">จัดการสต็อก</Link>
      </Menu.Item>
      <Menu.Item key="orders" icon={<FileTextOutlined />}>
        <Link to="/admin/orders">ออเดอร์</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/admin/settings">ตั้งค่า</Link>
      </Menu.Item>
    </Menu>
  );
};