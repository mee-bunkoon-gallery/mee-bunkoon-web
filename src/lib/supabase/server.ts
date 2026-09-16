import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// ----------------------------------------------------------------------

/**
 * Server-only Supabase client bound to the request's cookies.
 * Use this inside Route Handlers / Server Components / Server Actions —
 * never import it from a 'use client' file.
 *
 * It authenticates as the signed-in user (RLS applies), reading/writing
 * the session via httpOnly cookies so the browser never sees the tokens.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component render — middleware refreshes the session instead.
          }
        },
      },
    }
  );
}
