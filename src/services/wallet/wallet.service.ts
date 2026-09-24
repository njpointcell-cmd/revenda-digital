import 'server-only';
import {randomUUID} from 'node:crypto';
import {db} from '@/lib/db';
import {createPixTopUp} from '@/services/payments/mercado-pago';

export async function createTopUp(userId:string,email:string,rawAmount:unknown){
  const amount=Number(rawAmount);
  if(!Number.isFinite(amount)||amount<10||amount>1000)throw new Error('Informe um valor entre R$ 10,00 e R$ 1.000,00.');
  const value=Number(amount.toFixed(2));
  const topUp=await db.walletTopUp.create({data:{userId,amount:value,idempotencyKey:randomUUID()}});
  try{
    const preference=await createPixTopUp({topUpId:topUp.id,email,amount:value});
    await db.walletTopUp.update({where:{id:topUp.id},data:{preferenceId:preference.id}});
    return {checkoutUrl:preference.init_point??preference.sandbox_init_point};
  }catch(error){await db.walletTopUp.update({where:{id:topUp.id},data:{status:'FAILED'}});throw error;}
}

export async function creditTopUp(topUpId:string,paymentId:string){
  await db.$transaction(async tx=>{
    const topUp=await tx.walletTopUp.findUnique({where:{id:topUpId}});
    if(!topUp||topUp.status==='APPROVED')return;
    if(topUp.status!=='PENDING')return;
    const wallet=await tx.wallet.upsert({where:{userId:topUp.userId},create:{userId:topUp.userId,balance:0},update:{}});
    await tx.wallet.update({where:{id:wallet.id},data:{balance:{increment:topUp.amount}}});
    await tx.walletTransaction.create({data:{walletId:wallet.id,type:'TOP_UP',amount:topUp.amount,idempotencyKey:`topup-${topUp.id}`,topUpId:topUp.id}});
    await tx.walletTopUp.update({where:{id:topUp.id},data:{status:'APPROVED',externalPaymentId:paymentId,confirmedAt:new Date()}});
  });
}

export async function getWallet(userId:string){
  return db.wallet.findUnique({where:{userId},select:{balance:true},});
}
