import { NextResponse } from 'next/server';

import { publicJson } from 'src/lib/api/utils';
import { createSupabaseAdminClient } from 'src/lib/supabase/admin';

// ----------------------------------------------------------------------

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data: company, error } = await supabase
    .from('company_profile')
    .select('name, store_name_th, store_name_en, address, phone, logo_url')
    .eq('id', 'default')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: 'Failed to load data' }, { status: 400 });
  }

  return publicJson({
    company: company
      ? {
          name: company.store_name_th || company.name,
          nameEn: company.store_name_en,
          address: company.address,
          phone: company.phone,
          logoUrl: company.logo_url,
        }
      : null,
  });
}
