import type {NextRequest} from 'next/server';
import {canWrite,fail,json} from '@/lib/server/http';
import {saveImage,validWebP} from '@/lib/server/store';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 const denied=canWrite(request);if(denied)return denied;
 if(Number(request.headers.get('content-length')||0)>1_200_000)return json({error:'Optimized upload must be less than 950 KB.'},413);
 try{
  const form=await request.formData();const file=form.get('file');
  if(!(file instanceof File)||file.type!=='image/webp'||file.size<16||file.size>950_000)return json({error:'Upload a valid optimized WebP image under 950 KB.'},400);
  const bytes=Buffer.from(await file.arrayBuffer());
  if(!validWebP(bytes))return json({error:'Invalid WebP file.'},400);
  return json({image:await saveImage(bytes)});
 }catch(error){return fail(error)}
}
