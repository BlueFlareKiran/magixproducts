"use client";
import React,{useEffect,useMemo,useState,useRef} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Sun,Moon,Pause,Play,ChevronLeft,ChevronRight,ArrowUpRight,ChevronDown,Menu,X,Search,MapPin,Phone,Mail,Save,LogOut,Upload,ArrowRight,LockKeyhole,Instagram,House,ShieldCheck,Leaf,UsersRound,BookOpen,Download,FileText} from 'lucide-react';
import seed from './catalog.json';
import type {Product} from '../lib/product';

const CATEGORIES=['Mops','Grass Brooms','Kharata Brooms','Ceiling Brooms','Floor Wipers','Toilet Brushes','Miscellaneous'];
const starting=seed as Product[];
const originalProductIds=new Set(starting.map(p=>p.id));
const slug=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const categoryUrl=(name:string)=>`/products/${slug(name)}`;
const CATEGORY_IMAGES:Record<string,string>={
  'Mops':'/products/p04-1-2.webp',
  'Grass Brooms':'/products/p07-1-4.webp',
  'Kharata Brooms':'/products/p08-1-6.webp',
  'Ceiling Brooms':'/products/p09-2-1.webp',
  'Floor Wipers':'/products/p10-1-2.webp',
  'Toilet Brushes':'/products/p13-2-2.webp',
  'Miscellaneous':'/products/p17-1-4.webp'
};
const categoryFromPath=(path:string)=>CATEGORIES.find(c=>slug(c)===path.split('/').filter(Boolean)[1])||'All products';
const featuredIds=['catalog-3-1-1','catalog-6-1-1','catalog-10-1-2','catalog-13-1-2'];
const CatalogContext=React.createContext<{products:Product[];warning?:string}>({products:starting});
function useCatalog(){const initial=React.useContext(CatalogContext);const [products,setProducts]=useState<Product[]>(initial.products),[error,setError]=useState(initial.warning||'');useEffect(()=>{fetch('/api/catalog',{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setProducts(d.products as Product[]);setError(d.warning||'')}).catch(e=>setError(e.message||'Catalog updates are temporarily unavailable.'))},[]);return {products,error}}
function Brand(){return <Link href="/" className="brand" aria-label="Magix home"><img src="/brand/magix-cloud-r.png" alt="Magix — We Mean Clean"/></Link>}
function ThemeToggle(){
 const [dark,setDark]=useState(false);
 useEffect(()=>{setDark(document.documentElement.dataset.theme==='dark')},[]);
 function toggle(){const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';try{localStorage.setItem('magix-theme',next?'dark':'light')}catch{}}
 return <button type="button" className="theme-toggle" onClick={toggle} aria-label={dark?'Switch to light mode':'Switch to dark mode'} title={dark?'Light mode':'Dark mode'}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
}
function Header({path}:{path:string}){
 const [open,setOpen]=useState(false),[drop,setDrop]=useState(false);
 useEffect(()=>{setOpen(false);setDrop(false)},[path]);
 return <header className="header"><div className="shell head-inner"><Brand/><nav className={open?'nav open':'nav'} aria-label="Main navigation"><Link className={path==='/'?'current':''} href="/">Home</Link><div className="nav-dropdown" onMouseEnter={()=>setDrop(true)} onMouseLeave={()=>setDrop(false)}><div className="nav-products"><Link href="/products" className={path.startsWith('/product')?'current':''}>Our collection</Link><button type="button" aria-label="Show product categories" aria-expanded={drop} onClick={()=>setDrop(!drop)} onKeyDown={e=>{if(e.key==='Escape'){setDrop(false);e.currentTarget.blur()}}}><ChevronDown size={14}/></button></div><div className={drop?'dropdown-panel show':'dropdown-panel'}><Link href="/products">All products <ArrowUpRight size={15}/></Link>{CATEGORIES.map(c=><Link href={categoryUrl(c)} key={c}>{c}<ArrowUpRight size={15}/></Link>)}</div></div><Link className={path.startsWith('/about')?'current':''} href="/about">Our story</Link><Link className={path.startsWith('/contact')?'current':''} href="/contact">Contact</Link></nav><div className="header-actions"><ThemeToggle/><Link className="head-contact" href="/contact">Let’s talk <ArrowUpRight size={16}/></Link><button className="mobile-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={24}/>:<Menu size={24}/>}</button></div></div></header>
}
function Footer(){return <footer className="footer"><div className="shell footer-main"><div><Brand/><p>Cleaning essentials for the spaces we live in, made with more than three decades of know-how.</p></div><div><strong>Explore</strong><Link href="/products">All products</Link><Link href="/about">About us</Link>{CATEGORIES.slice(0,4).map(c=><Link key={c} href={categoryUrl(c)}>{c}</Link>)}</div><div><strong>Connect</strong><Link href="/contact">Contact us</Link><a href="tel:+919900844744">+91 99008 44744</a><a href="mailto:magixblr@yahoo.co.in">magixblr@yahoo.co.in</a></div><div><strong>Find us</strong><span>#19, 9th Cross, Cubbonpet<br/>Bangalore – 560 002</span></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} Magix Household Product</span><span>We Mean Clean.</span></div></footer>}
function ProductCard({p}:{p:Product}){return <Link className="product-card" href={`/product/${encodeURIComponent(p.id)}`} aria-label={`View ${p.name} details`}><div className="product-photo">{p.image?<img src={p.image} alt={p.name} loading="lazy"/>:<span className="photo-placeholder">Magix</span>}</div><div className="product-meta"><span>{p.category} {p.code&&<>· ITEM {p.code}</>}</span><h3>{p.name}</h3><p>{p.price===null?'Contact for price':`₹${p.price.toLocaleString('en-IN')}`}</p><span className="card-view">View details <ArrowUpRight size={15}/></span></div></Link>}
function ProductGrid({products}:{products:Product[]}){return <div className="product-grid">{products.map(p=><ProductCard p={p} key={p.id}/>)}</div>}
function MovingFavorites({products}:{products:Product[]}){
  if(!products.length)return null;
  return <div className="favorites-window" aria-label="Automatically scrolling Magix favorite products"><div className="favorites-track">{[...products,...products,...products,...products].map((p,i)=><div className="favorites-item" key={`${p.id}-${i}`}><ProductCard p={p}/></div>)}</div></div>;
}
const lifestyleScenes=[
  {image:'/lifestyle/living-room.webp',eyebrow:'FOR EVERYDAY LIVING',title:'A cleaner home starts with the right mop.',body:'Keep living spaces fresh with Magix mops designed for regular use.',link:'/products/mops',linkText:'Explore mops'},
  {image:'/lifestyle/bathroom.webp',eyebrow:'FOR BATHROOM CARE',title:'Clean corners and tiles with confidence.',body:'Discover Magix toilet brushes and tools made for bathroom cleaning.',link:'/products/toilet-brushes',linkText:'Explore toilet brushes'},
  {image:'/lifestyle/home-cleaning.webp',eyebrow:'FOR FLOOR CARE',title:'Everyday floors. Everyday care.',body:'Explore Magix grass brooms and floor wipers for sweeping and wiping.',link:'/products/grass-brooms',linkText:'Explore brooms'},
  {image:'/lifestyle/bathroom-detail.webp',eyebrow:'FOR DEEPER CLEANING',title:'The little details matter.',body:'Brushes, scrubbers and more for the jobs around the home.',link:'/products/miscellaneous',linkText:'Explore cleaning tools'}
];
function LifestyleShowcase(){return <section className="lifestyle-section" aria-labelledby="lifestyle-title"><div className="shell"><div className="lifestyle-section-header"><span className="kicker">INSPIRED BY THE ORIGINAL MAGIX CATALOGUE</span><h2 id="lifestyle-title">The right tool for every room.</h2><p>Spaces from our product catalogue, paired with the cleaning tools that belong there.</p></div><div className="lifestyle-viewport"><div className="lifestyle-track">{[...lifestyleScenes,...lifestyleScenes].map((scene,i)=><article className="lifestyle-slide" key={scene.image+'-'+i} style={{backgroundImage:`linear-gradient(90deg,rgba(20,40,55,.84),rgba(20,40,55,.24)),url(${scene.image})`}}><div className="lifestyle-slide-content"><span>{scene.eyebrow}</span><h3>{scene.title}</h3><p>{scene.body}</p><Link href={scene.link}>{scene.linkText} <ArrowUpRight size={17}/></Link></div></article>)}</div></div></div></section>}


function HeroBroomDialog({onClose}:{onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog?.close();document.body.style.overflow=previous}},[]);
 return <dialog ref={ref} className="hero-broom-dialog" aria-labelledby="hero-broom-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><button type="button" className="hero-broom-close" onClick={onClose} aria-label="Close hero product" autoFocus><X size={22}/></button><div className="hero-broom-dialog-grid"><div className="hero-broom-product-photo"><img src="/brand/hero-broom-makai-gold.webp" alt="Magix MAKAI GOLD broom stick with its purple product packaging"/></div><div><span className="kicker">OUR HERO PRODUCT</span><h2 id="hero-broom-title">Our hero: the broom stick.</h2><div className="usage-life"><strong>90+ Days</strong><span>indicative usage life*</span></div><p>A familiar tool for everyday sweeping, and one of the cleaning essentials at the heart of our range.</p><p className="usage-note"><strong>*Indicative only:</strong> Based on varying usage conditions and customer feedback. Actual lifespan depends on use and care; not a guaranteed minimum.</p><div className="hero-broom-dialog-actions"><Link href="/contact" className="button button-dark">Enquire about this broom <ArrowUpRight size={17}/></Link><Link href="/products/grass-brooms" className="link-arrow">View all grass brooms <ArrowRight size={17}/></Link></div></div></div></dialog>
}
function HomeHero(){
 const [broomOpen,setBroomOpen]=useState(false);
 const [paused,setPaused]=useState(false);
 const [active,setActive]=useState(0);
 const [hovered,setHovered]=useState(false);
 const [focused,setFocused]=useState(false);
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>setReduced(media.matches);sync();
  media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);
 },[]);
 useEffect(()=>{
  if(paused||hovered||focused||reduced||broomOpen)return;
  const timer=window.setInterval(()=>{if(!document.hidden)setActive(i=>(i+1)%4)},8000);
  return()=>window.clearInterval(timer);
 },[paused,hovered,focused,reduced,active,broomOpen]);
 const go=(index:number)=>setActive((index+4)%4);
 return <section className={'premium-hero hero-slideshow'+(paused?' motion-paused':'')+(active===1?' quality-active':'')} aria-label="Magix highlights" aria-roledescription="carousel" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocused(false)}}>
 <div className="hero-atmosphere" aria-hidden="true"/>
 <div className="shell premium-hero-grid hero-slide" hidden={active!==0} role="group" aria-roledescription="slide" aria-label="1 of 4: The Magix collection">
 <div className="premium-copy"><span className="hero-eyebrow"><i/> EVERYDAY SPACES. EXTRAORDINARY CARE.</span><h1>A little care.<br/>A beautifully<br/><em>clean home.</em></h1><p>Thoughtful cleaning essentials for every room, every corner, and everything life leaves behind.</p><div className="hero-actions"><Link href="/products" className="button premium-primary">Explore the collection <ArrowUpRight size={19}/></Link><Link href="/about" className="quiet-link">Meet Magix <ArrowRight size={17}/></Link></div><div className="hero-proof"><span><strong>32+</strong> years of know-how</span><span><strong>7</strong> ways to a better clean</span><span className="hero-origin">BENGALURU ROOTS.<br/>EVERYDAY PURPOSE.</span></div></div>
 <div className="premium-visual"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="emblem-stage"><img className="premium-spokes" src="/brand/magix-tools-ring.png" alt="Magix collection of mops, brooms, brushes and wipers" fetchPriority="high"/><img className="premium-cloud" src="/brand/magix-cloud-r.png" alt="Magix — We Mean Clean"/></div><div className="emblem-caption"><p>We Mean Clean</p><span>MOP-BRUSH-BROOM-WIPER</span></div></div>
 </div>
 <div className="shell premium-hero-grid hero-slide quality-slide refined-trust-slide" hidden={active!==1} role="group" aria-roledescription="slide" aria-label="2 of 4: Magix quality and trust">
  <div className="premium-copy quality-copy refined-trust-copy">
   <span className="hero-eyebrow"><i/> MAGIX QUALITY PROMISE · SINCE 1991</span>
   <h2>We mean<br/><em>trust.</em></h2>
   <p className="quality-superline">Great cleaning starts with something bigger.</p>
   <p className="quality-statement">We just don’t mean clean — <strong>we mean trust also.</strong></p>
   <div className="quality-actions"><Link href="/about#magix-certification" className="button premium-primary">Our quality story <ArrowUpRight size={19}/></Link><a className="quality-certificate-link" href="/Magix_ISO_9001_2015_Certificate.pdf" target="_blank" rel="noopener noreferrer">View certificate <ArrowUpRight size={17}/></a></div>
  </div>
  <div className="refined-trust-visual" aria-label="Magix ISO 9001:2015 certification and four cleaning commitments">
   <div className="refined-cert-header">
    <a className="refined-iso-token" href="/Magix_ISO_9001_2015_Certificate.pdf" target="_blank" rel="noopener noreferrer" aria-label="View Magix ISO 9001:2015 certificate"><img src="/brand/magix-iso-emblem-transparent.png" alt="ISO 9001:2015 Certified"/></a>
    <div className="refined-karnataka-claim"><span>First Company in</span><strong>KARNATAKA</strong><span>in Housekeeping Field to get</span><mark>an ISO 9001:2015</mark><span>Certification</span></div>
   </div>
   <div className="refined-tiny-benefits" aria-label="Magix cleaning commitments">
    <div className="refined-tiny-benefit"><span className="refined-tiny-icon trust-green"><House size={26} strokeWidth={2.3}/></span><b>CLEANER<br/>HOMES</b></div>
    <div className="refined-tiny-benefit"><span className="refined-tiny-icon trust-pink"><ShieldCheck size={26} strokeWidth={2.3}/></span><b>HEALTHIER<br/>LIFESTYLE</b></div>
    <div className="refined-tiny-benefit"><span className="refined-tiny-icon trust-blue"><Leaf size={26} strokeWidth={2.3}/></span><b>SUSTAINABLE<br/>LIVING</b></div>
    <div className="refined-tiny-benefit"><span className="refined-tiny-icon trust-orange"><UsersRound size={26} strokeWidth={2.3}/></span><b>STRONGER<br/>COMMUNITIES</b></div>
   </div>
   <p className="refined-artwork-note">“First company” wording is from Magix promotional artwork and has not been independently verified. <a href="/Magix_ISO_9001_2015_Certificate.pdf" target="_blank" rel="noopener noreferrer">See supplied certificate</a>.</p>
  </div>
 </div>
 <div className="shell premium-hero-grid hero-slide broom-slide" hidden={active!==2} role="group" aria-roledescription="slide" aria-label="3 of 4: Our hero broom">
 <div className="premium-copy broom-copy"><span className="hero-eyebrow"><i/> OUR HERO PRODUCT</span><h2>Our hero:<br/><em>the broom stick.</em></h2><div className="usage-life"><strong>90+ Days</strong><span>indicative usage life*</span></div><p>A familiar tool for everyday sweeping, and one of the cleaning essentials at the heart of our range.</p><button type="button" className="button premium-primary" onClick={()=>setBroomOpen(true)}>Explore hero product <ArrowUpRight size={19}/></button><p className="usage-note"><strong>*Indicative only:</strong> Based on varying usage conditions and customer feedback. Actual lifespan depends on use and care; not a guaranteed minimum.</p></div>
 </div>

 <div className="shell premium-hero-grid hero-slide mop-slide" hidden={active!==3} role="group" aria-roledescription="slide" aria-label="4 of 4: Plastic Clip Mop Colour">
  <div className="premium-copy mop-copy"><span className="hero-eyebrow"><i/> AN EVERYDAY CLEANING HERO · ITEM 429</span><h2>Plastic Clip<br/><em>Mop Colour.</em></h2><div className="mop-life"><strong>Up to 70+ Days</strong><span>indicative usage life*</span></div><ul className="mop-highlights"><li>Heavy-duty 4 ft M.S. metal rod</li><li>Virgin plastic clip for a secure hold</li><li>Pure cotton refill for efficient cleaning</li></ul><Link href="/product/catalog-3-1-3" className="button premium-primary">Explore Plastic Clip Mop <ArrowUpRight size={19}/></Link><p className="usage-note">*Indicative only. Actual usage life depends on how and where the mop is used and cared for; not a guaranteed minimum.</p></div>
  {/* Keep the sunlit living-room background visible: no catalogue product cut-out or pasted photo card. */}
 </div>
 {broomOpen&&<HeroBroomDialog onClose={()=>setBroomOpen(false)}/>}
 <div className="shell slideshow-footer"><div className="slideshow-dots" role="group" aria-label="Choose banner slide"><button type="button" onClick={()=>go(0)} aria-label="Show logo slide" aria-current={active===0?'true':undefined}/><button type="button" onClick={()=>go(1)} aria-label="Show quality and ISO certificate slide" aria-current={active===1?'true':undefined}/><button type="button" onClick={()=>go(2)} aria-label="Show broom product slide" aria-current={active===2?'true':undefined}/><button type="button" onClick={()=>go(3)} aria-label="Show Plastic Clip Mop Colour slide" aria-current={active===3?'true':undefined}/></div><span className="slideshow-count">0{active+1} / 04</span><div className="slideshow-actions"><button type="button" onClick={()=>go(active-1)} aria-label="Previous banner slide"><ChevronLeft size={18}/></button><button type="button" onClick={()=>setPaused(!paused)} aria-label={paused?'Resume slideshow and logo animation':'Pause slideshow and logo animation'} aria-pressed={paused}>{paused?<Play size={15}/>:<Pause size={15}/>}</button><button type="button" onClick={()=>go(active+1)} aria-label="Next banner slide"><ChevronRight size={18}/></button></div></div>
 </section>
}
function ProductImage({src,alt}:{src:string;alt:string}){const [open,setOpen]=useState(false);const [play,setPlay]=useState(false);return <><button type="button" className="interactive-product-image" onClick={()=>{setOpen(true);setPlay(true)}} aria-label={'View '+alt+' image with motion'}><img src={src} alt={alt}/><span className="image-motion-hint">Tap to view <ArrowUpRight size={14}/></span></button>{open&&<div className="product-lightbox" role="dialog" aria-modal="true" aria-label={alt+' product image'} onClick={()=>setOpen(false)}><button type="button" className="lightbox-close" aria-label="Close product image" onClick={()=>setOpen(false)}><X size={26}/></button><div className="lightbox-panel" onClick={e=>e.stopPropagation()}><img className={play?'is-playing':''} src={src} alt={alt} onClick={()=>{setPlay(false);requestAnimationFrame(()=>setPlay(true))}}/><p>{alt}</p><span>Tap the image to replay the motion</span></div></div>}</>}


/* Additive brand milestones and certificate display. Existing site workflows remain unchanged. */
function MagixCustomerMilestone(){
 return <section className="magix-milestone" aria-labelledby="magix-customer-milestone-title"><div className="shell magix-milestone-inner"><div className="magix-milestone-figure"><span>ESTABLISHED IN 1991</span><strong>10M+</strong><small>HAPPY CUSTOMERS</small></div><div className="magix-milestone-message"><span className="kicker">A HUGE MILESTONE FOR MAGIX HOUSEHOLD PRODUCT</span><h2 id="magix-customer-milestone-title">10 Million+ Happy Customers! 🎉</h2><p>10 million happy customers, 10 million smiles, and millions of homes made cleaner with Magix products. ❤️</p><p>Thank you for your incredible trust, love, and support. You inspire us to keep making cleaning easier, smarter, and better every day. 🙏💫</p><Link className="magix-quality-teaser" href="/about#magix-certification">Explore our ISO 9001:2015 certification <ArrowUpRight size={16}/></Link></div></div></section>;
}
function MagixQualityCertificate(){
 return <section id="magix-certification" className="magix-certification" aria-labelledby="magix-certificate-title"><div className="magix-certification-info"><span className="kicker">MAGIX QUALITY MANAGEMENT</span><h2 id="magix-certificate-title">ISO 9001:2015 Certification</h2><p>The certificate provided for MAGIX HOUSE HOLD PRODUCT covers the trading and supply of household products including mops, toilet brushes, floor wipers and grass brooms.</p><div className="magix-certification-facts"><span><b>First certified</b>28 October 2026</span><span><b>Valid until</b>27 October 2029</span><span><b>Certificate number</b>E20261056100</span></div><a className="button button-dark magix-certificate-button" href="/Magix_ISO_9001_2015_Certificate.pdf" target="_blank" rel="noopener noreferrer">View supplied certificate (PDF) <ArrowUpRight size={18}/></a><p className="magix-certification-caption">Certificate details are presented as supplied; authenticity can be checked with the issuing certification body.</p></div><a href="/Magix_ISO_9001_2015_Certificate.pdf" target="_blank" rel="noopener noreferrer" className="magix-certification-preview" aria-label="Open full Magix ISO 9001:2015 certificate PDF"><img src="/brand/magix-iso-9001-certificate.png" loading="lazy" alt="MAGIX HOUSE HOLD PRODUCT ISO 9001:2015 certificate, with certification details"/></a></section>;
}

function BrochureCallout(){
 return <section className="catalogue-callout shell magix-brochure" aria-labelledby="magix-brochure-title">
  <div className="magix-brochure-copy">
   <div className="magix-brochure-eyebrow"><BookOpen size={16} strokeWidth={1.8}/><span>THE COMPLETE MAGIX COLLECTION</span></div>
   <h2 id="magix-brochure-title">Your next clean<br/>starts <em>right here.</em></h2>
   <p>Explore our complete range of mops, brooms, brushes, wipers and more. Every product, beautifully brought together in the official Magix brochure.</p>
   <div className="magix-brochure-actions">
    <a className="magix-brochure-download" href="/Magix_Product_Catalogue.pdf" download="Magix_Product_Catalogue.pdf"><Download size={21} strokeWidth={2.2}/><span><strong>Download brochure</strong><small>20-page PDF catalogue</small></span><ArrowUpRight className="magix-brochure-download-arrow" size={20}/></a>
    <a className="magix-brochure-preview" href="/Magix_Product_Catalogue.pdf" target="_blank" rel="noopener noreferrer">Preview PDF <ArrowUpRight size={18}/></a>
   </div>
   <div className="magix-brochure-features"><span><FileText size={15}/> Original Magix catalogue</span><span className="magix-brochure-dot" aria-hidden="true"/><span>20 pages of products</span></div>
  </div>
  <a className="magix-brochure-art" href="/Magix_Product_Catalogue.pdf" target="_blank" rel="noopener noreferrer" aria-label="Preview the Magix product brochure PDF">
   <span className="magix-brochure-art-halo" aria-hidden="true"/>
   <span className="magix-brochure-art-back"><img src="/brand/magix-brochure-inside.webp" alt="" loading="lazy"/></span>
   <span className="magix-brochure-art-front"><img src="/brand/magix-brochure-cover.webp" alt="Original Magix product catalogue cover" loading="lazy"/></span>
   <span className="magix-brochure-stamp"><span>OFFICIAL</span><strong>MAGIX</strong><small>BROCHURE</small></span>
  </a>
 </section>
}

function Home(){const {products,error}=useCatalog();const featured=featuredIds.map(id=>products.find(p=>p.id===id)).filter(Boolean) as Product[];const added=products.filter(p=>!originalProductIds.has(p.id));return <><HomeHero/><div className="value-strip"><div className="shell value-inner"><span>Made for daily life</span><i>✳</i><span>Built for every corner</span><i>✳</i><span>We mean clean</span></div></div><section id="collection" className="section shell"><div className="section-heading"><div><span className="kicker">01 / FIND YOUR CLEAN</span><h2>Everything you need,<br/><em>room by room.</em></h2></div><Link className="link-arrow" href="/products">Browse the full range <ArrowUpRight size={19}/></Link></div><div className="category-grid">{CATEGORIES.map((c,i)=>{const p=products.find(x=>x.category===c);const image=CATEGORY_IMAGES[c]||p?.image;return <Link className={`category-card category-${i}`} key={c} href={categoryUrl(c)}><div className="category-image">{image&&<img src={image} alt={c}/>}</div><div className="category-bottom"><span><small>0{i+1} / CATEGORY</small><strong>{c}</strong></span><span className="round-arrow"><ArrowUpRight size={20}/></span></div></Link>})}</div></section><section className="story-band"><div className="shell story-grid"><div><span className="kicker light-kicker">02 / THE MAGIX STORY</span><h2>Made for a<br/><em>better clean.</em></h2></div><div><p>For over three decades, Magix has made and supplied cleaning aids from Bengaluru. Our range covers the everyday essentials that make caring for your home easier.</p><Link href="/contact" className="button button-outline">Get in touch <ArrowUpRight size={18}/></Link></div></div></section><MagixCustomerMilestone/>{added.length>0&&<section className="section shell home-additions"><div className="section-heading"><div><span className="kicker">03 / ADDED TO THE RANGE</span><h2>New to Magix.</h2></div><Link className="link-arrow" href="/products">Explore all products <ArrowUpRight size={19}/></Link></div><ProductGrid products={added}/></section>}<section className="section shell"><div className="section-heading"><div><span className="kicker">{added.length>0?'04':'03'} / FROM THE CATALOGUE</span><h2>Everyday favorites.</h2></div><Link href="/products" className="link-arrow">See all {products.length} products <ArrowUpRight size={19}/></Link></div>{error&&<p role="status" className="notice">{error}</p>}<MovingFavorites products={featured}/></section><BrochureCallout/></>}
function Products({path}:{path:string}){const {products,error}=useCatalog();const [manageOpen,setManageOpen]=useState(false);const category=categoryFromPath(path);const [search,setSearch]=useState('');const shown=useMemo(()=>products.filter(p=>(category==='All products'||p.category===category)&&(p.name+' '+p.code).toLowerCase().includes(search.toLowerCase())),[products,category,search]);return <><section className="page-hero"><div className="shell"><div className="products-heading-row"><span className="kicker light-kicker">THE COMPLETE MAGIX RANGE</span><button type="button" className="manage-products-button" onClick={()=>setManageOpen(true)}><LockKeyhole size={15}/> Manage products</button></div>{manageOpen&&<AdminLoginDialog onClose={()=>setManageOpen(false)}/>}<h1>Find the right tool<br/>for <em>every clean.</em></h1><p>Explore the full product catalogue, from mops and brooms to all the little essentials.</p></div></section><LifestyleShowcase/><section className="shell catalog-section"><div className="catalog-toolbar"><div><span className="kicker">BROWSE PRODUCTS</span><h2>{category}</h2><p>{shown.length} {shown.length===1?'product':'products'} found</p></div><label className="search-box"><Search size={19}/><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product or item code" aria-label="Search products"/></label></div><div className="filter-list" aria-label="Product categories"><Link className={category==='All products'?'active':''} href="/products">All products</Link>{CATEGORIES.map(c=><Link key={c} className={category===c?'active':''} href={categoryUrl(c)}>{c}</Link>)}</div>{error&&<p className="notice" role="status">{error}</p>}{shown.length?<ProductGrid products={shown}/>:<div className="empty">No products match your search. Try another term or category.</div>}</section></>}
function ProductDetail({path}:{path:string}){const {products,error}=useCatalog();const id=path.split('/').filter(Boolean)[1]||'';const p=products.find(item=>item.id===id);if(!p)return <section className="shell detail-missing"><h1>Product not found.</h1><p>This product may no longer be available.</p><Link className="button button-dark" href="/products">Browse all products <ArrowRight size={18}/></Link></section>;const related=products.filter(item=>item.category===p.category&&item.id!==p.id).slice(0,4);return <><section className="shell detail-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/products">Products</Link><span>/</span><Link href={categoryUrl(p.category)}>{p.category}</Link><span>/</span><span>{p.name}</span></nav>{error&&<p role="status" className="notice">{error}</p>}<div className="detail-grid"><div className="detail-image">{p.image?<ProductImage src={p.image} alt={p.name}/>:<span className="photo-placeholder">Magix</span>}</div><div className="detail-copy"><span className="kicker">{p.category}</span><h1>{p.name}</h1>{p.code&&<p className="detail-code">Item code: <strong>{p.code}</strong></p>}<p className="detail-price">{p.price===null?'Contact for price':`₹${p.price.toLocaleString('en-IN')}`}</p><p>{p.description||'Part of the Magix Household Product catalogue. Get in touch for availability and ordering information.'}</p>{p.specifications&&<div className="product-specifications"><h2>Specifications</h2><p>{p.specifications}</p></div>}<div className="detail-actions"><Link className="button button-dark" href="/contact">Contact us about this product <ArrowUpRight size={18}/></Link><a className="button button-outline-dark" href="/Magix_Product_Catalogue.pdf" target="_blank" rel="noreferrer">View original catalogue <ArrowUpRight size={18}/></a></div><p className="detail-source">Shown in the supplied catalogue on page {p.page||'—'}.</p></div></div></section>{related.length>0&&<section className="shell related-section"><div className="section-heading"><div><span className="kicker">KEEP EXPLORING</span><h2>More in {p.category}.</h2></div><Link className="link-arrow" href={categoryUrl(p.category)}>View category <ArrowUpRight size={18}/></Link></div><ProductGrid products={related}/></section>}</>}
function About(){return <><section className="page-hero about-banner"><div className="shell"><span className="kicker light-kicker">OUR STORY · SINCE 1991</span><h1>Rooted in Bengaluru.<br/><em>Made for everyday cleaning.</em></h1><p>Over three decades of experience, a wide range of cleaning essentials, and a commitment to practical quality.</p></div></section><section className="section shell about-page"><div className="about-intro-grid"><div><span className="kicker">WHO WE ARE</span><h2>A familiar name in household cleaning.</h2></div><div><p>Magix is a Bengaluru-based household cleaning products brand with more than 32 years of experience in cleaning aids. Since the early 1990s, our work has grown across manufacturing, trading, sales and distribution of practical products for homes and businesses.</p><p>Our catalogue describes an established brand image supported by prompt service, periodic retailer visits and a dedicated sales and marketing team. We are proud of our Bengaluru roots and the relationships we have built with retailers over the years.</p><p>From a simple broom for sweeping your home to specialised brushes for hard-to-reach corners, Magix focuses on cleaning tools that make everyday work easier.</p></div></div><div className="about-stat-grid"><div><strong>32+</strong><span>Years of cleaning expertise</span></div><div><strong>1991</strong><span>Catalogue founding year</span></div><div><strong>7</strong><span>Major product categories</span></div></div><MagixQualityCertificate/><div className="about-feature-grid"><article><span className="kicker">WHAT WE OFFER</span><h2>One brand, many ways to clean.</h2><p>Our range includes cotton and microfiber mops, grass and kharata brooms, ceiling brooms, floor wipers, toilet brushes, and everyday essentials such as scrubbers, dust pans, sink brushes and cloths.</p><Link href="/products" className="button button-dark">See the collection <ArrowUpRight size={17}/></Link></article><div className="about-feature-visual"><img src="/hero-products.webp" alt="Magix cleaning range"/></div></div><div className="about-values"><article><h3>Designed for daily work</h3><p>Our products are designed with attention to convenience in cleaning floors, bathrooms, kitchens, utensils, windows and more.</p></article><article><h3>Quality-led approach</h3><p>We focus on usable, reliable designs with attention to the practical needs of our customers.</p></article><article><h3>Retailer relationships</h3><p>Our sales and distribution teams help connect the Magix range with retailers and customers.</p></article></div><div className="about-broom"><div><span className="kicker">FEATURED PRODUCT</span><h2>Our hero: the broom stick.</h2><p>A familiar tool for everyday sweeping, and one of the cleaning essentials at the heart of our range.</p><div className="broom-life"><strong>90+ Days</strong><span>indicative usage life*</span></div><p className="life-caveat">*Based on varying usage conditions and customer feedback. Actual lifespan depends on how the product is used and cared for; not a guaranteed minimum.</p></div><img src="/products/p07-1-2.webp" alt="Magix broom stick"/></div><div className="about-contact"><h2>Need the right tool for your space?</h2><p>Talk to the Magix team about products, availability and buying enquiries.</p><Link href="/contact" className="button button-dark">Contact us <ArrowUpRight size={18}/></Link></div></section></>}
function Contact(){return <><section className="page-hero contact-banner"><div className="shell"><span className="kicker light-kicker">LET&apos;S CONNECT</span><h1>We&apos;re here to<br/><em>help you clean.</em></h1><p>For product details and pricing, reach our Bengaluru team directly.</p></div></section><section className="shell contact-grid"><div className="contact-intro"><span className="kicker">MAGIX HOUSEHOLD PRODUCT</span><h2>Drop by or<br/><em>get in touch.</em></h2><p>We&apos;d be happy to help you find the right cleaning products for your needs.</p></div><div className="contact-details"><div><span className="detail-icon"><MapPin size={23}/></span><div><small>VISIT US</small><h3>Registered office</h3><p>#19, 9th Cross, Cubbonpet<br/>Bangalore – 560 002, India</p><a href="https://maps.app.goo.gl/uQkEFn1HjuWinPjZ7?g_st=iw" target="_blank" rel="noreferrer">Open map <ArrowUpRight size={16}/></a></div></div><div><span className="detail-icon"><Phone size={23}/></span><div><small>CALL US</small><a className="big-contact" href="tel:+919900844744">+91 99008 44744</a><a className="big-contact" href="tel:+918041262888">080-4126 2888</a></div></div><div><span className="detail-icon"><Mail size={23}/></span><div><small>EMAIL US</small><a className="big-contact" href="mailto:magixblr@yahoo.co.in">magixblr@yahoo.co.in</a></div></div><div><span className="detail-icon"><Instagram size={23}/></span><div><small>FOLLOW US ON INSTAGRAM</small><a className="big-contact magix-instagram" href="https://www.instagram.com/magixproducts?vrfl=MTdzNWZ5ODl6d2s3Yw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">@magixproducts <ArrowUpRight size={18}/></a></div></div></div></section><section className="qr-section"><div className="shell"><div className="section-heading"><div><span className="kicker">SCAN & CONNECT</span><h2>Find Magix instantly.</h2></div><p>Scan the QR codes from our product catalogue.</p></div><div className="qr-grid">{[['website','Website'],['catalogue','Product catalogue'],['location','Our location']].map(([key,title])=><div className={key==='location'?'qr-card magix-location-card':'qr-card'} key={key}><img src={`/qr/clean-${key}.png`} alt={`QR code: ${title}`}/><strong>{title}</strong><span>Scan to {key==='website'?'open the Magix website':key==='catalogue'?'view our product catalogue':'find us on the map'}</span>{key==='location'&&<a className="magix-location-open" href="https://maps.app.goo.gl/uQkEFn1HjuWinPjZ7?g_st=iw" target="_blank" rel="noopener noreferrer">Open location <ArrowUpRight size={16}/></a>}</div>)}</div><p className="qr-note">Website and product-catalogue QR codes are from the supplied printed catalogue. The location QR uses the newly supplied Magix location code.</p></div></section></>}
const blank:Product={id:'',name:'',category:CATEGORIES[0],code:'',price:null,image:'',active:1,description:'',specifications:''};
async function api(url:string,options?:RequestInit){const r=await fetch(url,{credentials:'same-origin',...options});const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed');return d}
function AdminLogin({onSuccess,onClose}:{onSuccess:()=>void|Promise<void>;onClose?:()=>void}){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function login(e:React.FormEvent){
    e.preventDefault();setBusy(true);setError('');
    try{await api('/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})});setPassword('');await onSuccess()}
    catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  return <div className="admin-login-panel">
    {onClose&&<button type="button" className="login-close" aria-label="Close admin login" onClick={onClose}><X size={20}/></button>}
    <span className="login-lock"><LockKeyhole size={23}/></span>
    <span className="kicker">PRIVATE ACCESS</span><h2 id="admin-login-title">Manage products</h2>
    <p>Sign in to add, edit, publish or hide products on this website.</p>
    <form onSubmit={login} className="admin-login-form">
      <label>Username<input autoFocus autoComplete="username" name="username" maxLength={80} value={username} onChange={e=>setUsername(e.target.value)} required/></label>
      <label>Password<input type="password" autoComplete="current-password" name="password" maxLength={200} value={password} onChange={e=>setPassword(e.target.value)} required/></label>
      {error&&<p className="form-message error" role="alert">{error}</p>}
      <button className="button button-dark" disabled={busy}>{busy?'Signing in…':'Sign in'} <ArrowRight size={18}/></button>
    </form>
  </div>;
}
function AdminLoginDialog({onClose}:{onClose:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);
  const router=useRouter();
  useEffect(()=>{const dialog=ref.current;dialog?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog?.close();document.body.style.overflow=previous}},[]);
  return <dialog ref={ref} className="admin-login-dialog" aria-labelledby="admin-login-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><AdminLogin onClose={onClose} onSuccess={()=>{router.push('/admin')}}/></dialog>;
}
async function optimizeImage(file:File):Promise<File>{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5_000_000)throw Error('Use a JPG, PNG or WebP under 5 MB.');
  const img=await createImageBitmap(file);
  try{
    const scale=Math.min(1,1400/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
    const context=canvas.getContext('2d');if(!context)throw Error('Image processing unavailable.');
    context.drawImage(img,0,0,canvas.width,canvas.height);
    for(const quality of [.85,.72,.58,.44]){
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',quality));
      if(blob&&blob.size<=900_000)return new File([blob],'product.webp',{type:'image/webp'});
    }
    throw Error('Image is too complex to optimize below 900 KB. Please use a smaller image.');
  } finally {img.close()}
}
function Admin(){
  const [authorized,setAuthorized]=useState<boolean|null>(null);
  const [items,setItems]=useState<Product[]>([]);
  const [catalogSha,setCatalogSha]=useState<string|null>(null);
  const [drafts,setDrafts]=useState<Record<string,Product>>({});
  const [uploads,setUploads]=useState<Record<string,File>>({});
  const [form,setForm]=useState<Product>(blank);
  const [file,setFile]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState(false);
  const [applied,setApplied]=useState(false);
  const [filter,setFilter]=useState('');
  const [previewOpen,setPreviewOpen]=useState(false);
  const [previewImages,setPreviewImages]=useState<Record<string,string>>({});
  const pending=Object.keys(drafts).length;
  const rows=useMemo(()=>{
    const merged=new Map(items.map(p=>[p.id,p]));
    Object.values(drafts).forEach(p=>merged.set(p.id,p));
    return [...merged.values()];
  },[items,drafts]);
  async function refresh(){const d=await api('/api/admin/products');setItems(d.products);setCatalogSha(d.sha??null)}
  useEffect(()=>{api('/api/admin/session').then(d=>{setAuthorized(d.authenticated);if(d.authenticated)refresh().catch(()=>{setAuthorized(false);setMessage('Unable to access catalogue storage. Check server configuration.')})}).catch(()=>setAuthorized(false))},[]);
  useEffect(()=>{
    if(!pending)return;
    const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};
    window.addEventListener('beforeunload',warn);
    return()=>window.removeEventListener('beforeunload',warn);
  },[pending]);
  function stage(e:React.FormEvent){
    e.preventDefault();
    if(file&&(file.size>5000000||!['image/jpeg','image/png','image/webp'].includes(file.type))){setMessage('Use a JPG, PNG or WebP under 5 MB.');setError(true);return}
    const item={...form,id:form.id||crypto.randomUUID()};
    setDrafts(current=>({...current,[item.id]:item}));
    if(file){setUploads(current=>({...current,[item.id]:file}));const reader=new FileReader();reader.onload=()=>setPreviewImages(current=>({...current,[item.id]:String(reader.result)}));reader.readAsDataURL(file)}
    setForm(blank);setFile(null);setApplied(false);setError(false);
    setMessage('Change staged. Preview it, then click Apply changes to publish.');
  }
  function toggle(p:Product){
    if(!items.some(item=>item.id===p.id)&&p.active){
      setDrafts(current=>{const next={...current};delete next[p.id];return next});
      setUploads(current=>{const next={...current};delete next[p.id];return next});
      setPreviewImages(current=>{const next={...current};delete next[p.id];return next});
      setMessage('Unpublished product removed from pending changes.');
    }else{
      setDrafts(current=>({...current,[p.id]:{...p,active:p.active?0:1}}));
      setMessage(p.active?'Product staged to hide. Click Apply changes.':'Product staged to restore. Click Apply changes.');
    }
    setError(false);setApplied(false);
  }
  async function apply(){
    if(!pending)return;
    setBusy(true);setMessage('');setError(false);
    try{
      const products:Product[]=[];
      for(const p of Object.values(drafts)){
        const upload=uploads[p.id];
        if(!upload){products.push(p);continue}
        const fd=new FormData();fd.append('file',await optimizeImage(upload));
        const result=await api('/api/admin/upload',{method:'POST',body:fd});
        setDrafts(current=>({...current,[p.id]:{...current[p.id],image:result.image}}));
        setUploads(current=>{const next={...current};delete next[p.id];return next});
        products.push({...p,image:result.image});
      }
      const result=await api('/api/admin/apply',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({products,baseSha:catalogSha})});
      setDrafts({});setUploads({});setPreviewImages({});setApplied(true);
      try{await refresh()}catch{setMessage('Changes published, but refreshing the admin list failed. Reload this page to verify.');return}
      setMessage(`${result.applied} ${result.applied===1?'change':'changes'} published. Open the website to review the live catalogue.`);
    }catch(e){setMessage((e as Error).message);setError(true)}
    finally{setBusy(false)}
  }
  async function refreshPublished(){
    try{await refresh();setMessage('Published catalogue refreshed. Review your staged changes before applying again.');setError(false)}
    catch(e){setMessage((e as Error).message);setError(true)}
  }
  async function logout(){
    try{await api('/api/admin/logout',{method:'POST'});setAuthorized(false);setDrafts({});setUploads({});setPreviewImages({})}
    catch(e){setMessage((e as Error).message);setError(true)}
  }
  if(authorized===null)return <section className="shell admin-wrap"><p>Checking access…</p></section>;
  if(!authorized)return <section className="shell admin-wrap login-wrap"><AdminLogin onSuccess={async()=>{setAuthorized(true);await refresh()}}/></section>;
  return <section className="shell admin-wrap">
    <div className="admin-heading"><div><span className="kicker">MAGIX PRODUCT MANAGEMENT</span><h1>Manage catalogue</h1><p>Add, edit, hide or restore products. Changes appear publicly only when you click Apply changes.</p></div><button className="text-button" onClick={logout}><LogOut size={17}/> Sign out</button></div>
    <div className="publish-bar" aria-live="polite"><div><strong>{pending? `${pending} pending ${pending===1?'change':'changes'}`:'All changes applied'}</strong><span>{pending?'The public website still shows the published catalogue.':'Your catalogue is up to date.'}</span></div><button type="button" className="button button-open" onClick={refreshPublished} disabled={!pending||busy}>Refresh published</button><button type="button" className="button button-open" onClick={()=>setPreviewOpen(!previewOpen)} disabled={!pending}>{previewOpen?'Close preview':'Preview changes'}</button><button type="button" className="button button-dark" onClick={apply} disabled={!pending||busy}>{busy?'Applying…':'Apply changes'} <ArrowRight size={17}/></button>{applied&&<Link className="button button-open" href="/" target="_blank" rel="noreferrer">Open website <ArrowUpRight size={17}/></Link>}</div>
    <form className="editor-card" onSubmit={stage}><div className="editor-title"><h2>{form.id?'Edit product':'Add a product'}</h2>{form.id&&<button type="button" onClick={()=>{setForm(blank);setFile(null)}}>Cancel edit</button>}</div><div className="editor-fields"><label>Product name<input required maxLength={120} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label><label>Item code<input maxLength={40} value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/></label><label>Price in ₹ <small>(leave blank to show “Contact for price”)</small><input type="number" min="0" max="10000000" step="1" value={form.price??''} onChange={e=>setForm({...form,price:e.target.value===''?null:Number(e.target.value)})}/></label><label>Description<textarea maxLength={2000} rows={4} value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe this product"/></label><label>Specifications<textarea maxLength={2000} rows={4} value={form.specifications||''} onChange={e=>setForm({...form,specifications:e.target.value})} placeholder="Materials, dimensions or other details"/></label><label className="file-label"><Upload size={20}/> Product image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>{file?.name||'JPG, PNG or WebP up to 5 MB'}</small></label>{form.image&&<img className="edit-preview" src={form.image} alt="Current product"/>}</div><button className="button button-dark" disabled={busy}>{form.id?'Stage changes':'Stage product'} <Save size={17}/></button></form>
    {previewOpen&&pending>0&&<section className="staged-preview" aria-label="Preview staged changes"><h2>Preview staged changes</h2><p>Only you can see these changes until Apply changes succeeds.</p><div className="preview-grid">{Object.values(drafts).map(p=><article className="preview-item" key={p.id}>{(previewImages[p.id]||p.image)&&<img src={previewImages[p.id]||p.image} alt={p.name}/>}<div><strong>{p.name}</strong><span>{p.category} · {p.active?'Visible':'Hidden'} · {p.price===null?'Contact for price':`₹${p.price.toLocaleString('en-IN')}`}</span>{p.description&&<p>{p.description}</p>}{p.specifications&&<p><b>Specifications:</b> {p.specifications}</p>}</div></article>)}</div></section>}
    {message&&<p role={error?'alert':'status'} className={`form-message ${error?'error':''}`}>{message}</p>}
    <div className="admin-list-head"><h2>Products <span>({rows.length})</span></h2><label className="search-box"><Search size={18}/><input placeholder="Find a product" value={filter} onChange={e=>setFilter(e.target.value)}/></label></div>
    <div className="admin-list">{rows.filter(p=>(p.name+' '+p.code).toLowerCase().includes(filter.toLowerCase())).map(p=><div key={p.id} className={`admin-row ${p.active?'':'archived'}`}><img src={p.image||'/hero-products.webp'} alt=""/><div><strong>{p.name} {drafts[p.id]&&<span className="pending-tag">Pending{uploads[p.id]?' image':''}</span>}</strong><small>{p.category} · {p.code||'No code'} · {p.price===null?'Contact for price':`₹${p.price}`}{!p.active?' · Hidden':''}</small></div><button type="button" onClick={()=>{setForm(p);setFile(uploads[p.id]||null);window.scrollTo({top:0,behavior:'smooth'})}}>Edit</button><button type="button" className="archive-button" onClick={()=>toggle(p)}>{p.active?'Hide':'Restore'}</button></div>)}</div>
  </section>;
}
export default function MagixSite({path,initialProducts,warning}:{path:string;initialProducts:Product[];warning?:string}){return <CatalogContext.Provider value={{products:initialProducts,warning}}><Header path={path}/><main>{path.startsWith('/products')?<Products path={path}/>:path.startsWith('/product/')?<ProductDetail path={path}/>:path.startsWith('/about')?<About/>:path.startsWith('/contact')?<Contact/>:path.startsWith('/admin')?<Admin/>:<Home/>}</main><Footer/></CatalogContext.Provider>}

