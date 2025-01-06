import React, { useState } from 'react';
import { Card, Space, Tabs } from 'antd';
import { ReviewsList } from './ReviewsList';
import { ReviewForm } from './ReviewForm';
import { ReviewAnalytics } from './ReviewAnalytics';
import { Review, ReviewAnalytics as ReviewAnalyticsType } from '../../interfaces/Review';
import './styles.css';

interface ReviewSystemProps {
    productId: number;
    onReviewSubmitted: () => void;
    initialAnalytics?: ReviewAnalyticsType;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
    productId,
    onReviewSubmitted,
    initialAnalytics
}) => {
    const [activeTab, setActiveTab] = useState('1');

    const items = [
        {
            key: '1',
            label: 'Reviews',
            children: <ReviewsList productId={productId} />
        },
        {
            key: '2',
            label: 'Write a Review',
            children: <ReviewForm productId={productId} onSuccess={onReviewSubmitted} />
        },
        {
            key: '3',
            label: 'Analytics',
            children: <ReviewAnalytics productId={productId} initialData={initialAnalytics} />
        }
    ];

    return (
        <Card className="review-system">
            <Tabs 
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
                className="review-tabs"
            />
        </Card>
    );
};