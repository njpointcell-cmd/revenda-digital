import 'server-only';
import {randomUUID} from 'node:crypto';
import {db} from '@/lib/db';
import {cartSchema} from '@/validations/cart';
import {configuredSupplierService} from '@/services/suppliers/supplier.service';
import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';

function encrypt(value:string){const key=createHash('sha256').update(process.env.SESSION_SECRET??'').digest();const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',key,iv);const content=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${content.toString('base64url')}`;}
export function decrypt(value:string){const [ivValue,tagValue,contentValue]=value.split('.');if(!ivValue||!tagValue||!contentValue)throw new Error('Entrega inválida.');const key=createHash('sha256').update(process.env.SESSION_SECRET??'').digest();const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(ivValue,'base64url'));decipher.setAuthTag(Buffer.from(tagValue,'base64url'));return Buffer.concat([decipher.update(Buffer.from(contentValue,'base64url')),decipher.final()]).toString('utf8');}

export async function fulfillPaidOrder(orderId:string){
  const order=await db.order.findUnique({where:{id:orderId},include:{items:{include:{delivery:true,product:{include:{supplierProduct:true}}}}}});
  if(!order||order.status!=='PAID')return;
  const supplierService=configuredSupplierService();
  await db.order.update({where:{id:order.id},data:{status:'PROCESSING',history:{create:{status:'PROCESSING',reason:'Pagamento aprovado; reservando produtos.'}}}});
  for(const item of order.items){
    if(item.deliveryType!=='AUTOMATIC_API'||!item.product.supplierProduct)continue;
    if(item.delivery?.status==='DELIVERED')continue;
    try{
      const result=await supplierService.getProvider('generic-rest').reserveProduct({externalCode:item.product.supplierProduct.externalCode,quantity:item.quantity,orderId:order.id,idempotencyKey:`delivery-${item.id}`});
      await db.delivery.upsert({where:{orderItemId:item.id},update:{status:'DELIVERED',encryptedContent:encrypt(result.content),externalReservationId:result.reservationId,deliveredAt:new Date(),errorCode:null},create:{orderItemId:item.id,idempotencyKey:`delivery-${item.id}`,status:'DELIVERED',encryptedContent:encrypt(result.content),externalReservationId:result.reservationId,deliveredAt:new Date()}});
    }catch{await db.delivery.upsert({where:{orderItemId:item.id},update:{status:'FAILED',errorCode:'SUPPLIER_RESERVATION_FAILED'},create:{orderItemId:item.id,idempotencyKey:`delivery-${item.id}`,status:'FAILED',errorCode:'SUPPLIER_RESERVATION_FAILED'}});}
  }
  const failed=await db.delivery.count({where:{orderItem:{orderId:order.id},status:'FAILED'}});
  await db.order.update({where:{id:order.id},data:{status:failed?'PROCESSING':'DELIVERED',history:{create:{status:failed?'PROCESSING':'DELIVERED',reason:failed?'Aguardando nova tentativa de entrega.':'Produtos reservados e entregues.'}}}});
}

export async function createOrder(userId:string,email:string,input:unknown){
  const items=cartSchema.parse(input);if(!items.length)throw new Error('Carrinho vazio.');
  const order=await db.$transaction(async tx=>{
    const products=await tx.product.findMany({where:{id:{in:items.map(item=>item.productId)},status:'ACTIVE'}});
    if(products.length!==items.length)throw new Error('Um produto não está mais disponível.');
    const lines=items.map(item=>{const product=products.find(value=>value.id===item.productId)!;if(item.quantity>product.availableStock)throw new Error(`Estoque insuficiente para ${product.name}.`);return {item,product};});
    const subtotal=lines.reduce((sum,line)=>sum+Number(line.product.price)*line.item.quantity,0).toFixed(2);
    const wallet=await tx.wallet.upsert({where:{userId},create:{userId,balance:0},update:{}});
    const debited=await tx.wallet.updateMany({where:{id:wallet.id,balance:{gte:subtotal}},data:{balance:{decrement:subtotal}}});
    if(debited.count!==1)throw new Error('Saldo insuficiente. Adicione crédito à sua carteira para concluir o pedido.');
    const created=await tx.order.create({data:{userId,idempotencyKey:randomUUID(),subtotal,total:subtotal,status:'PAID',items:{create:lines.map(line=>({productId:line.product.id,productName:line.product.name,unitPrice:line.product.price,unitCost:line.product.cost,quantity:line.item.quantity,deliveryType:line.product.deliveryType}))},history:{create:{status:'PAID',reason:'Pedido pago com saldo da carteira.'}}},include:{items:true}});
    await tx.payment.create({data:{orderId:created.id,provider:'wallet',idempotencyKey:`payment-${created.id}`,amount:subtotal,status:'PAID',confirmedAt:new Date()}});
    await tx.walletTransaction.create({data:{walletId:wallet.id,type:'ORDER_PAYMENT',amount:-Number(subtotal),idempotencyKey:`order-${created.id}`,orderId:created.id}});
    return created;
  });
  await fulfillPaidOrder(order.id);
  return {orderId:order.id,number:order.number};
}
