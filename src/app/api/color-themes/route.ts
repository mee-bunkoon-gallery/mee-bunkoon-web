import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

function mapColorTheme(row: any, usedIds: Set<string>) {
  return { id: row.id, name: row.name, hexCode: row.hex_code, inUse: usedIds.has(row.id) };
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  const rowsPerPageParam = searchParams.get('rowsPerPage');

  let query = supabase.from('color_themes').select('*', { count: 'exact' }).order('name');

  if (rowsPerPageParam) {
    const rowsPerPage = Math.min(Math.max(Number(rowsPerPageParam) || 10, 1), 100);
    const page = Math.max(Number(searchParams.get('page')) || 0, 0);
    const from = page * rowsPerPage;
    query = query.range(from, from + rowsPerPage - 1);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const { data: usedRows, error: usedError } = await supabase
    .from('jobs')
    .select('color_theme_id')
    .not('color_theme_id', 'is', null);
  if (usedError) return NextResponse.json({ message: usedError.message }, { status: 400 });

  const usedIds = new Set((usedRows ?? []).map((row) => row.color_theme_id as string));

  return NextResponse.json({
    colorThemes: data.map((row) => mapColorTheme(row, usedIds)),
    total: count ?? data.length,
  });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.name?.trim())
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('color_themes')
    .insert({ name: body.name.trim(), hex_code: body.hexCode || null })
    .select('*')
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ colorTheme: mapColorTheme(data, new Set()) });
}
