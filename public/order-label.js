function labelWords(lang){return ({
 en:{label:'Print label',print:'Print',close:'Close',size:'Label size',pieces:'pieces'},
 ar:{label:'طباعة الملصق',print:'طباعة',close:'إغلاق',size:'قياس الملصق',pieces:'قطعة'},
 ckb:{label:'چاپی لیبڵ',print:'چاپکردن',close:'داخستن',size:'قەبارەی لیبڵ',pieces:'پارچە'}
})[lang]||labelWords('ar')}
function orderQR(code){
 const url=new URL('/admin',location.origin);url.searchParams.set('order',code);
 const qr=new LabelQR(-1,0);qr.addData(url.href);qr.make();
 const n=qr.getModuleCount(),ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
 svg.setAttribute('viewBox','0 0 '+(n+8)+' '+(n+8));svg.setAttribute('shape-rendering','crispEdges');svg.setAttribute('aria-label','QR '+code);
 const modules=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))modules.push('M'+(x+4)+' '+(y+4)+'h1v1h-1z');
 path.setAttribute('d',modules.join(''));svg.append(path);return svg
}
function receiptAmounts(order,lang){
 const labels={
  ckb:['کۆی نرخی کاڵاکان','کرێی گەیاندن','کۆی گشتی بۆ وەرگرتن','دینار'],
  ar:['مجموع أسعار السلع','أجرة التوصيل','الإجمالي عند الاستلام','د.ع'],
  en:['Items subtotal','Delivery fee','Total due on delivery','IQD']
 }[lang];
 const fmt=n=>n.toLocaleString(lang==='ckb'?'ar-IQ-u-nu-arabext':lang==='ar'?'ar-IQ':'en-IQ')+' '+labels[3];
 const block=document.createElement('div');block.className='receiptAmounts';
 [order.subtotal,order.delivery,order.total].forEach((amount,i)=>{
  const row=document.createElement(i===2?'strong':'div');
  const title=document.createElement('span'),value=document.createElement('bdi');
  title.textContent=labels[i];value.textContent=fmt(amount);row.append(title,value);block.append(row)
 });
 return {block,fmt}
}
function previewLabel(order,lang){
 const w=labelWords(lang),dialog=document.createElement('dialog');dialog.className='labelDialog';
 const labels=({ckb:['وەرگر','مۆبایل','شوێن','ناونیشان'],ar:['المستلم','الهاتف','الموقع','العنوان'],en:['Recipient','Phone','Location','Address']})[lang]||['Recipient','Phone','Location','Address'];
 const region=iraqRegions.find(r=>r[0]===order.region);
 const pages=document.createElement('div');pages.className='labelPages';
 function layout(){
  pages.replaceChildren();
  function sheet(){
   const page=document.createElement('section');page.className='sticker';
   pages.append(page);return page
  }
  let page=sheet();
  const fits=()=>page.scrollHeight<=page.clientHeight;
  function field(title,value,ltr=false,kind='courierField'){
   if(!value)return;
   const words=(title?title+' · '+value:value).trim().split(/\s+/u);
   let row;
   function newRow(){row=document.createElement('div');row.className=kind;if(ltr)row.dir='ltr';page.append(row)}
   newRow();
   for(let i=0;i<words.length;i++){
    const word=words[i],prior=row.textContent;
    row.textContent=prior?prior+' '+word:word;
    if(fits())continue;
    row.textContent=prior;
    if(!prior)row.remove();
    if(!prior&&page.children.length===0){
     // Very long unbroken input: fill as many characters as fit on this sheet.
     newRow();const chars=Array.from(word);let used=0;
     while(used<chars.length){row.textContent+=chars[used];if(!fits()){row.textContent=chars.slice(0,used).join('');break}used++}
     if(used<chars.length)words[i]=chars.slice(Math.max(used,1)).join('');else continue
    }
    page=sheet();newRow();i--
   }
  }
  const {block,fmt}=receiptAmounts(order,lang);
  for(const item of order.lines){
   field('',(item[lang]||item.ar)+' · '+fmt(item.price)+' × '+item.qty,false,'productLine')
  }
  const qr=orderQR(order.code);qr.classList.add('labelQR');page.append(qr);
  if(!fits()){qr.remove();page=sheet();page.append(qr)}
  field('',({ckb:'بازاڕ',ar:'بازار',en:'Bazar'}[lang]+' #')+order.code,true,'orderNumber');
  field(labels[0],order.customer);field(labels[1],order.phone,true);
  field(labels[2],[region&&regionLabel(region,lang),order.city].filter(Boolean).join(' · '));field(labels[3],order.address);
  page.append(block);
  if(!fits()){block.remove();page=sheet();page.append(block)}
  // Identify every continuation sheet without displacing the product heading.
  for(const label of pages.children){label.dataset.code='#'+order.code}

 }
 const controls=document.createElement('div');controls.className='labelControls';
 const label=document.createElement('label');label.textContent=w.size+' ';const select=document.createElement('select');
 for(const size of ['50 × 30','60 × 40'])select.add(new Option(size+' mm',size.slice(0,2)));
 let saved;try{saved=localStorage.getItem('bazar.labelSize')}catch{}select.value=saved==='60'?'60':'50';
 function resize(){dialog.dataset.width=select.value;if(dialog.open)layout();try{localStorage.setItem('bazar.labelSize',select.value)}catch{}}
 resize();select.onchange=resize;label.append(select);controls.append(label);
 for(const [text,action] of [[w.print,()=>window.print()],[w.close,()=>dialog.close()]]){const b=document.createElement('button');b.textContent=text;b.onclick=action;controls.append(b)}
 dialog.append(pages,controls);document.body.append(dialog);dialog.onclose=()=>dialog.remove();dialog.showModal();layout()
}
