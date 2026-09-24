import {NextRequest,NextResponse} from 'next/server';
import {getCurrentUser} from '@/services/auth/session';
import {db} from '@/lib/db';
import {getPayment} from '@/services/payments/mercado-pago';

export async function GET(_request:NextRequest,{params}:{params:Promise<{orderId:string}>}){
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Faça login para continuar.'},{status:401});
  const {orderId}=await params;
  const order=await db.order.findFirst({where:{id:orderId,userId:user.id},include:{payments:{where:{provider:'mercadopago'},orderBy:{createdAt:'desc'},take:1}}});
  const stored=order?.payments[0];
  if(!order||!stored?.externalId)return NextResponse.json({error:'Pagamento não encontrado.'},{status:404});
  try{
    const payment=await getPayment(stored.externalId);
    const data=payment.point_of_interaction?.transaction_data;
    return NextResponse.json({orderId:order.id,orderNumber:order.number,status:order.status,paymentStatus:payment.status,qrCodeBase64:data?.qr_code_base64??'',qrCode:data?.qr_code??'',ticketUrl:data?.ticket_url??'',expiresAt:payment.date_of_expiration??null});
  }catch{return NextResponse.json({error:'Não foi possível consultar o pagamento.'},{status:502});}
}
