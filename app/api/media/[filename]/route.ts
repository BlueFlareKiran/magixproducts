import {readImage} from '@/lib/server/store';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}){
 const {filename}=await params;
 try{const bytes=await readImage(filename);if(!bytes)return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
  return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/webp','Content-Disposition':'inline','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=3600'}})
 }catch{return new Response('Image temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}})}
}
