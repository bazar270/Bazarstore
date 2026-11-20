const catalogKey='products/catalog-v1.json';
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
async function load(bucket){
 const object=await bucket.get(catalogKey);
 if(!object)return {products:seed,tag:'initial'};
 const products=await object.json();
 for(const p of products){if(p.en===undefined){const sample=seed.find(row=>row.id===p.id&&row.ar===p.ar);p.en=sample?.en||''}}
 return {products,tag:object.etag};
}
function asset(path){
 const file=files[path];if(!file)return new Response('Not found',{status:404});
 return new Response(Uint8Array.from(atob(file[1]),ch=>ch.charCodeAt(0)),{headers:{'Content-Type':file[0]+(file[0].startsWith('text/')?'; charset=utf-8':''),'Cache-Control':'private, no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
}
const validId=id=>typeof id==='string'&&/^(?:[0-7]|[a-f0-9-]{36})$/.test(id);
function validProduct(p){
 return p&&typeof p.ar==='string'&&p.ar.trim().length>0&&p.ar.length<=120&&typeof p.ckb==='string'&&p.ckb.length<=120&&(p.en===undefined||(typeof p.en==='string'&&p.en.length<=120))&&typeof p.details==='string'&&p.details.length<=250&&Number.isSafeInteger(p.price)&&p.price>0&&p.price<=999999999&&Number.isInteger(p.category)&&p.category>=1&&p.category<=10;
}
async function write(request,bucket){
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({},415);
 const limit=1600000;
 if(Number(request.headers.get('content-length'))>limit)return json({},413);
 const reader=request.body?.getReader();if(!reader)return json({},400);
 let size=0;const chunks=[];
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();return json({},413)}chunks.push(value)}
 let p;try{p=JSON.parse(await new Blob(chunks).text())}catch{return json({},400)}
 const validAmount=n=>n==null||(Number.isSafeInteger(n)&&n>=0&&n<=999999999);
 if(!validAmount(p.cost)||!validAmount(p.stock))return json({},400);
 if(!validProduct(p)||!validId(p.id))return json({},400);
 const state=await load(bucket);
 if(p.tag!==state.tag)return json({},409);
 const existing=state.products.find(row=>row.id===p.id);
 const measurements=p.measurements===undefined?existing?.measurements:p.measurements;
 if(measurements!==undefined&&(!measurements||typeof measurements!=='object'||Array.isArray(measurements)||Object.entries(measurements).some(([key,v])=>!measurementKeys.includes(key)||!Number.isFinite(v)||v<0.01||v>99999)))return json({},400);
 const regularPrice=p.regularPrice===undefined?existing?.regularPrice:p.regularPrice;
 if(regularPrice!=null&&(!validAmount(regularPrice)||regularPrice<=p.price))return json({},400);
 let image=existing?.image;
 if(p.photo){
  if(typeof p.photo!=='string'||!p.photo.startsWith('data:image/jpeg;base64,'))return json({},400);
  let bytes;try{bytes=Uint8Array.from(atob(p.photo.slice(23)),c=>c.charCodeAt(0))}catch{return json({},400)}
  if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255||bytes.at(-2)!==255||bytes.at(-1)!==217)return json({},400);
  const sum=await crypto.subtle.digest('SHA-256',bytes);const hash=Array.from(new Uint8Array(sum),b=>b.toString(16).padStart(2,'0')).join('');
  image='/photos/'+hash;await bucket.put(image.slice(1),bytes);
 }
 if(!image)return json({},400);
 const product={measurements,id:p.id,ar:p.ar.trim(),ckb:p.ckb.trim(),en:(p.en??existing?.en??'').trim(),category:p.category,cost:p.cost===undefined?existing?.cost:p.cost,regularPrice,stock:p.stock===undefined?existing?.stock:p.stock,price:p.price,details:p.details.trim(),image};
 const products=existing?state.products.map(row=>row.id===p.id?product:row):[product,...state.products];
 const onlyIf=state.tag==='initial'?{etagDoesNotMatch:'*'}:{etagMatches:state.tag};
 const result=await bucket.put(catalogKey,JSON.stringify(products),{onlyIf});
 return result?json({products,tag:result.etag}):json({},409);
}
export default {async fetch(request,env){
 const {pathname,origin}=new URL(request.url);
 const manager=Boolean(request.headers.get('oai-authenticated-user-id'))&&request.headers.get('oai-authenticated-user-email')?.toLowerCase()===(env.BAZAR_ADMIN_EMAIL || '!disabled!').toLowerCase();
 if((pathname==='/admin'||pathname==='/admin.html')&&!request.headers.get('oai-authenticated-user-id'))return Response.redirect(origin+'/signin-with-chatgpt?return_to='+encodeURIComponent('/admin'+new URL(request.url).search),302);
 if(pathname==='/admin'||pathname==='/admin.html'||pathname==='/api/manage'){
  if(!manager)return new Response('هذه الصفحة مخصصة لصاحب المتجر. افتح الرابط بحساب المالك.',{status:403,headers:{'Content-Type':'text/plain;charset=utf-8','Cache-Control':'no-store'}});
 }
 try{
  const bucket=storeFor(env);
  if(pathname==='/api/backfill' && request.method==='POST' && request.headers.get('Authorization')==='Bearer '+env.BAZAR_SB_TOKEN && env.BAZAR_SB_TOKEN)return json(await bucket.backfill(new URL(request.url).searchParams.get('cursor')));
  if(pathname==='/api/usage'){
   if(request.method==='GET'){
    if(!manager)return json({},403);
    const since=new Date(Date.now()-300000).toISOString();
    const [active,installed]=await Promise.all([bucket.countUsage('usage/active/',since),bucket.countUsage('usage/install/')]);
    return json({active,installed});
   }
   if(request.method!=='POST'||request.headers.get('Origin')!==origin)return json({},403);
   const url=new URL(request.url),id=url.searchParams.get('id'),kind=url.searchParams.get('kind');
   if(!uuid.test(id||'')||!['active','install'].includes(kind))return json({},400);
   await bucket.put('usage/'+kind+'/'+id,'1');
   return json({ok:true});
  }
  if(pathname==='/api/sales'){
   if(!manager)return json({},403);
   if(request.method==='GET'){
    const period=new URL(request.url).searchParams.get('period')||'day';
    if(!['day','week','month','year','all'].includes(period))return json({},400);
    return json(await bucket.rpc('bazar_sales_report',{p_period:period}));
   }
   if(request.method!=='POST'||request.headers.get('Origin')!==origin)return json({},403);
   const id=new URL(request.url).searchParams.get('id');
   if(!uuid.test(id||''))return json({},400);
   const key=orderPrefix+id,obj=await bucket.get(key);
   if(!obj)return json({},404);
   const order=await obj.json();
   if(!order.paidAt){
    order.paidAt=new Date().toISOString();
    if(!await bucket.put(key,JSON.stringify(order),{onlyIf:{etagMatches:obj.etag}}))return json({},409);
   }
   return json({paidAt:order.paidAt});
  }
  if(pathname==='/api/orders')return await orderApi(request,bucket,manager);
  if(['/api/contact','/api/chat','/api/inbox'].includes(pathname))return await contact(request,bucket,manager);
  if(pathname==='/api/manage'&&request.method==='POST'){
   if(request.headers.get('Origin')!==origin)return json({},403);
   return await write(request,bucket)
  }
  if(request.method!=='GET')return json({},405);
  if(pathname==='/api/catalog'){
   const state=await load(bucket);
   if(!manager)state.products=state.products.map(({cost,...product})=>product);
   return json({...state,manager:Boolean(manager)});
  }
  if(/^\/photos\/[a-f0-9]{64}$/.test(pathname)){
   const file=await bucket.get(pathname.slice(1));
   return file?new Response(file.body,{headers:{'Content-Type':'image/jpeg','X-Content-Type-Options':'nosniff','Cache-Control':'private, max-age=86400'}}):json({},404);
  }
  return asset(pathname==='/'?'/index.html':pathname==='/admin'?'/admin.html':pathname);
 }catch{return json({error:'temporarily_unavailable'},503)}
}};
