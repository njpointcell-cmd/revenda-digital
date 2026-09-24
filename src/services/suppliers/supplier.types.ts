export type SupplierStock={
  externalCode:string;
  service:string;
  name?:string;
  slug?:string;
  description?:string;
  shortDescription?:string;
  image?:string;
  category?:string;
  quantity:number;
  cost?:string;
  updatedAt:Date;
};
export type ReservationInput={externalCode:string;service:string;quantity:number;orderId:string;idempotencyKey:string};
export type ReservationResult={reservationId:string;content:string};
