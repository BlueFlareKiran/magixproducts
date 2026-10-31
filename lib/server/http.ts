import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {hasSession,validOrigin} from './auth';
import {StorageError} from './store';
export function json(data:unknown,status=200){return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function fail(error:unknown){if(error instanceof StorageError)return json({error:error.message},error.status);console.error('Magix API error:',error instanceof Error?error.message:'unknown');return json({error:'Service temporarily unavailable. Please retry.'},503)}
export function canWrite(request:NextRequest){if(!validOrigin(request))return json({error:'Invalid request origin.'},403);if(!hasSession(request))return json({error:'Unauthorized.'},401);return null}
