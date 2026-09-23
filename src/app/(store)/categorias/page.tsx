import Link from 'next/link';
import {catalogRepository} from '@/repositories/catalog';
import {EmptyState} from '@/components/ui';
export const dynamic='force-dynamic';
export default async function Categories(){const categories=await catalogRepository.categories();return <><h1>Categorias</h1>{categories.length?<div className="grid">{categories.map(c=><Link className="card" key={c.id} href={`/categorias/${c.slug}`}><h2>{c.name}</h2><p>{c.description}</p><span className="text-link">Explorar →</span></Link>)}</div>:<EmptyState title="Nenhuma categoria disponível"/>}</>;}
