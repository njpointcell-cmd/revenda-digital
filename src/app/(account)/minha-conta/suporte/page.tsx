import Link from 'next/link';
import {requireUser} from '@/services/auth/session';
import {db} from '@/lib/db';
import {EmptyState} from '@/components/ui';
import {TicketForm} from '@/components/tickets/ticket-form';
const labels:Record<string,string>={OPEN:'Aberto',WAITING_CUSTOMER:'Aguardando você',WAITING_SUPPORT:'Aguardando suporte',CLOSED:'Fechado'};
export default async function Support(){const user=await requireUser();const [tickets,orders]=await Promise.all([db.ticket.findMany({where:{userId:user.id},orderBy:{updatedAt:'desc'}}),db.order.findMany({where:{userId:user.id},select:{id:true,number:true},orderBy:{createdAt:'desc'}})]);return <><div className="section-head"><div><span className="eyebrow">Atendimento</span><h1>Suporte</h1></div><Link className="button secondary" href="/minha-conta">Minha conta</Link></div><div className="split"><section><h2>Seus chamados</h2>{tickets.length?<div className="stack">{tickets.map(ticket=><Link className="card row" style={{justifyContent:'space-between'}} href={`/minha-conta/suporte/${ticket.id}`} key={ticket.id}><strong>{ticket.subject}</strong><span className="badge">{labels[ticket.status]}</span></Link>)}</div>:<EmptyState title="Nenhum chamado aberto"/>}</section><section><h2>Precisa de ajuda?</h2><TicketForm orders={orders}/></section></div></>;}
