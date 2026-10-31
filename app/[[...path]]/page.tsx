import {notFound} from 'next/navigation';
import MagixSite from '@/src/MagixSite';
import {readPublicCatalog} from '@/lib/server/store';

export const dynamic='force-dynamic';
const categories=new Set(['mops','grass-brooms','kharata-brooms','ceiling-brooms','floor-wipers','toilet-brushes','miscellaneous']);
export default async function Page({params}:{params:Promise<{path?:string[]}>}){
 const parts=(await params).path||[];
 const valid=parts.length===0||parts.length===1&&['products','about','contact','admin'].includes(parts[0])||parts.length===2&&(parts[0]==='products'&&categories.has(parts[1])||parts[0]==='product'&&/^[a-zA-Z0-9_-]{1,80}$/.test(parts[1]));
 if(!valid)notFound();
 const initial=await readPublicCatalog();
 if(parts[0]==='product'&&!initial.products.some(p=>p.id===parts[1]))notFound();
 return <MagixSite path={'/'+parts.join('/')} initialProducts={initial.products} warning={initial.warning}/>;
}
