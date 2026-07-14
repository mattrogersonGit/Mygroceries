-- ============================================================
-- Grocery Price Compare — Supabase schema
-- Households share one shopping list + store selection.
-- Run this in the Supabase SQL editor.
-- ============================================================

-- ---------- households & membership ----------

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Household',
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  display_name text,
  created_at timestamptz not null default now()
);

-- Which physical store a household uses per chain, and which chain is "default"
create table household_stores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  chain text not null check (chain in ('paknsave', 'woolworths', 'newworld')),
  store_id text not null,        -- the chain's internal store id/code
  store_label text not null,     -- human readable, e.g. "Pak'nSave Hamilton"
  is_default boolean not null default false,
  unique (household_id, chain)
);

-- ---------- product catalogue (scraped) ----------

-- One row per product-at-a-chain. Prices get overwritten on each refresh;
-- price_history keeps the trail.
create table products (
  id uuid primary key default gen_random_uuid(),
  chain text not null check (chain in ('paknsave', 'woolworths', 'newworld')),
  store_id text not null,               -- ties to household_stores.store_id
  external_id text not null,            -- the chain's own product id
  name text not null,
  brand text,
  size_label text,                      -- e.g. "2L", "500g"
  category_key text,                    -- e.g. "milk-2l-standard", nullable
  price numeric(10,2) not null,
  unit_price text,                      -- e.g. "$4.50 / L" (as displayed by the store)
  image_url text,
  last_seen timestamptz not null default now(),
  unique (chain, store_id, external_id)
);
create index products_category_idx on products (category_key);
create index products_store_idx on products (chain, store_id);

create table price_history (
  id bigint generated always as identity primary key,
  product_id uuid not null references products(id) on delete cascade,
  price numeric(10,2) not null,
  captured_at timestamptz not null default now()
);
create index price_history_product_idx on price_history (product_id, captured_at);

-- ---------- shopping list ----------

create table list_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  label text not null,                        -- what you typed, e.g. "2L milk"
  match_type text not null check (match_type in ('category', 'product')),
  category_key text,                          -- used when match_type = 'category'
  linked_products jsonb,                      -- used when match_type = 'product'
                                               -- shape: {"paknsave": "<products.id>", "woolworths": "...", "newworld": "..."}
  qty int not null default 1,
  checked boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index list_items_household_idx on list_items (household_id);

-- ============================================================
-- Row level security — everything scoped to "my household"
-- ============================================================

alter table households enable row level security;
alter table profiles enable row level security;
alter table household_stores enable row level security;
alter table list_items enable row level security;
-- products / price_history are readable by anyone logged in (no household-specific data in them)
alter table products enable row level security;
alter table price_history enable row level security;

-- security definer is required here: this function is called from inside the
-- RLS policy on `profiles` itself. Without it, evaluating the policy queries
-- profiles, which re-evaluates the policy, which queries profiles again -
-- infinite recursion ("stack depth limit exceeded"). security definer runs
-- this query as the function owner (bypassing RLS), breaking the loop.
create or replace function my_household_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select household_id from profiles where id = auth.uid()
$$;

create policy "read own household" on households
  for select using (id = my_household_id());

create policy "read own profile + household members" on profiles
  for select using (household_id = my_household_id() or id = auth.uid());
create policy "update own profile" on profiles
  for update using (id = auth.uid());
create policy "insert own profile" on profiles
  for insert with check (id = auth.uid());

create policy "manage own household's stores" on household_stores
  for all using (household_id = my_household_id())
  with check (household_id = my_household_id());

create policy "manage own household's list" on list_items
  for all using (household_id = my_household_id())
  with check (household_id = my_household_id());

create policy "anyone logged in can read products" on products
  for select using (auth.role() = 'authenticated');
create policy "anyone logged in can read price history" on price_history
  for select using (auth.role() = 'authenticated');

-- Only the service role (used by the scraper edge function) can write products/prices.
-- No insert/update policy for regular users = blocked by default with RLS on.

-- ============================================================
-- Helper: create a household + profile automatically on signup
-- ============================================================

-- set search_path = public is required: this trigger fires from an insert into
-- auth.users, whose execution context doesn't include the public schema in its
-- search path by default, so the unqualified table names below would otherwise
-- fail to resolve ("Database error saving new user").
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
begin
  insert into households (name) values ('My Household') returning id into new_household_id;
  insert into profiles (id, household_id, display_name)
    values (new.id, new_household_id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- To invite a second household member: they sign up (gets their own household
-- automatically via the trigger above), then run, as an already-authenticated
-- admin action or manually in the SQL editor:
--   update profiles set household_id = '<existing-household-id>' where id = '<new-user-id>';
-- A simple "join household by invite code" UI can be added later if needed.
