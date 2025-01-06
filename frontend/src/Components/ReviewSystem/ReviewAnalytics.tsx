import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space } from 'antd';
import { StarFilled, LikeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import { ReviewService } from '../../services/ReviewService';
import { ReviewAnalytics as ReviewAnalyticsType } from '../../interfaces/Review';

interface ReviewAnalyticsProps {
    productId: number;
    initialData?: ReviewAnalyticsType;
}

export const ReviewAnalytics: React.FC<ReviewAnalyticsProps> = ({
    productId,
    initialData
}) => {
    const { data: analytics } = useQuery(
        ['reviewAnalytics', productId],
        () => ReviewService.getAnalytics(productId),
        {
            initialData,
            staleTime: 300000, // 5 minutes
        }
    );

    if (!analytics) return null;

    return (
        <Space direction="vertical" className="w-full">
            <Row gutter={[16, 16]}>
                {/* Average Rating */}
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Average Rating"
                            value={analytics.averageRating}
                            precision={1}
                            prefix={<StarFilled className="text-yellow-500" />}
                            suffix="/ 5"
                        />
                        <Progress
                            percent={analytics.averageRating * 20}
                            status="active"
                            showInfo={false}
                        />
                    </Card>
                </Col>

                {/* Total Reviews */}
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Total Reviews"
                            value={analytics.totalReviews}
                        />
                    </Card>
                </Col>

                {/* Rating Distribution */}
                <Col xs={24}>
                    <Card title="Rating Distribution">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = analytics.ratingDistribution[rating] || 0;
                            const percentage = (count / analytics.totalReviews) * 100;
                            return (
                                <Row key={rating} className="mb-2">
                                    <Col span={4}>
                                        {rating} {rating === 1 ? 'star' : 'stars'}
                                    </Col>
                                    <Col span={16}>
                                        <Progress
                                            percent={percentage}
                                            size="small"
                                            showInfo={false}
                                        />
                                    </Col>
                                    <Col span={4} className="text-right">
                                        {count}
                                    </Col>
                                </Row>
                            );
                        })}
                    </Card>
                </Col>

                {/* Additional Stats */}
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Helpful Votes"
                            value={analytics.helpfulVotes}
                            prefix={<LikeOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Verified Purchase Rate"
                            value={analytics.verifiedPurchaseRate}
                            precision={1}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
        </Space>
    );
};