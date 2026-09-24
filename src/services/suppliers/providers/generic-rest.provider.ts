import 'server-only';
import type {SupplierProvider} from '../supplier.interface';
import type {ReservationInput, ReservationResult, SupplierStock} from '../supplier.types';

type RawProduct={
  externalCode?:unknown; code?:unknown; id?:unknown; service?:unknown; name?:unknown; title?:unknown;
  slug?:unknown; description?:unknown; shortDescription?:unknown; image?:unknown;
  category?:unknown; categoryName?:unknown; quantity?:unknown; stock?:unknown; descricao?:unknown;
  cost?:unknown; price?:unknown; valor?:unknown; updatedAt?:unknown;
};

function text(value:unknown){return typeof value==='string'&&value.trim()?value.trim():undefined;}
function number(value:unknown){const parsed=typeof value==='number'?value:Number(value);return Number.isFinite(parsed)?parsed:undefined;}
function parseProduct(value:RawProduct):SupplierStock{
  const service=text(value.service)??text(value.externalCode)??text(value.code)??text(value.id);
  const quantity=number(value.quantity??value.stock);
  if(!service||quantity===undefined||quantity<0)throw new Error('Resposta do fornecedor contém produto inválido.');
  return {
    externalCode:service,
    service,
    name:text(value.name)??text(value.title)??service,
    slug:text(value.slug),
    description:text(value.description)??text(value.descricao),
    shortDescription:text(value.shortDescription),
    image:text(value.image),
    category:text(value.category)??text(value.categoryName),
    quantity:Math.floor(quantity),
    cost:(()=>{const n=number(value.cost??value.price??value.valor);return n===undefined?undefined:n.toFixed(2)})(),
    updatedAt:new Date(text(value.updatedAt)??Date.now()),
  };
}

export class GenericRestSupplierProvider implements SupplierProvider{
  constructor(private readonly baseUrl:string,private readonly apiKey?:string,private readonly timeoutMs=10000){}
  private async request(path:string,init?:RequestInit){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),this.timeoutMs);
    try{
      const response=await fetch(new URL(path,this.baseUrl),{
        ...init,signal:controller.signal,headers:{Accept:'application/json',...(this.apiKey?{'X-Stock-Key':this.apiKey}:{}),...init?.headers},
        cache:'no-store',
      });
      if(!response.ok){
        const details=await response.text().catch(()=> '');
        throw new Error(`Fornecedor respondeu HTTP ${response.status}${details?`: ${details.slice(0,300)}`:''}.`);
      }
      return response;
    }finally{clearTimeout(timer);}
  }
  async getStock(){
    const payload=await (await this.request('/api/stock')).json() as unknown;
    const items=Array.isArray(payload)?payload:(payload&&typeof payload==='object'&&Array.isArray((payload as {products?:unknown;stock?:unknown}).products)?(payload as {products:unknown[]}).products:payload&&typeof payload==='object'&&Array.isArray((payload as {stock?:unknown}).stock)?(payload as {stock:unknown[]}).stock:null);
    if(!items)throw new Error('Resposta do fornecedor não possui uma lista de produtos.');
    return items.map(item=>parseProduct(item as RawProduct));
  }
  async getProduct(externalCode:string){return (await this.getStock()).find(item=>item.externalCode===externalCode)??null;}
  async reserveProduct(input:ReservationInput):Promise<ReservationResult>{
    const response=await this.request('/api/stock/reserve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service:input.externalCode,buyer_id:input.orderId,sale_id:input.idempotencyKey})});
    const payload=await response.json() as {access?:unknown;reservation_id?:unknown;reservationId?:unknown};
    if(!payload.access)throw new Error('Fornecedor não retornou os dados de acesso.');
    return {reservationId:text(payload.reservation_id)??text(payload.reservationId)??input.idempotencyKey,content:JSON.stringify(payload.access)};
  }
  async healthCheck(){try{await this.getStock();return true;}catch{return false;}}
}
