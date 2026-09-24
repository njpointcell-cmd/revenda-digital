import 'server-only';

type PreferenceResponse={id:string;init_point?:string;sandbox_init_point?:string};
export type PaymentResponse={id:string;status:string;external_reference?:string;date_of_expiration?:string;transaction_amount?:number;point_of_interaction?:{transaction_data?:{qr_code?:string;qr_code_base64?:string;ticket_url?:string}}};
function token(){const value=process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();if(!value)throw new Error('Mercado Pago não configurado.');return value;}
async function request<T>(path:string,init?:RequestInit):Promise<T>{
  const response=await fetch(`https://api.mercadopago.com${path}`,{...init,headers:{Authorization:'Bearer '+token(),'Content-Type':'application/json',...init?.headers},cache:'no-store'});
  if(!response.ok)throw new Error(`Mercado Pago respondeu HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}
export function createPixPayment(input:{orderId:string;amount:number;email:string;description:string;expiresAt:Date}){
  return request<PaymentResponse>('/v1/payments',{method:'POST',headers:{'X-Idempotency-Key':`order-${input.orderId}`},body:JSON.stringify({
    transaction_amount:input.amount,description:input.description,payment_method_id:'pix',
    payer:{email:input.email},external_reference:input.orderId,date_of_expiration:input.expiresAt.toISOString(),
  })});
}
const pixOnly={excluded_payment_types:[{id:'credit_card'},{id:'debit_card'},{id:'ticket'}]};
export function createPreference(input:{orderId:string;number:number;email:string;items:{title:string;quantity:number;unitPrice:number}[]}){
  const appUrl=process.env.APP_URL?.trim();if(!appUrl)throw new Error('APP_URL não configurada.');
  return request<PreferenceResponse>('/checkout/preferences',{method:'POST',headers:{'X-Idempotency-Key':`order-${input.orderId}`},body:JSON.stringify({
    external_reference:input.orderId,payer:{email:input.email},items:input.items.map(item=>({title:item.title,quantity:item.quantity,currency_id:'BRL',unit_price:item.unitPrice})),
    payment_methods:pixOnly,back_urls:{success:`${appUrl}/minha-conta/pedidos`,failure:`${appUrl}/carrinho`,pending:`${appUrl}/minha-conta/pedidos`},auto_return:'approved',
  })});
}
export function createPixTopUp(input:{topUpId:string;email:string;amount:number}){
  const appUrl=process.env.APP_URL?.trim();if(!appUrl)throw new Error('APP_URL não configurada.');
  return request<PreferenceResponse>('/checkout/preferences',{method:'POST',headers:{'X-Idempotency-Key':`wallet-topup-${input.topUpId}`},body:JSON.stringify({
    external_reference:`wallet-topup:${input.topUpId}`,payer:{email:input.email},items:[{title:'Crédito na carteira',quantity:1,currency_id:'BRL',unit_price:input.amount}],
    payment_methods:pixOnly,back_urls:{success:`${appUrl}/minha-conta/carteira`,failure:`${appUrl}/minha-conta/carteira`,pending:`${appUrl}/minha-conta/carteira`},auto_return:'approved',
  })});
}
export function getPayment(id:string){return request<PaymentResponse>(`/v1/payments/${encodeURIComponent(id)}`);}
