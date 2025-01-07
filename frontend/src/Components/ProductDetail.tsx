import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Rate, Button, Typography, Divider, 
    Row, Col, Image, Space, Spin, Alert, Tag, App,
    Breadcrumb
} from 'antd';
import { 
    ShoppingCartOutlined, 
    HomeOutlined,
    ArrowLeftOutlined,
    TagOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { ProductService } from '../services/ProductService';
import { CartService } from '../services/CartService';
import { Product } from '../interfaces/Product';
import { ReviewSystem } from './ReviewSystem';

const { Title, Text, Paragraph } = Typography;

interface ProductDetailPageProps {
    onCartUpdate: () => Promise<void>;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onCartUpdate }) => {
    const { message } = App.useApp();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const userId = "user123"; // Should come from auth context

    const fetchProductDetails = async () => {
        try {
            setError(null);
            const data = await ProductService.getProductDetails(Number(id));
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Failed to load product details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product?.stock || product.stock.quantity === 0) {
            message.error('Product is out of stock');
            return;
        }

        setAddingToCart(true);
        try {
            await CartService.addToCart(userId, product.ID);
            message.success('Added to cart successfully');
            await onCartUpdate();
        } catch (error) {
            message.error('Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <Alert
                message={error || "Product Not Found"}
                description="Unable to load product details. Please try again."
                type="error"
                showIcon
                className="m-4"
                action={
                    <Button onClick={() => navigate('/')} type="primary">
                        Back to Products
                    </Button>
                }
            />
        );
    }

    const breadcrumbItems = [
        {
            title: <><HomeOutlined /> Home</>,
            href: '/'
        },
        {
            title: <><TagOutlined /> Products</>,
            href: '/products'
        },
        {
            title: product.name
        }
    ];

    return (
        <div className="page-container">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} className="mb-4" />

            {/* Back Button */}
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                className="mb-4"
            >
                Back
            </Button>

            <Row gutter={[24, 24]}>
                {/* Product Image */}
                <Col xs={24} md={12}>
                    <Card className="product-image-card">
                        <Image
                            src={product.image}
                            alt={product.name}
                            className="w-full rounded-lg"
                            style={{ objectFit: 'cover' }}
                        />
                    </Card>
                </Col>

                {/* Product Details */}
                <Col xs={24} md={12}>
                    <Card className="product-details-card">
                        <Space direction="vertical" size="large" className="w-full">
                            {/* Product Title and Rating */}
                            <div>
                                <Title level={2}>{product.name}</Title>
                                <Space>
                                    <Rate disabled allowHalf value={product.avg_rating} />
                                    <Text>({product.reviews?.length || 0} reviews)</Text>
                                </Space>
                            </div>

                            {/* Price and Stock Status */}
                            <Space direction="vertical">
                                <Title level={3} type="success" className="mb-0">
                                    ${product.price.toFixed(2)}
                                </Title>
                                <Tag color={
                                    product.stock?.quantity === 0 ? 'red' :
                                    product.stock?.quantity <= (product.stock?.MinQuantity || 0) ? 'orange' : 'green'
                                }>
                                    {product.stock?.quantity === 0 ? 'Out of Stock' :
                                    product.stock?.quantity <= (product.stock?.MinQuantity || 0) ? 'Low Stock' :
                                    'In Stock'}
                                    {product.stock?.quantity > 0 && ` (${product.stock?.quantity} available)`}
                                </Tag>
                            </Space>

                            {/* Product Description */}
                            <div>
                                <Title level={4}>Description</Title>
                                <Paragraph>{product.description}</Paragraph>
                            </div>

                            {/* Add to Cart Button */}
                            <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                onClick={handleAddToCart}
                                loading={addingToCart}
                                disabled={!product.stock?.quantity}
                                size="large"
                                block
                            >
                                {addingToCart ? 'Adding to Cart...' :
                                 !product.stock?.quantity ? 'Out of Stock' :
                                 'Add to Cart'}
                            </Button>

                            {/* Shipping Info */}
                            <Card size="small" className="shipping-info">
                                <Space>
                                    <ClockCircleOutlined />
                                    <Text>Usually ships within 2-3 business days</Text>
                                </Space>
                            </Card>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Reviews Section */}
            <ReviewSystem
                productId={product.ID}
                onReviewSubmitted={fetchProductDetails}
                initialAnalytics={{
                    productId: product.ID,
                    totalReviews: product.reviews?.length || 0,
                    averageRating: product.avg_rating || 0,
                    ratingDistribution: {},
                    helpfulVotes: 0,
                    responseRate: 0,
                    verifiedPurchaseRate: 0
                }}
            />
        </div>
    );
};