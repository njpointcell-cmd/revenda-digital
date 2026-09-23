import 'server-only';
import {Prisma} from '@prisma/client';
import {catalogRepository} from '@/repositories/catalog';
import {catalogQuerySchema} from '@/validations/catalog';
export async function listProducts(input:unknown){const query=catalogQuerySchema.parse(input);const where:Prisma.ProductWhereInput={status:'ACTIVE',...(query.q?{OR:[{name:{contains:query.q,mode:'insensitive'}},{shortDescription:{contains:query.q,mode:'insensitive'}}]}:{}),...(query.category?{category:{slug:query.category}}:{}),...(query.available?{availableStock:{gt:0}}:{})};const orderBy:Prisma.ProductOrderByWithRelationInput=query.sort==='price-asc'?{price:'asc'}:query.sort==='price-desc'?{price:'desc'}:query.sort==='name'?{name:'asc'}:{createdAt:'desc'};const [products,total]=await catalogRepository.list(where,orderBy,(query.page-1)*12,12);return {products,total,page:query.page,pages:Math.ceil(total/12)};}
