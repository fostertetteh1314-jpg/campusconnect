create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

alter default privileges for role postgres in schema public revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke usage, select on sequences from anon, authenticated;

create type public.user_role as enum ('user', 'admin');
create type public.subject_type as enum ('listing', 'service');
create type public.order_status as enum ('pending_payment', 'paid', 'accepted', 'fulfilled', 'completed', 'disputed', 'cancelled', 'refund_pending', 'refunded');
create type public.withdrawal_status as enum ('requested', 'processing', 'paid', 'failed', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  email text not null,
  department text not null default '', level text not null default '',
  phone text not null default '', phone_verified_at timestamptz,
  campus text not null default 'UCC', profile_image text not null default '',
  role public.user_role not null default 'user', is_banned boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index profiles_phone_unique on public.profiles(phone) where phone <> '';

create table public.listings (
  id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id),
  title text not null, description text not null, price_minor bigint not null check (price_minor >= 0),
  quantity integer not null default 1 check (quantity >= 0), category text not null, condition text not null,
  images text[] not null default '{}', contact_number text not null, is_active boolean not null default true,
  is_flagged boolean not null default false, campus text not null default 'UCC', location text not null default '',
  fulfilment_methods text[] not null default '{campus_pickup,public_meetup}', lifecycle_status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index listings_seller_created_idx on public.listings(seller_id, created_at desc);
create index listings_search_idx on public.listings using gin (to_tsvector('english', title || ' ' || description));

create table public.services (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.profiles(id),
  title text not null, description text not null, price_minor bigint not null check (price_minor >= 0), category text not null,
  images text[] not null default '{}', contact_number text not null, is_active boolean not null default true,
  is_flagged boolean not null default false, campus text not null default 'UCC', location text not null default '',
  fulfilment_methods text[] not null default '{public_meetup,digital}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index services_provider_created_idx on public.services(provider_id, created_at desc);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, listing_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(), context_type text not null default 'general', context_id uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz, primary key (conversation_id, user_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id), body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_conversation_created_idx on public.messages(conversation_id, created_at);

create table public.offers (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  created_by uuid not null references public.profiles(id), recipient_id uuid not null references public.profiles(id),
  subject_type public.subject_type not null, subject_id uuid not null, amount_minor bigint not null check (amount_minor > 0),
  note text not null default '', status text not null default 'pending', expires_at timestamptz not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique,
  buyer_id uuid not null references public.profiles(id), seller_id uuid not null references public.profiles(id),
  subject_type public.subject_type not null, subject_id uuid not null, offer_id uuid references public.offers(id),
  inventory_reserved boolean not null default false, snapshot jsonb not null,
  item_amount_minor bigint not null check (item_amount_minor > 0), platform_fee_minor bigint not null check (platform_fee_minor >= 0),
  total_minor bigint not null check (total_minor = item_amount_minor + platform_fee_minor), currency text not null default 'GHS' check (currency = 'GHS'),
  fulfilment_method text not null, status public.order_status not null default 'pending_payment', transitions jsonb not null default '[]',
  paid_at timestamptz, accepted_at timestamptz, fulfilled_at timestamptz, completed_at timestamptz, cancelled_at timestamptz,
  payment jsonb not null default '{}', refund jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index orders_buyer_created_idx on public.orders(buyer_id, created_at desc);
create index orders_seller_created_idx on public.orders(seller_id, created_at desc);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(), provider text not null check (provider = 'moolre'), event_key text not null unique,
  reference text not null, event_type text not null, order_id uuid references public.orders(id), withdrawal_id uuid,
  amount_minor bigint not null check (amount_minor >= 0), currency text not null default 'GHS', provider_status text not null,
  payload_hash text not null, raw_payload jsonb not null default '{}', processed_at timestamptz not null default now()
);

create table public.wallet_accounts (
  seller_id uuid primary key references public.profiles(id), currency text not null default 'GHS',
  available_minor bigint not null default 0 check (available_minor >= 0), pending_withdrawal_minor bigint not null default 0 check (pending_withdrawal_minor >= 0),
  updated_at timestamptz not null default now()
);
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id), amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'GHS', destination jsonb not null, status public.withdrawal_status not null default 'requested',
  idempotency_key text not null unique, reviewed_by uuid references public.profiles(id), reviewed_at timestamptz,
  failure_reason text not null default '', transfer_reference text unique, transfer_code text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.payment_events add constraint payment_events_withdrawal_fk foreign key (withdrawal_id) references public.withdrawals(id);

create table public.ledger_transactions (
  id uuid primary key default gen_random_uuid(), idempotency_key text not null unique, kind text not null,
  order_id uuid references public.orders(id), withdrawal_id uuid references public.withdrawals(id), metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.ledger_entries (
  id bigint generated always as identity primary key, transaction_id uuid not null references public.ledger_transactions(id) on delete restrict,
  account text not null, debit_minor bigint not null default 0 check (debit_minor >= 0), credit_minor bigint not null default 0 check (credit_minor >= 0),
  check ((debit_minor > 0 and credit_minor = 0) or (credit_minor > 0 and debit_minor = 0))
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id),
  reviewer_id uuid not null references public.profiles(id), reviewee_id uuid not null references public.profiles(id),
  rating integer not null check (rating between 1 and 5), comment text not null default '', created_at timestamptz not null default now()
);
create table public.disputes (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id), opened_by uuid not null references public.profiles(id),
  reason text not null, evidence jsonb not null default '[]', status text not null default 'open', resolution_note text not null default '',
  resolved_by uuid references public.profiles(id), resolved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.phone_verifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, phone text not null,
  code_hash text not null, attempts integer not null default 0 check (attempts between 0 and 5), expires_at timestamptz not null,
  consumed_at timestamptz, created_at timestamptz not null default now()
);
create index phone_verifications_user_created_idx on public.phone_verifications(user_id, created_at desc);
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references public.profiles(id), action text not null,
  target_type text not null, target_id text not null, request_id text, ip_hash text, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

create function private.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, name, email, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), new.email, coalesce(new.raw_user_meta_data ->> 'phone', ''));
  return new;
end; $$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.services enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.offers enable row level security;
alter table public.orders enable row level security;
alter table public.payment_events enable row level security;
alter table public.wallet_accounts enable row level security;
alter table public.withdrawals enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.reviews enable row level security;
alter table public.disputes enable row level security;
alter table public.phone_verifications enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_self_read on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_self_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy listings_public_read on public.listings for select using (is_active and not is_flagged or seller_id = auth.uid());
create policy listings_owner_write on public.listings for all using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy services_public_read on public.services for select using (is_active and not is_flagged or provider_id = auth.uid());
create policy services_owner_write on public.services for all using (provider_id = auth.uid()) with check (provider_id = auth.uid());
create policy favorites_owner on public.favorites for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create function private.is_conversation_member(check_conversation_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.conversation_participants where conversation_id = check_conversation_id and user_id = (select auth.uid()));
$$;
revoke all on function private.is_conversation_member(uuid) from public, anon, authenticated;
create policy conversation_member_read on public.conversations for select to authenticated using ((select private.is_conversation_member(id)));
create policy participant_member_read on public.conversation_participants for select to authenticated using ((select private.is_conversation_member(conversation_id)));
create policy message_member_read on public.messages for select to authenticated using ((select private.is_conversation_member(conversation_id)));
create policy message_member_insert on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and (select private.is_conversation_member(conversation_id)));
create policy offers_participant_read on public.offers for select to authenticated using (created_by = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy orders_participant_read on public.orders for select to authenticated using (buyer_id = (select auth.uid()) or seller_id = (select auth.uid()));
create policy wallets_owner_read on public.wallet_accounts for select to authenticated using (seller_id = (select auth.uid()));
create policy withdrawals_owner_read on public.withdrawals for select to authenticated using (seller_id = (select auth.uid()));
create policy reviews_public_read on public.reviews for select using (true);
create policy disputes_participant_read on public.disputes for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id = (select auth.uid()) or o.seller_id = (select auth.uid()))));

revoke all on public.payment_events, public.ledger_transactions, public.ledger_entries, public.phone_verifications, public.audit_logs from anon, authenticated;
revoke update on public.profiles from authenticated;
grant update (name, department, level, phone, campus, profile_image, updated_at) on public.profiles to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

create index favorites_listing_id_idx on public.favorites(listing_id);
create index conversation_participants_user_id_idx on public.conversation_participants(user_id);
create index messages_sender_id_idx on public.messages(sender_id);
create index offers_conversation_id_idx on public.offers(conversation_id);
create index offers_created_by_idx on public.offers(created_by);
create index offers_recipient_id_idx on public.offers(recipient_id);
create index payment_events_order_id_idx on public.payment_events(order_id);
create index payment_events_withdrawal_id_idx on public.payment_events(withdrawal_id);
create index withdrawals_seller_created_idx on public.withdrawals(seller_id, created_at desc);
create index withdrawals_reviewed_by_idx on public.withdrawals(reviewed_by);
create index ledger_transactions_order_id_idx on public.ledger_transactions(order_id);
create index ledger_transactions_withdrawal_id_idx on public.ledger_transactions(withdrawal_id);
create index ledger_entries_transaction_id_idx on public.ledger_entries(transaction_id);
create index reviews_reviewer_id_idx on public.reviews(reviewer_id);
create index reviews_reviewee_id_idx on public.reviews(reviewee_id);
create index disputes_opened_by_idx on public.disputes(opened_by);
create index disputes_resolved_by_idx on public.disputes(resolved_by);
create index audit_logs_actor_id_idx on public.audit_logs(actor_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marketplace-images', 'marketplace-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy marketplace_images_public_read on storage.objects for select using (bucket_id = 'marketplace-images');
create policy marketplace_images_owner_insert on storage.objects for insert to authenticated with check (bucket_id = 'marketplace-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy marketplace_images_owner_update on storage.objects for update to authenticated using (bucket_id = 'marketplace-images' and owner_id = auth.uid()::text) with check (bucket_id = 'marketplace-images' and owner_id = auth.uid()::text);
create policy marketplace_images_owner_delete on storage.objects for delete to authenticated using (bucket_id = 'marketplace-images' and owner_id = auth.uid()::text);
