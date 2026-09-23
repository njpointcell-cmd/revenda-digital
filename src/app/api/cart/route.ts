import {NextRequest,NextResponse} from 'next/server';
import {quoteCart} from '@/services/cart/cart.service';
export async function POST(request:NextRequest){try{const raw=await request.text();if(raw.length>10000)return NextResponse.json({error:'Carrinho muito grande'},{status:413});return NextResponse.json(await quoteCart(JSON.parse(raw)));}catch{return NextResponse.json({error:'Não foi possível validar o carrinho.'},{status:400});}}
