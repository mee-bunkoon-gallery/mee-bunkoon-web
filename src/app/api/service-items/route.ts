import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

function mapServiceItem(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    unit: row.unit,
    unitPrice: Number(row.unit_price),
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

  const q = new URL(request.url).searchParams.get('q');

  let query = supabase.from('service_items').select('*').order('created_at', { ascending: false });

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ serviceItems: data.map(mapServiceItem) });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

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

  return NextResponse.json({ serviceItem: mapServiceItem(data) });
}
