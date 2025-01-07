import React from 'react';
import { Card, Rate, Space, Button, Typography, Tag, Image, message, App } from 'antd';
import { LikeOutlined, UserOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Review } from '../../interfaces/Review';
import { ReviewService } from '../../services/ReviewService';

const { Text, Paragraph } = Typography;

interface ReviewCardProps {
    review: Review;
    onVoteChange?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onVoteChange }) => {
    const { message } = App.useApp();
    
    return (
        <Card className="mb-4">
            <Space direction="vertical" size="small" className="w-full">
                <Space>
                    <UserOutlined />
                    <Text strong>{review.userId || 'Anonymous'}</Text> {/* เพิ่ม fallback */}
                    {review.verifiedPurchase && (
                        <Tag icon={<CheckCircleOutlined />} color="green">
                            Verified Purchase
                        </Tag>
                    )}
                </Space>
                
                <Rate disabled value={review.rating} />
                
                <Space>
                    <CalendarOutlined />
                    <Text type="secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                </Space>
                
                {/* แสดง comment ถ้ามี */}
                {review.comment && (
                    <Paragraph className="mt-4">
                        {review.comment}
                    </Paragraph>
                )}

                {/* แสดงรูปภาพถ้ามี */}
                {review.images && review.images.length > 0 && (
                    <Image.PreviewGroup>
                        <Space>
                            {review.images.map((img, index) => (
                                <Image
                                    key={index}
                                    width={100}
                                    src={img}
                                    className="rounded"
                                />
                            ))}
                        </Space>
                    </Image.PreviewGroup>
                )}

                {/* Helpful button */}
                <Button 
                    icon={<LikeOutlined />} 
                    onClick={onVoteChange}
                >
                    Helpful ({review.helpfulVotes})
                </Button>
            </Space>
        </Card>
    );
};