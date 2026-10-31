import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=await readFile(path.join(root,'src/MagixSite.tsx'),'utf8');
const css=await readFile(path.join(root,'app/premium.css'),'utf8');
test('home hero product slide has text + Explore action but no product image',()=>{
  const secondSlide=source.split('aria-label="3 of 4: Our hero broom"')[1].split('aria-label="4 of 4: Plastic Clip Mop Colour"')[0];
  assert.match(secondSlide,/OUR HERO PRODUCT/);
  assert.match(secondSlide,/90\+ Days/);
  assert.match(secondSlide,/Explore hero product/);
  assert.doesNotMatch(secondSlide,/<img\b/);
  assert.doesNotMatch(secondSlide,/hero-broom-visual|hero-broom-image-frame|broom-product-label/);
  assert.match(css,/\.hero-slideshow \.broom-slide/);
});
test('explore hero product popup displays the original MAKAI GOLD packaging',async()=>{
  const dialog=source.split('function HeroBroomDialog')[1].split('function HomeHero')[0];
  assert.match(dialog,/showModal\(\)/);
  assert.match(dialog,/hero-broom-makai-gold\.webp/);
  assert.match(dialog,/MAKAI GOLD/);
  assert.doesNotMatch(dialog,/p07-1-2\.webp/);
  const image=await readFile(path.join(root,'public/brand/hero-broom-makai-gold.webp'));
  assert.ok(image.length>1000);
  assert.equal(image.toString('ascii',0,4),'RIFF');
  assert.equal(image.toString('ascii',8,12),'WEBP');
});


test('the extended home carousel adds item 429 and supplied Karnataka promotion without replacing original slides',async()=>{
  assert.match(source,/aria-label="1 of 4: The Magix collection"/);
  assert.match(source,/aria-label="3 of 4: Our hero broom"/);
  assert.doesNotMatch(source,/magix-approved-image-slide/); // no separate full-width poster masking native carousel
  const mop=source.split('aria-label="4 of 4: Plastic Clip Mop Colour"')[1].split('{broomOpen&&')[0];
  assert.match(mop,/Plastic Clip/);
  assert.match(mop,/Mop Colour/);
  assert.match(mop,/70\+ Days/);
  assert.match(mop,/4 ft M\.S\. metal rod/);
  assert.match(mop,/Virgin plastic clip/);
  assert.match(mop,/Pure cotton refill/);
  assert.match(mop,/\/product\/catalog-3-1-3/);
  assert.doesNotMatch(mop,/<img\b/); // do not float a catalogue product cutout over living-room photography
  const quality=source.split('aria-label="2 of 4: Magix quality and trust"')[1].split('aria-label="3 of 4: Our hero broom"')[0];
  assert.match(source,/className="shell premium-hero-grid hero-slide quality-slide refined-trust-slide"/);
  assert.match(quality,/We mean<br\/><em>trust\./);
  assert.match(quality,/We just don’t mean clean/);
  assert.match(quality,/we mean trust also/);
  assert.match(quality,/First Company in/);
  assert.match(quality,/KARNATAKA/);
  assert.match(quality,/ISO 9001:2015/);
  assert.match(quality,/refined-iso-token/);
  assert.match(quality,/CLEANER<br\/>HOMES/);
  assert.match(quality,/HEALTHIER<br\/>LIFESTYLE/);
  assert.match(quality,/SUSTAINABLE<br\/>LIVING/);
  assert.match(quality,/STRONGER<br\/>COMMUNITIES/);
  assert.match(quality,/\/Magix_ISO_9001_2015_Certificate\.pdf/);
  assert.match(quality,/<img\b/);
  assert.doesNotMatch(quality,/editorial-certificate-frame|quality-trust-card/);
  assert.match(css,/\.hero-slideshow\.quality-active \.refined-tiny-benefits/);
  assert.match(css,/\.hero-slideshow\.quality-active \.refined-iso-token/);
  assert.match(css,/\.hero-slideshow\.quality-active \.refined-trust-copy/);
  assert.match(source,/active\+1\} \/ 04/);
  for(const file of ['public/brand/magix-karnataka-iso-promo.jpg','public/brand/magix-iso-emblem-crop.webp','public/brand/magix-cloud-r.png','public/brand/products-bright.webp','public/brand/about-bright.webp','public/brand/contact-bright.webp']){
    const data=await readFile(path.join(root,file));assert.ok(data.length>1000,`${file} must exist`);
  }
});


test('certification is slide two, broom slide three and mop slide four with a photo background',()=>{
  const slideLabels=[
    '1 of 4: The Magix collection',
    '2 of 4: Magix quality and trust',
    '3 of 4: Our hero broom',
    '4 of 4: Plastic Clip Mop Colour'
  ];
  let previous=-1;
  for(const label of slideLabels){
    const offset=source.indexOf(`aria-label="${label}"`);
    assert.ok(offset>previous,`${label} should appear in sequential slide order`);
    previous=offset;
  }
  assert.match(source,/active===1\?' quality-active'/);
  assert.match(source,/onClick=\{\(\)=>go\(1\)\} aria-label="Show quality and ISO certificate slide"/);
  assert.match(source,/onClick=\{\(\)=>go\(2\)\} aria-label="Show broom product slide"/);
  assert.match(source,/onClick=\{\(\)=>go\(3\)\} aria-label="Show Plastic Clip Mop Colour slide"/);
  assert.match(css,/:root \.hero-slideshow\.quality-active \.hero-atmosphere/);
  assert.match(css,/url\('\/brand\/home-banner\.webp'\)/);
  // New slide two uses the actual home image with no blue overlay.
  assert.match(css,/ISO \+ Karnataka hero/);
  assert.match(css,/background-image:url\('\/brand\/home-banner\.webp'\)/);
  assert.match(css,/\.hero-slideshow\.quality-active \.refined-tiny-icon/);
});

test('refined trust slide uses small inline icons and keeps the source certificate accessible',async()=>{
  const quality=source.split('aria-label="2 of 4: Magix quality and trust"')[1].split('aria-label="3 of 4: Our hero broom"')[0];
  assert.match(quality,/MAGIX QUALITY PROMISE/);
  assert.match(quality,/We mean<br\/><em>trust\./);
  assert.match(quality,/First Company in/);
  assert.match(quality,/KARNATAKA/);
  assert.match(quality,/refined-tiny-benefit/);
  assert.match(quality,/refined-tiny-icon trust-green/);
  assert.match(quality,/refined-tiny-icon trust-pink/);
  assert.match(quality,/refined-tiny-icon trust-blue/);
  assert.match(quality,/refined-tiny-icon trust-orange/);
  assert.doesNotMatch(quality,/quality-trust-card|editorial-certificate-frame/);
  const cert=await readFile(path.join(root,'public/Magix_ISO_9001_2015_Certificate.pdf'));
  assert.ok(cert.length>50000);
  assert.match(css,/ISO \+ Karnataka hero/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/Harmonized ISO slide/);
  assert.doesNotMatch(css,/\.refined-trust-slide \{ display:none !important;/);
  assert.doesNotMatch(css,/\.slideshow-footer \{ display:none !important;/);
});
