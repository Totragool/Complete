// pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, Tag, Space } from 'antd';
import { OrderService } from '../services/OrderService';
import { Order } from '../interfaces/Order';
// import { OrderItem } from '../interfaces/OrderItem';
import { App } from 'antd';

const { Title } = Typography;

export const OrdersPage: React.FC = () => {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = "user123";
  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await OrderService.getOrders(userId);
        console.log('Fetched orders:', data);
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        message.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'ID',
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Pending' ? 'gold' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
  ];

  const orderItemColumns = [
    {
      title: 'Product',
      dataIndex: ['Product', 'name'],
      key: 'name',
    },
    {
      title: 'Unit Price',
      dataIndex: 'UnitPrice',
      key: 'unit_price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'Quantity',
      key: 'quantity',
    },
    {
      title: 'Subtotal',
      dataIndex: 'TotalPrice',
      key: 'total',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
  ];

  return (
    <div className="page-container">
      <Title level={2}>Order History</Title>
      <Card>
        <Table
          dataSource={orders}
          columns={columns}
          loading={loading}
          rowKey="ID"
          expandable={{
            expandedRowRender: (record: Order) => (
              <div className="px-4">
                <Table
                  dataSource={record.OrderItems}
                  columns={orderItemColumns}
                  pagination={false}
                  rowKey="ID"
                  summary={(pageData) => (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <strong>Total</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>${record.TotalPrice.toFixed(2)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};