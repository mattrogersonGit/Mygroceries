import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.');
}

// Service role key bypasses RLS - required because products/price_history are
// only writable by the service role (see supabase/schema.sql policies). Never
// use this key anywhere client-side; it only ever runs here, in CI.
export const supabase = createClient(url, key);
