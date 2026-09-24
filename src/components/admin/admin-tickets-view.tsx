import Link from 'next/link';
import {EmptyState} from '@/components/ui';
import {db} from '@/lib/db';
import {adminReplyTicket,updateTicketStatus} from '@/services/tickets/actions';
import {ReplyForm} from '@/components/tickets/reply-form';

type Props={archived:boolean;customerId?:string;ticketId?:string};

export async function AdminTicketsView({archived,customerId,ticketId}:Props){
  const tickets=await db.ticket.findMany({
    where:archived?{status:'CLOSED'}:{status:{not:'CLOSED'}},
    include:{user:{select:{id:true,name:true,email:true}},order:{select:{number:true}},messages:{include:{author:{select:{name:true,role:true}},attachments:true},orderBy:{createdAt:'asc'}}},
    orderBy:{updatedAt:'desc'},
    take:200
  });
  const customers=Array.from(new Map(tickets.map(ticket=>[ticket.user.id,ticket.user])).values());
  const selected=tickets.find(ticket=>ticket.id===ticketId)??tickets.find(ticket=>ticket.user.id===customerId)??tickets[0];
  const archivedTickets=archived?[]:await db.ticket.findMany({where:{status:'CLOSED'},include:{user:{select:{name:true,email:true}},messages:{include:{author:{select:{name:true,role:true}},attachments:true},orderBy:{createdAt:'asc'}}},orderBy:{updatedAt:'desc'},take:200});
  return <><div className="section-head"><div><span className="eyebrow">Atendimento</span><h1>Tickets</h1></div><span className="muted">{customers.length} clientes</span></div><div className="ticket-layout">
    <aside className="card stack ticket-list">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2>{archived?'Arquivados':'Conversas'}</h2>
        <span className="muted">{customers.length}</span>
      </div>
      <div className="row" style={{gap:8}}>
        <Link className={!archived?'button':'button secondary'} href="/admin/tickets">Ativas</Link>
        <Link className={archived?'button':'button secondary'} href="/admin/tickets#arquivados">Arquivadas</Link>
      </div>
      {customers.map(customer=>{
        const latest=tickets.find(ticket=>ticket.user.id===customer.id);
        if(!latest)return null;
        return <Link className={`ticket-list-item ${selected?.user.id===customer.id?'selected':''}`} href={`/admin/tickets?${archived?'arquivados=1&':''}cliente=${customer.id}&ticket=${latest.id}`} key={customer.id}>
          <strong>{customer.name}</strong><small>{customer.email}</small><span>{latest.subject}</span>
        </Link>;
      })}
      {!customers.length&&<p className="muted">{archived?'Nenhum ticket encerrado.':'Nenhuma conversa ativa.'}</p>}
    </aside>
    {selected?<section className="card stack ticket-conversation">
      <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><span className="eyebrow">Conversa</span><h2>{selected.user.name}</h2><p>{selected.user.email} • {selected.subject}{selected.order&&` • Pedido #${selected.order.number}`}</p></div>
        <div className="row">
          <form action={updateTicketStatus}><input type="hidden" name="ticketId" value={selected.id}/><select name="status" defaultValue={selected.status}><option value="OPEN">Aberto</option><option value="WAITING_CUSTOMER">Aguardando cliente</option><option value="WAITING_SUPPORT">Aguardando suporte</option><option value="CLOSED">Fechado</option></select><button className="text-link">Salvar</button></form>
          {selected.status!=='CLOSED'&&<form action={updateTicketStatus}><input type="hidden" name="ticketId" value={selected.id}/><input type="hidden" name="status" value="CLOSED"/><button className="text-link">Encerrar</button></form>}
        </div>
      </div>
      <div className="stack">{selected.messages.map(message=><div className="notice" key={message.id}><strong>{message.author.role==='ADMIN'?'Suporte':message.author.name}</strong><small style={{display:'block'}}>{message.createdAt.toLocaleString('pt-BR')}</small><p className="prose">{message.body}</p>{message.attachments.map(file=><p key={file.id}><a className="text-link" href={file.url} target="_blank" rel="noreferrer">Ver anexo: {file.filename}</a></p>)}</div>)}</div>
      {selected.status!=='CLOSED'&&<ReplyForm action={adminReplyTicket} ticketId={selected.id}/>}
    </section>:<EmptyState title={archived?'Nenhum ticket arquivado':'Nenhuma conversa ativa'}/>}
    {!archived&&archivedTickets.length>0&&<section className="card stack" id="arquivados"><div className="row" style={{justifyContent:'space-between'}}><h2>Arquivados</h2><span className="muted">{archivedTickets.length} encerrados</span></div>{archivedTickets.map(ticket=><details key={ticket.id} className="archived-conversation"><summary><strong>{ticket.user.name}</strong> <span>{ticket.user.email} • {ticket.subject}</span></summary><div className="stack">{ticket.messages.map(message=><div className="notice" key={message.id}><strong>{message.author.role==='ADMIN'?'Suporte':message.author.name}</strong><small style={{display:'block'}}>{message.createdAt.toLocaleString('pt-BR')}</small><p className="prose">{message.body}</p></div>)}</div></details>)}</section>}
  </div></>;
}
