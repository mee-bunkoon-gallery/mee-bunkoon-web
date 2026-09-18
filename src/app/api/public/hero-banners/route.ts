import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from 'src/lib/supabase/admin';

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('hero_banners')
    .select('id, eyebrow, title, subtitle, image_url, button_label, button_url, display_order')
    .eq('is_active', true)
    .not('image_url', 'is', null)
    .order('display_order')
    .order('created_at');

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({
    banners: data.map((row) => ({
      id: row.id,
      eyebrow: row.eyebrow,
      title: row.title,
      subtitle: row.subtitle,
      imageUrl: row.image_url,
      buttonLabel: row.button_label,
      buttonUrl: row.button_url,
      displayOrder: row.display_order,
    })),
  });
}
