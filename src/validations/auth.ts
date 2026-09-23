import {z} from 'zod';
export const emailSchema=z.string().trim().toLowerCase().email('E-mail inválido').max(254);
export const passwordSchema=z.string().min(12,'Use pelo menos 12 caracteres').max(128,'Use no máximo 128 caracteres');
export const loginSchema=z.object({email:emailSchema,password:z.string().min(1,'Informe sua senha').max(128)});
export const registerSchema=z.object({name:z.string().trim().min(2,'Informe seu nome').max(100),email:emailSchema,password:passwordSchema,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,{path:['confirmPassword'],message:'As senhas não coincidem'});
export const profileSchema=z.object({name:z.string().trim().min(2).max(100)});
export const changePasswordSchema=z.object({currentPassword:z.string().min(1).max(128),password:passwordSchema,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,{message:'As senhas não coincidem',path:['confirmPassword']});
