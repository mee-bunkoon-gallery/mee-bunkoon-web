import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from 'src/lib/supabase/admin';

// ----------------------------------------------------------------------

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data: deliveries, error } = await supabase
    .from('deliveries')
    .select('id, delivery_no, delivery_date, items_delivered, image_urls')
    .in('status', ['delivered', 'acknowledged'])
    .order('delivery_date', { ascending: false })
    .limit(12);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    deliveries: (deliveries ?? []).map((delivery) => ({
      id: delivery.id,
      deliveryNo: delivery.delivery_no,
      deliveryDate: delivery.delivery_date,
      itemsDelivered: delivery.items_delivered,
      imageUrls: delivery.image_urls ?? [],
    })),
  });
}
