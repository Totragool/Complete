// export interface Stock {
//   ID: number;
//   ProductID: number;
//   quantity: number;
//   MinQuantity: number;
//   status: string;
//   CreatedAt: string;
//   UpdatedAt: string;
//   DeletedAt?: string | null;
// }

export interface Stock {
  ID: number;
  ProductID: number;
  Color: string;
  Size: string;
  Quantity: number;
  MinQuantity: number;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}