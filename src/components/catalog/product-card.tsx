import Link from 'next/link';
import Image from 'next/image';
import type {Product,Category} from '@prisma/client';
import {money,toCents} from '@/utils/money';
import {Badge} from '@/components/ui';
import {AddToCart} from '@/components/cart/add-to-cart';
import {BuyNow} from '@/components/cart/buy-now';
export function ProductArt({image,name}:{image:string|null;name:string}){return <div className="product-art">{image?<Image src={image} alt={name} width={600} height={400} unoptimized referrerPolicy="no-referrer"/>:<span aria-hidden="true">NJ / digital</span>}</div>;}
export function ProductCard({product:p}:{product:Product&{category:Category}}){return <article className="card product-card"><Link href={`/produtos/${p.slug}`}><ProductArt image={p.image} name={p.name}/></Link><div className="product-body"><Badge>{p.category.name}</Badge><Link href={`/produtos/${p.slug}`}><h3>{p.name}</h3></Link><p>{p.shortDescription}</p><strong className="price">{money(toCents(p.price.toFixed(2)))}</strong><small>{p.availableStock>0?'Disponível':'Sem estoque'}</small><div className="row product-actions"><BuyNow productId={p.id} disabled={p.availableStock===0}/><AddToCart id={p.id} stock={p.availableStock}/></div></div></article>;}
