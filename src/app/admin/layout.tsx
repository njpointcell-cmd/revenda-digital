import Link from 'next/link';
import {requireAdmin} from '@/services/auth/session';
const links=[['','Dashboard'],['produtos','Produtos'],['categorias','Categorias'],['pedidos','Pedidos'],['clientes','Clientes'],['fornecedores','Fornecedores'],['tickets','Tickets'],['configuracoes','Configurações']];
export default async function AdminLayout({children}:{children:React.ReactNode}){await requireAdmin();return <div className="admin-shell"><aside><span className="eyebrow">Administração</span><nav className="sidebar" aria-label="Administração">{links.map(([path,title])=><Link key={path} href={`/admin/${path}`}>{title}</Link>)}</nav></aside><div>{children}</div></div>;}
