import { Product } from "./Product";

export interface CartItem {
    ID: number;
    product_id: number;
    stock_id: number;  // Added stock_id
    product?: Product;
    Product?: Product;  // For frontend consistency
    quantity: number;
    UserID: string;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
}