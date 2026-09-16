/** Thin JSON fetch helper for this app's own `/api/*` route handlers. */
export async function apiFetch<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'Something went wrong!');
  }

  return payload as T;
}
