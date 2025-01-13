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
  price: number;
  quantity: number;
  color: string;
  shapeSize: string;
  image: string;
  status: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}