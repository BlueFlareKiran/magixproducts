import type {NextRequest} from 'next/server';
import {COOKIE_NAME,validOrigin} from '@/lib/server/auth';
import {json} from '@/lib/server/http';
export const runtime='nodejs';
export async function POST(request:NextRequest){if(!validOrigin(request))return json({error:'Invalid request origin.'},403);const response=json({authenticated:false});response.cookies.set(COOKIE_NAME,'',{httpOnly:true,secure:process.env.NODE_ENV==='production'||request.nextUrl.protocol==='https:',sameSite:'strict',path:'/',maxAge:0});return response}
