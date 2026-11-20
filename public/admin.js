'use strict';
const $=id=>document.getElementById(id);
const strings={
 en:{"brand": "Bazar", "title": "Manage products", "store": "View store", "new": "Add product", "edit": "Edit product", "save": "Save product", "cancel": "Cancel", "arLabel": "Arabic product name", "ckbLabel": "Sorani name (optional)", "enLabel": "English name (optional)", "categoryLabel": "Category", "priceLabel": "Price in Iraqi dinars", "detailsLabel": "Colours or sizes (optional)", "photoLabel": "Product photo", "success": "Product saved.", "error": "Could not save. Check your connection and try again.", "conflict": "The catalogue changed on another device. Copy your changes and refresh before saving.", "photoError": "Choose a JPEG, PNG or WebP image smaller than 20 MB.", "loadError": "Could not load products. Refresh to try again.", "busy": "Saving\u2026", "cats": ["Accessories", "Men\u2019s clothing", "Women\u2019s clothing", "Children\u2019s clothing", "Fragrances", "Watches", "Kitchenware", "Phone accessories", "Gifts", "Sporting goods"]},
 ar:{enLabel:'الاسم بالإنجليزية (اختياري)',brand:'بازار',title:'إدارة المنتجات',store:'عرض المتجر',language:'کوردی',new:'إضافة منتج',edit:'تعديل المنتج',save:'حفظ المنتج',cancel:'إلغاء',arLabel:'اسم المنتج بالعربية',ckbLabel:'الاسم بالسورانية (اختياري)',categoryLabel:'القسم',priceLabel:'السعر بالدينار العراقي',detailsLabel:'الألوان أو المقاسات (اختياري)',photoLabel:'صورة المنتج',success:'تم حفظ المنتج في المتجر.',error:'تعذّر الحفظ. تأكد من الاتصال وجرّب مجدداً.',conflict:'تغيّر الكتالوج من جهاز آخر. انسخ تغييراتك وحدّث الصفحة قبل الحفظ.',photoError:'اختر صورة JPEG أو PNG أو WebP يمكن فتحها بحجم أقل من ٢٠ ميغابايت.',loadError:'تعذّر تحميل المنتجات. حدّث الصفحة للمحاولة مجدداً.',busy:'جارٍ الحفظ…',cats:['إكسسوارات','ملابس رجالية','ملابس نسائية','ملابس أطفال','عطور','ساعات','أدوات المطبخ','إكسسوارات الموبايل','هدايا','مستلزمات رياضية']},
 ckb:{enLabel:'ناوی ئینگلیزی (ئارەزوومەندانە)',brand:'بازاڕ',title:'بەڕێوەبردنی بەرهەمەکان',store:'بینینی فرۆشگا',language:'العربية',new:'زیادکردنی بەرهەم',edit:'دەستکاریی بەرهەم',save:'پاشەکەوتکردن',cancel:'هەڵوەشاندنەوە',arLabel:'ناوی بەرهەم بە عەرەبی',ckbLabel:'ناو بە سۆرانی (ئارەزوومەندانە)',categoryLabel:'بەش',priceLabel:'نرخ بە دیناری عێراقی',detailsLabel:'ڕەنگ یان قەبارە (ئارەزوومەندانە)',photoLabel:'وێنەی بەرهەم',success:'بەرهەمەکە لە فرۆشگا پاشەکەوت کرا.',error:'پاشەکەوت نەکرا. پەیوەندیی ئینتەرنێت بپشکنە و دووبارە هەوڵ بدەوە.',conflict:'بەرهەمەکان لە ئامێرێکی تر گۆڕدراون. گۆڕانکارییەکانت کۆپی بکە و پەڕەکە نوێ بکەرەوە.',photoError:'وێنەیەکی JPEG یان PNG یان WebP هەڵبژێرە کە لە ٢٠ مێگابایت بچووکتر بێت.',loadError:'بەرهەمەکان بار نەکران. پەڕەکە نوێ بکەرەوە.',busy:'پاشەکەوت دەکرێت…',cats:['ئێکسسوارات','جل‌وبەرگی پیاوان','جل‌وبەرگی ژنان','جل‌وبەرگی منداڵان','بۆن','کاتژمێر','کەلوپەلی چێشتخانە','ئێکسسواراتی مۆبایل','دیاری','کەلوپەلی وەرزشی']}
};
let language='ar';try{const pref=localStorage.getItem('bazaar.language');if(['en','ckb'].includes(pref))language=pref}catch{}
let state=null,editing=null,busy=false,objectURL='';
const t=()=>strings[language];
function list(){
 $('list').replaceChildren();for(const p of state?.products||[]){
  const row=document.createElement('article');row.className='line';
  const image=document.createElement('img');image.src=p.image;image.alt='';image.loading='lazy';
  const box=document.createElement('div'),title=document.createElement('strong'),price=document.createElement('small');
  title.textContent=p[language]||p.ar;price.textContent=t().cats[p.category-1]+' · '+p.price.toLocaleString(language==='en'?'en-IQ':'ar-IQ')+' '+(language==='en'?'IQD':language==='ar'?'د.ع':'دینار');
  const edit=document.createElement('button');edit.textContent=t().edit;edit.onclick=()=>openEditor(p);box.append(title,price);row.append(image,box,edit);$('list').append(row)
 }
}
$('productsToggle').onclick=()=>{
 const panel=$('productsPanel');
 panel.hidden=!panel.hidden;
 $('productsToggle').setAttribute('aria-expanded',String(!panel.hidden));
};
function translate(){
 const labels=measurementLabels[language];
 $('measurementTitle').textContent=labels[0];
 measurementKeys.forEach((key,i)=>$('measure-'+key+'-label').textContent=labels[i+1]+' ('+labels[key==='capacity'?6:5]+')');
 $('productsLabel').textContent={ckb:'بەرهەمەکان',ar:'المنتجات',en:'Products'}[language];document.documentElement.lang=language;document.documentElement.dir=language==='en'?'ltr':'rtl';$('language').value=language;document.title=t().title;for(const k of Object.keys(t()))if(k!=='language'&&$(k))$(k).textContent=t()[k];const previous=$('category').value;$('category').replaceChildren(...t().cats.map((c,i)=>new Option(c,String(i+1))));$('category').value=previous||'1';$('heading').textContent=t()[editing?'edit':'new'];list()}
function imagePreview(url){if(objectURL){URL.revokeObjectURL(objectURL);objectURL=''}$('preview').hidden=!url;if(url)$('preview').src=url;else $('preview').removeAttribute('src')}
let formId='';
function openEditor(p){if(busy||!state)return;editing=p;formId=p?.id||crypto.randomUUID();$('editor').reset();for(const k of ['ar','ckb','en','price','cost','stock','category','details'])$(k).value=p?.[k]??(k==='category'?1:'');$('price').value=p?.regularPrice??p?.price??'';
 measurementKeys.forEach(key=>$('measure-'+key).value=p?.measurements?.[key]??'');
 $('offer').value=p?.regularPrice?p.price:'';
 updateOfferLimit();$('photo').required=!p;imagePreview(p?.image);$('editor').hidden=false;$('message').textContent='';$('heading').textContent=t()[p?'edit':'new'];$('ar').focus()}
$('photo').onchange=()=>{const file=$('photo').files[0];const url=file?URL.createObjectURL(file):null;imagePreview(url||editing?.image);objectURL=url||''};
async function jpeg(file){
 if(file.size>20000000||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('photo');
 const bitmap=await createImageBitmap(file);const scale=Math.min(1,900/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL('image/jpeg',.82)
}
$('new').onclick=()=>openEditor(null);$('cancel').onclick=()=>{if(!busy){imagePreview(null);$('editor').hidden=true}};
$('language').onchange=()=>{language=$('language').value;try{localStorage.setItem('bazaar.language',language)}catch{}translate()};
function updateOfferLimit(){ $('offer').max=String(Math.max(0,Number($('price').value)-1)) }
$('price').addEventListener('input',updateOfferLimit);
$('editor').onsubmit=async e=>{
 e.preventDefault();if(!state||busy)return;busy=true;$('save').disabled=true;$('message').textContent=t().busy;
 try{
  const p={id:formId,tag:state.tag,ar:$('ar').value,ckb:$('ckb').value,en:$('en').value,cost:$('cost').value===''?null:Number($('cost').value),stock:$('stock').value===''?null:Number($('stock').value),category:Number($('category').value),regularPrice:$('offer').value?Number($('price').value):null,price:Number($('offer').value||$('price').value),measurements:Object.fromEntries(measurementKeys.filter(k=>$('measure-'+k).value!=='').map(k=>[k,Number($('measure-'+k).value)])),details:$('details').value};
  if($('photo').files.length){try{p.photo=await jpeg($('photo').files[0])}catch{throw Error('photoError')}}
  const r=await fetch('/api/manage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
  if(!r.ok)throw Error(r.status===409?'conflict':'error');state=await r.json();refreshSales();$('editor').hidden=true;imagePreview(null);list();$('message').textContent=t().success
 }catch(err){$('message').textContent=t()[err.message]||t().error}finally{busy=false;$('save').disabled=false;$('message').scrollIntoView({block:'nearest'})}
};
const salesCopy={
 ckb:['فرۆشتن، قازانج و کۆگا','ماوە','ئەمڕۆ','ئەم هەفتەیە','ئەم مانگە','ئەمساڵ','گشتی','نرخی کڕینی یەک دانە (دینار)','نرخی فرۆشتنی یەک دانە (دینار)','ژمارەی دانەی ماوە','داواکاریی پارەوەرگیراو','دانەی فرۆشراو','فرۆشتن (دینار)','قازانجی کاڵا (دینار)','دانە نرخی کڕینی دیار نییە','کاڵا','ماوە','نەماوە','دیاری نەکراوە','گەیەنرا و پارەکە وەرگیرا','پارەکە وەرگیراوە'],
 ar:['المبيعات والربح والمخزون','الفترة','اليوم','هذا الأسبوع','هذا الشهر','هذه السنة','الإجمالي','سعر شراء القطعة (د.ع)','سعر بيع القطعة (د.ع)','الكمية المتبقية','طلبات مدفوعة','قطع مباعة','المبيعات (د.ع)','ربح البضاعة (د.ع)','قطع بتكلفة غير معروفة','المنتج','المتبقي','نفد','غير محدد','تم التسليم واستلام المبلغ','مدفوع'],
 en:['Sales, profit and stock','Period','Today','This week','This month','This year','All time','Purchase cost per unit (IQD)','Selling price per unit (IQD)','Units remaining','Paid orders','Units sold','Sales (IQD)','Gross profit (IQD)','units with unknown cost','Product','Remaining','Sold out','Unknown','Mark delivered and paid','Paid']
};
const salesWords=()=>salesCopy[language];
let reportVersion=0;
async function refreshSales(){
 const w=salesWords(),period=$('salesPeriod').value||'day',version=++reportVersion;
 $('salesHeading').textContent={ckb:'حیسابات و قازانج',ar:'الحسابات والأرباح',en:'Accounts and profit'}[language];
 $('salesHelp').textContent={
  ckb:'ماوەکە هەڵبژێرە بۆ بینینی فروشتنی داواکارییە پارەدراوەکان. قازانجی کاڵا بریتییە لە نرخی فرۆشتن کەم نرخی کڕین، بۆ ئەو کاڵایانەی نرخی کڕینیان دیارە. خشتەکەش بڕی ئێستای کۆگا پیشان دەدات.',
  ar:'اختر الفترة لعرض مبيعات الطلبات المدفوعة. ربح البضاعة هو الفرق بين سعر البيع وتكلفة الشراء للقطع التي لها تكلفة مسجلة. يعرض الجدول المخزون الحالي.',
  en:'Choose a period to see paid sales. Gross profit is the sale price less purchase cost for items with a recorded cost. The table shows current stock.'
 }[language];
 $('periodLabel').textContent=w[1];
 $('salesPeriod').replaceChildren(...['day','week','month','year','all'].map((v,i)=>new Option(w[i+2],v)));$('salesPeriod').value=period;
 $('costLabel').textContent=w[7];$('priceLabel').textContent={ckb:'نرخی ئاسایی (دینار)',ar:'السعر الاعتيادي (د.ع)',en:'Regular price (IQD)'}[language];
 $('offerLabel').textContent={ckb:'نرخی دوای داشکاندن (دینار، ئارەزوومەندانە)',ar:'السعر بعد الخصم (د.ع، اختياري)',en:'Discounted price (IQD, optional)'}[language];$('stockLabel').textContent=w[9];
 if(!state||!$('salesPanel').open)return;
 try{
  const [sales,catalog]=await Promise.all(['/api/sales?period='+period,'/api/catalog'].map(async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error();return r.json()}));
  if(version!==reportVersion)return;
  if($('editor').hidden){state=catalog;list()}
  const fmt=n=>Number(n).toLocaleString(language);
  $('salesTotals').textContent=[sales.orders,sales.units,sales.revenue,sales.profit].map((v,i)=>w[10+i]+' · '+fmt(v)).join('  |  ')+(sales.unknown?'  ('+fmt(sales.unknown)+' '+w[14]+')':'');
  const table=document.createElement('table');table.className='inventoryTable';
  const header=table.createTHead().insertRow();for(const name of [w[15],w[11],w[16]]){const th=document.createElement('th');th.textContent=name;header.append(th)}
  const body=table.createTBody();for(const p of catalog.products){
   const row=body.insertRow();for(const value of [p[language]||p.ar,fmt(sales.byProduct[p.id]||0),p.stock==null?w[18]:p.stock===0?w[17]:fmt(p.stock)])row.insertCell().textContent=value;
   if(p.stock===0)row.className='outOfStock';
  }
  $('stockRows').replaceChildren(table);
 }catch{if(version===reportVersion)$('salesTotals').textContent=t().loadError}
}
$('salesPeriod').onchange=refreshSales;$('salesPanel').ontoggle=refreshSales;
$('language').addEventListener('change',refreshSales);
setInterval(()=>{if(!document.hidden&&$('salesPanel').open)refreshSales()},60000);
translate();refreshSales();$('new').disabled=true;
fetch('/api/catalog',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{if(!data.manager)throw Error();state=data;list();refreshSales();$('new').disabled=false}).catch(()=>{$('message').textContent=t().loadError});

const usageCopy={
 ckb:['چالاکی و دامەزراندن','ئامێری چالاک لە ٥ خولەکی ڕابردوو','دامەزراندنی تۆمارکراو','لە ٢٠ی تشرینی دووەمی ٢٠٢٦ەوە. ژمێرەرەکە هەر وێبگەڕ یان ئەپی دامەزراو بە ناسنامەیەکی ناوخۆیی دەناسێتەوە.','ژمارەکان بەردەست نین.'],
 ar:['النشاط والتثبيت','الأجهزة النشطة خلال آخر ٥ دقائق','التثبيتات المرصودة','منذ ٢٠ نوفمبر ٢٠٢٦. يُستخدم معرّف محلي لكل متصفح أو تطبيق مثبت.','تعذّر تحميل الأعداد.'],
 en:['Activity and installs','Active devices in the last 5 minutes','Recorded installations','Since 20 November 2026. Each browser or installed app is identified by a local identifier.','Counts unavailable.']
};
let usageVersion=0;
async function refreshUsage(){
 const version=++usageVersion,w=usageCopy[language];
 $('usageLabel').textContent=w[0];$('usageNote').textContent=w[3];
 if(!$('usagePanel').open||document.hidden)return;
 try{
  const response=await fetch('/api/usage',{cache:'no-store'});if(!response.ok)throw Error();
  const data=await response.json();if(version!==usageVersion)return;
  $('usageActive').textContent=w[1]+' · '+data.active.toLocaleString(language);
  $('usageInstalled').textContent=w[2]+' · '+data.installed.toLocaleString(language);
  $('usageStatus').textContent='';
 }catch{if(version===usageVersion){$('usageActive').textContent='';$('usageInstalled').textContent='';$('usageStatus').textContent=w[4]}}
}
$('usagePanel').ontoggle=refreshUsage;
$('language').addEventListener('change',refreshUsage);
document.addEventListener('visibilitychange',refreshUsage);
setInterval(refreshUsage,30000);refreshUsage();
