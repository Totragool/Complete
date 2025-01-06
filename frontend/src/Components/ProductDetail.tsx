import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Rate, Input, Button, Typography, Divider, 
    Row, Col, Image, Space, Spin, Alert, Tag, App,
    Descriptions, Badge, Breadcrumb, message
} from 'antd';
import { 
    ShoppingCartOutlined, 
    HomeOutlined,
    ArrowLeftOutlined,
    TagOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    HeartOutlined,
    HeartFilled,
    ShareAltOutlined
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
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const userId = "user123"; // Should come from auth context

    const fetchProductDetails = async () => {
        try {
            setError(null);
            const data = await ProductService.getProductDetails(Number(id));
            console.log('Product details:', data);
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product?.stock || product.stock.quantity === 0) {
            message.error('Product is out of stock');
            return;
        }

        if (quantity > product.stock.quantity) {
            message.error('Selected quantity exceeds available stock');
            return;
        }

        setAddingToCart(true);
        try {
            await CartService.addToCart(userId, product.ID);
            message.success('Added to cart successfully');
            await fetchProductDetails();
            await onCartUpdate();
        } catch (error) {
            message.error('Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleQuantityChange = (value: number | null) => {
        if (!value || value < 1) return;
        if (product?.stock && value > product.stock.quantity) {
            message.warning(`Only ${product.stock.quantity} items available`);
            setQuantity(product.stock.quantity);
            return;
        }
        setQuantity(value);
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        message.success('Product link copied to clipboard!');
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        message.success(isFavorite ? 'Removed from wishlist' : 'Added to wishlist');
    };

    useEffect(() => {
        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    const getStockStatus = () => {
        if (!product?.stock) return null;

        const { quantity, MinQuantity } = product.stock;
        
        if (quantity === 0) {
            return <Badge status="error" text="Out of Stock" />;
        }
        if (quantity <= MinQuantity) {
            return <Badge status="warning" text={`Low Stock (${quantity} left)`} />;
        }
        return <Badge status="success" text={`In Stock (${quantity} available)`} />;
    };

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

    return (
        <div className="page-container">
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item href="/">
                    <HomeOutlined /> Home
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <TagOutlined /> Products
                </Breadcrumb.Item>
                <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
            </Breadcrumb>

            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                className="mb-4"
            >
                Back
            </Button>

            <Row gutter={[24, 24]}>
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

                <Col xs={24} md={12}>
                    <Card className="product-details-card">
                        <Space direction="vertical" size="large" className="w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Title level={2}>{product.name}</Title>
                                    <Space>
                                        <Rate disabled allowHalf value={product.avg_rating} />
                                        <Text>({product.reviews?.length || 0} reviews)</Text>
                                    </Space>
                                </div>
                                <Space>
                                    <Button
                                        icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                                        onClick={toggleFavorite}
                                        type={isFavorite ? 'primary' : 'default'}
                                    />
                                    <Button
                                        icon={<ShareAltOutlined />}
                                        onClick={handleShare}
                                    />
                                </Space>
                            </div>

                            <Space direction="vertical">
                                <Title level={3} type="success" className="mb-0">
                                    ${product.price.toFixed(2)}
                                </Title>
                                {getStockStatus()}
                            </Space>

                            <div>
                                <Title level={4}>Description</Title>
                                <Paragraph>{product.description}</Paragraph>
                            </div>

                            <Descriptions bordered size="small">
                                <Descriptions.Item label="SKU" span={3}>
                                    {product.ID}
                                </Descriptions.Item>
                                <Descriptions.Item label="Availability" span={3}>
                                    {product.stock?.status}
                                </Descriptions.Item>
                                <Descriptions.Item label="Added On" span={3}>
                                    {new Date(product.CreatedAt).toLocaleDateString()}
                                </Descriptions.Item>
                            </Descriptions>

                            {product.stock?.quantity > 0 && (
                                <Space direction="vertical" className="w-full">
                                    <Text>Quantity:</Text>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={product.stock.quantity}
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(Number(e.target.value))}
                                        style={{ width: '100px' }}
                                    />
                                </Space>
                            )}

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

            <ReviewSystem
                productId={product.ID}
                onReviewSubmitted={fetchProductDetails}
                initialAnalytics={{
                    productId: product.ID,
                    averageRating: product.avg_rating,
                    totalReviews: product.reviews?.length || 0,
                    ratingDistribution: {},
                    helpfulVotes: 0,
                    responseRate: 0,
                    verifiedPurchaseRate: 0
                }}
            />
        </div>
    );
};