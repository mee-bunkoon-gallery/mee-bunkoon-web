import { NextResponse } from 'next/server';

import { readJson } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

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

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  const rowsPerPage = Math.min(Math.max(Number(searchParams.get('rowsPerPage')) || 10, 1), 100);
  const page = Math.max(Number(searchParams.get('page')) || 0, 0);
  const from = page * rowsPerPage;

  const { data, error, count } = await supabase
    .from('hero_banners')
    .select('*', { count: 'exact' })
    .order('display_order')
    .order('created_at', { ascending: false })
    .range(from, from + rowsPerPage - 1);

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ banners: data.map(mapBanner), total: count ?? data.length });
}

export async function POST(request: Request) {
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
    .insert({
      eyebrow: body.eyebrow?.trim() || null,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || null,
      button_label: body.buttonLabel?.trim() || null,
      button_url: body.buttonUrl?.trim() || null,
      display_order: Number(body.displayOrder) || 0,
      is_active: body.isActive ?? true,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ banner: mapBanner(data) });
}
