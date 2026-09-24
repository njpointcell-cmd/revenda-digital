'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ErrorState,LoadingState} from '@/components/ui';

type PaymentData={orderNumber:number;status:string;paymentStatus:string;qrCodeBase64:string;qrCode:string;ticketUrl:string;expiresAt:string|null};
const labels:Record<string,string>={approved:'Pagamento aprovado',pending:'Aguardando pagamento',rejected:'Pagamento recusado',cancelled:'Pagamento cancelado',expired:'Pagamento expirado'};
export function PaymentView({orderId}:{orderId:string}){
  const [data,setData]=useState<PaymentData|null>(null);const [error,setError]=useState('');const [remaining,setRemaining]=useState('');
  async function refresh(){const response=await fetch(`/api/payments/${orderId}`,{cache:'no-store'});const body=await response.json();if(!response.ok)throw new Error(body.error);setData(body);}
  useEffect(()=>{const load=()=>refresh().catch(e=>setError(e.message));const initial=window.setTimeout(load,0);const timer=setInterval(load,10000);return()=>{clearTimeout(initial);clearInterval(timer);};},[orderId]);
  useEffect(()=>{if(!data?.expiresAt)return;const update=()=>{const ms=Math.max(0,new Date(data.expiresAt!).getTime()-Date.now());setRemaining(`${Math.floor(ms/60000).toString().padStart(2,'0')}:${Math.floor(ms/1000%60).toString().padStart(2,'0')}`);};const initial=window.setTimeout(update,0);const timer=setInterval(update,1000);return()=>{clearTimeout(initial);clearInterval(timer);};},[data?.expiresAt]);
  if(error)return <ErrorState message={error}/>;if(!data)return <LoadingState/>;
  const finished=['approved','rejected','cancelled','expired'].includes(data.paymentStatus);
  return <section className="card stack" style={{maxWidth:620,margin:'24px auto',textAlign:'center'}}><span className="eyebrow">Pedido #{data.orderNumber}</span><h1>Pagamento via PIX</h1><p>{labels[data.paymentStatus]??'Aguardando pagamento'}</p>{data.paymentStatus==='pending'&&!finished&&<><p>Escaneie o QR Code ou copie o código abaixo. Esta cobrança expira em <strong>{remaining}</strong>.</p>{data.qrCodeBase64&&<img src={`data:image/png;base64,${data.qrCodeBase64}`} alt="QR Code PIX" style={{width:260,height:260,margin:'auto'}}/>}<label className="field"><span>Código PIX copia e cola</span><textarea readOnly value={data.qrCode}/></label><button className="button" onClick={()=>navigator.clipboard.writeText(data.qrCode)}>Copiar código PIX</button></>}{data.paymentStatus==='approved'&&<p className="success">Pagamento confirmado! Sua entrega será processada automaticamente.</p>}{finished&&data.paymentStatus!=='approved'&&<p className="error">Este pagamento não pode mais ser concluído. Gere um novo pedido para tentar novamente.</p>}<Link className="button secondary" href="/minha-conta/pedidos">Ver meus pedidos</Link>{data.ticketUrl&&<a className="text-link" href={data.ticketUrl} target="_blank" rel="noreferrer">Abrir no Mercado Pago</a>}</section>;
}
