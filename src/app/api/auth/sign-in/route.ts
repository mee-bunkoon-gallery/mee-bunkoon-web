import { NextResponse } from 'next/server';

import { readJson, rateLimit } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

export async function POST(request: Request) {
  const limited = rateLimit(request, 'sign-in', 10);
  if (limited) return limited;

  const { email, password } = await readJson(request);

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Same response for every credential failure so accounts can't be enumerated.
    if (error.status === 429) {
      return NextResponse.json({ message: 'Too many attempts, try again later' }, { status: 429 });
    }
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }

  return NextResponse.json({ user: data.user });
}
