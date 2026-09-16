import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

function mapColorTheme(row: any) {
  return { id: row.id, name: row.name, hexCode: row.hex_code };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('color_themes').select('*').order('name');
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ colorThemes: data.map(mapColorTheme) });
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
  return NextResponse.json({ colorTheme: mapColorTheme(data) });
}
