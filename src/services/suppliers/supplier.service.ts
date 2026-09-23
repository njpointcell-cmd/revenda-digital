import 'server-only';
import {db} from '@/lib/db';
import type {SupplierProvider} from './supplier.interface';
import {GenericRestSupplierProvider} from './providers/generic-rest.provider';

export class SupplierService {constructor(private readonly providers:ReadonlyMap<string,SupplierProvider>=new Map()){}getProvider(name:string){const provider=this.providers.get(name);if(!provider)throw new Error('Fornecedor não configurado');return provider;}}

function slugify(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90);}
function priceWithMargin(cost:string){const margin=Number(process.env.SUPPLIER_PRICE_MARGIN_PERCENT??'50');if(!Number.isFinite(margin)||margin<0||margin>500)throw new Error('SUPPLIER_PRICE_MARGIN_PERCENT inválido.');return (Number(cost)*(1+margin/100)).toFixed(2);}

export function configuredSupplierService(){
  const baseUrl=process.env.SUPPLIER_API_URL?.trim();
  if(!baseUrl)throw new Error('SUPPLIER_API_URL não configurada.');
  return new SupplierService(new Map([['generic-rest',new GenericRestSupplierProvider(baseUrl,process.env.SUPPLIER_API_KEY)]]));
}

export async function syncSupplierCatalog(){
  const supplier=await db.supplier.upsert({
    where:{provider:'generic-rest'},
    update:{name:process.env.SUPPLIER_NAME?.trim()||'Fornecedor principal',active:true},
    create:{name:process.env.SUPPLIER_NAME?.trim()||'Fornecedor principal',provider:'generic-rest',active:true},
  });
  const items=await configuredSupplierService().getProvider(supplier.provider).getStock();
  let created=0,updated=0,skipped=0;
  await db.$transaction(async tx=>{
    for(const item of items){
      const existing=await tx.supplierProduct.findUnique({where:{supplierId_externalCode:{supplierId:supplier.id,externalCode:item.externalCode}},include:{product:true}});
      if(!existing&&(!item.name||!item.cost)){skipped++;continue;}
      const categoryName=item.category||'Produtos importados';
      const categorySlug=slugify(categoryName)||'produtos-importados';
      const category=await tx.category.upsert({where:{slug:categorySlug},update:{},create:{name:categoryName,slug:categorySlug,description:'Categoria sincronizada do fornecedor.'}});
      const productData=item.name?{
        name:item.name,slug:slugify(item.slug||item.name)+'-'+slugify(item.externalCode).slice(0,20),
        description:item.description||item.shortDescription||`Produto importado do fornecedor ${supplier.name}.`,
        shortDescription:item.shortDescription||item.name,
        image:item.image?.startsWith('https://')?item.image:(existing?.product.image??null),
        price:item.cost?priceWithMargin(item.cost):existing?.product.price.toFixed(2)??'0.01',
        cost:item.cost??existing?.product.cost.toFixed(2)??'0.00',
        status:'ACTIVE' as const,deliveryType:'AUTOMATIC_API' as const,availableStock:item.quantity,
        stockSynced:true,lastSyncedAt:item.updatedAt,categoryId:category.id,
      }:null;
      const product=existing?.product??(productData?await tx.product.create({data:productData}):null);
      if(!product){skipped++;continue;}
      if(existing){await tx.product.update({where:{id:product.id},data:productData??{availableStock:item.quantity,stockSynced:true,lastSyncedAt:item.updatedAt}});updated++;}
      else {created++;}
      await tx.supplierProduct.upsert({
        where:{supplierId_externalCode:{supplierId:supplier.id,externalCode:item.externalCode}},
        update:{productId:product.id,quantity:item.quantity,cost:item.cost??null,lastSyncedAt:item.updatedAt},
        create:{supplierId:supplier.id,productId:product.id,externalCode:item.externalCode,quantity:item.quantity,cost:item.cost??null,lastSyncedAt:item.updatedAt},
      });
    }
  });
  return {total:items.length,created,updated,skipped};
}
