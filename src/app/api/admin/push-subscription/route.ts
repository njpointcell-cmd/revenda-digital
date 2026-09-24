import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireAdmin} from '@/services/auth/session';
import {getVapidPublicKey} from '@/services/notifications/admin-push';

export async function GET(){
  try{
    await requireAdmin();
    const publicKey=getVapidPublicKey();
    if(!publicKey)return NextResponse.json({error:'Notificações push não configuradas.'},{status:503});
    return NextResponse.json({publicKey});
  }catch(error){if(error instanceof Response)return error;return NextResponse.json({error:'Não foi possível obter a configuração push.'},{status:500});}
}

export async function POST(request:NextRequest){
  try{
    const admin=await requireAdmin();
    const body=await request.json() as {endpoint?:string;keys?:{p256dh?:string;auth?:string}};
    if(!body.endpoint||!body.keys?.p256dh||!body.keys.auth)return NextResponse.json({error:'Assinatura inválida.'},{status:400});
    await db.adminPushSubscription.upsert({where:{endpoint:body.endpoint},create:{adminId:admin.id,endpoint:body.endpoint,p256dh:body.keys.p256dh,auth:body.keys.auth,userAgent:request.headers.get('user-agent')},update:{adminId:admin.id,p256dh:body.keys.p256dh,auth:body.keys.auth,userAgent:request.headers.get('user-agent')}});
    return NextResponse.json({ok:true});
  }catch(error){if(error instanceof Response)return error;return NextResponse.json({error:'Não foi possível salvar a assinatura.'},{status:500});}
}

export async function DELETE(request:NextRequest){
  try{
    const admin=await requireAdmin();
    const body=await request.json() as {endpoint?:string};
    if(body.endpoint)await db.adminPushSubscription.deleteMany({where:{endpoint:body.endpoint,adminId:admin.id}});
    return NextResponse.json({ok:true});
  }catch(error){if(error instanceof Response)return error;return NextResponse.json({error:'Não foi possível remover a assinatura.'},{status:500});}
}
