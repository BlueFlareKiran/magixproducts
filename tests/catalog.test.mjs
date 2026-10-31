import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateProduct,CATEGORIES} from '../lib/product.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const seed=JSON.parse(await readFile(path.join(root,'data/catalog.json'),'utf8'));
const bundled=JSON.parse(await readFile(path.join(root,'src/catalog.json'),'utf8'));
test('all 118 original products remain valid, with unique IDs and seven categories',()=>{
 assert.equal(seed.length,118);
 assert.deepEqual(bundled,seed);
 assert.equal(new Set(seed.map(p=>p.id)).size,118);
 assert.deepEqual(new Set(seed.map(p=>p.category)),new Set(CATEGORIES));
 for(const item of seed) assert.deepEqual(validateProduct(item),item);
});
test('reject unsafe admin catalogue edits',()=>{
 const sample=seed[0];
 for(const invalid of [{...sample,name:''},{...sample,price:-5},{...sample,price:1.5},{...sample,image:'https://evil.example/a.jpg'},{...sample,image:'/api/media/../token'},{...sample,category:'Other'},{...sample,id:'../abc'},{...sample,active:2}])assert.equal(validateProduct(invalid),null);
 assert.equal(validateProduct({...sample,price:500})?.price,500);
});
test('every referenced original product image is included',async()=>{
 for(const {image} of seed){assert.ok(image.startsWith('/products/'));await readFile(path.join(root,'public',image.slice(1)))}
});
test('all public QR/catalogue brand assets are preserved',async()=>{
 const publicNames=await readdir(path.join(root,'public'));
 for(const name of ['products','qr','Magix_Product_Catalogue.pdf','magix-original-logo.png','hero-products.webp','hero-catalog.webp'])assert.ok(publicNames.includes(name),name);
 for(const name of ['website','catalogue','location']){const bytes=await readFile(path.join(root,'public','qr',name+'.png'));assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a')}
 const pdf=await readFile(path.join(root,'public','Magix_Product_Catalogue.pdf'));assert.equal(pdf.subarray(0,4).toString(),'%PDF');
});
