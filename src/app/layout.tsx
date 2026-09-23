import './globals.css';
import Link from 'next/link';
import {Header} from '@/components/layout/header';
import {CartProvider} from '@/components/cart/cart-provider';
export const metadata={title:{default:'NJ Story | Seu universo digital',template:'%s | NJ Story'},description:'Explore produtos digitais na NJ Story.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><CartProvider><Header/><main className="container">{children}</main><footer className="footer"><div><strong>NJ Story</strong><p>Seu próximo passo no universo digital.</p></div><div><Link href="/produtos">Explorar produtos</Link><Link href="/minha-conta">Minha conta</Link><span>Loja em desenvolvimento • FASE 1</span></div></footer></CartProvider></body></html>;}
