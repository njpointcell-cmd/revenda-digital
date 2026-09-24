import 'server-only';
import webpush from 'web-push';
import {db} from '@/lib/db';

type PushPayload={title:string;body:string;url:string};

function configured(){
  const {VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY,VAPID_SUBJECT}=getPushConfig();
  if(!VAPID_PUBLIC_KEY||!VAPID_PRIVATE_KEY||!VAPID_SUBJECT)return false;
  webpush.setVapidDetails(VAPID_SUBJECT,VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);
  return true;
}

function getPushConfig(){
  return {VAPID_PUBLIC_KEY:process.env.VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY:process.env.VAPID_PRIVATE_KEY,VAPID_SUBJECT:process.env.VAPID_SUBJECT};
}

export function getVapidPublicKey(){return process.env.VAPID_PUBLIC_KEY??null;}

export async function sendAdminPush(payload:PushPayload){
  if(!configured())return;
  const subscriptions=await db.adminPushSubscription.findMany();
  await Promise.allSettled(subscriptions.map(async subscription=>{
    try{
      await webpush.sendNotification({endpoint:subscription.endpoint,keys:{p256dh:subscription.p256dh,auth:subscription.auth}},JSON.stringify(payload));
    }catch(error){
      const status=(error as {statusCode?:number}).statusCode;
      if(status===404||status===410)await db.adminPushSubscription.delete({where:{id:subscription.id}}).catch(()=>undefined);
    }
  }));
}

export async function notifyAdminsNewTicket(ticket:{id:string;subject:string;userName:string}){
  await sendAdminPush({title:'Novo chamado de suporte',body:`${ticket.userName}: ${ticket.subject}`,url:`/admin/tickets#${ticket.id}`});
}

export async function notifyAdminsCustomerReply(ticket:{id:string;subject:string;userName:string}){
  await sendAdminPush({title:'Nova resposta no chamado',body:`${ticket.userName}: ${ticket.subject}`,url:`/admin/tickets#${ticket.id}`});
}
