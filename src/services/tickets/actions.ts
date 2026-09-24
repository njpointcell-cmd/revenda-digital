'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin,requireUser} from '@/services/auth/session';
import {actionError} from '@/lib/action-error';
import type {ActionState} from '@/lib/action-state';
import {messageSchema,ticketSchema} from '@/validations/tickets';
import {uploadImage} from '@/lib/cloudinary';
import {notifyAdminsCustomerReply,notifyAdminsNewTicket} from '@/services/notifications/admin-push';

async function attachmentData(form:FormData, folder:string){
  const file=form.get('attachment');
  if(!(file instanceof File)||file.size===0)return null;
  const uploaded=await uploadImage(file,folder);
  return {url:uploaded.url,publicId:uploaded.publicId,filename:file.name,contentType:file.type,bytes:file.size};
}

export async function createTicket(_:ActionState,form:FormData):Promise<ActionState>{
  const user=await requireUser();
  try{
    const data=ticketSchema.parse(Object.fromEntries(form));
    if(data.orderId){const order=await db.order.findFirst({where:{id:data.orderId,userId:user.id},select:{id:true}});if(!order)throw new Error('Pedido inválido para este chamado.');}
    const attachment=await attachmentData(form,'revenda-digital/tickets');
    const ticket=await db.ticket.create({data:{userId:user.id,orderId:data.orderId||null,subject:data.subject,category:data.category,status:'OPEN',messages:{create:{authorId:user.id,body:data.body,attachments:attachment?{create:attachment}:undefined}}}});
    await notifyAdminsNewTicket({id:ticket.id,subject:ticket.subject,userName:user.name});
    revalidatePath('/minha-conta/suporte');redirect(`/minha-conta/suporte/${ticket.id}`);
  }catch(error){return actionError(error);}
}
export async function replyTicket(_:ActionState,form:FormData):Promise<ActionState>{
  const user=await requireUser();
  try{
    const ticketId=String(form.get('ticketId')??'');const data=messageSchema.parse({body:form.get('body')});
    const ticket=await db.ticket.findFirst({where:{id:ticketId,userId:user.id}});if(!ticket)throw new Error('Chamado não encontrado.');if(ticket.status==='CLOSED')throw new Error('Este chamado foi encerrado. Abra um novo ticket para continuar o atendimento.');
    const attachment=await attachmentData(form,'revenda-digital/tickets');
    await db.$transaction([db.ticketMessage.create({data:{ticketId,authorId:user.id,body:data.body,attachments:attachment?{create:attachment}:undefined}}),db.ticket.update({where:{id:ticketId},data:{status:'WAITING_SUPPORT'}})]);
    await notifyAdminsCustomerReply({id:ticket.id,subject:ticket.subject,userName:user.name});
    revalidatePath(`/minha-conta/suporte/${ticketId}`);return {success:'Resposta enviada.'};
  }catch(error){return actionError(error);}
}
export async function adminReplyTicket(_:ActionState,form:FormData):Promise<ActionState>{
  const admin=await requireAdmin();
  try{
    const ticketId=String(form.get('ticketId')??'');const data=messageSchema.parse({body:form.get('body')});
    const ticket=await db.ticket.findUnique({where:{id:ticketId}});if(!ticket)throw new Error('Chamado não encontrado.');if(ticket.status==='CLOSED')throw new Error('Este ticket está encerrado.');
    const attachment=await attachmentData(form,'revenda-digital/tickets');
    await db.$transaction([db.ticketMessage.create({data:{ticketId,authorId:admin.id,body:data.body,attachments:attachment?{create:attachment}:undefined}}),db.ticket.update({where:{id:ticketId},data:{status:'WAITING_CUSTOMER'}}),db.auditLog.create({data:{actorId:admin.id,action:'ticket.replied',entityId:ticketId}})]);
    revalidatePath('/admin/tickets');revalidatePath(`/minha-conta/suporte/${ticketId}`);return {success:'Resposta enviada.'};
  }catch(error){return actionError(error);}
}
export async function updateTicketStatus(form:FormData){
  const admin=await requireAdmin();const ticketId=String(form.get('ticketId')??'');const status=String(form.get('status')??'');
  if(!['OPEN','WAITING_CUSTOMER','WAITING_SUPPORT','CLOSED'].includes(status))throw new Error('Status inválido.');
  await db.$transaction([db.ticket.update({where:{id:ticketId},data:{status:status as 'OPEN'|'WAITING_CUSTOMER'|'WAITING_SUPPORT'|'CLOSED'}}),db.auditLog.create({data:{actorId:admin.id,action:'ticket.status.changed',entityId:ticketId,metadata:{status}}})]);
  revalidatePath('/admin/tickets');revalidatePath(`/minha-conta/suporte/${ticketId}`);
}
