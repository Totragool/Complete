import { Product } from './Product';

export interface Review {
    ID: number;
    ProductID: number;
    Product?: Product;
    UserID: string;
    Rating: number;
    Comment: string;
    HelpfulVotes?: number;
    Images?: string[];
    VerifiedPurchase: boolean;
    Reply?: string;
    Status: ReviewStatus;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
}

export interface ReviewInput {
    product_id: number;
    user_id: string;
    rating: number;
    comment: string;
    images?: string[];
}

export interface ReviewAnalytics {
    productId: number;
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    helpfulVotes: number;
    responseRate: number;
    verifiedPurchaseRate: number;
}

export enum ReviewStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export interface ReviewsPagination {
    items: Review[];
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
}