import type {NextRequest} from 'next/server';
import {hasSession} from '@/lib/server/auth';
import {fail,json} from '@/lib/server/http';
import {readCatalog} from '@/lib/server/store';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){if(!hasSession(request))return json({error:'Unauthorized.'},401);try{return json(await readCatalog())}catch(error){return fail(error)}}
