import { NextResponse } from 'next/server';

import { paths } from 'src/routes/paths';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

export async function POST(request: Request) {
  const { email, password, firstName, lastName } = await request.json();

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}${paths.dashboard.root}`,
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
