import { NextResponse } from 'next/server';

import { readJson } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

function mapProfile(row: any) {
  return {
    entityType: row.entity_type ?? 'individual',
    name: row.name,
    storeNameTh: row.store_name_th,
    storeNameEn: row.store_name_en,
    branch: row.branch,
    taxId: row.tax_id,
    phone: row.phone,
    email: row.email,
    address: row.address,
    logoUrl: row.logo_url,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('company_profile')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from('company_profile')
      .insert({ id: 'default' })
      .select('*')
      .single();

    if (createError) {
      return NextResponse.json({ message: createError.message }, { status: 400 });
    }

    return NextResponse.json({ profile: mapProfile(created) });
  }

  return NextResponse.json({ profile: mapProfile(data) });
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await readJson(request);

  if (!body.entityType || !['individual', 'company'].includes(body.entityType)) {
    return NextResponse.json({ message: 'Invalid entity type' }, { status: 400 });
  }

  if (!body.name) {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('company_profile')
    .update({
      entity_type: body.entityType,
      name: body.name,
      store_name_th: body.storeNameTh || null,
      store_name_en: body.storeNameEn || null,
      branch: body.branch || null,
      tax_id: body.taxId || null,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
    })
    .eq('id', 'default')
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ profile: mapProfile(data) });
}
