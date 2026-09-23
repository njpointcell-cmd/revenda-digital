import type {SupplierStock,ReservationInput,ReservationResult} from './supplier.types';
export interface SupplierProvider {getStock():Promise<SupplierStock[]>;getProduct(externalCode:string):Promise<SupplierStock|null>;reserveProduct(input:ReservationInput):Promise<ReservationResult>;healthCheck():Promise<boolean>}
