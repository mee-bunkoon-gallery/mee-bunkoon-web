import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

function mapPackage(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    promotionPrice: Number(row.promotion_price),
    startDate: row.start_date,
    endDate: row.end_date,
    active: row.active,
    eventTypeId: row.event_type_id,
    eventType: row.event_type
      ? { id: row.event_type.id, name: row.event_type.name, inUse: true }
      : null,
    items: (row.items ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((item: any) => ({
        id: item.id,
        serviceItemId: item.service_item_id,
        quantity: Number(item.quantity),
        unitPrice: Number(item.service_item.unit_price),
        serviceItem: {
          id: item.service_item.id,
          name: item.service_item.name,
          description: item.service_item.description,
          imageUrl: item.service_item.image_url,
          unit: item.service_item.unit,
          unitPrice: Number(item.service_item.unit_price),
          colorThemeIds: [],
          colorThemes: [],
          createdAt: item.service_item.created_at,
          updatedAt: item.service_item.updated_at,
        },
      })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const selectPackage =
  '*, event_type:event_types(*), items:promotion_package_items(*, service_item:service_items(*))';

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const query = new URL(request.url).searchParams.get('q')?.trim();
  let requestQuery = supabase
    .from('promotion_packages')
    .select(selectPackage)
    .order('created_at', { ascending: false });
  if (query) requestQuery = requestQuery.ilike('name', `%${query}%`);

  const { data, error } = await requestQuery;
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ packages: data.map(mapPackage) });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.name?.trim() || !body.items?.length) {
    return NextResponse.json({ message: 'กรุณากรอกชื่อและเลือกรายการบริการ' }, { status: 400 });
  }
  if (body.startDate && body.endDate && body.endDate < body.startDate) {
    return NextResponse.json(
      { message: 'วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น' },
      { status: 400 }
    );
  }

  const { data: packageRow, error } = await supabase
    .from('promotion_packages')
    .insert({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      image_url: body.imageUrl || null,
      promotion_price: Number(body.promotionPrice) || 0,
      start_date: body.startDate || null,
      end_date: body.endDate || null,
      active: body.active ?? true,
      event_type_id: body.eventTypeId,
      created_by: user.id,
    })
    .select('id')
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const { error: itemError } = await supabase.from('promotion_package_items').insert(
    body.items.map((item: any, position: number) => ({
      package_id: packageRow.id,
      service_item_id: item.serviceItemId,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unitPrice) || 0,
      position,
    }))
  );
  if (itemError) {
    await supabase.from('promotion_packages').delete().eq('id', packageRow.id);
    return NextResponse.json({ message: itemError.message }, { status: 400 });
  }

  const { data, error: readError } = await supabase
    .from('promotion_packages')
    .select(selectPackage)
    .eq('id', packageRow.id)
    .single();
  if (readError) return NextResponse.json({ message: readError.message }, { status: 400 });
  return NextResponse.json({ package: mapPackage(data) });
}
