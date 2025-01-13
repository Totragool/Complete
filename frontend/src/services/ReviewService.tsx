import { Review, ReviewInput, ReviewAnalytics, ReviewsPagination } from '../interfaces/Review';

const baseUrl = 'http://localhost:8000/api';

export const ReviewService = {
    async getReviews(productId: number, pageParam: any): Promise<ReviewsPagination> {
        try {
            const response = await fetch(`${baseUrl}/products/${productId}/reviews`);
            if (!response.ok) {
                if (response.status === 404) {
                    return {
                        items: [],
                        total: 0,
                        page: 1,
                        totalPages: 1,
                        hasNextPage: false
                    };
                }
                throw new Error('Failed to fetch reviews');
            }
            const data = await response.json();
            return {
                items: data.items || [],
                total: data.total || 0,
                page: data.page || 1,
                totalPages: data.totalPages || 1,
                hasNextPage: data.hasNextPage || false
            };
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    },

    async createReview(review: ReviewInput): Promise<Review> {
        try {
            // Log the request data
            console.log('Sending review data:', review);
    
            const response = await fetch(`${baseUrl}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    product_id: review.productId,
                    user_id: review.userId,
                    rating: review.rating,
                    comment: review.comment,
                    images: review.images || []
                }),
            });
    
            // Log the response status
            console.log('Response status:', response.status);
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || 'Failed to create review');
                } catch (e) {
                    throw new Error(errorText || 'Failed to create review');
                }
            }
    
            const data = await response.json();
            console.log('Response data:', data);
    
            return {
                id: data.data.ID,
                productId: data.data.ProductID,
                userId: data.data.UserID,
                rating: data.data.Rating,
                comment: data.data.Comment,
                images: data.data.Images || [],
                helpfulVotes: data.data.HelpfulVotes || 0,
                verifiedPurchase: data.data.VerifiedPurchase || false,
                createdAt: data.data.CreatedAt,
                updatedAt: data.data.UpdatedAt
            };
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },

    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
    
        const response = await fetch(`${baseUrl}/reviews/upload`, {
            method: 'POST',
            body: formData,
        });
    
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload image');
        }
    
        const data = await response.json();
        return data.imageUrl;
    },

    async voteHelpful(reviewId: number): Promise<void> {
        try {
            const response = await fetch(`${baseUrl}/reviews/${reviewId}/vote`, {
                method: 'POST',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to vote');
            }
        } catch (error) {
            console.error('Error voting:', error);
            throw error;
        }
    },

    async getAnalytics(productId: number): Promise<ReviewAnalytics> {
        try {
            const response = await fetch(
                `${baseUrl}/products/${productId}/reviews/analytics`
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch analytics');
            }

            const data = await response.json();
            return {
                productId: productId,
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
    }
};