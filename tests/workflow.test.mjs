import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,unlink} from 'node:fs/promises';
import {authenticate,createSession,hasSession,validOrigin,loginAllowed,failedLogin,clearLogin} from '../lib/server/auth.ts';
import {applyProducts,readCatalog,readPublicCatalog,readImage,saveImage} from '../lib/server/store.ts';

const originalFetch=globalThis.fetch;
const originalEnv=Object.fromEntries(['GITHUB_MAGIX_REPO','GITHUB_MAGIX_TOKEN','GITHUB_MAGIX_BRANCH','GITHUB_MAGIX_PATH','GITHUB_MAGIX_UPLOAD_PATH','MAGIX_ADMIN_USERNAME','MAGIX_ADMIN_PASSWORD','MAGIX_SESSION_SECRET'].map(key=>[key,process.env[key]]));
const seed=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8'));
let catalog=structuredClone(seed),sha='sha-1',sequence=1,failWrite=false;
const images=new Map();
const requests=[];
process.env.GITHUB_MAGIX_REPO='example/private-magix';
process.env.GITHUB_MAGIX_TOKEN='offline-test-token';
process.env.GITHUB_MAGIX_BRANCH='main';
process.env.GITHUB_MAGIX_PATH='data/catalog.json';
process.env.GITHUB_MAGIX_UPLOAD_PATH='data/uploads';
process.env.MAGIX_ADMIN_USERNAME='admin';
process.env.MAGIX_ADMIN_PASSWORD='test-only-password';
process.env.MAGIX_SESSION_SECRET='a-test-only-secret-with-over-32-characters';
globalThis.fetch=async (url,options={})=>{
  const method=options.method||'GET';
  requests.push({url:String(url),method,auth:options.headers?.Authorization});
  if(!String(url).startsWith('https://api.github.com/repos/example/private-magix/contents/'))throw Error('unexpected request');
  const file=decodeURIComponent(new URL(url).pathname.split('/contents/')[1]);
  if(method==='GET'){
    const bytes=file==='data/catalog.json'?Buffer.from(JSON.stringify(catalog)):images.get(file);
    if(!bytes)return Response.json({message:'Not Found'},{status:404});
    return Response.json({type:'file',encoding:'base64',sha:file==='data/catalog.json'?sha:'image-sha',content:bytes.toString('base64')});
  }
  if(method==='PUT'){
    if(failWrite)return Response.json({message:'Conflict'},{status:409});
    const body=JSON.parse(options.body);
    if(file==='data/catalog.json'){
      if(body.sha!==sha)return Response.json({message:'Conflict'},{status:409});
      catalog=JSON.parse(Buffer.from(body.content,'base64').toString());sha=`sha-${++sequence}`;
    }else{images.set(file,Buffer.from(body.content,'base64'))}
    return Response.json({content:{sha}});
  }
  throw Error('unexpected method');
};

test('signed admin session, invalid credentials, tampering, and origin checks',()=>{
  assert.equal(authenticate('admin','test-only-password'),true);
  assert.equal(authenticate('admin','wrong'),false);
  const cookie=createSession();
  const request=value=>({cookies:{get:()=>value?{value}:undefined}});
  assert.equal(hasSession(request(cookie)),true);
  assert.equal(hasSession(request(cookie+'x')),false);
  assert.equal(hasSession(request()),false);
  const originRequest=origin=>({url:'https://magix.example/api/admin/apply',headers:{get:()=>origin}});
  assert.equal(validOrigin(originRequest('https://magix.example')),true);
  assert.equal(validOrigin(originRequest('https://other.example')),false);
});

test('login attempts are throttled after repeated failures',()=>{
  const ip='192.0.2.42';
  for(let i=0;i<5;i++){assert.equal(loginAllowed(ip),true);failedLogin(ip)}
  assert.equal(loginAllowed(ip),false);
  clearLogin(ip);
  assert.equal(loginAllowed(ip),true);
});

test('new product is staged until publishing, then can be edited, hidden and restored',async()=>{
  const base=(await readCatalog()).sha;
  const created={...seed[0],id:'test-new-product',name:'New mop',price:150,description:'Cotton head',specifications:'40 cm',active:1};
  assert.equal((await readPublicCatalog()).products.some(p=>p.id===created.id),false);
  await applyProducts([created],base);
  assert.equal((await readPublicCatalog()).products.find(p=>p.id===created.id)?.description,'Cotton head');
  const edited={...created,name:'Edited mop',price:200,category:'Floor Wipers'};
  await applyProducts([edited],(await readCatalog()).sha);
  assert.equal((await readPublicCatalog()).products.find(p=>p.id===created.id)?.price,200);
  await applyProducts([{...edited,active:0}],(await readCatalog()).sha);
  assert.equal((await readPublicCatalog()).products.some(p=>p.id===created.id),false);
  assert.equal((await readCatalog()).products.find(p=>p.id===created.id)?.active,0);
  await applyProducts([{...edited,active:1}],(await readCatalog()).sha);
  assert.equal((await readPublicCatalog()).products.some(p=>p.id===created.id),true);
  assert.equal(requests.some(r=>r.method==='PUT'&&r.auth==='Bearer offline-test-token'),true);
});

test('an image upload followed by a catalogue conflict leaves products unpublished',async()=>{
  const image=await readFile(new URL('../public/products/p03-1-1.webp',import.meta.url));
  const saved=await saveImage(image);
  assert.deepEqual(await readImage(saved.split('/').at(-1)),image);
  const before=(await readCatalog()).products.find(p=>p.id===seed[0].id);
  const base=(await readCatalog()).sha;
  failWrite=true;
  await assert.rejects(applyProducts([{...before,image:saved}],base),{status:409});
  failWrite=false;
  assert.equal((await readCatalog()).products.find(p=>p.id===before.id).image,before.image);
});

test('invalid input, stale SHA, GitHub write conflict and outage leave catalogue unchanged',async()=>{
  const current=(await readCatalog()).products.find(p=>p.id===seed[0].id);
  const base=(await readCatalog()).sha;
  await assert.rejects(applyProducts([{...current,price:'100'}],base),{status:400});
  await assert.rejects(applyProducts([{...current,name:'Stale'}],'old-sha'),{status:409});
  failWrite=true;
  await assert.rejects(applyProducts([{...current,name:'Conflict'}],base),{status:409});
  failWrite=false;
  assert.equal((await readCatalog()).products.find(p=>p.id===current.id).name,current.name);
  globalThis.fetch=async()=>Response.json({message:'Unavailable'},{status:503});
  const fallback=await readPublicCatalog();
  assert.equal(fallback.products.length,118);
  assert.match(fallback.warning,/temporarily unavailable/);
  await assert.rejects(applyProducts([{...current,name:'Outage'}],base));
});

test('image upload rejects invalid bytes and missing or unsafe image paths',async()=>{
  globalThis.fetch=originalFetch;
  process.env.GITHUB_MAGIX_REPO='';process.env.GITHUB_MAGIX_TOKEN='';
  await assert.rejects(saveImage(Buffer.from('not a WebP')),{status:400});
  assert.equal(await readImage('../secret.webp'),null);
  const image=await readFile(new URL('../public/products/p03-1-1.webp',import.meta.url));
  const saved=await saveImage(image);
  assert.match(saved,/^\/api\/media\/[a-f0-9-]{36}\.webp$/);
  assert.deepEqual(await readImage(saved.split('/').at(-1)),image);
  await unlink(new URL('../data/uploads/'+saved.split('/').at(-1),import.meta.url));
  const item={...seed[0],image:'/api/media/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.webp'};
  await assert.rejects(applyProducts([item],null),{status:400});
});

test.after(()=>{
  globalThis.fetch=originalFetch;
  for(const [key,value] of Object.entries(originalEnv)){if(value===undefined)delete process.env[key];else process.env[key]=value}
});
