// interfaces/Order.ts
import { OrderItem } from "./Orderitem";

export interface Order {
    ID: number;
    UserID: string;
    TotalPrice: number;
    Status: string;
    OrderDate: string;
    OrderItems: OrderItem[];
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
}