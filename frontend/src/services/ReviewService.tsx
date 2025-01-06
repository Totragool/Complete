import { Review, ReviewInput, ReviewAnalytics, ReviewsPagination } from '../interfaces/Review';

const baseUrl = 'http://localhost:8000/api';

export const ReviewService = {
    async getReviews(productId: number, page: number = 1, pageSize: number = 10): Promise<ReviewsPagination> {
        try {
            const response = await fetch(
                `${baseUrl}/products/${productId}/reviews?page=${page}&pageSize=${pageSize}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }
            
            const data = await response.json();
            
            // แปลงข้อมูลให้ตรงกับ interface
            return {
                items: data.items || [],
                total: data.total || 0,
                page: page,
                totalPages: data.totalPages || 1,
                hasNextPage: data.hasNextPage || false
            };
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw new Error('Failed to fetch reviews');
        }
    },

    async createReview(review: ReviewInput): Promise<Review> {
        try {
            // แปลง snake_case เป็น camelCase
            const payload = {
                product_id: review.product_id, // เปลี่ยนจาก product_id
                user_id: review.user_id,      // เปลี่ยนจาก user_id
                rating: review.rating,
                comment: review.comment,
                images: review.images
            };

            const response = await fetch(`${baseUrl}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create review');
            }

            const data = await response.json();
            
            // แปลงข้อมูลให้ตรงกับ interface Review
            return {
                ID: data.ID,
                ProductID: data.ProductID,
                UserID: data.UserID,
                Rating: data.Rating,
                Comment: data.Comment,
                HelpfulVotes: data.HelpfulVotes || 0,
                Images: data.Images || [],
                VerifiedPurchase: data.VerifiedPurchase || false,
                Status: data.Status,
                CreatedAt: data.CreatedAt,
                UpdatedAt: data.UpdatedAt
            };
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },

    async getAnalytics(productId: number): Promise<ReviewAnalytics> {
        try {
            const response = await fetch(
                `${baseUrl}/products/${productId}/reviews/analytics`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const data = await response.json();
            
            // แปลงข้อมูลให้ตรงกับ interface ReviewAnalytics
            return {
                productId: data.total_reviews || 0,
                totalReviews: data.total_reviews || 0,
                averageRating: data.average_rating || 0,
                ratingDistribution: data.rating_distribution || {},
                helpfulVotes: data.helpful_votes || 0,
                responseRate: data.response_rate || 0,
                verifiedPurchaseRate: data.verified_purchase_rate || 0
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    },

    async voteHelpful(reviewId: number): Promise<void> {
        try {
            const response = await fetch(`${baseUrl}/reviews/${reviewId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to vote');
            }
        } catch (error) {
            console.error('Error voting:', error);
            throw new Error('Failed to record vote');
        }
    },

    async uploadImage(file: File): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${baseUrl}/reviews/upload-image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            return data.imageUrl || '';
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
        }
    },

    async moderateReview(reviewId: number, action: 'approve' | 'reject'): Promise<void> {
        try {
            const response = await fetch(`${baseUrl}/reviews/${reviewId}/moderate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to moderate review');
            }
        } catch (error) {
            console.error('Error moderating review:', error);
            throw new Error('Failed to moderate review');
        }
    }
};