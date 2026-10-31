// Server-only: import exclusively from Next.js route handlers/server components.
import {randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import seed from '../../src/catalog.json' with {type:'json'};
import type {Product} from '../product.ts';
import {validateProduct} from '../product.ts';
const LOCAL_CATALOG=path.join(process.cwd(),'data','catalog.json');
const LOCAL_UPLOADS=path.join(process.cwd(),'data','uploads');
const startupProducts:Product[]=(seed as unknown[]).map(validateProduct).filter((p):p is Product=>!!p);
export class StorageError extends Error{status:number;constructor(message:string,status=503){super(message);this.status=status}}
function config(){
 const repo=(process.env.GITHUB_MAGIX_REPO||'').trim(),token=(process.env.GITHUB_MAGIX_TOKEN||'').trim();
 if(repo&&!/^[\w.-]+\/[\w.-]+$/.test(repo))throw new StorageError('Invalid GITHUB_MAGIX_REPO configuration.');
 const branch=(process.env.GITHUB_MAGIX_BRANCH||'main').trim();
 if((repo&&!token)||(!repo&&token))throw new StorageError('Set both GITHUB_MAGIX_REPO and GITHUB_MAGIX_TOKEN.');
 if(!/^[\w./-]{1,100}$/.test(branch)||branch.includes('..')||branch.startsWith('/'))throw new StorageError('Invalid GITHUB_MAGIX_BRANCH configuration.');
 const catalog=(process.env.GITHUB_MAGIX_PATH||'data/catalog.json').trim();
 const upload=(process.env.GITHUB_MAGIX_UPLOAD_PATH||'data/uploads').trim();
 if(!/^data\/[\w./-]+\.json$/.test(catalog)||catalog.includes('..')||catalog.includes('//')||!/^data\/[\w/-]+$/.test(upload)||upload.includes('..')||upload.includes('//'))throw new StorageError('Invalid GitHub storage paths.');
 return {repo,token,branch,catalog,upload,remote:!!repo&&!!token};
}
function requireWrite(){const c=config();if(c.remote)return c;if(process.env.NODE_ENV==='production')throw new StorageError('Production editing requires GITHUB_MAGIX_REPO and GITHUB_MAGIX_TOKEN.');return c}
function githubURL(p:string){const c=config();return `https://api.github.com/repos/${c.repo}/contents/${p.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(c.branch)}`}
function headers(token:string){return {Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'}}
type GitHubContent={sha:string;content?:string;encoding?:string;type?:string};
async function readGitHubFile(filePath:string):Promise<{sha:string;bytes:Buffer}|null>{
 const c=config();const response=await fetch(githubURL(filePath),{headers:headers(c.token),cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(response.status===404)return null;
 if(!response.ok)throw new StorageError(`GitHub read failed (${response.status}). Check repository, branch and token permissions.`);
 const doc=await response.json() as GitHubContent;
 if(doc.type!=='file'||!doc.content||doc.encoding!=='base64')throw new StorageError('GitHub returned an unsupported content response.');
 return {sha:doc.sha,bytes:Buffer.from(doc.content.replace(/\s/g,''),'base64')};
}
async function writeGitHubFile(filePath:string,bytes:Buffer,message:string,sha?:string){
 const c=requireWrite();
 const response=await fetch(githubURL(filePath).split('?ref=')[0],{method:'PUT',headers:{...headers(c.token),'Content-Type':'application/json'},body:JSON.stringify({message,branch:c.branch,content:bytes.toString('base64'),...(sha?{sha}:{})}),cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!response.ok){if(response.status===409||response.status===422)throw new StorageError('GitHub rejected the update because the file or branch changed. Refresh and try again.',409);throw new StorageError(`GitHub write failed (${response.status}). Check Contents read/write permission and branch protections.`)}
}
function normalizeList(value:unknown):Product[]{if(!Array.isArray(value)||value.length>5000)throw new StorageError('Stored catalogue is invalid.');const products=value.map(validateProduct);if(products.some(p=>!p)||new Set(products.map(p=>p!.id)).size!==products.length)throw new StorageError('Stored catalogue contains invalid or duplicate products.');return products as Product[]}
export type Snapshot={products:Product[];sha:string|null};
export async function readCatalog():Promise<Snapshot>{
 const c=config();if(c.remote){const result=await readGitHubFile(c.catalog);if(!result)throw new StorageError('GitHub catalogue file was not found. Commit data/catalog.json to the selected branch.');return {products:normalizeList(JSON.parse(result.bytes.toString('utf8'))),sha:result.sha}}
 try{return {products:normalizeList(JSON.parse(await readFile(LOCAL_CATALOG,'utf8'))),sha:null}}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return {products:startupProducts,sha:null};throw error}
}
export async function readPublicCatalog():Promise<{products:Product[];warning?:string}>{try{const snapshot=await readCatalog();return {products:snapshot.products.filter(p=>p.active===1)}}catch(error){console.error('Catalogue fetch failed:',error instanceof Error?error.message:'error');return {products:startupProducts.filter(p=>p.active===1),warning:'Live catalogue temporarily unavailable; showing bundled catalogue.'}}}
export async function applyProducts(inputs:unknown[],baseSha:unknown){
 if(inputs.length<1||inputs.length>200)throw new StorageError('Apply between 1 and 200 product changes.',400);
 const changes=inputs.map(validateProduct);
 if(changes.some(x=>!x)||new Set(changes.map(x=>x!.id)).size!==changes.length)throw new StorageError('Invalid products, prices or duplicate IDs.',400);
 const c=requireWrite();const current=await readCatalog();
 if(c.remote&&(!baseSha||baseSha!==current.sha))throw new StorageError('The catalogue changed since you opened this page. Reload before applying.',409);
 const byId=new Map(current.products.map(p=>[p.id,p]));
 for(const p of changes as Product[]){const old=byId.get(p.id);byId.set(p.id,{...p,...(p.page===undefined&&old?.page?{page:old.page}:{})})}
 const merged=[...byId.values()];
 for(const p of changes as Product[]){
  if(p.image.startsWith('/api/media/')&&!await readImage(p.image.slice('/api/media/'.length)))throw new StorageError('An uploaded product image is missing. Upload it again before publishing.',400);
  if(p.image.startsWith('/products/')){try{await readFile(path.join(process.cwd(),'public',p.image.slice(1)))}catch{throw new StorageError('A bundled product image is missing.',400)}}
 }
 if(c.remote)await writeGitHubFile(c.catalog,Buffer.from(JSON.stringify(merged,null,2)+'\n'),'magix: publish catalogue edits',current.sha||undefined);
 else await writeFile(LOCAL_CATALOG,JSON.stringify(merged,null,2)+'\n');
 return {applied:changes.length};
}
export function validWebP(bytes:Buffer){
 if(bytes.length<30||bytes.length>950_000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.readUInt32LE(4)!==bytes.length-8)return false;
 const kind=bytes.toString('ascii',12,16),chunkSize=bytes.readUInt32LE(16);
 if(chunkSize<10||chunkSize+20>bytes.length)return false;
 let width=0,height=0;
 if(kind==='VP8X'){
  width=1+bytes.readUIntLE(24,3);height=1+bytes.readUIntLE(27,3);
 }else if(kind==='VP8L'&&bytes[20]===0x2f){
  width=1+(((bytes[22]&0x3f)<<8)|bytes[21]);height=1+((bytes[24]&0x0f)<<10|bytes[23]<<2|bytes[22]>>6);
 }else if(kind==='VP8 '&&bytes.toString('hex',23,26)==='9d012a'){
  width=bytes.readUInt16LE(26)&0x3fff;height=bytes.readUInt16LE(28)&0x3fff;
 }else return false;
 return width>0&&height>0&&width<=6000&&height<=6000;
}
export async function saveImage(bytes:Buffer){if(!validWebP(bytes))throw new StorageError('Optimized image must be under 950 KB.',400);const c=requireWrite();const filename=`${randomUUID()}.webp`;if(c.remote)await writeGitHubFile(`${c.upload}/${filename}`,bytes,`magix: upload product image ${filename}`);else{await mkdir(LOCAL_UPLOADS,{recursive:true});await writeFile(path.join(LOCAL_UPLOADS,filename),bytes)}return `/api/media/${filename}`}
export async function readImage(filename:string){if(!/^[a-f\d-]{36}\.webp$/.test(filename))return null;const c=config();if(c.remote){const result=await readGitHubFile(`${c.upload}/${filename}`);return result?.bytes||null}try{return await readFile(path.join(LOCAL_UPLOADS,filename))}catch{return null}}
