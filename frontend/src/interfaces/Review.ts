import { Product } from './Product';

export interface Review {
    ID: number;
    ProductID: number;
    Product?: Product;
    UserID: string;
    Rating: number;
    Comment: string;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
}