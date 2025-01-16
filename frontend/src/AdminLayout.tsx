import React from 'react';
import { Layout } from 'antd';
import { AdminNav } from './Components/AdminNav';
import { Outlet } from 'react-router-dom';

const { Sider, Content } = Layout;

export const AdminLayout: React.FC = () => {
  return (
    <Layout>
      <Sider width={250}>
        <AdminNav />
      </Sider>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};