import 'server-only';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {getEnv} from '@/lib/env';
import {hashToken,newToken} from '@/lib/tokens';
const COOKIE='nj_session';
export async function createSession(userId:string){const token=newToken();const expiresAt=new Date(Date.now()+1000*60*60*24*7);await db.session.create({data:{userId,tokenHash:hashToken(token,getEnv().SESSION_SECRET),expiresAt}});(await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',expires:expiresAt});}
export async function getCurrentUser(){const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;const session=await db.session.findUnique({where:{tokenHash:hashToken(token,getEnv().SESSION_SECRET)},include:{user:{select:{id:true,name:true,email:true,role:true}}}});return session&&session.expiresAt>new Date()?session.user:null;}
export async function requireUser(){const user=await getCurrentUser();if(!user)redirect('/login');return user;}
export async function requireAdmin(){const user=await requireUser();if(user.role!=='ADMIN')redirect('/minha-conta');return user;}
export async function destroySession(){const token=(await cookies()).get(COOKIE)?.value;if(token)await db.session.deleteMany({where:{tokenHash:hashToken(token,getEnv().SESSION_SECRET)}});(await cookies()).delete(COOKIE);}
