import Link from 'next/link';
import {requireUser} from '@/services/auth/session';
import {logoutAction} from '@/services/auth/actions';
import {AuthForm} from '@/components/auth/auth-form';
export default async function Account(){const user=await requireUser();return <><h1>Olá, {user.name}</h1><p>{user.email}</p><div className="row" style={{marginBottom:24}}><Link className="button secondary" href="/minha-conta/pedidos">Meus pedidos</Link><Link className="button secondary" href="/minha-conta/suporte">Suporte</Link>{user.role==='ADMIN'&&<Link className="button" href="/admin">Painel administrativo</Link>}<form action={logoutAction}><button className="button secondary">Sair</button></form></div><div className="split"><section className="card stack"><h2>Meu perfil</h2><AuthForm mode="profile" name={user.name}/></section><section className="card stack"><h2>Alterar senha</h2><p>Ao alterar sua senha, todas as sessões serão encerradas.</p><AuthForm mode="password"/></section></div></>;}
