import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ----------------------------------------------------------------------

/**
 * Refreshes the Supabase auth session cookie on every request so it never
 * expires silently between visits. Route Handlers and pages then read an
 * always-current session from the cookies.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

// Only routes that read the session need the refresh (a network round-trip to Supabase).
// Public marketing pages and `/api/public/*` skip it entirely.
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/api/((?!public/).*)'],
};
