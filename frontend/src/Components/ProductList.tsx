// src/components/ProductList.tsx
import React, { useState } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { Product } from '../interfaces/Product';
import { StockManagement } from './StockManagement';
import { ProductService } from '../services/ProductService';
import { useQuery, useMutation, useQueryClient } from 'react-query';

interface ProductListProps {
    mode?: 'management' | 'display';
}

export const ProductList: React.FC<ProductListProps> = ({ mode = 'display' }) => {
    const [searchText, setSearchText] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isStockModalVisible, setIsStockModalVisible] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // ดึงข้อมูลสินค้าทั้งหมด
    const { data: products, isLoading } = useQuery('products', ProductService.getProducts);

    // Mutation สำหรับลบสินค้า
    const deleteMutation = useMutation(
        (id: number) => ProductService.deleteProduct(id),
        {
            onSuccess: () => {
                message.success('ลบสินค้าสำเร็จ');
                queryClient.invalidateQueries('products');
            },
            onError: () => {
                message.error('ไม่สามารถลบสินค้าได้');
            }
        }
    );

    const columns = [
        {
            title: 'รูปภาพ',
            dataIndex: 'image',
            key: 'image',
            render: (image: string) => (
                <img 
                    src={image} 
                    alt="product" 
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                />
            ),
        },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value: string, record: Product) => 
                record.name.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'ราคา',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `฿${price.toFixed(2)}`,
        },
        {
            title: 'สถานะสต็อก',
            key: 'stock_status',
            render: (_: any, record: Product) => {
                const totalStock = record.stocks?.reduce((sum, stock) => sum + stock.Quantity, 0) || 0;
                const isLowStock = record.stocks?.some(stock => stock.Quantity <= stock.MinQuantity);
                
                if (totalStock === 0) {
                    return <Tag color="red">สินค้าหมด</Tag>;
                } else if (isLowStock) {
                    return <Tag color="orange">สต็อกต่ำ</Tag>;
                }
                return <Tag color="green">พร้อมขาย</Tag>;
            },
        },
        {
            title: 'จำนวนคงเหลือ',
            key: 'total_quantity',
            render: (_: any, record: Product) => {
                const total = record.stocks?.reduce((sum, stock) => sum + stock.Quantity, 0) || 0;
                return total;
            },
        }
    ];

    // เพิ่มคอลัมน์ Actions ถ้าอยู่ในโหมด management
    if (mode === 'management') {
        columns.push({
            title: 'จัดการ',
            key: 'action',
            render: (_: any, record: Product) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedProduct(record);
                            form.setFieldsValue(record);
                            setIsModalVisible(true);
                        }}
                    >
                        แก้ไข
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedProduct(record);
                            setIsStockModalVisible(true);
                        }}
                    >
                        จัดการสต็อก
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            Modal.confirm({
                                title: 'ยืนยันการลบสินค้า',
                                content: `คุณต้องการลบสินค้า "${record.name}" ใช่หรือไม่?`,
                                okText: 'ลบ',
                                cancelText: 'ยกเลิก',
                                okButtonProps: { danger: true },
                                onOk: () => deleteMutation.mutate(record.ID)
                            });
                        }}
                    >
                        ลบ
                    </Button>
                </Space>
            ),
        });
    }

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="ค้นหาสินค้า"
                    prefix={<SearchOutlined />}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                />
                {mode === 'management' && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setSelectedProduct(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        เพิ่มสินค้า
                    </Button>
                )}
            </Space>

            <Table
                columns={columns}
                dataSource={products}
                loading={isLoading}
                rowKey="ID"
            />

            {/* Modal สำหรับเพิ่ม/แก้ไขสินค้า */}
            <Modal
                title={selectedProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={form.submit}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={async (values) => {
                        try {
                            if (selectedProduct) {
                                await ProductService.updateProduct(selectedProduct.ID, values);
                                message.success('แก้ไขสินค้าสำเร็จ');
                            } else {
                                await ProductService.createProduct(values);
                                message.success('เพิ่มสินค้าสำเร็จ');
                            }
                            setIsModalVisible(false);
                            queryClient.invalidateQueries('products');
                        } catch (error) {
                            message.error('เกิดข้อผิดพลาด');
                        }
                    }}
                >
                    <Form.Item
                        name="name"
                        label="ชื่อสินค้า"
                        rules={[{ required: true, message: 'กรุณากรอกชื่อสินค้า' }]}
                    >
                        <Input />
                    </Form.Item>
                    
                    <Form.Item
                        name="price"
                        label="ราคา"
                        rules={[{ required: true, message: 'กรุณากรอกราคา' }]}
                    >
                        <Input type="number" prefix="฿" />
                    </Form.Item>
                    
                    <Form.Item
                        name="description"
                        label="รายละเอียด"
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal สำหรับจัดการสต็อก */}
            <Modal
                title="จัดการสต็อก"
                visible={isStockModalVisible}
                onCancel={() => setIsStockModalVisible(false)}
                width={800}
                footer={null}
            >
                {selectedProduct && (
                    <StockManagement productId={selectedProduct.ID} />
                )}
            </Modal>
        </div>
    );
};