// supabase/functions/get-store-list/index.ts
//
// Proxies each chain's "find a store" endpoint so the browser doesn't hit
// CORS issues calling them directly. Called from the household setup screen.
//
// Confirmed endpoints (as used by other NZ grocery-compare projects):
//   Pak'nSave:  https://www.paknsaveonline.co.nz/CommonApi/Store/GetStoreList
//   New World:  https://www.ishopnewworld.co.nz/CommonApi/Store/GetStoreList
//   Woolworths: https://www.countdown.co.nz/api/stores/
//
// Deploy: supabase functions deploy get-store-list --no-verify-jwt=false

import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ENDPOINTS: Record<string, string> = {
  paknsave: 'https://www.paknsaveonline.co.nz/CommonApi/Store/GetStoreList',
  newworld: 'https://www.ishopnewworld.co.nz/CommonApi/Store/GetStoreList',
  woolworths: 'https://www.countdown.co.nz/api/stores/',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const url = new URL(req.url)
  const chain = url.searchParams.get('chain')

  if (!chain || !ENDPOINTS[chain]) {
    return new Response(
      JSON.stringify({ error: 'chain must be one of: paknsave, newworld, woolworths' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const upstream = await fetch(ENDPOINTS[chain], {
      headers: { Accept: 'application/json' },
    })
    const raw = await upstream.text()

    // Each chain returns a different shape - normalise to {id, label}[].
    // NOTE: verify these field names against the live response before relying
    // on them - retailers change their APIs without notice. Log `raw` locally
    // once to confirm, then trim this down.
    let stores: { id: string; label: string }[] = []
    try {
      const data = JSON.parse(raw)
      if (chain === 'woolworths' && Array.isArray(data?.stores)) {
        stores = data.stores.map((s: any) => ({ id: String(s.id ?? s.storeId), label: s.name ?? s.storeName }))
      } else if (Array.isArray(data)) {
        stores = data.map((s: any) => ({ id: String(s.StoreId ?? s.id), label: s.StoreName ?? s.name }))
      } else if (Array.isArray(data?.storeAreas)) {
        // Foodstuffs (Pak'nSave / New World) sometimes nest stores under areas
        stores = data.storeAreas.flatMap((a: any) =>
          (a.stores ?? []).map((s: any) => ({ id: String(s.StoreId ?? s.id), label: s.StoreName ?? s.name })),
        )
      } else {
        stores = []
      }
    } catch {
      stores = []
    }

    return new Response(JSON.stringify({ chain, stores, raw_sample: raw.slice(0, 500) }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
