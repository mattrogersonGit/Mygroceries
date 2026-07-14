import { createFoodstuffsChain } from './foodstuffsShared.mjs';

export function createPakNSaveChain() {
  return createFoodstuffsChain({
    chain: 'paknsave',
    baseUrl: 'https://www.paknsave.co.nz',
    apiHost: 'api-prod.paknsave.co.nz',
  });
}
