import { NextResponse } from 'next/server';

import { paths } from 'src/routes/paths';

import { readJson, rateLimit, getSiteUrl } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

export async function POST(request: Request) {
  // Internal back-office app: public registration is off unless explicitly enabled.
  if (process.env.ALLOW_SIGN_UP !== 'true') {
    return NextResponse.json({ message: 'Sign-up is disabled' }, { status: 403 });
  }

  const limited = rateLimit(request, 'sign-up', 5);
  if (limited) return limited;

  const { email, password, firstName, lastName } = await readJson(request);

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl(request)}${paths.dashboard.root}`,
      data: { display_name: `${firstName} ${lastName}` },
    },
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: error.status ?? 400 });
  }

  if (!data.user?.identities?.length) {
    return NextResponse.json({ message: 'This user already exists' }, { status: 409 });
  }

  return NextResponse.json({ user: data.user });
}
