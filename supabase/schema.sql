-- ============================================================
-- Grocery Price Compare — Supabase schema
-- Households share one shopping list + store selection.
-- Run this in the Supabase SQL editor.
-- ============================================================

-- ---------- households & membership ----------

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Household',
  invite_code text unique not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
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

-- ---------- shopping lists ----------

-- A household can have several lists at once (e.g. an ongoing "Essentials"
-- list alongside a one-off dated list) - not a single ambient list.
create table shopping_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  list_date date,                 -- optional; a reusable template like "Essentials" may not need one
  status text not null default 'active' check (status in ('active', 'completed')),
  completed_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index shopping_lists_household_idx on shopping_lists (household_id);

create table list_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  list_id uuid not null references shopping_lists(id) on delete cascade,
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
create index list_items_list_idx on list_items (list_id);

-- A household's real, editable list of aisle/spend categories - name + icon.
-- Every household starts with a seeded copy of Pak'nSave's own category list
-- (see seed_default_categories() below), fully add/deletable afterwards.
create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  icon text not null default '🛒',
  created_at timestamptz not null default now(),
  unique (household_id, name)
);
create index categories_household_idx on categories (household_id);

-- Household-defined keyword -> category mappings, checked before the
-- built-in keyword guesses in index.html's ITEM_GROUP_RULES (e.g. "margarine"
-- isn't recognised as dairy by the built-in rules, so a household can add one
-- here instead of waiting for a code change). category_id is nullable +
-- on delete set null: deleting a category orphans any rules pointing at it
-- rather than deleting the rules outright, which just reverts those items to
-- auto-classification instead of silently losing the override entirely.
create table item_category_rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  keyword text not null,   -- case-insensitive substring match against the item's label
  category_id uuid references categories(id) on delete set null,
  created_at timestamptz not null default now()
);
create index item_category_rules_household_idx on item_category_rules (household_id);

-- ---------- receipts (photo/PDF scans, kept separate from scraped products) ----------

-- Free-text OCR from a receipt has no stable retailer product id to match
-- against the scraper's `products` table, so receipts get their own tables
-- rather than being merged in - avoids silently polluting price_history with
-- AI-misread prices.
create table receipts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  list_id uuid references shopping_lists(id) on delete set null,
  chain text,                     -- free text, not constrained to the scraper's 3 chains
  store_label text,
  receipt_date date,
  total numeric(10,2),
  image_path text not null,       -- Supabase Storage object path
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed')),
  raw_ai_response jsonb,          -- kept for debugging/reprocessing if extraction was poor
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index receipts_household_idx on receipts (household_id);

create table receipt_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,  -- denormalized, same pattern as list_items
  receipt_id uuid not null references receipts(id) on delete cascade,
  label text not null,
  price numeric(10,2) not null,
  matched_list_item_id uuid references list_items(id) on delete set null,
  created_at timestamptz not null default now()
);
create index receipt_items_receipt_idx on receipt_items (receipt_id);

-- ============================================================
-- Row level security — everything scoped to "my household"
-- ============================================================

alter table households enable row level security;
alter table profiles enable row level security;
alter table household_stores enable row level security;
alter table shopping_lists enable row level security;
alter table list_items enable row level security;
alter table categories enable row level security;
alter table item_category_rules enable row level security;
alter table receipts enable row level security;
alter table receipt_items enable row level security;
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
create policy "update own household" on households
  for update using (id = my_household_id())
  with check (id = my_household_id());

create policy "read own profile + household members" on profiles
  for select using (household_id = my_household_id() or id = auth.uid());
create policy "update own profile" on profiles
  for update using (id = auth.uid());
create policy "insert own profile" on profiles
  for insert with check (id = auth.uid());

create policy "manage own household's stores" on household_stores
  for all using (household_id = my_household_id())
  with check (household_id = my_household_id());

create policy "manage own household's lists" on shopping_lists
  for all using (household_id = my_household_id())
  with check (household_id = my_household_id());

create policy "manage own household's list" on list_items
  for all using (household_id = my_household_id())
  with check (household_id = my_household_id());

create policy "manage own household's categories" on categories
  for all using (household_id = my_household_id())
  with check (household_id = my_household_id());

create policy "manage own household's category rules" on item_category_rules
  for all using (household_id = my_household_id())
  with check (household_id = my_household_id());

create policy "manage own household's receipts" on receipts
  for all using (household_id = my_household_id())
  with check (household_id = my_household_id());

create policy "manage own household's receipt items" on receipt_items
  for all using (household_id = my_household_id())
  with check (household_id = my_household_id());

-- ============================================================
-- Storage — receipts bucket (private, household-scoped by path)
-- ============================================================

-- Uploaded images/PDFs are stored at "<household_id>/<receipt id>.<ext>" so
-- the household id embedded in the object path can be checked against
-- my_household_id() without a second table lookup. Bucket itself is created
-- as private via the Supabase dashboard (Storage > New bucket, "Public" off);
-- these policies are what actually enforce per-household access on top of that.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "household can manage own receipt files" on storage.objects
  for all using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = my_household_id()::text
  )
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = my_household_id()::text
  );

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

-- ============================================================
-- Seed every new household with a starting category list
-- (Pak'nSave's own category list, minus "Featured" which is a merchandising
-- tag, not something an item is ever actually filed under)
-- ============================================================

create or replace function seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into categories (household_id, name, icon) values
    (new.id, 'Fruit & Vegetables', '🍎'),
    (new.id, 'Meat, Poultry & Seafood', '🥩'),
    (new.id, 'Fridge, Deli & Eggs', '🥛'),
    (new.id, 'Bakery', '🍞'),
    (new.id, 'Frozen', '🧊'),
    (new.id, 'Pantry', '🍚'),
    (new.id, 'Hot & Cold Drinks', '☕'),
    (new.id, 'Beer, Wine & Cider', '🍷'),
    (new.id, 'Health & Body', '🧴'),
    (new.id, 'Baby & Toddler', '🍼'),
    (new.id, 'Pets', '🐾'),
    (new.id, 'Household & Cleaning', '🧼'),
    (new.id, 'Snacks, Treats & Easy Meals', '🍫'),
    (new.id, 'Other', '🛒');
  return new;
end;
$$;

create trigger on_household_created_seed_categories
  after insert on households
  for each row execute function seed_default_categories();

-- ============================================================
-- Join an existing household by invite code
-- ============================================================

-- security definer so the code lookup isn't limited by the "read own
-- household" RLS policy (a user has to be able to look up a household they
-- aren't in yet, by code, in order to join it). Only ever changes the
-- CALLING user's own household_id (auth.uid()), never an arbitrary id passed
-- in - that's what keeps this safe to expose to any authenticated user.
--
-- Known simplification: the "update own profile" policy below still allows
-- a user to set their own household_id directly via a plain update (not just
-- through this function) if they already know a target household's id -
-- there's no column-level lock forcing the code check. Acceptable for a
-- personal/family app where household ids aren't discoverable through the
-- UI; would need tightening (e.g. revoking direct household_id updates) for
-- a more adversarial multi-tenant setting.
create or replace function join_household(invite_code_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household_id uuid;
begin
  select id into target_household_id from households where invite_code = upper(trim(invite_code_input));
  if target_household_id is null then
    raise exception 'Invalid invite code';
  end if;
  update profiles set household_id = target_household_id where id = auth.uid();
  return target_household_id;
end;
$$;

grant execute on function join_household(text) to authenticated;

-- To invite a second household member: they sign up (gets their own
-- household automatically via the trigger above), then in the app's Settings
-- tab, enter your household's invite code (shown in your own Settings tab)
-- to switch into your household - see join_household() above.
