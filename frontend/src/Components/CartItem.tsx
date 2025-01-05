import React, { useState } from 'react';
import { Card, Space, Button, Typography, Alert } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { CartItem as CartItemType } from '../interfaces/Cart';
import { ProductService } from '../services/ProductService';

const { Title, Text } = Typography;

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  loading: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, loading }) => {
  const [stockError, setStockError] = useState<string | null>(null);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const stock = await ProductService.getProductStock(item.product_id);
      if (newQuantity > stock.quantity) {
        setStockError(`Only ${stock.quantity} items available`);
        return;
      }
      setStockError(null);
      onUpdateQuantity(newQuantity);
    } catch (error) {
      console.error('Failed to check stock:', error);
      setStockError('Failed to check stock availability');
    }
  };

  if (!item?.product) {
    return (
      <Card className="cart-item">
        <Alert
          message="Item unavailable"
          description="This item may have been removed from the store"
          type="error"
          showIcon
        />
      </Card>
    );
  }

  const productData = item.product;
  const stockData = productData.stock;
  const subtotal = (productData.price || 0) * (item.quantity || 0);
  const isOutOfStock = stockData?.status === "Out of Stock";
  const isLowStock = stockData?.status === "Low Stock";
  const maxQuantity = stockData?.quantity || 0;

  return (
    <Card className="cart-item shadow-sm">
      <Space size="large" align="start" className="w-full">
        {/* Product Image */}
        <img
          src={productData.image}
          alt={productData.name}
          className="cart-item-image rounded"
          style={{ width: 100, height: 100, objectFit: 'cover' }}
        />

        {/* Product Details */}
        <div className="cart-item-details flex-grow">
          <Title level={5}>{productData.name}</Title>
          <Text type="secondary">
            ${productData.price?.toFixed(2)} each
          </Text>
          
          {/* Stock Status Alerts */}
          {isOutOfStock && (
            <Alert 
              message="Out of Stock" 
              type="error" 
              showIcon 
              className="mt-2"
            />
          )}
          {isLowStock && (
            <Alert 
              message={`Low Stock: ${maxQuantity} remaining`} 
              type="warning" 
              showIcon 
              className="mt-2"
            />
          )}
        </div>

        {/* Quantity Controls */}
        <div className="cart-item-quantity">
          <Space direction="vertical" align="center">
            <Space>
              <Button
                icon={<MinusOutlined />}
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={loading || item.quantity <= 1}
              />
              <Text strong style={{ width: '30px', textAlign: 'center' }}>
                {item.quantity}
              </Text>
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={
                  loading ||
                  isOutOfStock ||
                  item.quantity >= maxQuantity
                }
              />
            </Space>
            <Text type="secondary">
              Subtotal: ${subtotal.toFixed(2)}
            </Text>
          </Space>
        </div>
      </Space>

      {/* Stock Error Message */}
      {stockError && (
        <Alert
          message={stockError}
          type="error"
          className="mt-4"
          showIcon
          closable
          onClose={() => setStockError(null)}
        />
      )}
    </Card>
  );
};
