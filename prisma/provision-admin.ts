import {PrismaClient} from '@prisma/client';
import argon2 from 'argon2';
import {z} from 'zod';

const db=new PrismaClient();
async function main(){
  const env=z.object({SEED_ADMIN_EMAIL:z.string().email(),SEED_ADMIN_PASSWORD:z.string().min(12).max(128)}).parse(process.env);
  const email=env.SEED_ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash=await argon2.hash(env.SEED_ADMIN_PASSWORD,{type:argon2.argon2id});
  const user=await db.user.upsert({where:{email},update:{name:'Administrador',role:'ADMIN',status:'ACTIVE',passwordHash},create:{name:'Administrador',email,role:'ADMIN',status:'ACTIVE',passwordHash}});
  await db.session.deleteMany({where:{userId:user.id}});
  console.info(`Administrador provisionado: ${user.email}`);
}
main().catch(error=>{console.error('Falha ao provisionar administrador.',error);process.exitCode=1;}).finally(()=>db.$disconnect());
