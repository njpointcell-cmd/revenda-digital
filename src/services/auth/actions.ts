'use server';
import {redirect} from 'next/navigation';
import {headers} from 'next/headers';
import argon2 from 'argon2';
import {login,register} from './auth.service';
import {requireUser,destroySession} from './session';
import {requestPasswordReset,resetPassword} from './password-reset';
import {db} from '@/lib/db';
import {profileSchema,changePasswordSchema} from '@/validations/auth';
import {actionError} from '@/lib/action-error';
import type {ActionState} from '@/lib/action-state';
import {rateLimit} from '@/lib/rate-limit';
async function throttle(){const h=await headers();await rateLimit('auth-global',h.get('x-forwarded-for')?.split(',')[0]?.trim()??'local',50);}
export async function loginAction(_:ActionState,form:FormData):Promise<ActionState>{try{await throttle();await login(Object.fromEntries(form));}catch(e){return actionError(e);}redirect('/minha-conta');}
export async function registerAction(_:ActionState,form:FormData):Promise<ActionState>{try{await throttle();await register(Object.fromEntries(form));}catch(e){return actionError(e);}redirect('/minha-conta');}
export async function logoutAction(){await destroySession();redirect('/login');}
export async function profileAction(_:ActionState,form:FormData):Promise<ActionState>{const user=await requireUser();try{const data=profileSchema.parse(Object.fromEntries(form));await db.user.update({where:{id:user.id},data});return {success:'Perfil atualizado.'};}catch(e){return actionError(e);}}
export async function passwordAction(_:ActionState,form:FormData):Promise<ActionState>{const user=await requireUser();try{await rateLimit('change-password',user.id,5);const data=changePasswordSchema.parse(Object.fromEntries(form));const record=await db.user.findUniqueOrThrow({where:{id:user.id}});if(!await argon2.verify(record.passwordHash,data.currentPassword))return {error:'Senha atual incorreta.'};const passwordHash=await argon2.hash(data.password,{type:argon2.argon2id});await db.$transaction(async tx=>{const changed=await tx.user.updateMany({where:{id:user.id,passwordHash:record.passwordHash},data:{passwordHash}});if(changed.count!==1)throw new Error('Sua senha foi alterada. Entre novamente.');await tx.session.deleteMany({where:{userId:user.id}});await tx.passwordResetToken.deleteMany({where:{userId:user.id}});});await destroySession();}catch(e){return actionError(e);}redirect('/login?changed=1');}
export async function recoveryAction(_:ActionState,form:FormData):Promise<ActionState>{try{await throttle();await requestPasswordReset(form.get('email'));return {success:'Se o e-mail estiver cadastrado, você receberá as instruções.'};}catch(e){return actionError(e);}}
export async function resetAction(_:ActionState,form:FormData):Promise<ActionState>{try{await throttle();await resetPassword(String(form.get('token')??''),form.get('password'));return {success:'Senha atualizada. Entre novamente.'};}catch(e){return actionError(e);}}
