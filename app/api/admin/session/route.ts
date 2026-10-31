import type {NextRequest} from 'next/server';
import {hasSession} from '@/lib/server/auth';
import {json} from '@/lib/server/http';
export const runtime='nodejs';
export async function GET(request:NextRequest){return json({authenticated:hasSession(request)})}
