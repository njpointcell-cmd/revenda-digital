import {NextRequest,NextResponse} from 'next/server';
import {getCurrentUser} from '@/services/auth/session';
import {createOrder} from '@/services/orders/order.service';
export async function POST(request:NextRequest){
  try{
    const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Faça login para continuar.'},{status:401});
    const body=await request.json();const result=await createOrder(user.id,user.email,body.items);
    return NextResponse.json(result,{status:201});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Não foi possível criar o pedido.'},{status:400});}
}
