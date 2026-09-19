import { NextResponse } from 'next/server';

import { readJson } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

function mapServiceItem(row: any) {
  const colorThemes = (row.color_themes ?? []).map((item: any) => ({
    id: item.color_theme.id,
    name: item.color_theme.name,
    hexCode: item.color_theme.hex_code,
    inUse: true,
  }));
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    unit: row.unit,
    unitPrice: Number(row.unit_price),
    colorThemeIds: colorThemes.map((item: any) => item.id),
    colorThemes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get('q');
  const rowsPerPageParam = searchParams.get('rowsPerPage');

  let query = supabase
    .from('service_items')
    .select('*, color_themes:service_item_color_themes(color_theme:color_themes(*))', {
      count: 'exact',
    })
    .order('created_at', { ascending: false });

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  if (rowsPerPageParam) {
    const rowsPerPage = Math.min(Math.max(Number(rowsPerPageParam) || 10, 1), 100);
    const page = Math.max(Number(searchParams.get('page')) || 0, 0);
    const from = page * rowsPerPage;
    query = query.range(from, from + rowsPerPage - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    serviceItems: data.map(mapServiceItem),
    total: count ?? data.length,
  });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await readJson(request);

  if (!body.name) {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('service_items')
    .insert({
      name: body.name,
      description: body.description || null,
      image_url: body.imageUrl || null,
      unit: body.unit || 'รายการ',
      unit_price: body.unitPrice ?? 0,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (body.colorThemeIds?.length) {
    const { error: themesError } = await supabase.from('service_item_color_themes').insert(
      body.colorThemeIds.map((colorThemeId: string) => ({
        service_item_id: data.id,
        color_theme_id: colorThemeId,
      }))
    );
    if (themesError) return NextResponse.json({ message: themesError.message }, { status: 400 });
  }

  const { data: savedServiceItem, error: readError } = await supabase
    .from('service_items')
    .select('*, color_themes:service_item_color_themes(color_theme:color_themes(*))')
    .eq('id', data.id)
    .single();
  if (readError) return NextResponse.json({ message: readError.message }, { status: 400 });

  return NextResponse.json({ serviceItem: mapServiceItem(savedServiceItem) });
}
