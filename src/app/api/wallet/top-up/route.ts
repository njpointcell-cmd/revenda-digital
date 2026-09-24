import {NextRequest,NextResponse} from 'next/server';
import {getCurrentUser} from '@/services/auth/session';
import {createTopUp} from '@/services/wallet/wallet.service';
export async function POST(request:NextRequest){
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Faça login para continuar.'},{status:401});
  try{const body=await request.json();return NextResponse.json(await createTopUp(user.id,user.email,body.amount));}
  catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Não foi possível gerar o PIX.'},{status:400});}
}
