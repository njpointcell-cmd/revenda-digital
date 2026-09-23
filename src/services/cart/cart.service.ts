import 'server-only';
import {db} from '@/lib/db';
import {cartSchema} from '@/validations/cart';
import {toCents} from '@/utils/money';
import {cartTotal} from './calculation';
export async function quoteCart(input:unknown){const items=cartSchema.parse(input);const products=await db.product.findMany({where:{id:{in:items.map(i=>i.productId)},status:'ACTIVE'}});const unavailable=items.filter(i=>!products.some(p=>p.id===i.productId)).map(i=>i.productId);const lines=items.flatMap(item=>{const p=products.find(p=>p.id===item.productId);return p?[{...item,name:p.name,slug:p.slug,unitPriceCents:toCents(p.price.toFixed(2)),availableStock:p.availableStock}]:[];});return {lines,totalCents:cartTotal(lines),unavailable,valid:unavailable.length===0&&lines.every(i=>i.quantity<=i.availableStock)};}
