// Server-only: import exclusively from Next.js route handlers/server components.
import {createHash,createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import type {NextRequest} from 'next/server';
export const COOKIE_NAME='magix_admin';
export const SESSION_SECONDS=60*60*8;
const attempts=new Map<string,{count:number;reset:number}>();
function safeEqual(a:string,b:string){const x=createHash('sha256').update(a).digest();const y=createHash('sha256').update(b).digest();return timingSafeEqual(x,y)}
function secret(){return process.env.MAGIX_SESSION_SECRET||''}
export function configured(){return !!process.env.MAGIX_ADMIN_USERNAME&&!!process.env.MAGIX_ADMIN_PASSWORD&&secret().length>=32}
function sign(payload:string){return createHmac('sha256',secret()).update(payload).digest('base64url')}
export function authenticate(username:string,password:string){return configured()&&safeEqual(username,process.env.MAGIX_ADMIN_USERNAME!)&&safeEqual(password,process.env.MAGIX_ADMIN_PASSWORD!)}
export function createSession(){if(!configured())throw Error('Admin authentication is not configured');const payload=Buffer.from(JSON.stringify({v:1,username:process.env.MAGIX_ADMIN_USERNAME,exp:Date.now()+SESSION_SECONDS*1000,nonce:randomUUID()})).toString('base64url');return `${payload}.${sign(payload)}`}
export function hasSession(request:NextRequest){if(!configured())return false;const value=request.cookies.get(COOKIE_NAME)?.value;if(!value||value.length>2000)return false;const [payload,signature,...extra]=value.split('.');if(!payload||!signature||extra.length||!safeEqual(signature,sign(payload)))return false;try{const decoded=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));return decoded.v===1&&decoded.username===process.env.MAGIX_ADMIN_USERNAME&&typeof decoded.exp==='number'&&decoded.exp>Date.now()&&decoded.exp<=Date.now()+SESSION_SECONDS*1000}catch{return false}}
export function validOrigin(request:NextRequest){const origin=request.headers.get('origin');return !!origin&&origin===new URL(request.url).origin}
// A lightweight, process-local limiter. Multiple serverless instances do not share counters.
function bucket(key:string,limit:number){const now=Date.now();const item=attempts.get(key);if(!item||item.reset<=now){if(attempts.size>10000){for(const [name,value] of attempts)if(value.reset<=now)attempts.delete(name);if(attempts.size>10000)attempts.clear()}attempts.set(key,{count:0,reset:now+15*60*1000});return true}return item.count<limit}
export function loginAllowed(ip:string){return bucket('ip:'+ip,5)&&bucket('global',50)}
export function failedLogin(ip:string){for(const key of ['ip:'+ip,'global']){const item=attempts.get(key);if(item)item.count++}}
export function clearLogin(ip:string){attempts.delete('ip:'+ip)}
