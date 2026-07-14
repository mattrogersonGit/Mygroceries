# Trolley — household grocery price compare

Vanilla JS PWA (matches the pattern of the finance app: single `index.html`,
no build step, Supabase for auth/data). Compares your shopping list across
Pak'nSave, New World and Woolworths, using whichever store you pick per chain,
and shows savings vs. your default store.

## What's working now
- Supabase schema (households, multi-user login per household, store
  selection, shopping list) — `supabase/schema.sql`
- Auth (sign up / sign in), household auto-created on signup
- Store picker UI, wired to a real `get-store-list` edge function that proxies
  each chain's public store-list API
- Shopping list UI: add item, per-chain price table, delta vs. default store,
  total savings banner
- PWA shell (manifest + service worker, installable / offline app-shell)

## What still needs finishing
**Product price scraping is a stub.** `supabase/functions/scrape-prices/index.ts`
has the orchestration logic (loop over your selected stores + list items,
upsert into `products`, track `price_history`) but the three `fetchXxxPrices()`
functions are placeholders. The store-*list* APIs are documented publicly;
the product-*search* APIs used by other NZ price-compare tools are not, and
are more likely to need a logged-in session or change without notice. To fill
them in:
1. Open the chain's online shopping site, search a product you track (e.g.
   "milk 2l"), open devtools → Network → filter XHR/fetch
2. Find the request returning product JSON (name, price, id)
3. Reproduce that request in the matching `fetchXxxPrices()` function
4. If it needs a login session, you'll need to store a session cookie/token
   as an edge function secret and refresh it periodically — happy to help
   with that once you've found the endpoint shape

Until that's filled in, the app runs fine but shows "no price data yet" for
every item.

## Setup
1. Create a Supabase project. Run `supabase/schema.sql` in the SQL editor.
2. Deploy the two edge functions:
   ```
   supabase functions deploy get-store-list
   supabase functions deploy scrape-prices
   ```
3. In `index.html`, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (top of the
   `<script>` block) to your project's values.
4. Once `scrape-prices` is filled in, schedule it: Supabase dashboard →
   Edge Functions → scrape-prices → add a cron trigger (e.g. `0 15 * * *`
   for a daily refresh — NZ specials typically lock in weekly).
5. Push to GitHub, enable GitHub Pages on the repo (serve from root).
6. Generate real icons for `icons/icon-192.png` / `icons/icon-512.png`
   (placeholders are included so the manifest doesn't 404).

## Adding a second household member
They sign up normally (gets their own household automatically), then in the
Supabase SQL editor:
```sql
update profiles set household_id = '<existing-household-id>' where id = '<new-user-id>';
```
A proper "join by invite code" flow can be added later if this gets annoying.

## Notes
- RLS is on throughout — a household only ever sees its own stores/list.
  `products`/`price_history` are shared/global (no household-specific data in
  them) and only writable by the service role (i.e. the scraper).
- The "any brand vs specific product" flexibility you wanted: right now every
  item is added as a loose category match (whatever you type becomes the
  search term). A "pin to one exact product per chain" mode (`match_type =
  'product'`, using `list_items.linked_products`) is in the schema but not
  wired into the UI yet — worth adding once scraping is live and you can see
  real product names to link against.
