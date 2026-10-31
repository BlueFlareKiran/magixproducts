import type {NextRequest} from 'next/server';
import {canWrite,fail,json} from '@/lib/server/http';
import {applyProducts} from '@/lib/server/store';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 const denied=canWrite(request);if(denied)return denied;
 if(Number(request.headers.get('content-length')||0)>350_000)return json({error:'Too many changes in one request.'},413);
 try{const body=await request.json();if(!body||!Array.isArray(body.products))return json({error:'Invalid catalogue payload.'},400);return json(await applyProducts(body.products,body.baseSha))}catch(error){if(error instanceof SyntaxError)return json({error:'Invalid JSON.'},400);return fail(error)}
}
