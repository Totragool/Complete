// src/pages/AdminDashboard.tsx
import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { DollarOutlined, ShoppingOutlined, WarningOutlined } from '@ant-design/icons';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-6">แดชบอร์ดผู้ดูแลระบบ</h1>
      
      {/* Overview Stats */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic 
              title="ยอดขายรวม" 
              value={15400} 
              prefix={<DollarOutlined />} 
              suffix="฿"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="จำนวนออเดอร์" 
              value={48} 
              prefix={<ShoppingOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="สินค้าใกล้หมด" 
              value={5} 
              prefix={<WarningOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      <Card title="สินค้าใกล้หมด" className="mb-6">
        <Table 
          columns={[
            { title: 'สินค้า', dataIndex: 'productName' },
            { title: 'สี', dataIndex: 'color' },
            { title: 'ขนาด', dataIndex: 'size' },
            { title: 'จำนวนคงเหลือ', dataIndex: 'quantity' }
          ]}
        />
      </Card>

      {/* Recent Orders */}
      <Card title="ออเดอร์ล่าสุด">
        <Table 
          columns={[
            { title: 'รหัสออเดอร์', dataIndex: 'orderId' },
            { title: 'ลูกค้า', dataIndex: 'customer' },
            { title: 'ยอดรวม', dataIndex: 'total' },
            { title: 'สถานะ', dataIndex: 'status' }
          ]}
        />
      </Card>
    </div>
  );
};