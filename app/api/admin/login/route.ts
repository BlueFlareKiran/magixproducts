import type {NextRequest} from 'next/server';
import {authenticate,clearLogin,configured,COOKIE_NAME,createSession,failedLogin,loginAllowed,SESSION_SECONDS,validOrigin} from '@/lib/server/auth';
import {json} from '@/lib/server/http';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 if(!validOrigin(request))return json({error:'Invalid request origin.'},403);
 if(!configured())return json({error:'Admin login is not configured. Set MAGIX_ADMIN_USERNAME, MAGIX_ADMIN_PASSWORD and a 32+ character MAGIX_SESSION_SECRET.'},503);
 const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,64);
 if(!loginAllowed(ip))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 let body:Record<string,unknown>;try{body=await request.json()}catch{return json({error:'Invalid request.'},400)}
 const username=typeof body.username==='string'?body.username:'',password=typeof body.password==='string'?body.password:'';
 if(username.length>80||password.length>200||!authenticate(username,password)){failedLogin(ip);return json({error:'Incorrect username or password.'},401)}
 clearLogin(ip);
 const response=json({authenticated:true});
 response.cookies.set(COOKIE_NAME,createSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production'||request.nextUrl.protocol==='https:',sameSite:'strict',path:'/',maxAge:SESSION_SECONDS});
 return response;
}
