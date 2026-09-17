import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/'))
    return NextResponse.json({ message: 'กรุณาเลือกรูปภาพ' }, { status: 400 });
  const path = `${id}/id-card-front-${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
  const { error: uploadError } = await supabase.storage
    .from('contract-id-cards')
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) return NextResponse.json({ message: uploadError.message }, { status: 400 });
  const { data: signed, error } = await supabase.storage
    .from('contract-id-cards')
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  const { error: updateError } = await supabase
    .from('contracts')
    .update({ id_card_front_url: signed.signedUrl })
    .eq('id', id);
  if (updateError) return NextResponse.json({ message: updateError.message }, { status: 400 });
  return NextResponse.json({ idCardFrontUrl: signed.signedUrl });
}
