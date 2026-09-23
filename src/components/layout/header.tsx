'use client';
import Link from 'next/link';
import {useCart} from '@/components/cart/cart-provider';
export function Header(){const {items}=useCart();return <header className="header"><Link className="logo" href="/">NJ<span> Story</span><small>DIGITAL STORE</small></Link><nav aria-label="Principal"><Link href="/produtos">Produtos</Link><Link href="/categorias">Categorias</Link><Link href="/minha-conta">Minha conta</Link><Link className="cart-link" href="/carrinho">Carrinho <b>{items.reduce((sum,i)=>sum+i.quantity,0)}</b></Link></nav></header>;}
