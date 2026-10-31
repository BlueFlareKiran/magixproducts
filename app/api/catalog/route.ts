import {readPublicCatalog} from '@/lib/server/store';
import {json} from '@/lib/server/http';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){return json(await readPublicCatalog())}
