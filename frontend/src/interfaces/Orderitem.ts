import { Product } from './Product';
import { Order } from './Order';

export interface OrderItem {
    ID: number;
    OrderID: number;
    Order?: Order;
    ProductID: number;
    Product: Product;
    Quantity: number;
    UnitPrice: number;
    TotalPrice: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
}