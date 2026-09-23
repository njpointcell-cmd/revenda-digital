import 'server-only';
import {db} from '@/lib/db';
export const users={byEmail:(email:string)=>db.user.findUnique({where:{email}}),byId:(id:string)=>db.user.findUnique({where:{id}}),create:(data:{name:string;email:string;passwordHash:string})=>db.user.create({data})};
