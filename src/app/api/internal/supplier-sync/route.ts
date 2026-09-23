import {NextRequest,NextResponse} from 'next/server';
import {syncSupplierCatalog} from '@/services/suppliers/supplier.service';

export async function POST(request:NextRequest){
  const secret=process.env.CRON_SECRET?.trim();
  if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'Não autorizado.'},{status:401});
  try{return NextResponse.json({ok:true,result:await syncSupplierCatalog()});}
  catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Falha na sincronização.'},{status:500});}
}
