import 'server-only';
import argon2 from 'argon2';
import {db} from '@/lib/db';
import {getEnv} from '@/lib/env';
import {newToken,hashToken} from '@/lib/tokens';
import {emailSchema,passwordSchema} from '@/validations/auth';
import {rateLimit} from '@/lib/rate-limit';
import {getEmailProvider} from './email.interface';
export async function requestPasswordReset(input:unknown){const email=emailSchema.parse(input);await rateLimit('reset',email,3);const provider=getEmailProvider();const user=await db.user.findUnique({where:{email}});if(!user)return;const token=newToken();await db.passwordResetToken.create({data:{userId:user.id,tokenHash:hashToken(token,getEnv().SESSION_SECRET),expiresAt:new Date(Date.now()+30*60*1000)}});await provider.sendPasswordReset({to:email,resetUrl:`${getEnv().APP_URL}/redefinir-senha?token=${encodeURIComponent(token)}`});}
export async function resetPassword(token:string,input:unknown){const password=passwordSchema.parse(input);if(token.length>128)throw new Error('Link inválido.');await rateLimit('reset-consume',token,5);const passwordHash=await argon2.hash(password,{type:argon2.argon2id});await db.$transaction(async tx=>{const entry=await tx.passwordResetToken.findUnique({where:{tokenHash:hashToken(token,getEnv().SESSION_SECRET)}});if(!entry)throw new Error('Link inválido ou expirado.');const claimed=await tx.passwordResetToken.updateMany({where:{id:entry.id,usedAt:null,expiresAt:{gt:new Date()}},data:{usedAt:new Date()}});if(claimed.count!==1)throw new Error('Link inválido ou expirado.');await tx.user.update({where:{id:entry.userId},data:{passwordHash}});await tx.session.deleteMany({where:{userId:entry.userId}});await tx.passwordResetToken.updateMany({where:{userId:entry.userId,usedAt:null},data:{usedAt:new Date()}});});}
