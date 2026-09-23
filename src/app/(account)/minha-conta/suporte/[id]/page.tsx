import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireUser} from '@/services/auth/session';
import {db} from '@/lib/db';
import {ReplyForm} from '@/components/tickets/reply-form';
import {replyTicket} from '@/services/tickets/actions';
const labels:Record<string,string>={OPEN:'Aberto',WAITING_CUSTOMER:'Aguardando você',WAITING_SUPPORT:'Aguardando suporte',CLOSED:'Fechado'};
export default async function TicketDetail({params}:{params:Promise<{id:string}>}){const user=await requireUser();const {id}=await params;const ticket=await db.ticket.findFirst({where:{id,userId:user.id},include:{messages:{include:{author:{select:{name:true,role:true}}},orderBy:{createdAt:'asc'}},order:{select:{number:true}}}});if(!ticket)notFound();return <><div className="section-head"><div><span className="eyebrow">Atendimento</span><h1>{ticket.subject}</h1></div><Link className="button secondary" href="/minha-conta/suporte">Voltar</Link></div><div className="row"><span className="badge">{labels[ticket.status]}</span>{ticket.order&&<span className="muted">Pedido #{ticket.order.number}</span>}</div><div className="stack" style={{margin:'24px 0'}}>{ticket.messages.map(message=><div className="card" key={message.id}><div className="row" style={{justifyContent:'space-between'}}><strong>{message.author.role==='ADMIN'?'Suporte':message.author.name}</strong><small>{message.createdAt.toLocaleString('pt-BR')}</small></div><p className="prose">{message.body}</p></div>)}</div>{ticket.status!=='CLOSED'&&<ReplyForm action={replyTicket} ticketId={ticket.id}/>}</>;}
