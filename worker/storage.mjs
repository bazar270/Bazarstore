// Keep the application's conditional writes atomic via Postgres insert and update predicates.
function storeFor(env) {
 const legacy=env.BUCKET;
 async function rest(method,params,data,prefer) {
  const url=new URL('/rest/v1/bazar_objects',env.BAZAR_SB_URL);
  for(const [key,value] of Object.entries(params))url.searchParams.set(key,value);
  const response=await fetch(url,{method,headers:{apikey:env.BAZAR_SB_KEY,'x-bazar-token':env.BAZAR_SB_TOKEN,'Content-Type':'application/json',Prefer:prefer||'return=representation'},body:data===undefined?undefined:JSON.stringify(data)});
  if(!response.ok)throw new Error('Database request failed '+response.status);
  return response.json();
 }
 function object(row) {
  if(!row)return null;
  const binary=row.key.startsWith('photos/');
  return {etag:row.etag,body:binary?Uint8Array.from(atob(row.payload),c=>c.charCodeAt(0)):row.payload,text:async()=>row.payload,json:async()=>JSON.parse(row.payload)};
 }
 function encode(bytes) {
  let text='';
  for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(text);
 }
 const read=async key=>(await rest('GET',{key:'eq.'+key,limit:'1'}))[0];
 async function importKey(key) {
  let row=await read(key);
  if(row)return row;
  const old=await legacy.get(key);
  if(!old&&key!==catalogKey)return null;
  const payload=old?(key.startsWith('photos/')?encode(new Uint8Array(await old.arrayBuffer())):await old.text()):JSON.stringify(seed);
  const record={key,payload,etag:old?.etag||crypto.randomUUID(),uploaded:old?.uploaded||new Date()};
  const created=await rest('POST',{select:'etag'},record,'resolution=ignore-duplicates,return=representation');
  return created.length?record:await read(key);
 }
 return {
  async countUsage(prefix,since) {
   const url=new URL('/rest/v1/bazar_objects',env.BAZAR_SB_URL);
   url.searchParams.set('select','key');url.searchParams.set('key','like.'+prefix+'*');
   if(since)url.searchParams.set('uploaded','gte.'+since);
   const response=await fetch(url,{method:'HEAD',headers:{apikey:env.BAZAR_SB_KEY,'x-bazar-token':env.BAZAR_SB_TOKEN,Prefer:'count=exact'}});
   const total=response.headers.get('content-range')?.split('/').pop();
   if(!response.ok||!total||!/^\d+$/.test(total))throw Error('Count unavailable');
   return Number(total);
  },
  async rpc(name,params) {
   const response=await fetch(new URL('/rest/v1/rpc/'+name,env.BAZAR_SB_URL),{method:'POST',headers:{apikey:env.BAZAR_SB_KEY,'x-bazar-token':env.BAZAR_SB_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(params)});
   if(!response.ok){const error=new Error('Database operation failed');error.status=response.status;throw error}
   return response.json();
  },
  get:async key=>object(await importKey(key)),
  async put(key,value,options={}) {
   const row={key,payload:typeof value==='string'?value:encode(value),etag:crypto.randomUUID(),uploaded:new Date()};
   const match=options.onlyIf;
   if(match?.etagDoesNotMatch&&await importKey(key))return null;
   const rows=match?.etagMatches
    ? await rest('PATCH',{key:'eq.'+key,etag:'eq.'+match.etagMatches,select:'etag'},row)
    : await rest('POST',{select:'etag'},row,'resolution='+(match?.etagDoesNotMatch?'ignore':'merge')+'-duplicates,return=representation');
   return rows[0]||null;
  },
  async list({prefix,cursor}) {
   // Include legacy keys even before the backfill finishes.
   const page=new Map();
   let offset;
   do {
    const old=await legacy.list({prefix,cursor:offset});
    for(const item of old.objects)if(!cursor||item.key>cursor)page.set(item.key,item);
    offset=old.truncated?old.cursor:null;
   }while(offset);
   const params={select:'key,uploaded',key:'like.'+prefix+'*',order:'key.asc',limit:'101'};
   if(cursor)params.and='(key.gt.'+cursor+')';
   for(const item of await rest('GET',params))page.set(item.key,item);
   const objects=[...page.values()].sort((a,b)=>a.key<b.key?-1:1).slice(0,100);
   return {objects,truncated:page.size>100,cursor:objects.at(-1)?.key};
  },
  async backfill(cursor) {
   const page=await legacy.list({cursor:cursor||undefined,limit:12});
   for(const entry of page.objects)await importKey(entry.key);
   await importKey(catalogKey);
   return {count:page.objects.length,next:page.truncated?page.cursor:null};
  }
 };
}
