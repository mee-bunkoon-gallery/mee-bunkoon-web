import { NextResponse } from 'next/server';

import { extensionFromMime } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

const BUCKET = 'promotion-package-images';
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function storagePathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const file = (await request.formData()).get('file');
  if (!(file instanceof File))
    return NextResponse.json({ message: 'File is required' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ message: 'รองรับเฉพาะ PNG, JPG และ WEBP' }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ message: 'ไฟล์ต้องมีขนาดไม่เกิน 2MB' }, { status: 400 });

  const { data: current, error: findError } = await supabase
    .from('promotion_packages')
    .select('image_url')
    .eq('id', id)
    .single();
  if (findError) return NextResponse.json({ message: findError.message }, { status: 404 });

  const extension = extensionFromMime(file.type, 'png');
  const path = `${id}/${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (uploadError) return NextResponse.json({ message: uploadError.message }, { status: 400 });

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const { error: updateError } = await supabase
    .from('promotion_packages')
    .update({ image_url: publicUrl })
    .eq('id', id);
  if (updateError) return NextResponse.json({ message: updateError.message }, { status: 400 });

  const previousPath = current.image_url ? storagePathFromPublicUrl(current.image_url) : null;
  if (previousPath) await supabase.storage.from(BUCKET).remove([previousPath]);
  return NextResponse.json({ imageUrl: publicUrl });
}
