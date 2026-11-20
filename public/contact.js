(()=>{
const panel=document.getElementById('contactPanel'),admin=document.getElementById('adminContact');
const terms={
 en:['Contact & live chat','Live chat','Sign in to chat','Your message','Send','Shop','Customer','Welcome to Bazar! How can I help you today?','Could not connect. Try again.','Conversations','Choose a conversation','WhatsApp','Store WhatsApp number','Save','Saved','No conversations yet','Sending…','Pause slideshow','Play slideshow'],
 ar:['التواصل والدردشة','دردشة مباشرة','سجّل الدخول للدردشة','رسالتك','إرسال','المتجر','الزبون','أهلاً وسهلاً بك في بازار. تفضّل، كيف أقدر أساعدك؟','تعذّر الاتصال. حاول مجدداً.','المحادثات','اختر محادثة','واتساب','رقم واتساب المتجر','حفظ','تم الحفظ','لا توجد محادثات بعد','جارٍ الإرسال…','إيقاف عرض الصور','تشغيل عرض الصور'],
 ckb:['پەیوەندی و چات','چاتی ڕاستەوخۆ','بۆ چات بچۆ ژوورەوە','نامەکەت','ناردن','فرۆشگا','کڕیار','سڵاو، بەخێربێیت بۆ بازاڕ. فەرموو بەڕێز، چ پرسیارێکت هەیە؟','پەیوەندی سەرکەوتوو نەبوو. دووبارە هەوڵ بدەرەوە.','گفتوگۆکان','گفتوگۆیەک هەڵبژێرە','واتساپ','ژمارەی واتساپی فرۆشگا','پاشەکەوتکردن','پاشەکەوت کرا','هێشتا هیچ گفتوگۆیەک نییە','دەنێردرێت…','وەستاندنی وێنەکان','جووڵاندنی وێنەکان']};
const words=()=>terms[document.documentElement.lang]||terms.ar;
function make(tag,text){const e=document.createElement(tag);if(text)e.textContent=text;return e}
let selected='',loaded=false,roomList,chatBox,log,input,send,notice,roomState='',pending=false,messageId='',lastBody='',version=0;
const active=()=>admin?admin.open:location.hash==='#chat';
let guestToken;
function guestChatToken(){
 if(guestToken)return guestToken;
 try{guestToken=localStorage.getItem('bazar.chat.token')}catch{}
 if(!/^[a-f0-9]{64}$/.test(guestToken||'')){
  guestToken=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
  try{localStorage.setItem('bazar.chat.token',guestToken)}catch{}
 }
 return guestToken;
}
async function api(path,data){const opts={cache:'no-store',headers:{}};if(!admin&&path==='/api/chat')opts.headers['x-bazar-chat']=guestChatToken();if(data){opts.method='POST';opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(data)}const r=await fetch(path,opts);if(!r.ok)throw Error();return r.json()}
function path(){return '/api/chat'+(admin?'?room='+encodeURIComponent(selected):'')}
function drawMessages(rows){const key=JSON.stringify(rows);if(key===roomState)return;roomState=key;const w=words();log.replaceChildren();if(!rows.length){
 const greeting=make('p');greeting.append(make('b',({ckb:'بۆتی بازاڕ',ar:'مساعد بازار الآلي',en:'Bazar bot'})[document.documentElement.lang]||'Bazar bot'),document.createTextNode(w[7]));log.append(greeting)
}for(const row of rows){const p=make('p');p.append(make('b',row.sender==='bot'?({ckb:'بۆتی بازاڕ',ar:'مساعد بازار الآلي',en:'Bazar bot'}[document.documentElement.lang]||'Bazar bot'):row.sender==='store'?w[5]:w[6]),document.createTextNode(row.text));log.append(p)}log.scrollTop=log.scrollHeight}
async function refresh(){
 if(!active()||!loaded||document.hidden)return;
 const current=version,room=selected;
 try{
  if(admin){const rooms=await api('/api/inbox');if(current!==version)return;
   const opts=[new Option(rooms.length?words()[10]:words()[15],'')];rooms.forEach(r=>opts.push(new Option(words()[6]+' · '+r.room.slice(0,7),r.room)));
   roomList.replaceChildren(...opts);roomList.value=selected;chatBox.hidden=!selected;if(!selected)return}
  const rows=await api(path());if(current===version&&room===selected)drawMessages(rows)
 }catch{if(current===version)notice.textContent=words()[8]}
}
function keepComposerVisible(){
 if(!input||document.activeElement!==input||!matchMedia('(max-width:750px)').matches)return;
 const viewport=window.visualViewport;
 const bottom=viewport?viewport.offsetTop+viewport.height:window.innerHeight;
 const overlap=input.parentElement.getBoundingClientRect().bottom+20-bottom;
 if(overlap>0)window.scrollBy(0,Math.ceil(overlap))
}
window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(keepComposerVisible));
async function setup(){
 const w=words();if(admin)document.getElementById('contactSummary').textContent=w[0];if(!active())return;
 const current=++version;loaded=false;roomState='';panel.replaceChildren();notice=make('p');notice.setAttribute('role','status');panel.append(notice);
 try{const config=await api('/api/contact');if(current!==version)return;
 if(config.phone&&admin){const a=make('a',w[11]);a.className='wa';a.href='https://wa.me/'+config.phone.slice(1);a.target='_blank';a.rel='noopener noreferrer';panel.append(a)}
 if(admin){const field=make('label',w[12]),tel=make('input'),save=make('button',w[13]);tel.type='tel';tel.dir='ltr';tel.placeholder='+964…';tel.value=config.phone||'';field.append(tel);save.onclick=async()=>{try{await api('/api/contact',{phone:tel.value.trim()});notice.textContent=w[14]}catch{notice.textContent=w[8]}};panel.append(field,save)}
 panel.append(make('h2',admin?w[9]:w[1]));
 if(admin){roomList=make('select');roomList.setAttribute('aria-label',w[9]);roomList.onchange=()=>{selected=roomList.value;roomState='';log.replaceChildren();input.value='';refresh()};panel.append(roomList)}
 chatBox=make('div');log=make('div');log.id='chatLog';input=make('textarea');input.maxLength=1000;input.placeholder=w[3];input.setAttribute('aria-label',w[3]);send=make('button',w[4]);
 send.onclick=async()=>{const body=input.value.trim();if(!body||pending)return;pending=true;send.disabled=true;notice.textContent=w[16];
 if(lastBody!==body||!messageId){messageId=crypto.randomUUID();lastBody=body}
 try{const rows=await api(path(),{text:body,id:messageId,lang:document.documentElement.lang});input.value='';messageId='';notice.textContent='';drawMessages(rows)}catch{notice.textContent=w[8]}finally{send.disabled=false;pending=false}};
 const composer=make('div');composer.className='chatComposer';composer.append(input,send);input.rows=2;
 input.addEventListener('focus',()=>requestAnimationFrame(keepComposerVisible));
 chatBox.append(log,composer);chatBox.hidden=admin&&!selected;panel.append(chatBox);loaded=true;await refresh()
 }catch{if(current===version)notice.textContent=w[8]}
}
async function showOtherContact(){
 if(admin||location.hash!=='#help')return;
 try{const config=await api('/api/contact');document.getElementById('otherWhatsApp')?.remove();
 if(config.phone){const a=make('a',words()[11]);a.id='otherWhatsApp';a.href='https://wa.me/'+config.phone.slice(1);a.target='_blank';a.rel='noopener noreferrer';a.className='chatAction';document.getElementById('openStoreChat').after(a)}}catch{}
}
window.addEventListener('hashchange',showOtherContact);showOtherContact();
if(admin){admin.addEventListener('toggle',setup);if(new URL(location.href).searchParams.get('chat')==='1'){admin.open=true;requestAnimationFrame(()=>admin.scrollIntoView({block:'start'}))}}window.addEventListener('hashchange',setup);
new MutationObserver(setup).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
setInterval(()=>{if(active()&&!document.hidden){if(loaded)refresh()}},5000);setup();
const frame=document.querySelector('.lookPhotos');
if(frame){const pause=make('button');pause.id='slidePause';pause.type='button';frame.parentElement.append(pause);const media=matchMedia('(prefers-reduced-motion: reduce)');let playing=!media.matches,offset=0;
 function icon(){pause.textContent=playing?'Ⅱ':'▶';pause.setAttribute('aria-label',words()[playing?17:18])}
 pause.onclick=()=>{playing=!playing;icon()};media.addEventListener('change',()=>{playing=!media.matches;icon()});new MutationObserver(icon).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});icon();
 const sets=[0,4,2,5];setInterval(()=>{if(!playing||document.hidden||document.getElementById('home').hidden)return;offset=(offset+1)%sets.length;
 frame.querySelector('img').src='/img/'+sets[offset]+'.webp';if(!media.matches)frame.animate([{opacity:.65,translate:'4px 0'},{opacity:1,translate:'0 0'}],{duration:700,easing:'ease-out'})},4600)}
})();
