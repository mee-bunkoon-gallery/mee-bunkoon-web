import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from 'src/lib/supabase/admin';

export async function GET(request: Request) {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const limit = Number(new URL(request.url).searchParams.get('limit'));
  const { data, error } = await supabase
    .from('promotion_packages')
    .select(
      'id, name, description, image_url, promotion_price, start_date, end_date, items:promotion_package_items(quantity, service_item:service_items(name, description, image_url, unit))'
    )
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const activePackages = (data ?? [])
    .filter(
      (item) =>
        (!item.start_date || item.start_date <= today) && (!item.end_date || item.end_date >= today)
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.image_url,
      promotionPrice: Number(item.promotion_price),
      items: (item.items ?? []).map((packageItem: any) => ({
        name: packageItem.service_item.name,
        description: packageItem.service_item.description,
        imageUrl: packageItem.service_item.image_url,
        quantity: Number(packageItem.quantity),
        unit: packageItem.service_item.unit,
      })),
    }));

  const packages =
    Number.isInteger(limit) && limit > 0 ? activePackages.slice(0, limit) : activePackages;

  return NextResponse.json({ packages });
}
