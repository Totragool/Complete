
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Rate, Input, Button, Typography, Divider, 
    Row, Col, Image, List, Space, Spin, Alert, Tag, App 
} from 'antd';
import { ShoppingCartOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { ProductService } from '../services/ProductService';
import { CartService } from '../services/CartService';
import { Product } from '../interfaces/Product';
import { Review } from '../interfaces/Review';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const ProductDetailPage: React.FC = () => {
    const { message } = App.useApp();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const userId = "user123";

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

    const handleSubmitReview = async () => {
        if (!userRating) {
            message.warning('Please provide a rating');
            return;
        }

        if (!userReview.trim()) {
            message.warning('Please write a review');
            return;
        }

        setSubmitting(true);
        try {
            await ProductService.createReview({
                ProductID: Number(id),
                UserID: userId,
                Rating: userRating,
                Comment: userReview.trim()
            });
            message.success('Review submitted successfully');
            setUserRating(0);
            setUserReview('');
            await fetchProductDetails();
        } catch (error) {
            console.error('Review submission error:', error);
            message.error('Failed to submit review');
        } finally {
            setSubmitting(false);
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
            await fetchProductDetails();
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

    return (
        <div className="page-container p-4">
            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Image
                        src={product.image}
                        alt={product.name}
                        className="w-full rounded-lg shadow-md"
                        style={{ objectFit: 'cover', maxHeight: '500px' }}
                    />
                </Col>

                <Col xs={24} md={12}>
                    <Card className="shadow-md">
                        <Title level={2}>{product.name}</Title>
                        <Space direction="vertical" size="large" className="w-full">
                            <Space>
                                <Rate disabled allowHalf value={product.avg_rating} />
                                <Text>({product.reviews?.length || 0} reviews)</Text>
                            </Space>
                            
                            <Title level={3} type="success" className="mb-0">
                                ${product.price.toFixed(2)}
                            </Title>

                            <Tag color={
                                product.stock?.quantity === 0 ? 'red' :
                                product.stock?.quantity <= product.stock?.MinQuantity ? 'orange' : 'green'
                            }>
                                {product.stock?.quantity === 0 ? 'Out of Stock' :
                                 `${product.stock?.quantity} in stock`}
                            </Tag>

                            <Paragraph>{product.description}</Paragraph>

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
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Customer Reviews</Divider>

            <Card title="Write a Review" className="mb-6">
                <Space direction="vertical" size="large" className="w-full">
                    <div>
                        <Text className="mb-2 block">Your Rating</Text>
                        <Rate value={userRating} onChange={setUserRating} />
                    </div>
                    
                    <div>
                        <Text className="mb-2 block">Your Review</Text>
                        <TextArea
                            rows={4}
                            value={userReview}
                            onChange={(e) => setUserReview(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            maxLength={500}
                            showCount
                        />
                    </div>

                    <Button
                        type="primary"
                        onClick={handleSubmitReview}
                        loading={submitting}
                        icon={<UserOutlined />}
                    >
                        Submit Review
                    </Button>
                </Space>
            </Card>

            <List
                itemLayout="vertical"
                dataSource={product.reviews || []}
                locale={{ emptyText: 'No reviews yet. Be the first to review!' }}
                className="reviews-list"
                renderItem={(review: Review) => (
                    <Card className="mb-4">
                        <Space direction="vertical" size="small" className="w-full">
                            <Space>
                                <UserOutlined />
                                <Text strong>{review.UserID}</Text>
                            </Space>
                            
                            <Rate disabled defaultValue={review.Rating} />
                            
                            <Space>
                                <CalendarOutlined />
                                <Text type="secondary">
                                    {new Date(review.CreatedAt).toLocaleDateString()}
                                </Text>
                            </Space>
                            
                            <Paragraph className="mt-4">
                                {review.Comment}
                            </Paragraph>
                        </Space>
                    </Card>
                )}
            />
        </div>
    );
};
