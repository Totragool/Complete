// import React from 'react';
// import { Card, Tag, Space, Button, Typography} from 'antd';
// import { useNavigate } from 'react-router-dom';
// import { ShoppingCartOutlined } from '@ant-design/icons';
// import { Product } from '../interfaces/Product';
// import { App } from 'antd';


// const { Meta } = Card;
// const { Text, Title } = Typography;

// interface ProductCardProps {
//   product: Product;
//   onAddToCart: () => void;
//   loading: boolean;
// }

// export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, loading }) => {
//   const navigate = useNavigate();
//   const { message } = App.useApp();
//   const stockData = product.stock;
//   const isOutOfStock = stockData?.status === "Out of Stock";
//   const isLowStock = stockData?.status === "Low Stock";
//   const stockQuantity = stockData?.quantity || 0;
//   const minQuantity = stockData?.MinQuantity || 0;

//   const getStockTag = () => {
//     if (!stockData) return null;
    
//     if (isOutOfStock) {
//       return <Tag color="red">Out of Stock</Tag>;
//     }
//     if (isLowStock) {
//       return <Tag color="orange">Low Stock - {stockQuantity} left</Tag>;
//     }
//     return <Tag color="green">In Stock ({stockQuantity})</Tag>;
//   };

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (!stockData || stockQuantity === 0) {
//       message.error('Product is out of stock');
//       return;
//     }
//     onAddToCart();
//   };

//   return (
//     <Card
//       hoverable
//       className="h-full shadow-md transition-all duration-300 hover:shadow-lg"
//       cover={
//         <div 
//           className="relative pt-[75%] overflow-hidden"
//           onClick={() => navigate(`/products/${product.ID}`)}
//         >
//           <img
//             alt={product.name}
//             src={product.image}
//             className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer p-4 transition-transform duration-300 hover:scale-105"
//           />
//         </div>
//       }
//       actions={[
//         <Button
//           type="primary"
//           icon={<ShoppingCartOutlined />}
//           onClick={handleAddToCart}
//           loading={loading}
//           disabled={loading || !stockData || stockQuantity === 0}
//           className="w-11/12 mx-auto"
//         >
//           {loading ? 'Adding to Cart...' :
//            !stockData ? 'Checking Stock...' :
//            isOutOfStock ? 'Out of Stock' :
//            'Add to Cart'}
//         </Button>
//       ]}
//     >
//       <Meta
//         title={
//           <Space direction="vertical" className="w-full">
//             <div className="flex justify-between items-start">
//               <Title level={5} className="mb-0">{product.name}</Title>
//               <Text className="text-lg font-bold text-green-600">
//                 ${product.price.toFixed(2)}
//               </Text>
//             </div>
//             {getStockTag()}
//           </Space>
//         }
//         description={
//           <Space direction="vertical" className="w-full mt-2">
//             <Text className="text-gray-600">{product.description}</Text>
//             {stockData && stockQuantity <= minQuantity && stockQuantity > 0 && (
//               <Text className="text-orange-500">
//                 Only {stockQuantity} items remaining!
//               </Text>
//             )}
//             {product.avg_rating > 0 && (
//               <Text className="text-gray-500">
//                 Rating: {product.avg_rating.toFixed(1)} ({product.reviews?.length || 0} reviews)
//               </Text>
//             )}
//           </Space>
//         }
//       />
//     </Card>
//   );
// };

import React, { useState } from 'react';
import { Card, Tag, Space, Button, Typography, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Product } from '../interfaces/Product';

const { Meta } = Card;
const { Text, Title } = Typography;
const { Option } = Select;

interface ProductCardProps {
  product: Product;
  onAddToCart: (stockId: number) => void;
  loading: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, loading }) => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState<number | null>(null);

  // สร้างตัวเลือก stock
  const stockOptions = product.stocks?.map(stock => ({
    value: stock.ID,
    label: `${stock.Color} - ${stock.Size} (${stock.Quantity} available)`,
    disabled: stock.Quantity === 0
  }));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedStock) {
      message.warning('Please select color and size');
      return;
    }
    onAddToCart(selectedStock);
  };

  // คำนวณสถานะสต็อกรวม
  const totalStock = product.stocks?.reduce((sum, stock) => sum + stock.Quantity, 0) || 0;
  const stockStatus = totalStock === 0 ? 'Out of Stock' : 
                     totalStock <= 5 ? 'Low Stock' : 'In Stock';

  return (
    <Card
      hoverable
      className="h-full shadow-md"
      cover={
        <img
          alt={product.name}
          src={product.image}
          className="p-4 h-48 object-cover cursor-pointer"
          onClick={() => navigate(`/products/${product.ID}`)}
        />
      }
      actions={[
        <Select
          style={{ width: '90%' }}
          placeholder="Select color/size"
          onChange={setSelectedStock}
          options={stockOptions}
        />,
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          loading={loading}
          disabled={loading || !selectedStock}
        >
          Add to Cart
        </Button>
      ]}
    >
      <Meta
        title={
          <Space direction="vertical" className="w-full">
            <div className="flex justify-between">
              <Title level={5}>{product.name}</Title>
              <Text className="text-lg font-bold">
                ${product.price.toFixed(2)}
              </Text>
            </div>
            <Tag color={
              stockStatus === 'Out of Stock' ? 'red' :
              stockStatus === 'Low Stock' ? 'orange' : 'green'
            }>
              {stockStatus}
            </Tag>
          </Space>
        }
        description={
          <Space direction="vertical" className="w-full">
            <Text>{product.description}</Text>
            {product.avg_rating > 0 && (
              <Text className="text-gray-500">
                Rating: {product.avg_rating.toFixed(1)} ({product.reviews?.length || 0} reviews)
              </Text>
            )}
          </Space>
        }
      />
    </Card>
  );
};