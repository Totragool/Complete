// // interfaces/Order.ts
// import { OrderItem } from "./Orderitem";

// export interface Order {
//     ID: number;
//     UserID: string;
//     TotalPrice: number;
//     Status: string;
//     OrderDate: string;
//     OrderItems: OrderItem[];
//     CreatedAt: string;
//     UpdatedAt: string;
//     DeletedAt?: string | null;
// }

// interfaces/Order.ts
import { Product } from './Product';
import { Stock } from './Stock';

export interface Order {
    ID: number;
    UserID: string;
    OrderDate: string;
    Status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    TotalPrice: number;
    OrderItems: OrderItem[];
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
}

export interface OrderItem {
    ID: number;
    OrderID: number;
    ProductID: number;
    StockID: number;
    Product: Product;
    Stock: Stock;
    Quantity: number;
    UnitPrice: number;
    TotalPrice: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
}