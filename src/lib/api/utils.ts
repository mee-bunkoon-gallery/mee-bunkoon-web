import { NextResponse } from 'next/server';

// ----------------------------------------------------------------------

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

// ----------------------------------------------------------------------

/**
 * Parses a JSON request body without throwing. Malformed or non-object bodies
 * yield `{}` so each route's own required-field checks respond with a 400
 * instead of the handler crashing with a 500.
 */
export async function readJson(request: Request): Promise<Record<string, any>> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  } catch {
    return {};
  }
}

// ----------------------------------------------------------------------

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};

/**
 * Storage-path extension derived from the validated MIME type — never from the
 * client-supplied file name, which can contain path separators (`../`).
 */
export function extensionFromMime(mimeType: string, fallback = 'jpg') {
  return EXTENSION_BY_MIME[mimeType] ?? fallback;
}

// ----------------------------------------------------------------------

/** Escapes characters that are special inside a PostgREST `.or()` filter / LIKE pattern. */
export function sanitizeSearchTerm(term: string) {
  return term
    .replace(/[\\%_,()*"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

// ----------------------------------------------------------------------

/** JSON response for unauthenticated endpoints: cached at the CDN so the admin-client query isn't run per visitor. */
export function publicJson(body: unknown) {
  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}

// ----------------------------------------------------------------------

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Fixed-window rate limit keyed by client IP + scope. In-memory, so it is per server
 * instance (best-effort on serverless) — Supabase's own auth limits remain the backstop.
 * Returns a 429 response when the limit is exceeded, otherwise `null`.
 */
export function rateLimit(request: Request, scope: string, limit = 5, windowMs = 60_000) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `${scope}:${ip}`;
  const now = Date.now();

  if (buckets.size > 5000) {
    buckets.forEach((value, k) => {
      if (value.resetAt <= now) buckets.delete(k);
    });
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return NextResponse.json(
      { message: 'Too many attempts, try again later' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((bucket.resetAt - now) / 1000)) } }
    );
  }

  return null;
}

// ----------------------------------------------------------------------

/**
 * Origin used in emailed links. Prefers the configured `NEXT_PUBLIC_SITE_URL`; the request
 * origin (spoofable via the Host header) is only a fallback outside production.
 */
export function getSiteUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');

  if (configured) return configured;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_SITE_URL must be set in production');
  }

  return new URL(request.url).origin;
}
