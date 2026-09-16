import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

const BUCKET = 'logos';
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

export async function POST(request: Request) {
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
    return NextResponse.json({ message: 'File must be 2MB or smaller' }, { status: 400 });
  }

  const { data: current } = await supabase
    .from('company_profile')
    .select('logo_url')
    .eq('id', 'default')
    .maybeSingle();

  const extension = file.name.split('.').pop() || 'png';
  const path = `default-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ message: uploadError.message }, { status: 400 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: updated, error: updateError } = await supabase
    .from('company_profile')
    .update({ logo_url: publicUrl })
    .eq('id', 'default')
    .select('logo_url')
    .single();

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 400 });
  }

  const previousPath = current?.logo_url ? storagePathFromPublicUrl(current.logo_url) : null;
  if (previousPath) {
    await supabase.storage.from(BUCKET).remove([previousPath]);
  }

  return NextResponse.json({ logoUrl: updated.logo_url });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data: current } = await supabase
    .from('company_profile')
    .select('logo_url')
    .eq('id', 'default')
    .maybeSingle();

  const path = current?.logo_url ? storagePathFromPublicUrl(current.logo_url) : null;
  if (path) {
    await supabase.storage.from(BUCKET).remove([path]);
  }

  const { error } = await supabase
    .from('company_profile')
    .update({ logo_url: null })
    .eq('id', 'default');

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
