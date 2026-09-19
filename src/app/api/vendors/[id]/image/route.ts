import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

const BUCKET = 'vendor-images';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function pathFromUrl(url?: string | null) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index < 0 ? null : url.slice(index + marker.length);
}

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const file = (await request.formData()).get('file');
  if (!(file instanceof File)) return NextResponse.json({ message: 'กรุณาเลือกรูปภาพ' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ message: 'รองรับ PNG, JPG และ WEBP เท่านั้น' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ message: 'รูปภาพต้องไม่เกิน 5MB' }, { status: 400 });

  const { data: current, error: findError } = await supabase.from('vendors').select('image_url').eq('id', id).single();
  if (findError) return NextResponse.json({ message: findError.message }, { status: 404 });

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (uploadError) return NextResponse.json({ message: uploadError.message }, { status: 400 });
  const imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error: updateError } = await supabase.from('vendors').update({ image_url: imageUrl }).eq('id', id);
  if (updateError) { await supabase.storage.from(BUCKET).remove([path]); return NextResponse.json({ message: updateError.message }, { status: 400 }); }

  const oldPath = pathFromUrl(current.image_url);
  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
  return NextResponse.json({ imageUrl });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { data: current } = await supabase.from('vendors').select('image_url').eq('id', id).single();
  const { error } = await supabase.from('vendors').update({ image_url: null }).eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  const path = pathFromUrl(current?.image_url);
  if (path) await supabase.storage.from(BUCKET).remove([path]);
  return NextResponse.json({ success: true });
}
