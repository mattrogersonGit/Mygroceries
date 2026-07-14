# Trolley — household grocery price compare

Vanilla JS PWA (matches the pattern of the finance app: single `index.html`,
no build step, Supabase for auth/data). Compares your shopping list across
Pak'nSave, New World and Woolworths, using whichever store you pick per chain,
and shows savings vs. your default store.

## What's working now
- Supabase schema (households, multi-user login per household, store
  selection, shopping list) — `supabase/schema.sql`
- Auth (sign up / sign in), household auto-created on signup
- Store picker: search a postcode or suburb, pick your local store per chain
  from a map or list, mark one as default — backed by `stores-data.js`, a
  compiled dataset of real NZ store locations (see `tools/compile-stores.md`
  for how it was built and how to regenerate it)
- Three tabs (Stores / List / Prices) matching the finance app's bottom-nav
  pattern
- Shopping list: add/check/delete items; separate Prices tab shows the
  per-chain price table, delta vs. default store, and total savings banner
- **Live price scraping** — `scraper/` is a Node + Playwright script, run on
  a schedule via `.github/workflows/scrape-prices.yml` (GitHub Actions, free
  on this public repo). Pak'nSave and New World are working; Woolworths isn't
  built yet (see below)
- PWA shell (manifest + service worker, installable / offline app-shell)

## What still needs finishing
- **Woolworths price scraping.** Pak'nSave and New World share a platform
  (`api-prod.<domain>/v1/edge/...`) that a real Playwright browser reaches
  cleanly. Woolworths is a different platform and wasn't reachable via any
  method tried so far (timeouts on `woolworths.co.nz` even for its store
  list — see `tools/compile-stores.md`); its store data in `stores-data.js`
  came from OpenStreetMap instead. Scraping its prices needs fresh
  exploration, likely budgeting more time than Pak'nSave/New World took.
- **"Any brand vs specific product" flexibility.** Every list item is
  currently a loose category match (whatever you type becomes the search
  term, and the scraper takes the retailer's own top-5 results for it — no
  re-ranking). A "pin to one exact product per chain" mode (`match_type =
  'product'`, using `list_items.linked_products`) is in the schema but not
  wired into the UI.
- **Multi-store trip splitting + petrol cost.** The bigger vision (split your
  list across up to N stores for the best combined price, weigh that against
  the cost of driving to more than one store) depends on real price data
  existing first — a natural next feature, not built yet.

## Setup
1. Create a Supabase project. Run `supabase/schema.sql` in the SQL editor.
2. In `index.html`, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (top of the
   `<script>` block) to your project's values.
3. Push to GitHub, enable GitHub Pages on the repo (serve from root).
4. For live price scraping, add two **GitHub Actions repo secrets**
   (Settings → Secrets and variables → Actions):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase dashboard → Project Settings →
     API — the `service_role` key, **not** the anon key; RLS on
     `products`/`price_history` requires it to write). This key bypasses RLS
     entirely — GitHub secrets are encrypted and never exposed in logs, but
     treat it with the same care as a database root password.
5. Trigger the `Scrape grocery prices` workflow manually once (Actions tab →
   select it → "Run workflow") to confirm it works, rather than waiting for
   the daily cron. Check the run's summary for per-chain upserted/error
   counts, and the Supabase Table Editor (`products` table) to confirm real
   rows landed.
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
  them) and only writable by the service role (i.e. `scraper/`).
- `stores-data.js`'s Pak'nSave/New World entries use the retailers' own real
  store UUIDs (fetched live from their store-list API while building the
  scraper) — if you regenerate this file, keep using that same live source,
  not a re-scrape of the marketing site, so the IDs stay valid for scraping.
- The scraper (`scraper/src/index.mjs`) is a separate Node project from the
  zero-build-step PWA — `scraper/node_modules` is gitignored, but
  `scraper/package-lock.json` is committed (required for `npm ci` in CI).
