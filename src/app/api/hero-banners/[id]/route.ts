import { NextResponse } from 'next/server';

import { readJson } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

const mapBanner = (row: any) => ({
  id: row.id,
  eyebrow: row.eyebrow,
  title: row.title,
  subtitle: row.subtitle,
  imageUrl: row.image_url,
  buttonLabel: row.button_label,
  buttonUrl: row.button_url,
  displayOrder: row.display_order,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('hero_banners').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ message: error.message }, { status: 404 });
  return NextResponse.json({ banner: mapBanner(data) });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await readJson(request);
  if (!body.title?.trim()) {
    return NextResponse.json({ message: 'กรุณากรอกหัวข้อ Banner' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('hero_banners')
    .update({
      eyebrow: body.eyebrow?.trim() || null,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || null,
      button_label: body.buttonLabel?.trim() || null,
      button_url: body.buttonUrl?.trim() || null,
      display_order: Number(body.displayOrder) || 0,
      is_active: body.isActive ?? true,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ banner: mapBanner(data) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data: banner } = await supabase
    .from('hero_banners')
    .select('image_path')
    .eq('id', id)
    .single();
  const { error } = await supabase.from('hero_banners').delete().eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  if (banner?.image_path) {
    await supabase.storage.from('hero-banner-images').remove([banner.image_path]);
  }
  return NextResponse.json({ success: true });
}
