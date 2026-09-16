import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

export async function POST(request: Request) {
  const { password, accessToken, refreshToken } = await request.json();

  if (!password) {
    return NextResponse.json({ message: 'Password is required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  // Password-recovery links land the user on the client with tokens in the URL
  // fragment (never sent to a server automatically); the client forwards them
  // here so we can establish the session before updating the password.
  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      return NextResponse.json(
        { message: sessionError.message },
        { status: sessionError.status ?? 401 }
      );
    }
  }

  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: error.status ?? 400 });
  }

  return NextResponse.json({ user: data.user });
}
