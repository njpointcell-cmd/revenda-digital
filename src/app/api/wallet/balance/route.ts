import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/services/auth/session';
import {getWalletBalance} from '@/services/wallet/wallet.service';
export async function GET(){
  const user=await getCurrentUser();
  if(!user)return NextResponse.json({error:'Faça login para continuar.'},{status:401});
  return NextResponse.json({balance:await getWalletBalance(user.id)});
}
