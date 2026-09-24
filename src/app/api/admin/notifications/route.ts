import {NextRequest,NextResponse} from 'next/server';
import {requireAdmin} from '@/services/auth/session';
import {db} from '@/lib/db';

export async function GET(request:NextRequest){
  try{
    await requireAdmin();
    const sinceValue=request.nextUrl.searchParams.get('since');
    const since=sinceValue?new Date(sinceValue):new Date(Date.now()-60_000);
    if(Number.isNaN(since.getTime()))return NextResponse.json({error:'Data inválida.'},{status:400});
    const tickets=await db.ticket.findMany({
      where:{createdAt:{gt:since}},
      select:{id:true,subject:true,createdAt:true,user:{select:{name:true}}},
      orderBy:{createdAt:'asc'},
      take:20,
    });
    return NextResponse.json({tickets});
  }catch(error){
    if(error instanceof Response)return error;
    return NextResponse.json({error:'Não foi possível consultar notificações.'},{status:500});
  }
}
