import { chromium } from 'playwright';
import { createPakNSaveChain } from './src/chains/paknsave.mjs';
import { createNewWorldChain } from './src/chains/newworld.mjs';

const PAKNSAVE_STORE = '3bb30799-82ce-4648-8c02-5113228963ed'; // Te Awamutu
const NEWWORLD_STORE = process.argv[2]; // pass a real New World store UUID as arg, optional

const browser = await chromium.launch({ headless: true });

async function run(name, factory, storeId, terms) {
  console.log(`\n=== ${name} (store ${storeId}) ===`);
  const chain = factory();
  await chain.init(browser);
  for (const term of terms) {
    try {
      const results = await chain.searchPrices(storeId, term);
      console.log(`"${term}": ${results.length} results`);
      results.slice(0, 2).forEach((r) => console.log('  ', JSON.stringify(r)));
    } catch (err) {
      console.log(`"${term}": ERROR - ${err.message}`);
    }
  }
  await chain.close();
}

await run("Pak'nSave", createPakNSaveChain, PAKNSAVE_STORE, ['2l milk', 'bread', 'eggs', 'a totally made up nonexistent product xyzabc']);

if (NEWWORLD_STORE) {
  await run('New World', createNewWorldChain, NEWWORLD_STORE, ['2l milk', 'bread']);
}

await browser.close();
