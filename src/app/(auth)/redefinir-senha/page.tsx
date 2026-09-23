import {AuthForm} from '@/components/auth/auth-form';
export default async function Reset({searchParams}:{searchParams:Promise<{token?:string}>}){return <div className="auth-box"><h1>Redefinir senha</h1><div className="card"><AuthForm mode="reset" token={(await searchParams).token??''}/></div></div>;}
