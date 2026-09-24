'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui';
export function BuyNow({productId,disabled=false}:{productId:string;disabled?:boolean}){
  const router=useRouter();const [loading,setLoading]=useState(false);const [error,setError]=useState('');
  async function buy(){setLoading(true);setError('');try{const response=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{productId,quantity:1}]})});  const data=await response.json();if(response.status===401){router.push('/login?next=/produtos');return;}if(!response.ok)throw new Error(data.error??'Não foi possível iniciar o pagamento.');router.push(data.walletPaid?`/minha-conta/pedidos/${data.orderId}`:`/pagamento/${data.orderId}`);}catch(error){setError(error instanceof Error?error.message:'Não foi possível iniciar o pagamento.');setLoading(false);}}
  return <span className="stack">{error&&<small className="error">{error}</small>}<Button disabled={disabled||loading} onClick={buy}>{loading?'Abrindo PIX…':'Comprar agora'}</Button></span>;
}
