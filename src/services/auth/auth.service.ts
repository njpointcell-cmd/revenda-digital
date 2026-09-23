import 'server-only';
import argon2 from 'argon2';
import {Prisma} from '@prisma/client';
import {users} from '@/repositories/users';
import {registerSchema,loginSchema} from '@/validations/auth';
import {rateLimit} from '@/lib/rate-limit';
import {createSession} from './session';
export async function register(input:unknown){const data=registerSchema.parse(input);await rateLimit('register',data.email,5);const passwordHash=await argon2.hash(data.password,{type:argon2.argon2id});try{const user=await users.create({name:data.name,email:data.email,passwordHash});await createSession(user.id);}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new Error('Não foi possível cadastrar este e-mail. Tente entrar ou recuperar sua senha.');throw error;}}
const dummyHash=()=>argon2.hash('non-user-comparison-only',{type:argon2.argon2id});
let dummy:Promise<string>|undefined;
export async function login(input:unknown){const data=loginSchema.parse(input);await rateLimit('login',data.email);const user=await users.byEmail(data.email);dummy??=dummyHash();const valid=await argon2.verify(user?.passwordHash??await dummy,data.password);if(!user||!valid)throw new Error('E-mail ou senha inválidos.');if(user.status==='SUSPENDED')throw new Error('Esta conta está suspensa. Entre em contato com o suporte.');await createSession(user.id);}
