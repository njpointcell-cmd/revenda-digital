import Link from 'next/link';
import {requireAdmin} from '@/services/auth/session';
import {db} from '@/lib/db';
import {money,toCents} from '@/utils/money';
import {toggleProduct} from '@/services/admin/actions';
import {EmptyState} from '@/components/ui';
export default async function Products(){await requireAdmin();const products=await db.product.findMany({orderBy:{createdAt:'desc'},include:{category:true}});return <><div className="section-head"><h1>Produtos</h1><Link href="/admin/produtos/novo" className="button">Novo produto</Link></div>{products.length?<div className="table-wrap"><table><thead><tr><th>Produto</th><th>Preço / custo</th><th>Estoque</th><th>Status</th><th>Ações</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td>{p.name}<small style={{display:'block'}}>{p.category.name}</small></td><td>{money(toCents(p.price.toFixed(2)))} / {money(toCents(p.cost.toFixed(2)))}</td><td>{p.availableStock}</td><td>{p.status}</td><td><Link className="text-link" href={`/admin/produtos/${p.id}`}>Editar</Link><form action={toggleProduct}><input name="id" type="hidden" value={p.id}/><button>{p.status==='ACTIVE'?'Desativar':'Ativar'}</button></form></td></tr>)}</tbody></table></div>:<EmptyState title="Nenhum produto cadastrado"/>}</>;}
