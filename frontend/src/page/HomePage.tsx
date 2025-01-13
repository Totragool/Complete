// import React, { useState, useEffect } from 'react';
// import { Row, Col, Alert, Spin, Typography, Input, Select, Empty} from 'antd';
// import { ProductService } from '../services/ProductService';
// import { CartService } from '../services/CartService';
// import { Product } from '../interfaces/Product';
// import { ProductCard } from '../Components/ProductCard';
// import { App } from 'antd';

// const { Title } = Typography;
// const { Search } = Input;
// const { Option } = Select;

// interface HomePageProps {
//   onCartUpdate: () => void;
// }

// export const HomePage: React.FC<HomePageProps> = ({ onCartUpdate }) => {
//   const { message } = App.useApp();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [addingToCart, setAddingToCart] = useState<number | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState<string>('default');
//   const userId = "user123";

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const productsData = await ProductService.getProducts();
      
//       const productsWithStock = await Promise.all(
//         productsData.map(async (product) => {
//           try {
//             const stock = await ProductService.getProductStock(product.ID);
//             return { 
//               ...product, 
//               stock,
//               Stock: stock // For legacy support
//             };
//           } catch (error) {
//             console.error(`Failed to fetch stock for product ${product.ID}:`, error);
//             return product;
//           }
//         })
//       );
      
//       setProducts(productsWithStock);
//       setError(null);
//     } catch (error) {
//       console.error('Failed to fetch products:', error);
//       setError('Failed to load products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const handleAddToCart = async (product: Product) => {
//     if (!product.stock || product.stock.quantity === 0) {
//       message.error('Product is out of stock');
//       return;
//     }

//     setAddingToCart(product.ID);
//     try {
//       await CartService.addToCart(userId, product.ID);
//       message.success(`Added ${product.name} to cart`);
//       onCartUpdate();
//       // Optionally refresh product stock
//       const updatedStock = await ProductService.getProductStock(product.ID);
//       setProducts(prevProducts =>
//         prevProducts.map(p =>
//           p.ID === product.ID ? { ...p, stock: updatedStock } : p
//         )
//       );
//     } catch (error) {
//       message.error('Failed to add to cart');
//     } finally {
//       setAddingToCart(null);
//     }
//   };

//   const filteredProducts = products.filter(product =>
//     product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     product.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const sortedProducts = [...filteredProducts].sort((a, b) => {
//     switch (sortBy) {
//       case 'price-asc':
//         return a.price - b.price;
//       case 'price-desc':
//         return b.price - a.price;
//       case 'name':
//         return a.name.localeCompare(b.name);
//       case 'rating':
//         return (b.avg_rating || 0) - (a.avg_rating || 0);
//       default:
//         return 0;
//     }
//   });

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Title level={2} className="mb-6">Featured Products</Title>
      
//       {error && (
//         <Alert
//           message={error}
//           type="error"
//           className="mb-6"
//           showIcon
//           closable
//           onClose={() => setError(null)}
//         />
//       )}

//       <div className="mb-6 flex flex-wrap gap-4">
//         <Search
//           placeholder="Search products..."
//           onChange={e => setSearchTerm(e.target.value)}
//           className="max-w-md"
//           allowClear
//         />
//         <Select
//           defaultValue="default"
//           onChange={setSortBy}
//           style={{ width: 200 }}
//         >
//           <Option value="default">Sort by: Default</Option>
//           <Option value="price-asc">Price: Low to High</Option>
//           <Option value="price-desc">Price: High to Low</Option>
//           <Option value="name">Name</Option>
//           <Option value="rating">Rating</Option>
//         </Select>
//       </div>

//       {sortedProducts.length === 0 ? (
//         <Empty description="No products found" />
//       ) : (
//         <Row gutter={[24, 24]}>
//           {sortedProducts.map(product => (
//             <Col xs={24} sm={12} lg={8} xl={6} key={product.ID}>
//               <ProductCard
//                 product={product}
//                 onAddToCart={() => handleAddToCart(product)}
//                 loading={addingToCart === product.ID}
//               />
//             </Col>
//           ))}
//         </Row>
//       )}
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spin, Typography, Input, Select, Empty, Space, Card, Tag} from 'antd';
import { ProductService } from '../services/ProductService';
import { CartService } from '../services/CartService';
import { Product } from '../interfaces/Product';
import { ProductCard } from '../Components/ProductCard';
import { App } from 'antd';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Define available colors and sizes
const AVAILABLE_COLORS = [
  "Gray", "Blue", "Beige", "Brown", "Black", "Light Gray", 
  "Dark Gray", "Navy", "Mustard", "Green", "Pink"
];

const AVAILABLE_SIZES = [
  "3 Seater", "4 Seater", "Regular", "Large", "Left Corner", 
  "Right Corner", "Left Corner XL", "Standard", "Round", "Square", "Rectangle"
];

interface HomePageProps {
  onCartUpdate: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onCartUpdate }) => {
  const { message } = App.useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const userId = "user123";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await ProductService.getProducts();
      
      const productsWithStocks = await Promise.all(
        productsData.map(async (product) => {
          try {
            const stocks = await ProductService.getProductStocks(product.ID);
            return { 
              ...product, 
              stocks,
              Stock: stocks[0] // For legacy support
            };
          } catch (error) {
            console.error(`Failed to fetch stocks for product ${product.ID}:`, error);
            return product;
          }
        })
      );
      
      setProducts(productsWithStocks);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product, stockId: number) => {
    const selectedStock = product.stocks?.find(s => s.ID === stockId);
    if (!selectedStock || selectedStock.quantity === 0) {
      message.error('Selected variation is out of stock');
      return;
    }

    setAddingToCart(product.ID);
    try {
      await CartService.addToCart({
        user_id: userId,
        product_id: product.ID,
        stock_id: stockId,
        quantity: 1
      });
      message.success(`Added ${product.name} to cart`);
      onCartUpdate();
      
      // Refresh stocks
      const updatedStocks = await ProductService.getProductStocks(product.ID);
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.ID === product.ID ? { ...p, stocks: updatedStocks } : p
        )
      );
    } catch (error) {
      message.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  // Filter products based on search, color, and size
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesColor = !selectedColor || 
      product.stocks?.some(stock => stock.color === selectedColor);

    const matchesSize = !selectedSize || 
      product.stocks?.some(stock => stock.shapeSize === selectedSize);

    return matchesSearch && matchesColor && matchesSize;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.stocks?.[0]?.price || a.price) - (b.stocks?.[0]?.price || b.price);
      case 'price-desc':
        return (b.stocks?.[0]?.price || b.price) - (a.stocks?.[0]?.price || a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.avg_rating || 0) - (a.avg_rating || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">Featured Products</Title>
      
      {error && (
        <Alert
          message={error}
          type="error"
          className="mb-6"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      <Card className="mb-6">
        <Space direction="vertical" className="w-full">
          <Space wrap className="w-full">
            <Search
              placeholder="Search products..."
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              style={{ width: 200 }}
              placeholder="Filter by Color"
              allowClear
              onChange={setSelectedColor}
            >
              {AVAILABLE_COLORS.map(color => (
                <Option key={color} value={color}>{color}</Option>
              ))}
            </Select>

            <Select
              style={{ width: 200 }}
              placeholder="Filter by Size"
              allowClear
              onChange={setSelectedSize}
            >
              {AVAILABLE_SIZES.map(size => (
                <Option key={size} value={size}>{size}</Option>
              ))}
            </Select>

            <Select
              defaultValue="default"
              onChange={setSortBy}
              style={{ width: 200 }}
            >
              <Option value="default">Sort by: Default</Option>
              <Option value="price-asc">Price: Low to High</Option>
              <Option value="price-desc">Price: High to Low</Option>
              <Option value="name">Name</Option>
              <Option value="rating">Rating</Option>
            </Select>
          </Space>

          {/* Display active filters */}
          {(selectedColor || selectedSize) && (
            <Space wrap className="mt-2">
              <Text type="secondary">Active Filters:</Text>
              {selectedColor && (
                <Tag closable onClose={() => setSelectedColor('')}>
                  Color: {selectedColor}
                </Tag>
              )}
              {selectedSize && (
                <Tag closable onClose={() => setSelectedSize('')}>
                  Size: {selectedSize}
                </Tag>
              )}
            </Space>
          )}
        </Space>
      </Card>

      {sortedProducts.length === 0 ? (
        <Empty description="No products found" />
      ) : (
        <Row gutter={[24, 24]}>
          {sortedProducts.map(product => (
            <Col xs={24} sm={12} lg={8} xl={6} key={product.ID}>
              <ProductCard
                product={product}
                onAddToCart={(stockId) => handleAddToCart(product, stockId)}
                loading={addingToCart === product.ID}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};