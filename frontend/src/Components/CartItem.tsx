// import React, { useState } from 'react';
// import { Card, Space, Button, Typography, Alert } from 'antd';
// import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
// import { CartItem as CartItemType } from '../interfaces/Cart';
// import { ProductService } from '../services/ProductService';

// const { Title, Text } = Typography;

// interface CartItemProps {
//   item: CartItemType;
//   onUpdateQuantity: (quantity: number) => void;
//   loading: boolean;
// }

// export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, loading }) => {
//   const [stockError, setStockError] = useState<string | null>(null);

//   const handleQuantityChange = async (newQuantity: number) => {
//     if (newQuantity < 1) return;

//     try {
//       const stock = await ProductService.getProductStock(item.product_id);
//       if (newQuantity > stock.quantity) {
//         setStockError(`Only ${stock.quantity} items available`);
//         return;
//       }
//       setStockError(null);
//       onUpdateQuantity(newQuantity);
//     } catch (error) {
//       console.error('Failed to check stock:', error);
//       setStockError('Failed to check stock availability');
//     }
//   };

//   if (!item?.product) {
//     return (
//       <Card className="cart-item">
//         <Alert
//           message="Item unavailable"
//           description="This item may have been removed from the store"
//           type="error"
//           showIcon
//         />
//       </Card>
//     );
//   }

//   const productData = item.product;
//   const stockData = productData.stock;
//   const subtotal = (productData.price || 0) * (item.quantity || 0);
//   const isOutOfStock = stockData?.status === "Out of Stock";
//   const isLowStock = stockData?.status === "Low Stock";
//   const maxQuantity = stockData?.quantity || 0;

//   return (
//     <Card className="cart-item shadow-sm">
//       <Space size="large" align="start" className="w-full">
//         {/* Product Image */}
//         <img
//           src={productData.image}
//           alt={productData.name}
//           className="cart-item-image rounded"
//           style={{ width: 100, height: 100, objectFit: 'cover' }}
//         />

//         {/* Product Details */}
//         <div className="cart-item-details flex-grow">
//           <Title level={5}>{productData.name}</Title>
//           <Text type="secondary">
//             ${productData.price?.toFixed(2)} each
//           </Text>
          
//           {/* Stock Status Alerts */}
//           {isOutOfStock && (
//             <Alert 
//               message="Out of Stock" 
//               type="error" 
//               showIcon 
//               className="mt-2"
//             />
//           )}
//           {isLowStock && (
//             <Alert 
//               message={`Low Stock: ${maxQuantity} remaining`} 
//               type="warning" 
//               showIcon 
//               className="mt-2"
//             />
//           )}
//         </div>

//         {/* Quantity Controls */}
//         <div className="cart-item-quantity">
//           <Space direction="vertical" align="center">
//             <Space>
//               <Button
//                 icon={<MinusOutlined />}
//                 onClick={() => handleQuantityChange(item.quantity - 1)}
//                 disabled={loading || item.quantity <= 1}
//               />
//               <Text strong style={{ width: '30px', textAlign: 'center' }}>
//                 {item.quantity}
//               </Text>
//               <Button
//                 icon={<PlusOutlined />}
//                 onClick={() => handleQuantityChange(item.quantity + 1)}
//                 disabled={
//                   loading ||
//                   isOutOfStock ||
//                   item.quantity >= maxQuantity
//                 }
//               />
//             </Space>
//             <Text type="secondary">
//               Subtotal: ${subtotal.toFixed(2)}
//             </Text>
//           </Space>
//         </div>
//       </Space>

//       {/* Stock Error Message */}
//       {stockError && (
//         <Alert
//           message={stockError}
//           type="error"
//           className="mt-4"
//           showIcon
//           closable
//           onClose={() => setStockError(null)}
//         />
//       )}
//     </Card>
//   );
// };

import React, { useState } from 'react';
import { Card, Space, Button, Typography, Alert, Divider } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined } from '@ant-design/icons';
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
      const stocks = await ProductService.getProductStocks(item.product_id);
      const selectedStock = stocks.find(s => s.ID === item.stock_id);
      
      if (!selectedStock || newQuantity > selectedStock.quantity) {
        setStockError(`Only ${selectedStock?.quantity || 0} items available`);
        return;
      }
      setStockError(null);
      onUpdateQuantity(newQuantity);
    } catch (error) {
      console.error('Failed to check stock:', error);
      setStockError('Failed to check stock availability');
    }
  };

  // Handle missing product data
  if (!item?.Product) {
    return (
      <Card className="cart-item mb-4">
        <Alert
          message="Item unavailable"
          description="This item may have been removed from the store"
          type="error"
          showIcon
        />
      </Card>
    );
  }

  const { Product, quantity } = item;
  const selectedStock = Product.stocks?.find(s => s.ID === item.stock_id);
  if (!selectedStock) return null;

  return (
    <Card className="cart-item mb-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      <Space size="large" align="start" className="w-full">
        {/* Product Image */}
        <div className="relative">
          <img
            src={selectedStock.image || Product.image}
            alt={Product.name}
            className="rounded-lg object-cover"
            style={{ width: 120, height: 120 }}
          />
          {selectedStock.quantity <= 5 && (
            <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded-bl-lg rounded-tr-lg">
              Low Stock
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="cart-item-details flex-grow">
          <Space direction="vertical" size="small" className="w-full">
            <Title level={5} className="mb-0">{Product.name}</Title>
            
            {/* Price */}
            <Text className="text-lg font-semibold text-primary">
              ${selectedStock.price.toFixed(2)}
            </Text>
            
            {/* Variation Details */}
            <Space className="text-gray-500">
              <Text>Color: {selectedStock.color}</Text>
              <Divider type="vertical" />
              <Text>Size: {selectedStock.shapeSize}</Text>
            </Space>

            {/* Stock Status Alerts */}
            {selectedStock.quantity === 0 && (
              <Alert 
                message="Out of Stock" 
                type="error" 
                showIcon 
                className="mt-2"
              />
            )}
            {selectedStock.quantity <= 5 && selectedStock.quantity > 0 && (
              <Alert 
                message={`Only ${selectedStock.quantity} items left`} 
                type="warning" 
                showIcon 
                className="mt-2"
              />
            )}
          </Space>
        </div>

        {/* Quantity Controls */}
        <div className="cart-item-quantity">
          <Space direction="vertical" align="end">
            <Space>
              <Button
                icon={<MinusOutlined />}
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={loading || quantity <= 1}
                size="large"
              />
              <Text strong className="text-lg px-4">
                {quantity}
              </Text>
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={
                  loading ||
                  selectedStock.quantity === 0 ||
                  quantity >= selectedStock.quantity
                }
                size="large"
              />
            </Space>
            <Text type="secondary" className="text-right">
              Subtotal: ${(selectedStock.price * quantity).toFixed(2)}
            </Text>
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleQuantityChange(0)}
              disabled={loading}
            >
              Remove
            </Button>
          </Space>
        </div>
      </Space>

      {/* Error Message */}
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
