import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Product } from '../interfaces/Product';
import { Stock } from '../interfaces/Stock';
import { ProductService } from '../services/ProductService';
import { StockService } from '../services/StockService';

const { Option } = Select;

interface StockManagementProps {
    productId: number;
}

export const StockManagement: React.FC<StockManagementProps> = ({ productId }) => {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingStock, setEditingStock] = useState<Stock | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchStocks();
    }, [productId]);

    const fetchStocks = async () => {
        try {
            setLoading(true);
            const data = await ProductService.getProductStock(productId);
            setStocks(data);
        } catch (error) {
            message.error('Failed to load stocks');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingStock) {
                await StockService.updateStock({
                    ...editingStock,
                    ...values
                });
                message.success('Stock updated successfully');
            } else {
                await StockService.createStock({
                    productId,
                    ...values
                });
                message.success('Stock created successfully');
            }
            setModalVisible(false);
            fetchStocks();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleDelete = async (stockId: number) => {
        try {
            await StockService.deleteStock(stockId);
            message.success('Stock deleted successfully');
            fetchStocks();
        } catch (error) {
            message.error('Failed to delete stock');
        }
    };

    const columns = [
        {
            title: 'Color',
            dataIndex: 'Color',
            key: 'color',
        },
        {
            title: 'Size',
            dataIndex: 'Size',
            key: 'size',
        },
        {
            title: 'Quantity',
            dataIndex: 'Quantity',
            key: 'quantity',
            render: (quantity: number, record: Stock) => (
                <Space>
                    {quantity}
                    {quantity <= record.MinQuantity && (
                        <Tag color="orange">Low Stock</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'status',
            render: (status: string) => (
                <Tag color={
                    status === 'In Stock' ? 'green' :
                    status === 'Low Stock' ? 'orange' :
                    'red'
                }>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: Stock) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingStock(record);
                            form.setFieldsValue(record);
                            setModalVisible(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.ID)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-4 flex justify-between">
                <h2>Stock Management</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingStock(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Add Stock
                </Button>
            </div>

            <Table
                dataSource={stocks}
                columns={columns}
                loading={loading}
                rowKey="ID"
            />

            <Modal
                title={editingStock ? 'Edit Stock' : 'Add Stock'}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={form.submit}
            >
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="Color"
                        label="Color"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="Size"
                        label="Size"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="Quantity"
                        label="Quantity"
                        rules={[{ required: true, min: 0 }]}
                    >
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>

                    <Form.Item
                        name="MinQuantity"
                        label="Minimum Quantity"
                        rules={[{ required: true, min: 0 }]}
                    >
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};