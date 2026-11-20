const DEFAULT_PHONE='';
async function contact(request,bucket,manager){
 const url=new URL(request.url),path=url.pathname,user=request.headers.get('oai-authenticated-user-id');
 const writing=request.method==='POST';
 if(writing&&(request.headers.get('Origin')!==url.origin||!request.headers.get('Content-Type')?.startsWith('application/json')))return json({},403);
 if(!writing&&request.method!=='GET')return json({},405);
 if(path==='/api/contact'&&!writing){
  const o=await bucket.get('contact/whatsapp');
  return json({phone:o?await o.text():DEFAULT_PHONE,signedIn:Boolean(user)})
 }

 if((path==='/api/inbox'||path==='/api/contact')&&!manager)return json({},403);
 let data={};
 if(writing){
  const length=Number(request.headers.get('content-length'));
  if(!length||length>10000)return json({},413);
  try{data=await request.json()}catch{return json({},400)}
 }
 if(path==='/api/contact'){
  if(typeof data.phone!=='string'||!/^\+[1-9]\d{7,14}$/.test(data.phone))return json({},400);
  await bucket.put('contact/whatsapp',data.phone);return json({phone:data.phone})
 }
 if(path==='/api/inbox'){
  if(writing)return json({},405);
  const rooms=[];let cursor;
  do{const result=await bucket.list({prefix:'chat/',cursor});for(const o of result.objects)rooms.push({room:o.key.slice(5),updated:o.uploaded});cursor=result.truncated?result.cursor:null}while(cursor);
  return json(rooms.sort((a,b)=>new Date(b.updated)-new Date(a.updated)))
 }
 const guest=request.headers.get('x-bazar-chat');
 if(!user&&!/^[a-f0-9]{64}$/.test(guest||''))return json({},401);
 const identity=user||'bazar-guest:'+guest;
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(identity));
 const own=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
 const selected=url.searchParams.get('room');
 if(selected&&(!manager||!/^[a-f0-9]{64}$/.test(selected)))return json({},403);
 const key='chat/'+(selected||own);
 const obj=await bucket.get(key),messages=obj?await obj.json():[];
 if(!writing)return json(messages);
 if(selected&&!obj)return json({},404);
 const text=typeof data.text==='string'?data.text.trim():'';
 if(!text||text.length>1000||typeof data.id!=='string'||!/^[-a-f0-9]{36}$/.test(data.id))return json({},400);
 const sender=selected?'store':'buyer';
 if(messages.some(m=>m.id===data.id&&m.sender===sender))return json(messages);
 const last=messages.filter(m=>m.sender===sender).at(-1);
 if(last&&Date.now()-last.time<1200)return json({},429);
 messages.push({id:data.id,sender,text,time:Date.now()});
 const staffActive=messages.some(m=>(m.sender==='store'||m.requestedSeller)&&Date.now()-m.time<86400000);
 if(sender==='buyer'&&!staffActive){
  const lang=['ckb','ar','en'].includes(data.lang)?data.lang:'ar';
  let reply;
  try{reply=await shopReply(text,lang,bucket)}catch{reply={text:botCopy[lang].person,handoff:true}}
  messages.push({id:crypto.randomUUID(),sender:'bot',time:Date.now(),...reply});
 }
 const recent=messages.slice(-300);
 const written=await bucket.put(key,JSON.stringify(recent),{onlyIf:obj?{etagMatches:obj.etag}:{etagDoesNotMatch:'*'}});
 return written?json(recent):json({},409)
}

const botCopy={
 ckb:{hello:'سڵاو، بەخێربێیت بۆ بازاڕ. فەرموو بەڕێز، چ پرسیارێکت هەیە؟',ask:'تکایە ناوی کاڵاکە بۆم بنووسە، تا نرخ و بەردەستبوونی بۆت بپشکنم.',person:'پەیامەکەت لە چاتی فرۆشگاکە تۆمار کرا. فرۆشیار دەتوانێت لێرە وەڵامت بداتەوە.',delivery:'گەیاندن بۆ پارێزگاکانی عێراق',unit:'دینار',out:'تەواو بووە',yes:'بەردەستە',unknown:'بەردەستبوونی پێویستی بە پشتڕاستکردنەوە هەیە'},
 ar:{hello:'أهلاً وسهلاً بك في بازار. تفضّل، كيف أقدر أساعدك؟',ask:'ممكن تكتب لي اسم المنتج حتى أتأكد لك من سعره وتوفّره؟',person:'وصلت رسالتك إلى محادثة المتجر. يمكن للبائع الرد عليك هنا.',delivery:'التوصيل إلى محافظات العراق',unit:'د.ع',out:'نفد المخزون',yes:'متوفر',unknown:'التوفر يحتاج إلى تأكيد'},
 en:{hello:'Welcome to Bazar! How can I help you today?',ask:'Could you share the product name so I can check its price and availability?',person:'Your message is in the shop inbox. The seller can reply here.',delivery:'Delivery across Iraq',unit:'IQD',out:'Sold out',yes:'In stock',unknown:'Availability needs confirmation'}
};
function botNormalize(value){
 return value.toLowerCase().replace(/ة/g,'ە').replace(/ھ/g,'ه').replace(/[أإآ]/g,'ا').replace(/ك/g,'ک').replace(/ي/g,'ی').replace(/[\u064b-\u0652\u0640]/g,'').trim()
}
async function shopReply(text,lang,bucket){
 const w=botCopy[lang],q=botNormalize(text);
 const amount=n=>n.toLocaleString('en-US')+' '+w.unit;
 if(/فرۆشیار|خاوەن|موظف|البائع|human|seller|refund|refunds|استرجاع|گەڕاندنەوە|شکاو|شکایت/.test(q))return {text:w.person,requestedSeller:true};
 if(/^(سوپاس|زور سوپاس|زۆر سوپاس|دەستت خۆش|شکرا|ممنون|thanks|thank you)[!.، ]*$/.test(q))return {text:{ckb:'شایانی نییە، بەڕێز. هەر پرسیارێکی دیکەت هەبوو، فەرموو.',ar:'العفو، تدلّل. عندك أي سؤال ثاني؟',en:'You’re welcome! Is there anything else I can help with?'}[lang]};
 const guide=[
  [/سەبەت|سەلە|سلە|سلت|cart|چۆن.*بکڕ|چون.*بکڕ|اشتری|checkout|how.*buy/, 'دوگمەی 🛒ی سەر وێنەی کاڵاکە دابگرە، سەبەتەکەت بکەرەوە و ژمارەی دانەکان دیاری بکە. بۆ ناردنی داواکاری، ناو، مۆبایل و ناونیشانی گەیاندن بنووسە.', 'اضغط 🛒 على صورة المنتج ثم افتح السلة وحدد الكمية. لإرسال الطلب أدخل الاسم والموبايل وعنوان التوصيل.', 'Tap 🛒 on a product photo, open the cart and choose a quantity. Enter your name, mobile and address to place the order.'],
  [/دڵخواز|دڵەکە|مفضل|favo[u]?rite/, 'دڵەکەی سەر کاڵاکە دابگرە. دواتر لە «هەژمارەکەم» لیستی دڵخوازەکان بکەرەوە.', 'اضغط القلب على المنتج ثم افتح المفضلة من حسابي.', 'Tap the heart on a product, then open Favorites in your account.'],
  [/پارەدان|پارە.*بدەم|کارت|دفع|بطاق|pay|card/, 'بۆ داواکاری، پارە لە کاتی وەرگرتن دەدرێت.', 'يمكنك إرسال طلب والدفع عند الاستلام.', 'Place an order with cash on delivery.'],
  [/داواکاری|داواکار|طلبی|طلباتی|order/, 'لە «هەژمارەکەم» دوا داواکاریی تۆمارکراو لەسەر ئەم ئامێرە دەبینیت. بۆ پرسیار لەسەر داواکارییەکی دیاریکراو، بنووسە «فرۆشیار» و ژمارەی داواکارییەکەت بنێرە.', 'افتح حسابي لرؤية آخر طلب على هذا الجهاز. للاستفسار عن طلب محدد اكتب «البائع» وأرسل رقم الطلب.', 'Open Account to see the latest order on this device. For an update, type “seller” and send your order reference.'],
  [/وێنە|وینە|صورە|صوره|photo|camera|image/, 'لە خانەی گەڕان ئایکۆنی کامێرا دابگرە و وێنەیەک هەڵبژێرە. کاڵاکان بە پێی نزیکیی ڕەنگ ڕیز دەکرێن.', 'اضغط الكاميرا بجانب البحث واختر صورة لترتيب المنتجات حسب أقرب الألوان.', 'Choose the camera next to Search to rank products by similar colours.'],
  [/زمان|لغە|language/, 'لە سەرەوەی پەڕە، لە لیستی زمان کوردی، عەرەبی یان ئینگلیزی هەڵبژێرە.', 'اختر العربية أو الكردية أو الإنجليزية من قائمة اللغة أعلى الصفحة.', 'Use the language menu at the top to choose Kurdish, Arabic or English.'],
  [/دامەزر|دابەز|تنزیل|تثبیت|install|download/, 'لە «هەژمارەکەم» دوگمەی «بازاڕ دابمەزرێنە» دابگرە ئەگەر لە وێبگەڕەکەت بەردەستە.', 'اضغط زر تثبيت بازار في حسابي إذا كان متاحاً في متصفحك.', 'Use Install Bazar in Account if your browser offers installation.'],
  [/گەڕان|بگەڕ|بحث|search/, 'لە خانەی گەڕان چەند پیتێکی ناوی کاڵاکە بنووسە و یەکێک لە پێشنیارەکان هەڵبژێرە.', 'اكتب بعض حروف اسم المنتج في البحث واختر أحد الاقتراحات.', 'Type a few letters of a product name in Search and choose a suggestion.']
 ];
 const answerIndex={ckb:1,ar:2,en:3}[lang];
 const topic=guide.find(row=>row[0].test(q));
 if(topic)return {text:topic[answerIndex]};
 if(/گەیاندن|توصیل|شحن|delivery|shipping/.test(q))return {text:w.delivery+' · '+amount(deliveryCost)};
 if(/^(سڵاو|سلاو|سلام|السلام علیکم|مرحبا|اهلا|hello|hi|hey|بەیانی باش|ئێوارە باش)[\s!.؟]*$/.test(q))return {text:w.hello};
 const tokens=q.match(/[\p{L}\p{N}]+/gu)||[];
 const matches=[];
 const products=(await load(bucket)).products;
 if(/چیتان|چیت هەیە|چیتان هەیە|چی هەیە|چی دەفرۆش|بەشەکان|کاڵاکان|بەرهەمەکان|منتجات|اقسام|شنو عدکم|شنو عندکم|catalog|what.*sell|products|categories/.test(q)){
  const listed=products.slice(0,16).map(p=>(p[lang]||p.ar)+' · '+amount(p.price));
  if(listed.length)return {text:listed.join('\n')};
 }
 for(const p of products){
  const names=[p.ckb,p.ar,p.en].filter(Boolean).map(botNormalize);
  const score=tokens.filter(t=>t.length>=3&&names.some(n=>n.split(/\s+/).some(word=>word.startsWith(t)))).length;
  if(score)matches.push({p,score});
 }
 if(matches.length){
  matches.sort((a,b)=>b.score-a.score);
  const rows=matches.filter(m=>m.score===matches[0].score).slice(0,4);
  return {text:rows.map(({p})=>[p[lang]||p.ar,amount(p.price),measurementText(p.measurements,lang),p.details||'',p.stock==null?w.unknown:p.stock>0?w.yes:w.out].filter(Boolean).join(' · ')).join('\n')};
 }
 if(/نرخ|سعر|سعره|price|stock|بەردەست/.test(q))return {text:w.ask};
 return {text:{ckb:'تکایە کەمێک زیاتر بۆم ڕوون بکەرەوە، تا باشتر یارمەتیت بدەم. ئەگەر دەتەوێت لەگەڵ فرۆشیار قسە بکەیت، بنووسە «فرۆشیار».',ar:'ممكن توضّح لي أكثر حتى أساعدك؟ وإذا تحب تتكلم مع المتجر، اكتب «البائع».',en:'Could you tell me a little more so I can help? You can also type “seller” to speak to the shop.'}[lang]};
}
