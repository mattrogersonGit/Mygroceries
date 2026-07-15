import { chromium } from 'playwright';
import { supabase } from './supabaseClient.mjs';
import { uniqueBy, sleep } from './util.mjs';
import { createPakNSaveChain } from './chains/paknsave.mjs';
import { createNewWorldChain } from './chains/newworld.mjs';

// Woolworths isn't built yet (see plan doc / tools/compile-stores.md for why
// its store data itself was hard to get) - registry only lists working chains.
const CHAIN_FACTORIES = {
  paknsave: createPakNSaveChain,
  newworld: createNewWorldChain,
};

const DELAY_BETWEEN_SEARCHES_MS = 1500;

// GitHub Actions' shared runner IPs get hard-challenged by Cloudflare Turnstile
// on Pak'nSave/New World (confirmed - a real "verify you're human" checkbox,
// not just a slow response) even though the exact same code sails through
// cleanly from a normal home connection. Browserless.io runs the browser from
// a different (non-datacenter-flagged) IP pool and includes CAPTCHA solving,
// which is what actually fixes this for CI - not a local Chromium launch.
// connectOverCDP() returns a standard Playwright Browser object, identical to
// launch()'s, so nothing downstream (the chain modules) needs to know which
// path was used. Falls back to a local launch when no token is set, so this
// still works for local development/testing without needing an account.
async function launchBrowser() {
  const token = process.env.BROWSERLESS_TOKEN;
  if (token) {
    return chromium.connectOverCDP(`wss://production-sfo.browserless.io?token=${token}`);
  }
  return chromium.launch({ headless: true });
}

async function main() {
  const { data: stores, error: storesErr } = await supabase
    .from('household_stores')
    .select('chain, store_id');
  if (storesErr) throw new Error(`Failed to load household_stores: ${storesErr.message}`);

  const { data: items, error: itemsErr } = await supabase
    .from('list_items')
    .select('label, category_key, match_type');
  if (itemsErr) throw new Error(`Failed to load list_items: ${itemsErr.message}`);

  const storePairs = uniqueBy(stores ?? [], (s) => `${s.chain}:${s.store_id}`);
  const terms = uniqueBy(
    (items ?? []).map((i) => i.category_key ?? i.label).filter(Boolean),
    (t) => t,
  );

  const summary = {}; // chain -> { upserted, errors: [] }
  let totalUpserted = 0;

  const browser = await launchBrowser();

  try {
    for (const chainKey of Object.keys(CHAIN_FACTORIES)) {
      const chainStores = storePairs.filter((s) => s.chain === chainKey);
      summary[chainKey] = { upserted: 0, errors: [] };
      if (chainStores.length === 0 || terms.length === 0) continue;

      const scraper = CHAIN_FACTORIES[chainKey]();
      try {
        await scraper.init(browser);
      } catch (err) {
        summary[chainKey].errors.push(`init: ${err.message}`);
        continue; // one broken chain shouldn't block the others
      }

      for (const { store_id } of chainStores) {
        for (const term of terms) {
          try {
            const results = await scraper.searchPrices(store_id, term);
            for (const p of results) {
              const upserted = await upsertProduct(chainKey, store_id, term, p);
              if (upserted) {
                summary[chainKey].upserted++;
                totalUpserted++;
              }
            }
          } catch (err) {
            summary[chainKey].errors.push(`${store_id}/${term}: ${err.message}`);
          }
          await sleep(DELAY_BETWEEN_SEARCHES_MS);
        }
      }

      await scraper.close();
    }
  } finally {
    await browser.close();
  }

  await writeSummary(summary);

  if (totalUpserted === 0) {
    console.error('No products were upserted across any chain - treating this as a full failure.');
    process.exitCode = 1;
  }
}

// Mirrors the original Deno stub's dedupe pattern: upsert the product row,
// only append to price_history when the price actually changed.
async function upsertProduct(chain, storeId, categoryKey, p) {
  const { data: existing } = await supabase
    .from('products')
    .select('id, price')
    .eq('chain', chain)
    .eq('store_id', storeId)
    .eq('external_id', p.external_id)
    .maybeSingle();

  const { data: upsertedProduct, error: upsertErr } = await supabase
    .from('products')
    .upsert(
      {
        chain,
        store_id: storeId,
        external_id: p.external_id,
        name: p.name,
        brand: p.brand ?? null,
        size_label: p.size_label ?? null,
        category_key: categoryKey,
        price: p.price,
        unit_price: p.unit_price ?? null,
        image_url: p.image_url ?? null,
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'chain,store_id,external_id' },
    )
    .select('id')
    .single();

  if (upsertErr) {
    console.error(`Upsert failed for ${chain}/${p.external_id}: ${upsertErr.message}`);
    return false;
  }

  if (!existing || existing.price !== p.price) {
    await supabase.from('price_history').insert({ product_id: upsertedProduct.id, price: p.price });
  }
  return true;
}

async function writeSummary(summary) {
  const lines = ['| Chain | Upserted | Errors |', '|---|---|---|'];
  for (const [chain, { upserted, errors }] of Object.entries(summary)) {
    lines.push(`| ${chain} | ${upserted} | ${errors.length} |`);
  }
  const table = lines.join('\n');
  console.log(table);

  for (const [chain, { errors }] of Object.entries(summary)) {
    for (const e of errors.slice(0, 20)) console.log(`[${chain}] ${e}`);
    if (errors.length > 20) console.log(`[${chain}] ...and ${errors.length - 20} more`);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import('node:fs/promises');
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `\n${table}\n`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});
