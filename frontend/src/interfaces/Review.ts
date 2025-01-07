import { Product } from './Product';

export interface Review {
    id: number;
    productId: number;
    userId: string;
    rating: number;
    comment: string;
    images?: string[];
    helpfulVotes: number;
    verifiedPurchase: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewInput {
    productId: number;
    userId: string;
    rating: number;
    comment: string;
    images?: string[];
}

export interface ReviewAnalytics {
    productId: number;
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    helpfulVotes: number;
    responseRate: number;
    verifiedPurchaseRate: number;
}

export interface ReviewsPagination {
    items: Review[];
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
}