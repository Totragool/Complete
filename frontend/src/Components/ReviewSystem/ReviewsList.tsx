import React from 'react';
import { List, Spin, Empty } from 'antd';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ReviewCard } from './ReviewCard';
import { ReviewService } from '../../services/ReviewService';
import { Review } from '../../interfaces/Review';

interface ReviewsListProps {
    productId: number;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ productId }) => {
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isError
    } = useInfiniteQuery(
        ['reviews', productId],
        ({ pageParam = 1 }) => ReviewService.getReviews(productId, pageParam),
        {
            getNextPageParam: (lastPage) => 
                lastPage?.hasNextPage ? lastPage.page + 1 : undefined,
            staleTime: 60000,
            // เพิ่ม error handling
            onError: (error) => {
                console.error('Error fetching reviews:', error);
            }
        }
    );

    if (isLoading) return <Spin size="large" className="loading-spinner" />;
    if (isError) return <Empty description="Failed to load reviews" />;

    // แก้ไขการดึงข้อมูล reviews และเพิ่มการตรวจสอบ
    const reviews = data?.pages?.flatMap(page => page?.items || []).filter(Boolean) || [];

    if (reviews.length === 0) {
        return <Empty description="No reviews yet. Be the first to review!" />;
    }

    const getReviewKey = (review: Review) => {
        // ตรวจสอบว่ามี ID หรือไม่
        if (!review || typeof review.ID === 'undefined') {
            // ถ้าไม่มี ID ใช้ค่าอื่นๆ แทน
            return `${review?.ProductID}-${review?.UserID}-${Date.now()}`;
        }
        return review.ID.toString();
    };

    return (
        <InfiniteScroll
            dataLength={reviews.length}
            next={fetchNextPage}
            hasMore={!!hasNextPage}
            loader={<Spin />}
            scrollableTarget="reviews-container"
        >
            <List
                itemLayout="vertical"
                dataSource={reviews.filter(review => review !== null)}
                renderItem={(review: Review) => (
                    <ReviewCard 
                        key={getReviewKey(review)}
                        review={review}
                        onVoteChange={() => {
                            queryClient.invalidateQueries(['reviews', productId]);
                        }}
                    />
                )}
                // ใช้ฟังก์ชันเดียวกันสำหรับ rowKey
                rowKey={getReviewKey}
            />
        </InfiniteScroll>
    );
};