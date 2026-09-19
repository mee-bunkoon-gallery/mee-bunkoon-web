import { NextResponse } from 'next/server';

import { readJson } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

function mapColorTheme(row: any, inUse: boolean) {
  return { id: row.id, name: row.name, hexCode: row.hex_code, inUse };
}

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await readJson(request);
  if (!body.name?.trim())
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('color_themes')
    .update({ name: body.name.trim(), hex_code: body.hexCode || null })
    .eq('id', id)
    .select('*')
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const { count } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('color_theme_id', id);

  return NextResponse.json({ colorTheme: mapColorTheme(data, !!count) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { count, error: countError } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('color_theme_id', id);
  if (countError) return NextResponse.json({ message: countError.message }, { status: 400 });
  if (count) {
    return NextResponse.json(
      { message: 'ไม่สามารถลบโทนสีนี้ได้ เนื่องจากมีการใช้งานอยู่' },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('color_themes').delete().eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
