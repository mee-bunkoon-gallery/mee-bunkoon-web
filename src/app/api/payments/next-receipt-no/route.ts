import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.rpc('preview_next_receipt_no');
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  return NextResponse.json({ receiptNo: data });
}
