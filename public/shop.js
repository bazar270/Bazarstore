'use strict';
let catalog=[];
const copy={
 en:{"brand": "Bazar", "lang": "English", "bag": "Cart", "headline": "All your favourites in one place", "intro": "From fashion to home essentials.", "shop": "Shop categories", "title": "Explore products", "search": "Search products", "cats": ["All", "Accessories", "Men\u2019s clothing", "Women\u2019s clothing", "Children\u2019s clothing", "Fragrances", "Watches", "Kitchenware", "Phone accessories", "Gifts", "Sporting goods"], "foot": "Preview store \u00b7 Sample products and prices. Orders are for demonstration.", "bagTitle": "Shopping cart", "close": "Close", "empty": "Your cart is empty.", "total": "Subtotal", "payment": "Payment method", "cash": "Cash on delivery", "card": "Pay by card", "cashHint": "Try a demo order. No delivery will be arranged.", "cardHint": "Card payment preview. Please do not enter payment details.", "cashConfirm": "Confirm demo order", "cardConfirm": "Preview card payment", "cashDone": "Demo order complete. No delivery was requested.", "cardDone": "Card payment preview complete. Nothing was charged.", "unit": "IQD", "add": "Add to cart", "added": "Added to cart", "plus": "Increase quantity", "minus": "Decrease quantity", "none": "No matching products found.", "results": "Products"},
 ar:{brand:'بازار',lang:'کوردی',bag:'السلة',headline:'كل اختياراتك بمكان واحد',intro:'من أزياء العائلة إلى تفاصيل البيت.',shop:'تسوّق الأقسام',title:'اكتشف المنتجات',search:'ابحث عن منتج',cats:['الكل','إكسسوارات','ملابس رجالية','ملابس نسائية','ملابس أطفال','عطور','ساعات','أدوات المطبخ','إكسسوارات الموبايل','هدايا','مستلزمات رياضية'],foot:'نسخة للمعاينة · المنتجات والأسعار توضيحية والطلبات تجريبية.',bagTitle:'سلّة المشتريات',close:'إغلاق',empty:'سلّتك فارغة.',total:'مجموع المنتجات',payment:'طريقة الدفع',cash:'الدفع عند الاستلام',card:'الدفع بالكارت',cashHint:'جرّب تأكيد الطلب عند الاستلام. هذه المعاينة لا ترسل طلب توصيل.',cardHint:'معاينة فقط. الدفع الفعلي بالكارت يحتاج ربط بوابة دفع. لا تُدخل بيانات بطاقتك.',cashConfirm:'تأكيد الطلب التجريبي',cardConfirm:'معاينة الدفع بالكارت',cashDone:'اكتملت تجربة الطلب عند الاستلام. لم يُرسل طلب توصيل.',cardDone:'اكتملت المعاينة. عند ربط بوابة الدفع ستنتقل إلى صفحتها لإكمال العملية. لم يُخصم أي مبلغ.',unit:'د.ع',add:'أضف للسلة',added:'أُضيف إلى السلة',plus:'زيادة',minus:'تقليل',none:'ما لقينا منتج يطابق بحثك.',results:'عدد المنتجات'},
 ckb:{brand:'بازاڕ',lang:'العربية',bag:'سەبەتە',headline:'هەموو هەڵبژاردەکانت لە یەک شوێن',intro:'لە جل‌وبەرگی خێزانەوە تا پێداویستییەکانی ماڵ.',shop:'بەشەکان ببینە',title:'بەرهەمەکان ببینە',search:'بەدوای بەرهەمێکدا بگەڕێ',cats:['هەموو','ئێکسسوارات','جل‌وبەرگی پیاوان','جل‌وبەرگی ژنان','جل‌وبەرگی منداڵان','بۆن','کاتژمێر','کەلوپەلی چێشتخانە','ئێکسسواراتی مۆبایل','دیاری','کەلوپەلی وەرزشی'],foot:'وەشانی تاقیکردنەوە · بەرهەم و نرخەکان بۆ نموونەن و داواکارییەکان تاقیکاریین.',bagTitle:'سەبەتەی کڕین',close:'داخستن',empty:'سەبەتەکەت بەتاڵە.',total:'کۆی نرخی بەرهەمەکان',payment:'شێوازی پارەدان',cash:'پارەدان لە کاتی وەرگرتن',card:'پارەدان بە کارت',cashHint:'داواکارییەکی تاقیکاری پشتڕاست بکەرەوە. هیچ داواکارییەک بۆ گەیاندن نانێردرێت.',cardHint:'تەنها بۆ تاقیکردنەوەیە. پارەدان بە کارت پێویستی بە دەروازەی پارەدان هەیە. زانیارییەکانی کارت مەنووسە.',cashConfirm:'پشتڕاستکردنەوەی داواکاریی تاقیکاری',cardConfirm:'تاقیکردنەوەی پارەدان بە کارت',cashDone:'تاقیکردنەوەکە تەواو بوو. هیچ داواکارییەک بۆ گەیاندن نەنێردرا.',cardDone:'تاقیکردنەوەکە تەواو بوو. دوای بەستنەوەی دەروازەی پارەدان، بۆ پارەدان دەچیتە پەڕەکەی. هیچ بڕە پارەیەک وەرنەگیرا.',unit:'دینار',add:'بخەرە سەبەتە',added:'خرایە سەبەتەوە',plus:'زیادکردن',minus:'کەمکردنەوە',none:'هیچ بەرهەمێک نەدۆزرایەوە.',results:'ژمارەی بەرهەمەکان'}
};
const $=id=>document.getElementById(id);
function read(key){try{return localStorage.getItem(key)}catch{return null}}
function save(key,value){try{localStorage.setItem(key,value)}catch{}}
let language=['en','ckb'].includes(read('bazaar.language'))?read('bazaar.language'):'ar', category=0;
let saved;try{saved=JSON.parse(read('bazaar.cart'))}catch{}
let amounts=[];
function persistCart(){save('bazaar.cart',JSON.stringify(Object.fromEntries(catalog.map((p,i)=>[p[5],amounts[i]]))))}
const t=()=>copy[language],name=p=>language==='en'?(p[7]||p[1]):p[language==='ar'?1:2],number=v=>v.toLocaleString(language==='en'?'en-IQ':language==='ar'?'ar-IQ':'ar-IQ-u-nu-arabext'),price=v=>number(v)+' '+t().unit;
function node(tag,txt,cls){const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n}
function button(label,action,accessible){const b=node('button',label);b.onclick=action;if(accessible)b.setAttribute('aria-label',accessible);return b}
function updateBag(){const badge=$('bagCount');if(badge)badge.textContent=number(amounts.reduce((a,b)=>a+b,0))}
function adjust(i,d){amounts[i]=Math.max(0,Math.min(99,catalog[i][8]??99,amounts[i]+d));persistCart();updateBag()}
function normalize(s){return s.toLowerCase().replace(/[َ-ِّْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ك/g,'ک').replace(/ي/g,'ی').trim()}
function productCard(i){
 const p=catalog[i];
 const card=node('article',undefined,'tile'),img=node('img');img.src=p[4];img.alt=name(p);img.loading='lazy';
 const tail=node('div',undefined,'tail'),add=button('+',()=>{adjust(i,1);$('status').textContent=name(p)+' · '+t().added},t().add+' '+name(p));add.disabled=p[8]===0;
 if(add.disabled){add.textContent={ckb:'نەماوە',ar:'نفد',en:'Sold out'}[language];add.style.width='auto'}
 const photo=node('div',undefined,'product-photo');
 add.className='product-add';
 if(!add.disabled)add.textContent='🛒';
 photo.append(img,add);
 const cardPrice=value=>{
  const amount=node('bdi',value.toLocaleString('en-US'));
  const unit=node('span',language==='en'?'IQD':'د.ع');
  const money=node('span',undefined,'card-money');money.append(amount,unit);return money;
 };
 const standard=node('strong',undefined,'standard-price');
 standard.append(cardPrice(p[9]>p[3]?p[9]:p[3]));tail.append(standard);
 if(p[9]>p[3]){
  const offer=node('div',undefined,'offer-price');
  offer.append(node('span',{ckb:'بیکڕە بە',ar:'اشتري بـ',en:'Buy for'}[language]),cardPrice(p[3]));
  tail.append(offer);
 }
 const heart=button(likes.has(p[5])?'♥':'♡',()=>{if(likes.has(p[5]))likes.delete(p[5]);else likes.add(p[5]);save('bazaar.likes',JSON.stringify([...likes]));products();drawFeed();profile()},ui().favorites+' · '+name(p));heart.className='heart';heart.setAttribute('aria-pressed',String(likes.has(p[5])));
 card.append(photo,heart,node('small',t().cats[p[0]]),node('h3',name(p)),tail);if(p[6])card.append(node('small',p[6]));const measures=measurementText(p[10],language);if(measures)card.append(node('small',measures,'product-measurements'));return card
}
function products(){
 const grid=$('grid');grid.replaceChildren();
 (photoOrder||catalog.map((_,i)=>i)).forEach(i=>{const p=catalog[i];if((onlyFavorites&&!likes.has(p[5]))||(category&&category!==p[0])||!normalize((p[7]||'')+' '+p[1]+' '+p[2]+' '+t().cats[p[0]]).includes(normalize($('search').value)))return;
 grid.append(productCard(i))});
 $('status').textContent=grid.children.length?t().results+' · '+number(grid.children.length):t().none
}
const orderText={
 en:['Full name','Mobile number','Street address or nearest landmark','Place order · Cash on delivery','The store will contact you to confirm availability and delivery.','Order received. Your reference','Enter a valid Iraqi mobile number.','Could not confirm the order. Try again.','The catalogue changed. Refresh before ordering.','Orders','Latest order','No orders on this device.'],
 ar:['الاسم الكامل','رقم الموبايل','عنوان التوصيل أو أقرب نقطة دالة','إرسال الطلب · الدفع عند الاستلام','سيتواصل المتجر معك لتأكيد التوفّر والتوصيل.','استلمنا طلبك. رقم الطلب','أدخل رقم موبايل عراقي صحيحاً.','تعذّر تأكيد الطلب. حاول مجدداً.','تغيّر الكتالوج. حدّث الصفحة قبل الطلب.','طلباتي','آخر طلب','لا توجد طلبات على هذا الجهاز.'],
 ckb:['ناوی تەواو','ژمارەی مۆبایل','ناونیشانی گەیاندن یان نزیکترین نیشانە','ناردنی داواکاری · پارەدان لە کاتی وەرگرتن','فرۆشگا بۆ پشتڕاستکردنەوەی بەردەستبوونی کاڵا و گەیاندن پەیوەندیت پێوە دەکات.','داواکارییەکەت وەرگیرا. ژمارەی داواکاری','ژمارەیەکی دروستی مۆبایلی عێراقی بنووسە.','داواکارییەکە پشتڕاست نەکرایەوە. دووبارە هەوڵ بدەوە.','کاڵا یان نرخەکە گۆڕاوە. پەڕەکە نوێ بکەرەوە.','داواکارییەکانم','دوا داواکاری','لەسەر ئەم ئامێرە داواکاری نییە.']
};
const locationText={
 ckb:['پارێزگا','پارێزگاکەت هەڵبژێرە','شار یان شارۆچکە','ناوی شار یان شارۆچکەکەت بنووسە.'],
 ar:['المحافظة','اختر المحافظة','المدينة أو البلدة','أدخل اسم المدينة أو البلدة.'],
 en:['Governorate','Choose a governorate','City or town','Enter your city or town name.']
};
function refreshMethod(){
 const card=document.querySelector('[name=method]:checked').value==='card',w=orderText[language];
 ['customerLabel','phoneLabel','addressLabel'].forEach((id,i)=>$(id).textContent=w[i]);
 const loc=locationText[language],region=$('region'),selected=region.value;
 $('regionLabel').textContent=loc[0];$('cityLabel').textContent=loc[2];$('phone').placeholder='07XX XXX XXXX';
 region.replaceChildren(new Option(loc[1],''),...iraqRegions.map(row=>new Option(regionLabel(row,language),row[0])));region.value=selected;
 $('deliveryFields').hidden=card;$('hint').textContent=card?t().cardHint:w[4];$('confirm').textContent=card?t().cardConfirm:w[3];$('receipt').textContent=''
}
const deliveryFee=5000;
const deliveryLabels={
 ckb:['لە هەر شوێنێکی عێراق بیت، داواکارییەکەت پێت دەگات','کرێی گەیاندن','کۆی گشتی'],
 ar:['طلبك يوصلك وين ما تكون بالعراق','أجرة التوصيل','المجموع الكلي'],
 en:['Your order, delivered wherever you are in Iraq','Delivery fee','Order total']
};
function renderCart(){
 $('lines').replaceChildren();catalog.forEach((p,i)=>{if(!amounts[i])return;const row=node('div',undefined,'line'),desc=node('div'),controls=node('div');desc.append(node('strong',name(p)),node('small',number(amounts[i])+' × '+price(p[3])));for(const d of [-1,1]){const b=button(d===1?'+':'−',()=>{adjust(i,d);renderCart()},t()[d===1?'plus':'minus']+' '+name(p));b.disabled=d===1&&amounts[i]>=Math.min(99,p[8]??99);controls.append(b)}row.append(desc,controls);$('lines').append(row)});
 const empty=!amounts.some(Boolean);$('checkout').hidden=empty;if(empty)$('lines').textContent=t().empty;
 const subtotal=catalog.reduce((sum,p,i)=>sum+p[3]*amounts[i],0);
 const fee=empty?0:deliveryFee;
 $('subtotal').textContent=t().total+' · '+price(subtotal);
 $('shipping').textContent=deliveryLabels[language][1]+' · '+price(fee);
 $('total').textContent=deliveryLabels[language][2]+' · '+price(subtotal+fee);refreshMethod()
}
function show(){
 $('languageCaption').textContent={ckb:'زمان هەڵبژێرە',ar:'اختر اللغة',en:'Choose language'}[language];
 if(document.documentElement.lang!==language)document.documentElement.lang=language;document.documentElement.dir=language==='en'?'ltr':'rtl';$('lang').value=language;document.title=t().brand;$('brandName').textContent=t().brand;
 const manifest='/app'+(language==='ar'?'':'-'+language)+'.webmanifest';
 const link=document.querySelector('link[rel=manifest]');if(link.getAttribute('href')!==manifest)link.href=manifest;$('manage').textContent=ui().manage;
 $('headerAdmin').textContent={ckb:'بەڕێوەبردنی بازاڕ',ar:'إدارة المتجر',en:'Manage store'}[language];
 $('headerAdmin').hidden=$('manage').hidden;
 for(const id of ['foot','bagTitle','payment','cash','card'])$(id).textContent=t()[id];
 $('search').placeholder=t().search;$('search').setAttribute('aria-label',t().search);
 $('close').setAttribute('aria-label',t().close);$('drawer').setAttribute('aria-labelledby','bagTitle');
 drawLayout();updateBag();products();renderCart()
}
$('lang').onchange=()=>{language=$('lang').value;save('bazaar.language',language);show()};
$('close').onclick=()=>$('drawer').close();
document.querySelectorAll('[name=method]').forEach(r=>r.onchange=refreshMethod);
$('confirm').onclick=async()=>{
 if(!amounts.some(Boolean)||$('confirm').disabled)return;
 const w=orderText[language];if(document.querySelector('[name=method]:checked').value==='card'){$('receipt').textContent=t().cardDone;return}
 for(const key of ['customer','phone','region','city','address'])if(!$(key).reportValidity())return;
 const phone=iraqiMobile($('phone').value);
 if(!phone){$('receipt').textContent=w[6];$('phone').focus();return}
 if(!validCity($('city').value)){$('receipt').textContent=locationText[language][3];$('city').focus();return}
 const items=catalog.flatMap((p,i)=>amounts[i]?[{id:p[5],qty:amounts[i],price:p[3]}]:[]);
 const payload={region:$('region').value,city:$('city').value.trim(),customer:$('customer').value.trim(),address:$('address').value.trim(),phone,items};
 $('confirm').disabled=true;$('receipt').textContent='…';
 try{
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload)));
  const sig=Array.from(new Uint8Array(digest)).join('-');
  const previous=JSON.parse(read('bazaar.pendingOrder')||'null');
  const id=previous?.sig===sig?previous.id:crypto.randomUUID();save('bazaar.pendingOrder',JSON.stringify({sig,id}));
  const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,id})});
  if(!r.ok)throw Error(r.status===409?w[8]:w[7]);const result=await r.json();
  save('bazaar.pendingOrder','null');save('bazaar.orderRef',result.code);amounts.fill(0);persistCart();profile();updateBag();renderCart();$('lines').textContent='';
  for(const key of ['customer','phone','region','city','address'])$(key).value='';$('receipt').textContent=w[5]+' · '+result.code
 }catch(err){$('receipt').textContent=err.message===w[8]?w[8]:w[7]}finally{$('confirm').disabled=false}
};
let catalogTag;
let refreshingCatalog=false;
async function loadCatalog(){
 if(refreshingCatalog||document.hidden)return;
 refreshingCatalog=true;
 try{
  const response=await fetch('/api/catalog',{cache:'no-store'});if(!response.ok)throw Error();
  const data=await response.json();
  if(catalogTag===data.tag && $('manage').hidden===!data.manager)return;
  if(catalogTag!==undefined){
   saved=Object.fromEntries(catalog.map((p,i)=>[p[5],amounts[i]]));
   photoOrder=null;
  }
  catalogTag=data.tag;
  catalog=data.products.map(p=>[p.category,p.ar,p.ckb||p.ar,p.price,p.image,p.id,p.details||'',p.en||'',p.stock,p.regularPrice,p.measurements]);
  amounts=catalog.map(p=>Number.isInteger(saved?.[p[5]])&&saved[p[5]]>=0&&saved[p[5]]<=99?saved[p[5]]:0);
  $('manage').hidden=!data.manager;show();showHints()
 }catch{if(catalogTag===undefined)$('status').textContent=language==='en'?'Could not load products. Refresh to try again.':language==='ar'?'تعذّر تحميل المنتجات. حدّث الصفحة للمحاولة مجدداً.':'بەرهەمەکان بار نەکران. پەڕەکە نوێ بکەرەوە.'}finally{refreshingCatalog=false}
}
const labels={
 en:{"home": "Home", "sections": "Categories", "help": "Contact", "account": "Account", "feature": "Complete your look", "style": "Shop your style", "from": "From", "favorites": "Favourites", "settings": "Change language", "orders": "My demo orders", "noOrders": "No demo orders on this device.", "last": "Latest demo order", "manage": "Manage products", "photo": "Search by photo", "explain": "Choose a photo to sort products by colour similarity. Your photo stays on your device.", "album": "Choose a photo", "failed": "Could not read that photo. Try another image.", "busy": "Comparing colours\u2026", "match": "Closest colours", "faq": [["How do I add an item to my cart?", "Open a category and select + next to the price."], ["How do I save a product?", "Tap the heart on a product, then open Favourites in Account."], ["Will my order be delivered?", "Checkout is a demonstration in this version."]]},
 ar:{home:'الرئيسية',sections:'الأقسام',help:'تواصل معنا',account:'حسابي',feature:'أكملي إطلالتك',style:'تسوّق حسب ذوقك',from:'من',favorites:'قائمة المفضلة',settings:'تغيير اللغة',orders:'طلباتي التجريبية',noOrders:'لا توجد طلبات تجريبية على هذا الجهاز.',last:'آخر طلب تجريبي',manage:'إدارة المنتجات',photo:'البحث بصورة',explain:'اختر صورة من جهازك لترتيب المنتجات حسب أقرب الألوان. تبقى الصورة على جهازك.',album:'اختر صورة',failed:'تعذّرت قراءة الصورة. جرّب صورة أخرى.',busy:'جارٍ مقارنة الألوان…',match:'الأقرب بالألوان',faq:[['كيف أضيف منتجاً إلى سلّتي؟','اختر القسم واضغط + بجانب سعر المنتج.'],['كيف أحتفظ بمنتج؟','اضغط القلب على المنتج. ستجده في المفضلة من صفحة حسابي.'],['هل يُرسل الطلب للتوصيل؟','تأكيد الطلب في هذه النسخة تجريبي.']]},
 ckb:{home:'سەرەکی',sections:'بەشەکان',help:'پەیوەندی',account:'هەژمارەکەم',feature:'ستایلەکەت تەواو بکە',style:'بە پێی سەلیقەی خۆت هەڵبژێرە',from:'لە',favorites:'لیستی دڵخوازەکان',settings:'گۆڕینی زمان',orders:'داواکارییە تاقیکارییەکانم',noOrders:'لەسەر ئەم ئامێرە هیچ داواکارییەکی تاقیکاری نییە.',last:'دوا داواکاریی تاقیکاری',manage:'بەڕێوەبردنی بەرهەمەکان',photo:'گەڕان بە وێنە',explain:'وێنەیەک هەڵبژێرە بۆ ڕیزکردنی بەرهەمەکان بە پێی نزیکترین ڕەنگ. وێنەکە لە ئامێرەکەت دەمێنێتەوە.',album:'هەڵبژاردنی وێنە',failed:'وێنەکە نەخوێندرایەوە. وێنەیەکی تر هەڵبژێرە.',busy:'ڕەنگەکان بەراورد دەکرێن…',match:'نزیکترین ڕەنگەکان',faq:[['چۆن بەرهەمێک بخەمە سەبەتە؟','بەشەکە هەڵبژێرە و لە تەنیشت نرخەکە + دابگرە.'],['چۆن بەرهەمێک بۆ دواتر هەڵبگرم؟','دڵەکەی سەر بەرهەمەکە دابگرە. لە هەژمارەکەم لیستی دڵخوازەکان ببینە.'],['داواکارییەکەم بۆ گەیاندن دەنێردرێت؟','لە ئەم وەشانەدا پشتڕاستکردنەوەی داواکاری تاقیکارییە.']]}
};
copy.ar.foot='الأسعار بالدينار العراقي · الدفع عند الاستلام';
copy.ckb.foot='نرخەکان بە دیناری عێراقین · پارەدان لە کاتی وەرگرتن';
copy.en.foot='Prices in Iraqi dinars · Cash on delivery';
labels.ar.faq[2][1]='أرسل طلبك بالدفع عند الاستلام وسيتواصل المتجر لتأكيد التوصيل.';
labels.ckb.faq[2][1]='داواکارییەکەت بنێرە، فرۆشگا بۆ پشتڕاستکردنەوەی گەیاندن پەیوەندیت پێوە دەکات.';
labels.en.faq[2][1]='Place a cash-on-delivery order. The store will contact you to confirm delivery.';
const ui=()=>labels[language];
let onlyFavorites=false,photoOrder=null;
let likes=new Set();try{const stored=JSON.parse(read('bazaar.likes'));if(Array.isArray(stored))likes=new Set(stored)}catch{}
function view(){const id=location.hash.slice(1);return ['catalog','profile','help','chat'].includes(id)?id:'home'}
function goto(id){if(view()!==id)location.hash=id;else drawLayout()}
function browse(id){category=id;onlyFavorites=false;photoOrder=null;$('search').value='';goto('catalog');show();window.scrollTo(0,0)}
const paths={home:'M3 11 12 3l9 8v10h-6v-7H9v7H3Z',catalog:'M3 5h10M3 10h7M3 16h6M20 19l-4-4 M19 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',help:'M21 12a9 9 0 0 1-13 8l-5 1 1-5a9 9 0 1 1 17-4Z M8 11h8 M8 14h5',bag:'M3 4h2l3 12h10l3-9H6 M9 20h1 M17 20h1',profile:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M3 21v-2a7 5 0 0 1 7-5h4a7 5 0 0 1 7 5v2Z',camera:'M2 7h5l2-3h6l2 3h5v14H2Z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0 M15 15l6 6'};
function icon(key){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),p=document.createElementNS(ns,'path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');p.setAttribute('d',paths[key]);svg.append(p);return svg}
function collection(target,ids,withPrices){
 target.replaceChildren();for(const id of ids){const group=catalog.filter(p=>p[0]===id);if(!group.length)continue;
 const b=button('',()=>browse(id)),img=node('img');img.src=group[0][4];img.alt='';b.append(img,node('strong',t().cats[id]));
 if(withPrices)b.append(node('small',ui().from+' '+price(Math.min(...group.map(p=>p[3])))));target.append(b)}
}
function profile(){
 const last=read('bazaar.orderRef'),w=orderText[language];$('orderTitle').textContent=w[9];$('history').textContent=last?w[10]+' · '+last:w[11];
 $('favorites').textContent=ui().favorites+' ('+number(likes.size)+')';$('settings').textContent=ui().settings
}
let feedMode='recommended';
function drawFeed(){
 const rtl=language==='ckb',tabs=$('feedTabs');tabs.replaceChildren();
 for(const [key,label] of [['recommended',language==='en'?'You may like':rtl?'لەوانەیە بەدڵت بن':'قد تعجبك'],['new',language==='en'?'New arrivals':rtl?'تازە هاتووەکان':'وصل حديثاً']]){
  const tab=button(label,()=>{feedMode=key;drawFeed()});tab.setAttribute('aria-pressed',String(feedMode===key));tabs.append(tab)
 }
 const ordered=catalog.map((_,i)=>i);
 if(feedMode==='recommended')ordered.sort((i,j)=>catalog[i][0]-catalog[j][0]||catalog[i][3]-catalog[j][3]);
 $('homeGrid').replaceChildren(...ordered.map(productCard));
}
const categoryOrder=[3,5,4,2,1,6,7,8,9,10];
function drawHome(){
 const kurdish=language==='ckb';
 $('bannerTitle').textContent=language==='en'?'Bazar picks':kurdish?'هەڵبژاردەکانی بازاڕ':'اختيارات بازار';
 $('shopAll').textContent=language==='en'?'Shop all products':kurdish?'هەموو بەرهەمەکان ببینە':'تسوّق كل المنتجات';$('shopAll').onclick=()=>browse(0);
 $('roundTitle').textContent=language==='en'?'Shop by category':kurdish?'بەشەکانی بازاڕ':'أقسام السوق';
 const circles=$('roundCats');circles.replaceChildren();
 categoryOrder.forEach(id=>{
  const label=t().cats[id],b=button('',()=>browse(id)),p=catalog.find(item=>item[0]===id);
  if(p){const img=node('img');img.src=p[4];img.alt='';img.loading='lazy';b.append(img)}
  else{const mark=node('span',({8:'📱',9:'🎁',10:'⚽'})[id]||'🛍️','categoryMark');mark.setAttribute('aria-hidden','true');b.append(mark)}
  b.append(node('strong',label));circles.append(b)
 });
 drawFeed()
}
function drawLayout(){
 $('deliveryNotice').textContent={ckb:'گەیاندن بۆ سەرانسەری عێراق',ar:'توصيل إلى جميع أنحاء العراق',en:'Delivery across Iraq'}[language];
 const active=view();for(const k of ['home','catalog','help','profile','chat'])$(k).hidden=k!==active;
 const chatLabel={ckb:'چاتی ڕاستەوخۆ',ar:'دردشة مباشرة',en:'Live chat'}[language];
 for(const id of ['chatLaunch','openStoreChat'])$(id).replaceChildren(icon('help'),node('span',chatLabel));
 $('chatLaunch').hidden=active==='chat'||active==='help';
 const u=ui();for(const [id,value] of Object.entries({featureTitle:u.feature,accountTitle:u.account,orderTitle:u.orders,helpTitle:u.help,photoTitle:u.photo,photoExplain:u.explain,albumLabel:u.album,title:photoOrder?u.match:onlyFavorites?u.favorites:t().cats[category]}))$(id).textContent=value;
 drawHome();
 collection($('features'),[1,5,6,7],true);
 $('cats').replaceChildren();[0,...categoryOrder].forEach(i=>{const b=button(t().cats[i],()=>browse(i));b.setAttribute('aria-pressed',String(category===i));$('cats').append(b)});
 $('dock').replaceChildren();for(const [id,label] of [['home',u.home],['catalog',u.sections],['help',u.help],['bag',t().bag],['profile',u.account]]){
 const b=button('',()=>{if(id==='bag'){renderCart();$('drawer').showModal()}else if(id==='catalog')browse(0);else goto(id)});b.append(icon(id),node('span',label));if(id===active)b.setAttribute('aria-current','page');if(id==='bag'){const count=node('small');count.id='bagCount';b.append(count)}$('dock').append(b)}
 updateBag();profile();$('questions').replaceChildren();for(const [q,a] of u.faq){const d=node('details');d.append(node('summary',q),node('p',a));$('questions').append(d)}
 for(const [id,key,label] of [['camera','camera',u.photo],['searchBtn','search',t().search]]){$(id).replaceChildren(icon(key));$(id).setAttribute('aria-label',label)}
 $('photoClose').setAttribute('aria-label',t().close)
}
window.addEventListener('hashchange',()=>{show();window.scrollTo(0,0)});
$('favorites').onclick=()=>{category=0;photoOrder=null;onlyFavorites=true;$('search').value='';goto('catalog');show()};
$('settings').onclick=()=>{const select=$('lang');select.focus();try{select.showPicker()}catch{select.scrollIntoView()}};
function lookup(){category=0;onlyFavorites=false;photoOrder=null;goto('catalog');show()}
const queryField=$('search'),hintList=$('searchHints');
let activeHint=-1;
function closeHints(){
 hintList.hidden=true;activeHint=-1;
 queryField.setAttribute('aria-expanded','false');queryField.removeAttribute('aria-activedescendant');
}
function matchingNames(query){
 const groups=[new Set(),new Set(),new Set()];
 for(const product of catalog){
  const names=[...new Set([name(product),product[2],product[1],product[7]].filter(Boolean))];
  let best=3,label='';
  for(const candidate of names){
   const words=normalize(candidate);
   const rank=words.startsWith(query)?0:words.split(/\s+/).some(word=>word.startsWith(query))?1:words.includes(query)?2:3;
   if(rank<best){best=rank;label=candidate}
  }
  if(best<3)groups[best].add(label);
 }
 return [...new Set(groups.flatMap(group=>[...group]))].slice(0,6);
}
function chooseHint(label){queryField.value=label;closeHints();lookup();queryField.blur()}
function showHints(){
 closeHints();hintList.replaceChildren();
 const query=normalize(queryField.value);
 if(!query||document.activeElement!==queryField)return;
 for(const label of matchingNames(query)){
  const option=node('div',label);option.id='searchHint'+hintList.children.length;
  option.setAttribute('role','option');option.setAttribute('aria-selected','false');
  option.onmousedown=e=>e.preventDefault();option.onclick=()=>chooseHint(label);
  hintList.append(option);
 }
 hintList.hidden=!hintList.children.length;
 queryField.setAttribute('aria-expanded',String(!hintList.hidden));
 hintList.setAttribute('aria-label',t().search);
}
queryField.onfocus=showHints;
queryField.onblur=closeHints;
queryField.oninput=()=>{lookup();showHints()};
queryField.onkeydown=e=>{
 if(e.isComposing||hintList.hidden)return;
 if(e.key==='Escape'){e.preventDefault();closeHints();return}
 if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
 e.preventDefault();const options=[...hintList.children];
 activeHint=activeHint<0?(e.key==='ArrowDown'?0:options.length-1):(activeHint+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;
 options.forEach((option,i)=>option.setAttribute('aria-selected',String(i===activeHint)));
 queryField.setAttribute('aria-activedescendant',options[activeHint].id);
 options[activeHint].scrollIntoView({block:'nearest'});
};
$('lookup').onsubmit=e=>{
 e.preventDefault();
 if(!hintList.hidden&&activeHint>=0)chooseHint(hintList.children[activeHint].textContent);
 else{closeHints();lookup();queryField.blur()}
};
$('camera').onclick=()=>{$('photoStatus').textContent='';$('photos').showModal()};$('photoClose').onclick=()=>$('photos').close();
async function color(source){const img=new Image();img.src=source;await img.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=16;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,16,16);const rgba=ctx.getImageData(0,0,16,16).data,rgb=[0,0,0];for(let i=0;i<rgba.length;i+=4)for(let j=0;j<3;j++)rgb[j]+=rgba[i+j]/256;return rgb}
$('album').onchange=async()=>{const file=$('album').files[0];if(!file)return;const url=URL.createObjectURL(file);$('photoStatus').textContent=ui().busy;
 try{const ref=await color(url);const ranked=await Promise.all(catalog.map(async(p,i)=>{const rgb=await color(p[4]);return [i,rgb.reduce((sum,v,j)=>sum+(v-ref[j])**2,0)]}));if(!$('photos').open)return;photoOrder=ranked.sort((a,b)=>a[1]-b[1]).map(x=>x[0]);category=0;onlyFavorites=false;$('search').value='';$('photos').close();goto('catalog');show()}catch{$('photoStatus').textContent=ui().failed}finally{URL.revokeObjectURL(url);$('album').value=''}};
show();loadCatalog();
document.addEventListener('visibilitychange',loadCatalog);
window.addEventListener('online',loadCatalog);
window.addEventListener('pageshow',event=>{if(event.persisted)loadCatalog()});
setInterval(loadCatalog,60000);
async function updateLegacyOrderRef(){
 const old=read('bazaar.orderRef');if(!old||old.length!==36)return;
 try{
  const r=await fetch('/api/orders',{headers:{'X-Order-Reference':old},cache:'no-store'});
  if(!r.ok)return;
  const {code}=await r.json();
  if(/^\d{6}$/.test(code)&&read('bazaar.orderRef')===old){save('bazaar.orderRef',code);profile()}
 }catch{}
}
updateLegacyOrderRef();
