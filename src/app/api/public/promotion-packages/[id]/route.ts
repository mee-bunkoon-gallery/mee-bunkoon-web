import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from 'src/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const today = new Date().toISOString().slice(0, 10);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('promotion_packages')
    .select(
      'id, name, description, image_url, promotion_price, start_date, end_date, active, items:promotion_package_items(quantity, position, service_item:service_items(name, description, image_url, unit, color_themes:service_item_color_themes(color_theme:color_themes(id, name, hex_code))))'
    )
    .eq('id', id)
    .single();

  if (
    error ||
    !data.active ||
    (data.start_date && data.start_date > today) ||
    (data.end_date && data.end_date < today)
  ) {
    return NextResponse.json({ message: 'ไม่พบแพ็กเกจนี้' }, { status: 404 });
  }

  return NextResponse.json({
    package: {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      promotionPrice: Number(data.promotion_price),
      items: (data.items ?? [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((item: any) => ({
          name: item.service_item.name,
          description: item.service_item.description,
          imageUrl: item.service_item.image_url,
          quantity: Number(item.quantity),
          unit: item.service_item.unit,
          colorThemes: (item.service_item.color_themes ?? [])
            .map((relation: any) => relation.color_theme)
            .filter(Boolean)
            .map((theme: any) => ({
              id: theme.id,
              name: theme.name,
              hexCode: theme.hex_code,
            })),
        })),
    },
  });
}
