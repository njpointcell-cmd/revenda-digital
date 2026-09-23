import {z} from 'zod';

export const ticketSchema=z.object({
  subject:z.string().trim().min(5).max(120),
  category:z.enum(['PAYMENT','DELIVERY','PRODUCT','ACCOUNT','OTHER']),
  body:z.string().trim().min(10).max(5000),
  orderId:z.string().trim().optional(),
});
export const messageSchema=z.object({body:z.string().trim().min(2).max(5000)});
