import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {getPayment} from '@/services/payments/mercado-pago';
import {fulfillPaidOrder} from '@/services/orders/order.service';
import {creditTopUp} from '@/services/wallet/wallet.service';

export async function POST(request:NextRequest){
  try{
    const body=await request.json() as {type?:string;data?:{id?:string};action?:string};
    const paymentId=body.data?.id??new URL(request.url).searchParams.get('data.id');
    if(body.type!=='payment'||!paymentId)return NextResponse.json({received:true});
    const payment=await getPayment(paymentId);
    if(!payment.external_reference)return NextResponse.json({received:true});
    if(payment.external_reference.startsWith('wallet-topup:')){
      if(payment.status==='approved')await creditTopUp(payment.external_reference.slice('wallet-topup:'.length),String(payment.id));
      return NextResponse.json({received:true});
    }
    const status=payment.status==='approved'?'PAID':payment.status==='rejected'?'FAILED':payment.status==='cancelled'?'CANCELLED':'PENDING';
    await db.$transaction(async tx=>{
      const order=await tx.order.findUnique({where:{id:payment.external_reference}});
      if(!order)return;
      await tx.payment.updateMany({where:{orderId:order.id},data:{externalId:String(payment.id),status,confirmedAt:status==='PAID'?new Date():null}});
      if(order.status==='PAID'||order.status==='CANCELLED')return;
      await tx.order.update({where:{id:order.id},data:{status:status==='PAID'?'PAID':status==='FAILED'?'FAILED':status==='CANCELLED'?'CANCELLED':'WAITING_PAYMENT',history:{create:{status:status==='PAID'?'PAID':status==='FAILED'?'FAILED':status==='CANCELLED'?'CANCELLED':'WAITING_PAYMENT',reason:`Atualização Mercado Pago: ${payment.status}.`}}}});
    });
    if(status==='PAID')await fulfillPaidOrder(payment.external_reference);
    return NextResponse.json({received:true});
  }catch{return NextResponse.json({error:'Webhook recebido, mas não processado.'},{status:500});}
}
