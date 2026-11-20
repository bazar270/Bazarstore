-- The existing server-token RLS policy also applies inside both invoker functions.
create function public.bazar_place_order(p_order jsonb) returns text
language plpgsql security invoker set search_path='' as $$
declare
 catalog jsonb; seq jsonb; item jsonb; product jsonb; idx int; qty int;
 lines jsonb := '[]'; code int; oid text := p_order->>'id'; prior jsonb;
 stock_changed boolean := false;
begin
 select payload::jsonb into strict catalog from public.bazar_objects where key='products/catalog-v1.json' for update;
 select payload::jsonb into prior from public.bazar_objects where key='orders/v1/'||oid;
 if found then return prior->>'code'; end if;
 insert into public.bazar_objects(key,payload,etag) values ('order-sequence/v1','{"last":100000}',gen_random_uuid()::text) on conflict do nothing;
 select payload::jsonb into strict seq from public.bazar_objects where key='order-sequence/v1' for update;
 if seq->>'pending' is not null then raise exception 'pending_order'; end if;
 for item in select value from jsonb_array_elements(p_order->'lines') loop
  select value,(ordinality-1)::int into product,idx from jsonb_array_elements(catalog) with ordinality where value->>'id'=item->>'id';
  qty:=(item->>'qty')::int;
  if product is null or qty not between 1 and 99 or product->>'price' <> item->>'price' then raise sqlstate 'PT409' using message='catalog_changed'; end if;
  if product->>'stock' is not null then
   if (product->>'stock')::int < qty then raise sqlstate 'PT409' using message='out_of_stock'; end if;
   catalog:=jsonb_set(catalog,array[idx::text,'stock'],to_jsonb((product->>'stock')::int-qty));
   stock_changed:=true;
  end if;
  lines:=lines||jsonb_build_array(item||jsonb_build_object('cost',product->'cost'));
 end loop;
 code:=(seq->>'last')::int;
 loop
  code:=code+1;
  if code>999999 then raise exception 'sequence exhausted'; end if;
  insert into public.bazar_objects(key,payload,etag) values ('order-codes/v1/'||code,oid,gen_random_uuid()::text) on conflict do nothing;
  exit when found;
 end loop;
 insert into public.bazar_objects(key,payload,etag) values ('orders/v1/'||oid,(p_order||jsonb_build_object('code',code::text,'lines',lines))::text,gen_random_uuid()::text);
 update public.bazar_objects set payload=jsonb_build_object('last',code)::text,etag=gen_random_uuid()::text,uploaded=now() where key='order-sequence/v1';
 if stock_changed then
  update public.bazar_objects set payload=catalog::text,etag=gen_random_uuid()::text,uploaded=now() where key='products/catalog-v1.json';
 end if;
 return code::text;
end $$;

create function public.bazar_sales_report(p_period text) returns jsonb language sql stable security invoker set search_path='' as $$
 with orders as (
 select payload::jsonb as o from public.bazar_objects where key like 'orders/v1/%'
 ), sold as (
 select o from orders where o->>'paidAt' is not null and
 (p_period='all' or ((o->>'paidAt')::timestamptz at time zone 'Asia/Baghdad') >= date_trunc(nullif(p_period,'all'),now() at time zone 'Asia/Baghdad'))
 ), items as (
 select item->>'id' as id,(item->>'qty')::bigint as qty,(item->>'price')::bigint as price,(item->>'cost')::bigint as cost
 from sold cross join lateral jsonb_array_elements(o->'lines') item
 )
 select jsonb_build_object('orders',(select count(*) from sold),'units',coalesce(sum(qty),0),'revenue',coalesce(sum(qty*price),0),
 'profit',coalesce(sum(qty*(price-cost)),0),'unknown',coalesce(sum(qty) filter(where cost is null),0),
 'byProduct',(select coalesce(jsonb_object_agg(id,n),'{}') from (select id,sum(qty) n from items group by id) x)) from items
$$;
revoke all on function public.bazar_place_order(jsonb),public.bazar_sales_report(text) from public, authenticated;
grant execute on function public.bazar_place_order(jsonb),public.bazar_sales_report(text) to anon;
