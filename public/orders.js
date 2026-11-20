(()=>{
 const el=id=>document.getElementById(id);
 const words={en:['Incoming orders','No orders yet','Delivery','Total','Load more','Could not load orders.'],ar:['الطلبات الواردة','لا توجد طلبات بعد','التوصيل','المجموع','عرض المزيد','تعذّر تحميل الطلبات.'],ckb:['داواکارییە نوێکان','هێشتا داواکاری نییە','گەیاندن','کۆی گشتی','زیاتر ببینە','داواکارییەکان بار نەکران.']};
 const scanned=new URL(location.href).searchParams.get("order");
 let limit=25,loading=false;
 function line(parent,tag,text){const n=document.createElement(tag);n.textContent=text;parent.append(n)}
 async function refresh(){
 const panel=el('orderPanel'),lang=document.documentElement.lang,w=words[lang]||words.ar;
 el('orderHeading').textContent=w[0];if(loading||panel.hidden||document.hidden)return;loading=true;
 try{
 const all=new Map();let count=0;
 for(let offset=0;offset<limit;offset+=25){const r=await fetch(scanned?'/api/orders?code='+encodeURIComponent(scanned):'/api/orders?offset='+offset,{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();count=data.count;for(const row of data.rows)all.set(row.id,row);if(offset+25>=count)break}
 const box=el('orderRows');box.replaceChildren();el('orderHeading').textContent=w[0]+' ('+count+')';if(!count)line(box,'p',w[1]);
 const fmt=n=>n.toLocaleString(lang)+' '+({en:'IQD',ar:'د.ع',ckb:'دینار'}[lang]);
 for(const o of all.values()){const block=document.createElement('article');line(block,'strong',o.customer+' · '+new Date(o.created).toLocaleString(lang,{timeZone:'Asia/Baghdad'}));line(block,'b','#'+o.code);const region=iraqRegions.find(v=>v[0]===o.region);line(block,'p',[o.phone,region&&regionLabel(region,lang),o.city,o.address].filter(Boolean).join(' · '));
 const items=document.createElement("ul");block.append(items);
 for(const item of o.lines)line(items,'li',(item[lang]||item.ar)+' × '+item.qty+' · '+fmt(item.price*item.qty));
 line(block,'p',w[2]+' · '+fmt(o.delivery));line(block,'b',w[3]+' · '+fmt(o.total));const print=document.createElement('button');print.textContent=labelWords(lang).label;print.onclick=()=>previewLabel(o,lang);block.append(print);
 const paid=document.createElement('button');paid.textContent=salesWords()[o.paidAt?20:19];paid.disabled=Boolean(o.paidAt);
 paid.onclick=async()=>{paid.disabled=true;try{const r=await fetch('/api/sales?id='+encodeURIComponent(o.id),{method:'POST'});if(!r.ok)throw Error();paid.textContent=salesWords()[20];refreshSales()}catch{paid.disabled=false;line(block,'p',w[5])}};
 block.append(paid);box.append(block)}
 if(scanned){const back=document.createElement('a');back.href='/admin';back.textContent=w[0];box.append(back)}
 el('moreOrders').textContent=w[4];el('moreOrders').hidden=count<=limit
 }catch{el('orderHeading').textContent=w[0]+' · '+w[5]}finally{loading=false}
 }
 el('moreOrders').onclick=()=>{limit+=25;refresh()};const toggle=el('ordersToggle'), panel=el('orderPanel');
 function showOrders(open){
   panel.hidden=!open;
   toggle.setAttribute('aria-expanded',String(open));
   refresh();
 }
 toggle.onclick=()=>showOrders(panel.hidden);
 if(scanned)showOrders(true);
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});refresh();setInterval(refresh,15000)
})();
