'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Button,ErrorState} from '@/components/ui';
export default function WalletPage(){
  const [amount,setAmount]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError('');try{const response=await fetch('/api/wallet/top-up',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:Number(amount.replace(',','.'))})});const data=await response.json();if(!response.ok)throw new Error(data.error);if(!data.checkoutUrl)throw new Error('Não foi possível gerar o link PIX.');window.location.assign(data.checkoutUrl);}catch(e){setError(e instanceof Error?e.message:'Não foi possível gerar o PIX.');setLoading(false);}}
  return <><div className="section-head"><div><span className="eyebrow">Minha conta</span><h1>Carteira</h1></div><Link className="button secondary" href="/minha-conta">Voltar para minha conta</Link></div><section className="card stack"><p>Adicione créditos pagando exclusivamente por PIX. O saldo será liberado após a aprovação do pagamento.</p><form className="form" onSubmit={submit}><label className="field"><span>Valor do crédito (R$ 10 a R$ 1.000)</span><input required min="10" max="1000" step="0.01" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="50,00"/></label>{error&&<ErrorState message={error}/>}<Button disabled={loading}>{loading?'Gerando PIX…':'Adicionar crédito com PIX'}</Button></form></section><p className="notice">Depois de confirmado, você poderá usar o saldo para pagar seus pedidos.</p></>;
}
