import { NextResponse } from 'next/server';

import { isUuid, extensionFromMime } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File) || !ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ message: 'กรุณาเลือกรูปภาพ' }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ message: 'ไฟล์ต้องมีขนาดไม่เกิน 5MB' }, { status: 400 });
  const path = `${id}/id-card-front-${Date.now()}.${extensionFromMime(file.type, 'jpg')}`;
  const { error: uploadError } = await supabase.storage
    .from('contract-id-cards')
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) return NextResponse.json({ message: uploadError.message }, { status: 400 });
  const { data: signed, error } = await supabase.storage
    .from('contract-id-cards')
    .createSignedUrl(path, 60 * 60);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  const { data: previous } = await supabase
    .from('contracts')
    .select('id_card_front_path')
    .eq('id', id)
    .maybeSingle();
  const { error: updateError } = await supabase
    .from('contracts')
    .update({ id_card_front_path: path, id_card_front_url: null })
    .eq('id', id);
  if (updateError) return NextResponse.json({ message: updateError.message }, { status: 400 });
  if (previous?.id_card_front_path)
    await supabase.storage.from('contract-id-cards').remove([previous.id_card_front_path]);
  return NextResponse.json({ idCardFrontUrl: signed.signedUrl });
}
