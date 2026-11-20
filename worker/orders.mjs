const orderPrefix='orders/v1/';
const deliveryCost=5000;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function legacyOrderCode(bucket,id){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id));
 const start=new DataView(digest).getUint32(0)%900000;
 for(let step=0;step<900000;step++){
  const code=String(100000+(start+step)%900000),key='order-codes/v1/'+code;
  let reservation=await bucket.get(key);
  if(!reservation){
   if(await bucket.put(key,id,{onlyIf:{etagDoesNotMatch:'*'}}))return code;
   reservation=await bucket.get(key);
  }
  if(reservation&&await reservation.text()===id)return code
 }
 throw Error('Order number capacity reached')
}
// A pending order makes a partially completed allocation recoverable by the next writer.
const sequenceKey='order-sequence/v1';
async function storeNumberedOrder(bucket,order){
 for(let attempt=0;attempt<48;attempt++){
  const stateObject=await bucket.get(sequenceKey);
  const state=stateObject?await stateObject.json():{last:100000};
  const match=stateObject?{etagMatches:stateObject.etag}:{etagDoesNotMatch:'*'};
  const saved=await bucket.get(orderPrefix+order.id);
  if(saved){const row=await saved.json();return row.code||await legacyOrderCode(bucket,order.id)}
  if(!state.pending){
   if(state.last>=999999)throw Error('Six-digit sequence exhausted');
   await bucket.put(sequenceKey,JSON.stringify({last:state.last,pending:order}),{onlyIf:match});
   continue
  }
  const pending=state.pending,code=String(state.last+1),key='order-codes/v1/'+code;
  let owner=await bucket.get(key);
  if(!owner){
   await bucket.put(key,pending.id,{onlyIf:{etagDoesNotMatch:'*'}});
   owner=await bucket.get(key);
  }
  if(!owner)continue;
  if(await owner.text()===pending.id){
   await bucket.put(orderPrefix+pending.id,JSON.stringify({...pending,code}),{onlyIf:{etagDoesNotMatch:'*'}});
   await bucket.put(sequenceKey,JSON.stringify({last:Number(code)}),{onlyIf:match});
   if(pending.id===order.id)return code
  }else{
   // A previously issued reference occupies this number. Preserve the owner's label.
   const last=Number(code);
   if(last>=999999)throw Error('Six-digit sequence exhausted');
   await bucket.put(sequenceKey,JSON.stringify({last,pending}),{onlyIf:match})
  }
 }
 throw Error('Sequence is busy; retry the same order')
}
async function orderApi(request,bucket,manager){
 if(request.method==='GET'){
  const legacyId=request.headers.get('X-Order-Reference');
  if(legacyId){
   if(!uuid.test(legacyId))return json({},404);
   const saved=await bucket.get(orderPrefix+legacyId);
   if(!saved)return json({},404);
   return json({code:(await saved.json()).code||await legacyOrderCode(bucket,legacyId)})
  }
  if(!manager)return json({},403);
  const code=new URL(request.url).searchParams.get('code');
  if(code!==null){
   if(!/^[1-9]\d{5}$/.test(code))return json({},404);
   const key=await bucket.get('order-codes/v1/'+code);
   const record=key&&await bucket.get(orderPrefix+await key.text());
   if(!record)return json({rows:[],count:0});
   return json({rows:[{...await record.json(),code}],count:1})
  }
  const keys=[];let cursor;
  do{const page=await bucket.list({prefix:orderPrefix,cursor});keys.push(...page.objects);cursor=page.truncated?page.cursor:null}while(cursor);
  keys.sort((a,b)=>new Date(b.uploaded)-new Date(a.uploaded));
  const offset=Math.max(0,Number.parseInt(new URL(request.url).searchParams.get('offset'),10)||0);
  const rows=await Promise.all(keys.slice(offset,offset+25).map(async o=>{const row=await(await bucket.get(o.key)).json();row.code||=await legacyOrderCode(bucket,row.id);return row}));
  return json({rows,count:keys.length})
 }
 if(request.method!=='POST')return json({},405);
 if(request.headers.get('origin')!==new URL(request.url).origin||!request.headers.get('content-type')?.startsWith('application/json'))return json({},403);
 const len=Number(request.headers.get('content-length'));if(!len||len>24000)return json({},413);
 let p;try{p=await request.json()}catch{return json({},400)}
 if(!p||!uuid.test(p.id)||typeof p.customer!=='string'||typeof p.address!=='string'||typeof p.phone!=='string')return json({},400);
 const customer=p.customer.trim(),address=p.address.trim(),phone=iraqiMobile(p.phone);
 if(customer.length<2||customer.length>80||address.length<5||address.length>400||!phone||!Array.isArray(p.items)||!p.items.length||p.items.length>100)return json({},400);
 const key=orderPrefix+p.id;
 const previous=await bucket.get(key);
 if(previous)return json({id:p.id,code:(await previous.json()).code||await legacyOrderCode(bucket,p.id)});
 if(!iraqRegions.some(row=>row[0]===p.region)||!validCity(p.city))return json({error:'delivery_address'},400);
 const catalog=(await load(bucket)).products;
 const lines=[],seen=new Set();
 for(const line of p.items){
  if(!line||seen.has(line.id)||!Number.isInteger(line.qty)||line.qty<1||line.qty>99)return json({},400);
  const product=catalog.find(v=>v.id===line.id);
  if(!product||product.price!==line.price)return json({error:'catalog_changed'},409);
  seen.add(line.id);lines.push({id:line.id,qty:line.qty,price:product.price,ar:product.ar,ckb:product.ckb,en:product.en})
 }
 const subtotal=lines.reduce((sum,v)=>sum+v.price*v.qty,0);
 const order={id:p.id,created:new Date().toISOString(),customer,region:p.region,city:p.city.trim(),address,phone,lines,subtotal,delivery:deliveryCost,total:subtotal+deliveryCost};
 const seq=await bucket.get(sequenceKey);
 const pending=seq&&(await seq.json()).pending;
 if(pending)await storeNumberedOrder(bucket,pending);
 let code;
 try{code=await bucket.rpc('bazar_place_order',{p_order:order})}
 catch(err){if(err.status===409)return json({error:'catalog_changed'},409);throw err}
 return json({id:p.id,code},201)
}
