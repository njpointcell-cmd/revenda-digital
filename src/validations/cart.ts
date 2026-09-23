import {z} from 'zod';
export const cartSchema=z.array(z.object({productId:z.string().min(1).max(50),quantity:z.number().int().min(1).max(99)})).max(50).refine(items=>new Set(items.map(i=>i.productId)).size===items.length,'Produtos duplicados');
