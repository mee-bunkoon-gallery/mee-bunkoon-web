import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

function mapEventType(row: any, usedIds: Set<string>) {
  return { id: row.id, name: row.name, inUse: usedIds.has(row.id) };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('event_types').select('*').order('name');
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const { data: usedRows, error: usedError } = await supabase
    .from('contracts')
    .select('event_type_id')
    .not('event_type_id', 'is', null);
  if (usedError) return NextResponse.json({ message: usedError.message }, { status: 400 });

  const usedIds = new Set((usedRows ?? []).map((row) => row.event_type_id as string));

  return NextResponse.json({ eventTypes: data.map((row) => mapEventType(row, usedIds)) });
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
    .from('event_types')
    .insert({ name: body.name.trim() })
    .select('*')
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ eventType: mapEventType(data, new Set()) });
}
