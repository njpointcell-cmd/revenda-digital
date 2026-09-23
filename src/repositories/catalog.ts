import 'server-only';
import {Prisma} from '@prisma/client';
import {db} from '@/lib/db';
export const catalogRepository={
 categories:()=>db.category.findMany({orderBy:{name:'asc'}}),
 product:(slug:string)=>db.product.findFirst({where:{slug,status:'ACTIVE'},include:{category:true}}),
 list:(where:Prisma.ProductWhereInput,orderBy:Prisma.ProductOrderByWithRelationInput,skip:number,take:number)=>db.$transaction([db.product.findMany({where,orderBy,skip,take,include:{category:true}}),db.product.count({where})])
};
