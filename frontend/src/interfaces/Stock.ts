export interface Stock {
  ID: number;
  ProductID: number;
  quantity: number;
  MinQuantity: number;
  status: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}