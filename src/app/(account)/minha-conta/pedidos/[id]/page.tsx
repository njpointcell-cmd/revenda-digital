import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireUser} from '@/services/auth/session';
import {db} from '@/lib/db';
import {decrypt} from '@/services/orders/order.service';

const statusLabel:Record<string,string>={WAITING_PAYMENT:'Aguardando pagamento',PAID:'Pagamento aprovado',PROCESSING:'Processando entrega',DELIVERED:'Entregue',FAILED:'Falhou',CANCELLED:'Cancelado',REFUNDED:'Reembolsado',PENDING:'Pendente'};
function accessContent(value:string){try{const parsed=JSON.parse(value) as Record<string,unknown>;return Object.entries(parsed).map(([key,item])=><div className="row" style={{justifyContent:'space-between'}} key={key}><span>{key}</span><strong>{String(item)}</strong></div>);}catch{return <p>{value}</p>;}}

export default async function OrderDetail({params}:{params:Promise<{id:string}>}){
  const user=await requireUser();const {id}=await params;
  const order=await db.order.findFirst({where:{id,userId:user.id},include:{items:{include:{delivery:true}},history:{orderBy:{createdAt:'desc'}}}});
  if(!order)notFound();
  return <><div className="section-head"><div><span className="eyebrow">Pedido #{order.number}</span><h1>Detalhes da compra</h1></div><Link className="button secondary" href="/minha-conta/pedidos">Voltar aos pedidos</Link></div><div className="card stack"><div className="row" style={{justifyContent:'space-between'}}><span>Status</span><span className="badge">{statusLabel[order.status]??order.status}</span></div><div className="row" style={{justifyContent:'space-between'}}><span>Data</span><strong>{order.createdAt.toLocaleString('pt-BR')}</strong></div><div className="row" style={{justifyContent:'space-between'}}><span>Total</span><strong>R$ {order.total.toFixed(2).replace('.',',')}</strong></div></div><h2>Produtos</h2><div className="stack">{order.items.map(item=><div className="card stack" key={item.id}><div className="row" style={{justifyContent:'space-between'}}><strong>{item.productName}</strong><span>{item.quantity}x</span></div>{item.delivery?.status==='DELIVERED'&&item.delivery.encryptedContent?<div className="notice stack"><strong>Acesso liberado</strong>{accessContent(decrypt(item.delivery.encryptedContent))}</div>:item.delivery?.status==='FAILED'?<p className="error">Não foi possível entregar este item ainda. Nossa equipe fará uma nova tentativa.</p>:<p className="muted">O acesso ficará disponível após a confirmação e processamento do pagamento.</p>}</div>)}</div><h2>Histórico</h2><div className="stack">{order.history.map(entry=><div className="row" style={{justifyContent:'space-between'}} key={entry.id}><span>{statusLabel[entry.status]??entry.status}</span><small>{entry.createdAt.toLocaleString('pt-BR')}</small></div>)}</div></>;
}
