import 'server-only';
import {db} from './db';
import {hashToken} from './tokens';
import {getEnv} from './env';
export async function rateLimit(scope:string,identity:string,limit=10){
 const key=hashToken(`${scope}:${identity}`,getEnv().SESSION_SECRET);
 const rows=await db.$queryRaw<{count:number}[]>`INSERT INTO "RateLimit" ("key","count","expiresAt") VALUES (${key},1,NOW()+INTERVAL '15 minutes') ON CONFLICT ("key") DO UPDATE SET "count"=CASE WHEN "RateLimit"."expiresAt"<NOW() THEN 1 ELSE "RateLimit"."count"+1 END,"expiresAt"=CASE WHEN "RateLimit"."expiresAt"<NOW() THEN NOW()+INTERVAL '15 minutes' ELSE "RateLimit"."expiresAt" END RETURNING "count"`;
 if(rows[0].count>limit) throw new Error('Muitas tentativas. Aguarde 15 minutos.');
}
