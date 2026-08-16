drop policy if exists listings_public_read on public.listings;
drop policy if exists listings_owner_write on public.listings;
create policy listings_read on public.listings for select to anon, authenticated
using ((is_active and not is_flagged) or seller_id = (select auth.uid()));
create policy listings_owner_insert on public.listings for insert to authenticated
with check (seller_id = (select auth.uid()));
create policy listings_owner_update on public.listings for update to authenticated
using (seller_id = (select auth.uid())) with check (seller_id = (select auth.uid()));
create policy listings_owner_delete on public.listings for delete to authenticated
using (seller_id = (select auth.uid()));

drop policy if exists services_public_read on public.services;
drop policy if exists services_owner_write on public.services;
create policy services_read on public.services for select to anon, authenticated
using ((is_active and not is_flagged) or provider_id = (select auth.uid()));
create policy services_owner_insert on public.services for insert to authenticated
with check (provider_id = (select auth.uid()));
create policy services_owner_update on public.services for update to authenticated
using (provider_id = (select auth.uid())) with check (provider_id = (select auth.uid()));
create policy services_owner_delete on public.services for delete to authenticated
using (provider_id = (select auth.uid()));

create index if not exists orders_offer_id_idx on public.orders(offer_id);
