import 'server-only';

type PreferenceResponse={id:string;init_point?:string;sandbox_init_point?:string};
type PaymentResponse={id:string;status:string;external_reference?:string};

function token(){const value=process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();if(!value)throw new Error('Mercado Pago não configurado.');return value;}
async function request<T>(path:string,init?:RequestInit):Promise<T>{
  const response=await fetch(`https://api.mercadopago.com${path}`,{...init,headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json',...init?.headers},cache:'no-store'});
  if(!response.ok)throw new Error(`Mercado Pago respondeu HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}
export function createPreference(input:{orderId:string;number:number;email:string;items:{title:string;quantity:number;unitPrice:number}[]}){
  const appUrl=process.env.APP_URL?.trim();if(!appUrl)throw new Error('APP_URL não configurada.');
  return request<PreferenceResponse>('/checkout/preferences',{method:'POST',headers:{'X-Idempotency-Key':`order-${input.orderId}`},body:JSON.stringify({
    external_reference:input.orderId,payer:{email:input.email},items:input.items.map(item=>({title:item.title,quantity:item.quantity,currency_id:'BRL',unit_price:item.unitPrice})),
    back_urls:{success:`${appUrl}/minha-conta/pedidos`,failure:`${appUrl}/carrinho`,pending:`${appUrl}/minha-conta/pedidos`},auto_return:'approved',
  })});
}
export function getPayment(id:string){return request<PaymentResponse>(`/v1/payments/${encodeURIComponent(id)}`);}
