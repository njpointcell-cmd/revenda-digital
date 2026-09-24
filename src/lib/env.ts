import 'server-only';
import {z} from 'zod';
const schema=z.object({DATABASE_URL:z.string().url(),APP_URL:z.string().url(),SESSION_SECRET:z.string().min(32),VAPID_PUBLIC_KEY:z.string().min(1).optional(),VAPID_PRIVATE_KEY:z.string().min(1).optional(),VAPID_SUBJECT:z.string().url().optional()});
export function getEnv(){return schema.parse({DATABASE_URL:process.env.DATABASE_URL,APP_URL:process.env.APP_URL,SESSION_SECRET:process.env.SESSION_SECRET});}
