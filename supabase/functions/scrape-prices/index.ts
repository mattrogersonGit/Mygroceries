// supabase/functions/scrape-prices/index.ts
//
// Scheduled job: for every distinct (chain, store_id) that a household has
// selected, plus every tracked search term (from list_items), fetch current
// prices and upsert into `products` + append to `price_history`.
//
// Run on a schedule with Supabase's built-in cron (Dashboard > Edge Functions
// > scrape-prices > Cron) e.g. "0 15 * * *" (daily, adjust for NZ timezone)
// so it re-runs whenever supermarkets typically lock in weekly specials.
//
// IMPORTANT - the product SEARCH endpoints below are NOT confirmed the way
// the store-list ones are. Store list APIs are public and documented by
// other NZ grocery-compare projects; product search APIs are not, and
// change/require session cookies more often. Before relying on this:
//   1. Open the chain's online shopping site, log in, search a product
//      (e.g. "milk 2l"), open browser devtools > Network > XHR/fetch
//   2. Find the request that returns product JSON, copy its URL + headers
//   3. Fill in the fetchXxxPrices() function below for that chain
//   4. Some chains (Woolworths in particular) may require an authenticated
//      session/cookie rather than a plain fetch - if so, this needs to run
//      with a stored session token, refreshed periodically.
//
// Deploy: supabase functions deploy scrape-prices --no-verify-jwt=false
// Secrets needed: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (set automatically
// for edge functions), plus any chain login/session secrets you add later.

import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

type ScrapedProduct = {
  external_id: string
  name: string
  brand?: string
  size_label?: string
  price: number
  unit_price?: string
  image_url?: string
}

// --- TODO: fill these in once you've found the real endpoints (see notes above) ---

async function fetchPakNSavePrices(storeId: string, term: string): Promise<ScrapedProduct[]> {
  // Placeholder. Likely something like:
  // POST https://www.paknsaveonline.co.nz/CommonApi/SearchAutoComplete/GetSearchProducts
  // with a store cookie/header set. Confirm via devtools.
  console.log(`[paknsave] TODO: search "${term}" @ store ${storeId}`)
  return []
}

async function fetchNewWorldPrices(storeId: string, term: string): Promise<ScrapedProduct[]> {
  console.log(`[newworld] TODO: search "${term}" @ store ${storeId}`)
  return []
}

async function fetchWoolworthsPrices(storeId: string, term: string): Promise<ScrapedProduct[]> {
  console.log(`[woolworths] TODO: search "${term}" @ store ${storeId}`)
  return []
}

const FETCHERS: Record<string, (storeId: string, term: string) => Promise<ScrapedProduct[]>> = {
  paknsave: fetchPakNSavePrices,
  newworld: fetchNewWorldPrices,
  woolworths: fetchWoolworthsPrices,
}

// --- orchestration (this part is ready to go once the fetchers work) ---

serve(async (_req) => {
  const { data: stores, error: storesErr } = await supabase
    .from('household_stores')
    .select('chain, store_id')
  if (storesErr) return jsonError(storesErr.message)

  const { data: items, error: itemsErr } = await supabase
    .from('list_items')
    .select('label, category_key, match_type')
  if (itemsErr) return jsonError(itemsErr.message)

  // De-dupe (chain, store_id) pairs and search terms
  const storePairs = uniqueBy(stores ?? [], (s) => `${s.chain}:${s.store_id}`)
  const terms = uniqueBy(
    (items ?? []).map((i) => i.category_key ?? i.label),
    (t) => t,
  )

  let upserted = 0
  const errors: string[] = []

  for (const { chain, store_id } of storePairs) {
    const fetcher = FETCHERS[chain]
    if (!fetcher) continue

    for (const term of terms) {
      try {
        const results = await fetcher(store_id, term)
        for (const p of results) {
          const { data: existing } = await supabase
            .from('products')
            .select('id, price')
            .eq('chain', chain)
            .eq('store_id', store_id)
            .eq('external_id', p.external_id)
            .maybeSingle()

          const { data: upsertedProduct, error: upsertErr } = await supabase
            .from('products')
            .upsert(
              {
                chain,
                store_id,
                external_id: p.external_id,
                name: p.name,
                brand: p.brand ?? null,
                size_label: p.size_label ?? null,
                category_key: term,
                price: p.price,
                unit_price: p.unit_price ?? null,
                image_url: p.image_url ?? null,
                last_seen: new Date().toISOString(),
              },
              { onConflict: 'chain,store_id,external_id' },
            )
            .select('id')
            .single()

          if (upsertErr) {
            errors.push(`${chain}/${p.external_id}: ${upsertErr.message}`)
            continue
          }

          // Only log history when price actually changed (or is new)
          if (!existing || existing.price !== p.price) {
            await supabase.from('price_history').insert({
              product_id: upsertedProduct.id,
              price: p.price,
            })
          }
          upserted++
        }
      } catch (err) {
        errors.push(`${chain}/${term}: ${String(err)}`)
      }
    }
  }

  return new Response(JSON.stringify({ upserted, errors }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

function uniqueBy<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of arr) {
    const k = key(item)
    if (!seen.has(k)) {
      seen.add(k)
      out.push(item)
    }
  }
  return out
}

function jsonError(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })
}
