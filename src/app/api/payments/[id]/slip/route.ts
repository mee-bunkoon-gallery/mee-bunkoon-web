import { NextResponse } from 'next/server';

import { extensionFromMime } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

const BUCKET = 'payment-slips';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const SLIP_URL_TTL = 60 * 60; // 1 hour

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'File is required' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: 'File must be 5MB or smaller' }, { status: 400 });
  }

  const { data: current } = await supabase
    .from('payments')
    .select('slip_path')
    .eq('id', id)
    .maybeSingle();

  if (!current) {
    return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
  }

  const extension = extensionFromMime(file.type, 'jpg');
  const path = `${id}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ message: uploadError.message }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('payments')
    .update({ slip_path: path })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 400 });
  }

  if (current.slip_path) {
    await supabase.storage.from(BUCKET).remove([current.slip_path]);
  }

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, SLIP_URL_TTL);

  return NextResponse.json({ slipUrl: signed?.signedUrl ?? null });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data: current } = await supabase
    .from('payments')
    .select('slip_path')
    .eq('id', id)
    .maybeSingle();

  if (current?.slip_path) {
    await supabase.storage.from(BUCKET).remove([current.slip_path]);
  }

  const { error } = await supabase.from('payments').update({ slip_path: null }).eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
