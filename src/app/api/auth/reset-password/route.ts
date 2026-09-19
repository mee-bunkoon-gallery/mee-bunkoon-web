import { NextResponse } from 'next/server';

import { paths } from 'src/routes/paths';

import { readJson, rateLimit, getSiteUrl } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

export async function POST(request: Request) {
  const limited = rateLimit(request, 'reset-password', 3);
  if (limited) return limited;

  const { email } = await readJson(request);

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl(request)}${paths.auth.supabase.updatePassword}`,
  });

  // Same response whether or not the address exists, so accounts can't be enumerated.
  if (error && error.status === 429) {
    return NextResponse.json({ message: 'Too many attempts, try again later' }, { status: 429 });
  }

  return NextResponse.json({ success: true });
}
