'use client';
import {useActionState} from 'react';
import {createTicket} from '@/services/tickets/actions';
import {Button,ErrorState} from '@/components/ui';
import type {ActionState} from '@/lib/action-state';
export function TicketForm({orders}:{orders:{id:string;number:number}[]}){
  const [state,action,pending]=useActionState<ActionState,FormData>(createTicket,{});
  return <form action={action} className="form card">{state.error&&<ErrorState message={state.error}/>}<label className="field">Assunto<input name="subject" required minLength={5} maxLength={120}/></label><label className="field">Categoria<select name="category" defaultValue="DELIVERY"><option value="PAYMENT">Pagamento</option><option value="DELIVERY">Entrega</option><option value="PRODUCT">Produto</option><option value="ACCOUNT">Conta</option><option value="OTHER">Outro</option></select></label><label className="field">Pedido relacionado<select name="orderId" defaultValue=""><option value="">Nenhum</option>{orders.map(order=><option key={order.id} value={order.id}>Pedido #{order.number}</option>)}</select></label><label className="field">Mensagem<textarea name="body" required minLength={10} rows={6}/></label><Button disabled={pending}>{pending?'Abrindo chamado…':'Abrir chamado'}</Button></form>;
}
