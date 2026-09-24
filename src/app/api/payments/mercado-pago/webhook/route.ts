import {NextRequest,NextResponse} from 'next/server';
import {getPayment} from '@/services/payments/mercado-pago';
import {reconcileOrderPayment} from '@/services/orders/order.service';
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
    await reconcileOrderPayment(payment.external_reference,payment);
    return NextResponse.json({received:true});
  }catch{return NextResponse.json({error:'Webhook recebido, mas não processado.'},{status:500});}
}
