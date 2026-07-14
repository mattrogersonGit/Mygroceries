# Compiling stores-data.js

This documents how `stores-data.js` (the static list of NZ grocery store locations used by
Trolley) was built, so it can be regenerated when stores open/close or the source sites change.

## Sources

- **Pak'nSave**: `https://www.paknsave.co.nz/store-finder` — static HTML, stores listed by
  region (Upper North Island, Lower North Island, South Island) with name + full street
  address. Fetched with a tool prompt explicitly asking for "every single store, do not
  summarize" — a naive fetch/summary will silently drop stores. 60 stores as of 2026-07-14.
- **New World**: `https://www.newworld.co.nz/store-finder` — same structure as Pak'nSave.
  150 stores as of 2026-07-14.
- **Woolworths NZ**: `https://www.woolworths.co.nz/store-finder` — **could not be fetched**.
  Every attempt (main store-finder page, an individual store page, sitemap.xml) timed out
  (60s) or reset the connection (ECONNRESET), even across multiple retries and multiple
  sessions. This looks like bot/scraper protection (Cloudflare or similar) rather than a
  transient outage. Wikipedia and web.archive.org do not have address-level data either.
  **Fallback used instead: OpenStreetMap via the Overpass API** (free, keyless,
  `https://overpass-api.de/api/interpreter`). Queried for `shop=supermarket` nodes/ways
  tagged `brand=Woolworths`, `brand:wikidata=Q5176845`, or with `name`/`old_name` matching
  "Woolworths" or "Countdown" (NZ's Countdown chain was rebranded to Woolworths in
  2023–2024 and OSM tagging is a mix of both eras). This returned 186 candidate locations
  (1 was an "Order Collection Point," not a real store, and was dropped; a handful of
  node+way pairs representing the same physical store within ~1km with no distinguishing
  name were auto-merged — see "Known limitations" below), landing at 181 stores, in line
  with Woolworths NZ's real ~186-store estate.

  OSM tagging is inconsistent: only ~48 of the 186 raw entries had a complete
  `addr:housenumber` + `addr:street`. For the rest, the store's real lat/lon from OSM was
  used to **reverse-geocode** the address via Nominatim (see below). Where OSM also lacked
  a `branch` tag or a `website` URL (which sometimes encodes an official numeric store ID,
  e.g. `.../store-finder/9204/pakuranga/pakuranga-woolworths` → id `woolworths-9204`), the
  store's suburb/city name was used as an approximate label (e.g. "Woolworths Franklin") —
  these are flagged in the build script as `_approx_name` and are a known soft spot; see
  "Known limitations."

## Geocoding

- Pak'nSave and New World addresses (which come with no coordinates) were geocoded via
  Nominatim's `/search` endpoint: `https://nominatim.openstreetmap.org/search?q=<address>
  &format=json&countrycodes=nz&limit=1`.
- Woolworths (from Overpass, which already has lat/lon) only needed **reverse** geocoding
  to fill in missing address text: `https://nominatim.openstreetmap.org/reverse?lat=<lat>
  &lon=<lon>&format=json&zoom=18&addressdetails=1`.
- Both used a descriptive `User-Agent` header and were rate-limited to ~1 request/second
  (Nominatim's usage policy), run as a resumable Python script that caches every response
  to a JSON file keyed by query, so an interrupted run can restart without re-hitting
  already-resolved addresses.
- Addresses that failed on the first try (usually because they included a mall/shopping
  centre name Nominatim doesn't recognise as part of the address, e.g. "Botany Town
  Centre, 501 Ti Rakau Drive...") were retried with the leading non-address segment
  stripped, then with just suburb+postcode, until one resolved.

## Regenerating

1. Re-fetch the Pak'nSave and New World store-finder pages (WebFetch or similar), asking
   explicitly for the complete, non-summarized list of every store name + address.
2. Re-run the Overpass query above for Woolworths (or retry the direct
   woolworths.co.nz/store-finder fetch — if their anti-bot posture has relaxed, prefer
   that as the authoritative source and drop the OSM fallback).
3. Geocode/reverse-geocode any new or changed addresses via Nominatim as described above.
4. Re-derive each store's `id` as `${chain}-${slugified-name}` (or reuse a chain's native
   numeric store ID where available, e.g. Woolworths `website` URLs). Check for id
   collisions (two stores with the same name in different regions) and disambiguate with a
   `-1`/`-2` suffix or a region/street qualifier.
5. Spot-check a handful of entries per chain: lat should be roughly -34 to -47, lng
   roughly 166 to 179, and the coordinate should actually be near the place the store name
   implies (catches Nominatim falling back to a country/region centroid on a bad match).

## Known limitations / gaps to check manually

- **Woolworths names are not always the official branch name.** Where OSM had neither a
  `branch` tag nor a `website` slug, the label falls back to the reverse-geocoded suburb
  or city (e.g. "Woolworths Franklin", "Woolworths Hamilton Central") — this is a
  reasonable real-world approximation, not the store's actual trading name, and worth
  cleaning up manually against the live site if/when it becomes fetchable again.
- **Four Woolworths entries were auto-merged as likely duplicate OSM mappings**
  (Johnsonville, Manukau, Napier South, South Dunedin — each pair sat under 1km apart with
  no distinguishing name, consistent with OSM mapping the same physical store as both a
  POI node and a building outline way). Three more pairs of same-named-but-unbranched
  stores (two each in the "Franklin", "Palmerston North Central", and "Hamilton Central"
  areas, 1.3–1.9km apart) were kept as distinct since they're far enough apart to plausibly
  be two real stores, but this wasn't independently confirmed against Woolworths' own
  site — worth a manual spot-check.
- **Some Woolworths addresses are street/area-level, not exact rooftop.** A handful
  reverse-geocoded to a path or generic road name near the store rather than a shop-front
  address (e.g. "Domain Shared Path, Papamoa" for Woolworths Papamoa) — the coordinate is
  still the real store location from OSM, only the printed address text is approximate.
- Two Pak'nSave stores (Warkworth, Richmond) and ten New World stores initially failed
  plain address geocoding because their listed address included a mall/road-junction
  description Nominatim didn't parse; all were resolved with a follow-up query and are
  flagged in the geocoding script's fallback-query log, but are worth an extra manual
  glance.
