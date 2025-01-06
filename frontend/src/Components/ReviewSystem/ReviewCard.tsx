import React from 'react';
import { Card, Rate, Space, Button, Typography, Tag, Image, message } from 'antd';
import { LikeOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Review } from '../../interfaces/Review';
import { ReviewService } from '../../services/ReviewService';

const { Text, Paragraph } = Typography;

interface ReviewCardProps {
    review: Review;
    onVoteChange?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onVoteChange }) => {
    const handleHelpfulVote = async () => {
        try {
            await ReviewService.voteHelpful(review.ID);
            if (onVoteChange) onVoteChange();
        } catch (error) {
            console.error('Failed to vote:', error);
            message.error('Failed to submit vote');
        }
    };

    return (
        <Card className="review-card mb-4">
            <Space direction="vertical" size="small" className="w-full">
                {/* Header */}
                <Space className="w-full justify-between">
                    <Space>
                        <UserOutlined />
                        <Text strong>{review.UserID}</Text>
                        {review.VerifiedPurchase && (
                            <Tag icon={<CheckCircleOutlined />} color="green">
                                Verified Purchase
                            </Tag>
                        )}
                    </Space>
                    <Text type="secondary">
                        {new Date(review.CreatedAt).toLocaleDateString()}
                    </Text>
                </Space>

                {/* Rating */}
                <Rate disabled defaultValue={review.Rating} />

                {/* Review Content */}
                <Paragraph>{review.Comment}</Paragraph>

                {/* Images if any */}
                {review.Images && review.Images.length > 0 && (
                    <Image.PreviewGroup>
                        <Space>
                            {review.Images.map((img, index) => (
                                <Image
                                    key={index}
                                    width={100}
                                    src={img}
                                    className="review-image"
                                />
                            ))}
                        </Space>
                    </Image.PreviewGroup>
                )}

                {/* Actions */}
                <Space className="review-actions">
                    <Button
                        icon={<LikeOutlined />}
                        onClick={handleHelpfulVote}
                    >
                        Helpful ({review.HelpfulVotes})
                    </Button>
                </Space>

                {/* Reply if exists */}
                {review.Reply && (
                    <Card className="review-reply" size="small">
                        <Text type="secondary">Seller's Response:</Text>
                        <Paragraph>{review.Reply}</Paragraph>
                    </Card>
                )}
            </Space>
        </Card>
    );
};