import { NextResponse } from 'next/server';

import { extensionFromMime } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

const BUCKET = 'hero-banner-images';
type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const file = (await request.formData()).get('file');
  if (!(file instanceof File) || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ message: 'กรุณาเลือกไฟล์รูปภาพ' }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ message: 'รูปภาพต้องมีขนาดไม่เกิน 8 MB' }, { status: 400 });
  }

  const { data: current } = await supabase
    .from('hero_banners')
    .select('image_path')
    .eq('id', id)
    .single();
  const extension = extensionFromMime(file.type, 'jpg');
  const path = `${id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (uploadError) return NextResponse.json({ message: uploadError.message }, { status: 400 });

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const { error: updateError } = await supabase
    .from('hero_banners')
    .update({ image_url: publicUrl.publicUrl, image_path: path })
    .eq('id', id);
  if (updateError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ message: updateError.message }, { status: 400 });
  }
  if (current?.image_path) await supabase.storage.from(BUCKET).remove([current.image_path]);
  return NextResponse.json({ imageUrl: publicUrl.publicUrl });
}
