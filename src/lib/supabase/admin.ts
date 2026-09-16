import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------------

/**
 * Server-only Supabase client using the secret service-role key.
 * Bypasses Row Level Security — never import this from a 'use client' file
 * and never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
