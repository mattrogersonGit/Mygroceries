// Pak'nSave and New World run on the same Foodstuffs platform - confirmed by
// live exploration (both api-prod.<domain>/v1/edge/search/paginated/products
// endpoints return an identical response shape). Discovered this session:
//
// - A plain server-side fetch() cannot reach these endpoints at all (they sit
//   behind Cloudflare, and separately require a JWT the site's own frontend
//   JS obtains via a normal page load - confirmed by a direct curl POST
//   returning 401 "Failed to Resolve Variable: policy(JWT-VerifyRetailEdgeToken)").
//   A real Playwright browser context gets through cleanly with zero challenge,
//   because it's a genuine browser executing the page's own JS.
// - Store selection is enforced server-side (confirmed: a bogus store UUID in
//   the request gets a real 400 "Invalid store id parameter in filters", not
//   silently ignored) - so intercepting the search request and overwriting its
//   storeId/filters before it's sent is a reliable way to scrape prices for
//   any store, not just whichever one the session defaulted to.
// - Prices are returned in *cents* as integers (e.g. 488 = $4.88).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uniqueBy } from '../util.mjs';

const DEBUG_DIR = fileURLToPath(new URL('../../debug/', import.meta.url));

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Tuned generously for GitHub Actions' CI runners (US/EU-hosted, so much
// higher latency + Cloudflare challenge-solving overhead reaching NZ sites
// than testing from closer to NZ ever showed) - a run that failed here with
// pure timeouts (no other error) on every single search is the signature of
// this being too tight, not a real site/selector problem.
const SEARCH_TIMEOUT_MS = 30000;
const RESULTS_PER_TERM = 5;

export function createFoodstuffsChain({ chain, baseUrl, apiHost }) {
  const searchEndpoint = `https://${apiHost}/v1/edge/search/paginated/products`;
  let browser = null;
  let context = null;
  let page = null;
  let currentStoreId = null;

  async function init(launchedBrowser) {
    browser = launchedBrowser;
    context = await browser.newContext({ userAgent: USER_AGENT });
    page = await context.newPage();

    // Rewrite every outgoing search request to target whichever store the
    // caller most recently asked for (set via currentStoreId before each
    // searchPrices() call) - this is what lets one authenticated session
    // scrape prices across many different stores without re-authenticating.
    await page.route(searchEndpoint, async (route) => {
      const req = route.request();
      let postData;
      try {
        postData = req.postDataJSON();
      } catch {
        await route.continue();
        return;
      }
      postData.storeId = currentStoreId;
      if (postData.algoliaQuery) postData.algoliaQuery.filters = `stores:${currentStoreId}`;
      await route.continue({ postData: JSON.stringify(postData) });
    });

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500); // let the page's own auth/session setup finish
  }

  function captureNextSearchResponse() {
    return new Promise((resolve) => {
      const handler = async (res) => {
        if (res.url() === searchEndpoint) {
          page.off('response', handler);
          try {
            resolve({ status: res.status(), body: await res.json() });
          } catch (err) {
            resolve({ status: res.status(), body: null, parseError: err.message });
          }
        }
      };
      page.on('response', handler);
    });
  }

  async function searchPrices(storeId, term) {
    try {
      currentStoreId = storeId;
      const waitForResponse = captureNextSearchResponse();
      await page.goto(`${baseUrl}/shop/search?q=${encodeURIComponent(term)}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      const result = await Promise.race([
        waitForResponse,
        new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), SEARCH_TIMEOUT_MS)),
      ]);

      if (result === 'TIMEOUT') {
        throw new Error(`${chain}: search for "${term}" timed out waiting for a response`);
      }
      if (result.body == null) {
        throw new Error(`${chain}: search for "${term}" returned an unparseable response (status ${result.status})`);
      }
      if (result.status !== 200) {
        throw new Error(`${chain}: search for "${term}" failed (status ${result.status}): ${result.body?.message ?? JSON.stringify(result.body)}`);
      }

      const products = (result.body.products ?? []).slice(0, RESULTS_PER_TERM);
      return uniqueBy(products.map(mapProduct).filter(Boolean), (p) => p.external_id);
    } catch (err) {
      await saveDebugScreenshot(term);
      throw err;
    }
  }

  async function saveDebugScreenshot(term) {
    try {
      await fs.mkdir(DEBUG_DIR, { recursive: true });
      const safeTerm = term.replace(/[^a-z0-9]+/gi, '-').slice(0, 40);
      const file = path.join(DEBUG_DIR, `${chain}-${safeTerm}-${Date.now()}.png`);
      await page.screenshot({ path: file });
    } catch {
      // Debug capture is best-effort - never let it mask the real error.
    }
  }

  function mapProduct(p) {
    const priceCents = p.singlePrice?.price;
    if (priceCents == null) return null; // e.g. multi-buy-only pricing, no simple unit price - skip for v1
    const comparative = p.singlePrice.comparativePrice;
    return {
      external_id: p.productId,
      name: [p.name, p.displayName].filter(Boolean).join(' '),
      brand: p.brand ?? null,
      size_label: p.displayName ?? null,
      price: priceCents / 100,
      unit_price: comparative
        ? `$${(comparative.pricePerUnit / 100).toFixed(2)} / ${comparative.unitQuantityUom}`
        : null,
      image_url: null,
    };
  }

  async function close() {
    await context?.close();
  }

  return { init, searchPrices, close };
}
