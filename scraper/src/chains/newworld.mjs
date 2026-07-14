import { createFoodstuffsChain } from './foodstuffsShared.mjs';

export function createNewWorldChain() {
  return createFoodstuffsChain({
    chain: 'newworld',
    baseUrl: 'https://www.newworld.co.nz',
    apiHost: 'api-prod.newworld.co.nz',
  });
}
