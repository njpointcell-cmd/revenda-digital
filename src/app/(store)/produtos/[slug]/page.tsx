import Link from 'next/link';
import {notFound} from 'next/navigation';
import {catalogRepository} from '@/repositories/catalog';
import {listProducts} from '@/services/catalog/catalog.service';
import {ProductArt,ProductCard} from '@/components/catalog/product-card';
import {AddToCart} from '@/components/cart/add-to-cart';
import {money,toCents} from '@/utils/money';
export default async function Product({params}:{params:Promise<{slug:string}>}){const p=await catalogRepository.product((await params).slug);if(!p)notFound();const related=(await listProducts({category:p.category.slug})).products.filter(x=>x.id!==p.id).slice(0,4);return <><p><Link href="/produtos">Catálogo</Link> / {p.category.name}</p><section className="split"><div className="detail-art"><ProductArt name={p.name} image={p.image}/></div><div className="stack"><span className="eyebrow">{p.category.name}</span><h1>{p.name}</h1><p>{p.shortDescription}</p><strong className="price">{money(toCents(p.price.toFixed(2)))}</strong><span>{p.availableStock>0?`${p.availableStock} disponível(is)`:'Sem estoque'}</span><AddToCart id={p.id} stock={p.availableStock}/><small>Compras e entregas serão habilitadas nas próximas fases.</small></div></section><section className="card" style={{marginTop:32}}><h2>Sobre o produto</h2><p className="prose">{p.description}</p></section>{related.length>0&&<><div className="section-head"><h2>Você também pode gostar</h2></div><div className="grid">{related.map(p=><ProductCard key={p.id} product={p}/>)}</div></>}</>;}
