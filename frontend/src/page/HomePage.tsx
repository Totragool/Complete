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
import { Row, Col, Typography, Input, Select, Spin, Alert, Space, message } from 'antd';
import { ProductCard } from '../Components/ProductCard';
import { ProductService } from '../services/ProductService';
import { CartService } from '../services/CartService';
import { Product } from '../interfaces/Product';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface HomePageProps {
    onCartUpdate: () => Promise<void>;
}

export const HomePage: React.FC<HomePageProps> = ({ onCartUpdate }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<string>('default');
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const userId = "user123"; // Should come from auth context

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ProductService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId: number, stockId: number) => {
        try {
            setAddingToCart(productId);
            await CartService.addToCart(userId, productId, stockId);
            await onCartUpdate();
            message.success('Added to cart successfully');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            message.error('Failed to add to cart');
        } finally {
            setAddingToCart(null);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'rating':
                return (b.avg_rating || 0) - (a.avg_rating || 0);
            default:
                return 0;
        }
    });

    if (loading) {
        return <div className="flex justify-center p-8"><Spin size="large" /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Space direction="vertical" size="large" className="w-full">
                <Title level={2}>Featured Products</Title>

                {error && (
                    <Alert 
                        message={error} 
                        type="error" 
                        closable 
                        onClose={() => setError(null)} 
                    />
                )}

                <Space className="w-full justify-between">
                    <Search
                        placeholder="Search products..."
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: 300 }}
                    />

                    <Select
                        defaultValue="default"
                        style={{ width: 200 }}
                        onChange={setSortBy}
                    >
                        <Option value="default">Sort by: Default</Option>
                        <Option value="price-asc">Price: Low to High</Option>
                        <Option value="price-desc">Price: High to Low</Option>
                        <Option value="name">Name</Option>
                        <Option value="rating">Rating</Option>
                    </Select>
                </Space>

                <Row gutter={[16, 16]}>
                    {sortedProducts.map(product => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product.ID}>
                            <ProductCard
                                product={product}
                                onAddToCart={(stockId) => handleAddToCart(product.ID, stockId)}
                                loading={addingToCart === product.ID}
                            />
                        </Col>
                    ))}
                </Row>

                {sortedProducts.length === 0 && (
                    <div className="text-center py-8">
                        <Alert
                            message="No products found"
                            description="Try changing your search terms"
                            type="info"
                        />
                    </div>
                )}
            </Space>
        </div>
    );
};