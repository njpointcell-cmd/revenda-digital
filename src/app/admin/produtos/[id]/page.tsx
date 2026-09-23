import {notFound} from 'next/navigation';
import {requireAdmin} from '@/services/auth/session';
import {db} from '@/lib/db';
import {ProductForm} from '@/components/admin/product-form';
export default async function EditProduct({params}:{params:Promise<{id:string}>}){await requireAdmin();const {id}=await params;const categories=await db.category.findMany({select:{id:true,name:true},orderBy:{name:'asc'}});const p=id==='novo'?null:await db.product.findUnique({where:{id}});if(id!=='novo'&&!p)notFound();return <><h1>{p?'Editar produto':'Novo produto'}</h1><ProductForm categories={categories} product={p?{id:p.id,name:p.name,slug:p.slug,description:p.description,shortDescription:p.shortDescription,price:p.price.toFixed(2),cost:p.cost.toFixed(2),categoryId:p.categoryId,image:p.image,availableStock:p.availableStock,deliveryType:p.deliveryType,status:p.status}:undefined}/></>;}
