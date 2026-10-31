export const CATEGORIES = ['Mops','Grass Brooms','Kharata Brooms','Ceiling Brooms','Floor Wipers','Toilet Brushes','Miscellaneous'] as const;
export type Product = {id:string;name:string;category:string;code:string;price:number|null;image:string;active:0|1;page?:number;description?:string;specifications?:string};
const cleanImage = /^(?:\/products\/[a-zA-Z0-9_-]+\.(?:webp|png|jpe?g)|\/api\/media\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp)$/;
export function validateProduct(value:unknown):Product|null {
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const p=value as Record<string,unknown>;
 const id=typeof p.id==='string'?p.id.trim():'';
 const name=typeof p.name==='string'?p.name.trim():'';
 const category=typeof p.category==='string'?p.category:'';
 const code=typeof p.code==='string'?p.code.trim():'';
 const image=typeof p.image==='string'?p.image.trim():'';
 const price=p.price===null?null:p.price;
 const description=typeof p.description==='string'?p.description.trim():'';
 const specifications=typeof p.specifications==='string'?p.specifications.trim():'';
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||!name||name.length>120||!CATEGORIES.some(c=>c===category)||code.length>40||image.length>160||image&&!cleanImage.test(image)||price!==null&&(typeof price!=='number'||!Number.isInteger(price)||price<0||price>10_000_000)||p.active!==0&&p.active!==1||p.description!==undefined&&typeof p.description!=='string'||description.length>2000||p.specifications!==undefined&&typeof p.specifications!=='string'||specifications.length>2000||p.page!==undefined&&(typeof p.page!=='number'||!Number.isInteger(p.page)||p.page<1||p.page>999))return null;
 return {id,name,category,code,price:price as number|null,image,active:p.active as 0|1,...(p.page!==undefined?{page:p.page as number}:{}),...(description?{description}:{}),...(specifications?{specifications}:{})};
}
