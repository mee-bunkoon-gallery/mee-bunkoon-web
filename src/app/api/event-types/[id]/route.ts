import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

function mapEventType(row: any, inUse: boolean) {
  return { id: row.id, name: row.name, inUse };
}

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.name?.trim())
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('event_types')
    .update({ name: body.name.trim() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const { count } = await supabase
    .from('contracts')
    .select('id', { count: 'exact', head: true })
    .eq('event_type_id', id);

  return NextResponse.json({ eventType: mapEventType(data, !!count) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { count, error: countError } = await supabase
    .from('contracts')
    .select('id', { count: 'exact', head: true })
    .eq('event_type_id', id);
  if (countError) return NextResponse.json({ message: countError.message }, { status: 400 });
  if (count) {
    return NextResponse.json(
      { message: 'ไม่สามารถลบประเภทงานนี้ได้ เนื่องจากมีการใช้งานอยู่' },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('event_types').delete().eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
