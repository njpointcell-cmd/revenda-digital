import 'server-only';
import {createHash} from 'node:crypto';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Armazenamento de imagens não configurado.');
  return {cloudName, apiKey, apiSecret};
}

export async function uploadImage(file: File, folder: string) {
  if (!ALLOWED_TYPES.has(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('A imagem deve ter no máximo 5 MB.');
  const {cloudName, apiKey, apiSecret} = config();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash('sha1').update(`${params}${apiSecret}`).digest('hex');
  const body = new FormData();
  body.set('file', file);
  body.set('api_key', apiKey);
  body.set('timestamp', timestamp);
  body.set('folder', folder);
  body.set('signature', signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {method: 'POST', body});
  const result = await response.json() as {secure_url?: string; public_id?: string; error?: {message?: string}};
  if (!response.ok || !result.secure_url || !result.public_id) throw new Error(result.error?.message ?? 'Não foi possível enviar a imagem.');
  return {url: result.secure_url, publicId: result.public_id};
}
