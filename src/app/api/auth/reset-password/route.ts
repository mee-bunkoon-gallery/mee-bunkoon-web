import { NextResponse } from 'next/server';

import { paths } from 'src/routes/paths';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(request.url).origin}${paths.auth.supabase.updatePassword}`,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: error.status ?? 400 });
  }

  return NextResponse.json({ success: true });
}
