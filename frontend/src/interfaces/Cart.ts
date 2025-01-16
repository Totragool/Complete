// import { Product } from "./Product";

// export interface CartItem {
//     ID: number;
//     product_id: number;
//     product?: Product;
//     Product?: Product;  // For frontend consistency
//     quantity: number;
//     UserID: string;
//     CreatedAt: string;
//     UpdatedAt: string;
//     DeletedAt?: string | null;
// }

// interfaces/Cart.ts
import { Product } from './Product';
import { Stock } from './Stock';

export interface CartItem {
    ID: number;
    UserID: string;
    ProductID: number;
    StockID: number;
    Product: Product;
    Stock: Stock;
    quantity: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
}

export interface CartTotal {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
}