import {NextResponse} from 'next/server';

export async function GET(){
  return NextResponse.json({status:'ok',service:'revenda-digital',timestamp:new Date().toISOString()});
}
